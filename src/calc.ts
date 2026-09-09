/**
 * The break-even arithmetic. Pure functions, no DOM. Every number the UI
 * shows comes out of here or straight from a JSON field.
 *
 *   cloud_cost_per_day  = (daily_input_tokens  / 1e6 × input_price)
 *                       + (daily_output_tokens / 1e6 × output_price)
 *   local_cost_per_day  = (daily_output_tokens / local_tokens_per_sec / 3600)
 *                         × device_watts / 1000 × electricity_price_per_kwh
 *   daily_saving        = cloud_cost_per_day − local_cost_per_day
 *   breakeven_days      = device_price / daily_saving
 *   breakeven_tokens    = breakeven_days × daily_tokens
 *
 * With the falling-API-prices assumption switched on, the cloud side is not a
 * constant: it decays, so the saving shrinks every year and the pay-back is
 * found by integrating rather than dividing. See `breakevenWithDecay`.
 */

export interface CalcInputs {
  devicePriceUsd: number;
  dailyTokens: number;
  /** input:output ratio, e.g. 4 means 4 input tokens per output token */
  inputRatio: number;
  inputPricePerMtok: number;
  outputPricePerMtok: number;
  localTokensPerSec: number;
  cloudTokensPerSec: number;
  loadWatts: number;
  pricePerKwh: number;
  typicalTaskOutputTokens: number;
  /** fraction the API price falls each year, e.g. 0.4 for 40%/yr; 0 = hold today's prices */
  apiDeclinePerYear?: number;
}

export interface CalcResult {
  dailyInputTokens: number;
  dailyOutputTokens: number;
  cloudCostPerDay: number;
  localGenerationHoursPerDay: number;
  localKwhPerDay: number;
  localCostPerDay: number;
  dailySaving: number;
  /** null means it never pays back at these inputs */
  breakevenDays: number | null;
  breakevenTokens: number | null;
  /** the annual decline applied, 0 when the assumption is off */
  apiDeclinePerYear: number;
  /** with decay on: the best the position ever gets, and when */
  bestPosition?: { usd: number; days: number };
  cloudCostPerMonth: number;
  localCostPerMonth: number;
  timing: {
    localSecondsPerTask: number;
    cloudSecondsPerTask: number;
    localHoursPerDay: number;
    cloudHoursPerDay: number;
    extraHoursPerDay: number;
    speedRatio: number;
  };
}

export const DAYS_PER_MONTH = 365.25 / 12;
export const DAYS_PER_YEAR = 365.25;

/**
 * Cumulative saving after `days`, with the API price decaying at `decline` a year.
 *
 *   cloud(t) = cloud_per_day × (1 − decline)^t        (t in years)
 *   saved(T) = ∫₀ᵀ cloud(t) dt − local_per_day × T
 *            = cloud_per_day × ((1 − decline)^T − 1) / ln(1 − decline) − local × T
 *
 * The integral converges, so the total saving has a ceiling: past the point where
 * the decayed API price drops below your electricity bill, running the machine
 * costs more than renting and the position starts sinking again.
 */
export function cumulativeSaving(cloudPerDay: number, localPerDay: number, decline: number, days: number): number {
  const years = days / DAYS_PER_YEAR;
  if (decline <= 0) return (cloudPerDay - localPerDay) * days;
  const k = Math.log(1 - decline);
  const cloudTotal = (cloudPerDay * DAYS_PER_YEAR * (Math.exp(k * years) - 1)) / k;
  return cloudTotal - localPerDay * days;
}

/** The moment the decayed API price equals the electricity bill: the saving peaks here. */
export function peakSavingDays(cloudPerDay: number, localPerDay: number, decline: number): number {
  if (decline <= 0 || cloudPerDay <= localPerDay) return Infinity;
  const k = Math.log(1 - decline);
  return (Math.log(localPerDay / cloudPerDay) / k) * DAYS_PER_YEAR;
}

/** Days until cumulative saving covers `price`, or null if it never does. */
export function breakevenWithDecay(price: number, cloudPerDay: number, localPerDay: number, decline: number): number | null {
  if (decline <= 0) {
    const saving = cloudPerDay - localPerDay;
    return saving > 0 ? price / saving : null;
  }
  const peak = peakSavingDays(cloudPerDay, localPerDay, decline);
  if (!Number.isFinite(peak) || cumulativeSaving(cloudPerDay, localPerDay, decline, peak) < price) return null;
  // bisect between the purchase and the peak; the curve is monotonic over that span
  let lo = 0;
  let hi = peak;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (cumulativeSaving(cloudPerDay, localPerDay, decline, mid) < price) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function splitTokens(dailyTokens: number, inputRatio: number) {
  const output = dailyTokens / (inputRatio + 1);
  const input = dailyTokens - output;
  return { input, output };
}

export function calculate(i: CalcInputs): CalcResult {
  const { input, output } = splitTokens(i.dailyTokens, i.inputRatio);

  const cloudCostPerDay =
    (input / 1e6) * i.inputPricePerMtok + (output / 1e6) * i.outputPricePerMtok;

  const localGenerationHoursPerDay = output / i.localTokensPerSec / 3600;
  const localKwhPerDay = (localGenerationHoursPerDay * i.loadWatts) / 1000;
  const localCostPerDay = localKwhPerDay * i.pricePerKwh;

  const dailySaving = cloudCostPerDay - localCostPerDay;

  const decline = i.apiDeclinePerYear ?? 0;
  const breakevenDays = breakevenWithDecay(i.devicePriceUsd, cloudCostPerDay, localCostPerDay, decline);
  const breakevenTokens = breakevenDays === null ? null : breakevenDays * i.dailyTokens;
  let bestPosition: CalcResult['bestPosition'];
  if (decline > 0) {
    const peak = peakSavingDays(cloudCostPerDay, localCostPerDay, decline);
    if (Number.isFinite(peak)) {
      bestPosition = { usd: cumulativeSaving(cloudCostPerDay, localCostPerDay, decline, peak) - i.devicePriceUsd, days: peak };
    }
  }

  const localSecondsPerTask = i.typicalTaskOutputTokens / i.localTokensPerSec;
  const cloudSecondsPerTask = i.typicalTaskOutputTokens / i.cloudTokensPerSec;
  const cloudHoursPerDay = output / i.cloudTokensPerSec / 3600;

  return {
    dailyInputTokens: input,
    dailyOutputTokens: output,
    cloudCostPerDay,
    localGenerationHoursPerDay,
    localKwhPerDay,
    localCostPerDay,
    dailySaving,
    breakevenDays,
    breakevenTokens,
    apiDeclinePerYear: decline,
    bestPosition,
    cloudCostPerMonth: cloudCostPerDay * DAYS_PER_MONTH,
    localCostPerMonth: localCostPerDay * DAYS_PER_MONTH,
    timing: {
      localSecondsPerTask,
      cloudSecondsPerTask,
      localHoursPerDay: localGenerationHoursPerDay,
      cloudHoursPerDay,
      extraHoursPerDay: localGenerationHoursPerDay - cloudHoursPerDay,
      speedRatio: i.cloudTokensPerSec / i.localTokensPerSec,
    },
  };
}

/**
 * Net position in dollars after `days` of use. Negative = underwater.
 * With a decline rate the saving shrinks each year, so the curve bends over.
 */
export function positionAfterDays(devicePriceUsd: number, dailySaving: number, days: number, decay?: { cloudPerDay: number; localPerDay: number; decline: number }): number {
  if (decay && decay.decline > 0) {
    return -devicePriceUsd + cumulativeSaving(decay.cloudPerDay, decay.localPerDay, decay.decline, days);
  }
  return -devicePriceUsd + dailySaving * days;
}
