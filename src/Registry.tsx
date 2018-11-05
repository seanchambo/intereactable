import Manager from "./Manager";
import { Source } from "./Source";
import { Target } from './Target';

export declare interface RegistrationResult {
  id: string;
  unregister: () => void;
}

export default class Registry {
  manager: Manager;
  sourceCount: number = 0;
  targetCount: number = 0;
  sources: Map<string, Source> = new Map<string, Source>();
  targets: Map<string, Target> = new Map<string, Target>();
  itemTypes: Map<string, string> = new Map<string, string>();

  constructor(manager: Manager) {
    this.manager = manager;
  }

  registerSource = (itemType: string, source: Source): RegistrationResult => {
    const id = `DragSource(${this.sourceCount})`;
    this.sources.set(id, source);
    this.itemTypes.set(id, itemType);

    const unregister = () => {
      this.sources.delete(id);
      this.itemTypes.delete(id);
    }

    this.sourceCount = this.sourceCount + 1;

    return { id, unregister };
  }

  registerTarget = (itemType: string, target: Target): RegistrationResult => {
    const id = `DropTarget(${this.targetCount})`;
    this.targets.set(id, target);
    this.itemTypes.set(id, itemType);

    const unregister = () => {
      this.targets.delete(id);
      this.itemTypes.delete(id);
    }

    this.targetCount = this.targetCount + 1;

    return { id, unregister };
  }

  getSource = (id: string): Source => {
    return this.sources.get(id);
  }

  getTarget = (id: string): Target => {
    return this.targets.get(id);
  }

  getItemType = (id: string): string => {
    return this.itemTypes.get(id);
  }
}