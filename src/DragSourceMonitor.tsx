import { Monitor, SubscriptionListener, Unsubscribe, DirtyHandlers, XYCoordinate } from "./Monitor";
import Manager from "./Manager";
import { DragSourceItem } from "./DragSource";
import { DropResult } from './Target';

export default class DragSourceMonitor implements Monitor {
  sourceId: string;
  manager: Manager;

  constructor(manager: Manager) {
    this.manager = manager;
  }

  receiveId = (id: string) => {
    this.sourceId = id;
  }

  subscribeToOffsetChange = (listener: SubscriptionListener): Unsubscribe => {
    const shouldUpdate = (dirty: DirtyHandlers) => dirty.dragSources.indexOf(this.sourceId) >= 0;
    return this.manager.monitor.subscribeToOffsetChange(listener, { shouldUpdate });
  }

  subscribeToStateChange = (listener: SubscriptionListener): Unsubscribe => {
    const shouldUpdate = (dirty: DirtyHandlers) => dirty.dragSources.indexOf(this.sourceId) >= 0;
    return this.manager.monitor.subscribeToStateChange(listener, { shouldUpdate });
  }

  getSourceId = (): string => {
    return this.manager.monitor.getSourceId();
  }

  getTargetIds = (): string[] => {
    return this.manager.monitor.getTargetIds();
  }

  isDragging = (): boolean => {
    return this.manager.monitor.isSourceDragging(this.sourceId);
  }

  canDrag = (): boolean => {
    return this.manager.registry.getSource(this.sourceId).canDrag();
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