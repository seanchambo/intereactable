import { Monitor, SubscriptionListener, Unsubscribe, XYCoordinate } from "./Monitor";
import Manager from "./Manager";
import { DragSourceItem } from "./DragSource";
import { DropResult } from './Target';

export default class DragLayerMonitor implements Monitor {
  manager: Manager;

  constructor(manager: Manager) {
    this.manager = manager;
  }

  subscribeToOffsetChange = (listener: SubscriptionListener): Unsubscribe => {
    return this.manager.monitor.subscribeToOffsetChange(listener, { shouldUpdate: () => true });
  }

  subscribeToStateChange = (listener: SubscriptionListener): Unsubscribe => {
    return this.manager.monitor.subscribeToStateChange(listener, { shouldUpdate: () => true });
  }

  getSourceId = (): string => {
    return this.manager.monitor.getSourceId();
  }

  getTargetIds = (): string[] => {
    return this.manager.monitor.getTargetIds();
  }

  isDragging = (): boolean => {
    return this.manager.monitor.isDragging();
  }

  getItemType = (): string => {
    return this.manager.monitor.getItemType();
  }

  getItem = (): DragSourceItem => {
    return this.manager.monitor.getItem();
  }

  getClientOffset = (): XYCoordinate => {
    return this.manager.monitor.getClientOffset();
  }

  getClientSourceOffset = (): XYCoordinate => {
    return this.manager.monitor.getClientSourceOffset();
  }

  getInitialClientOffset = (): XYCoordinate => {
    return this.manager.monitor.getInitialClientOffset();
  }

  getInitialClientSourceOffset = (): XYCoordinate => {
    return this.manager.monitor.getInitialClientSourceOffset();
  }

  getDropResult = (): DropResult => {
    return this.manager.monitor.getDropResult();
  }

  didDrop = (): boolean => {
    return this.manager.monitor.didDrop();
  }
}