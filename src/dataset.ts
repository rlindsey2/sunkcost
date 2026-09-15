/** The dataset as one import, for code that runs outside the page (the Cloudflare card functions). */
import hardware from '../data/hardware.json';
import models from '../data/models.json';
import throughput from '../data/throughput.json';
import defaults from '../data/defaults.json';
import type { Dataset } from './types';

export const dataset = { hardware, models, throughput, defaults } as unknown as Dataset;
