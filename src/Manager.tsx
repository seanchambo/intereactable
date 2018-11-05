import Monitor from './Monitor';
import Registry from './Registry';

export default class Manager {
  registry: Registry;
  monitor: Monitor;

  constructor() {
    this.registry = new Registry(this);
    this.monitor = new Monitor(this);
  }
}