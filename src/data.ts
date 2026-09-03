import hardware from '../data/hardware.json';
import models from '../data/models.json';
import throughput from '../data/throughput.json';
import defaults from '../data/defaults.json';
import units from '../data/units.json';
import type { Dataset, Defaults, Hardware, Model, Throughput, UnitsFile } from './types';

export const data: Dataset = {
  hardware: hardware as Hardware[],
  models: models as Model[],
  throughput: throughput as Throughput[],
  defaults: defaults as unknown as Defaults,
  units: units as UnitsFile,
};
