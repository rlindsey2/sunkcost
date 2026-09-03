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

  const breakevenDays = dailySaving > 0 ? i.devicePriceUsd / dailySaving : null;
  const breakevenTokens = breakevenDays === null ? null : breakevenDays * i.dailyTokens;

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

/** Net position in dollars after `days` of use. Negative = underwater. */
export function positionAfterDays(devicePriceUsd: number, dailySaving: number, days: number): number {
  return -devicePriceUsd + dailySaving * days;
}
