import Manager from "./Manager";
import { DragSourceItem } from "./DragSource";
import { InteractEvent } from "interactjs";
import { DropResult } from "./Target";

export interface XYCoordinate {
  x: number;
  y: number;
}

export interface IsOverOptions {
  shallow: boolean;
}

export interface DragOperationOffset {
  clientOffset: XYCoordinate;
  clientSourceOffset: XYCoordinate;
  initialClientSourceOffset: XYCoordinate;
  initialClientOffset: XYCoordinate;
  diff: XYCoordinate;
}

export interface DragOperationState {
  dragSourceId: string;
  dropTargetIds: string[];
  isDragging: boolean;
  item: DragSourceItem;
  itemType: string;
  dragResult: DropResult;
}

export declare interface DragOperation {
  offset: DragOperationOffset;
  state: DragOperationState;
}

export declare type SubscriptionListener = (monitor: {}) => void;
export declare interface SubscriptionOptions {
  shouldUpdate: (dirty: DirtyHandlers) => boolean;
}
export declare interface Subscription {
  listener: SubscriptionListener;
  options: SubscriptionOptions;
}

export declare type Unsubscribe = () => void;

export declare interface DirtyHandlers {
  dragSources: string[];
  dropTargets: string[];
}

export declare interface Monitor {
  subscribeToStateChange: (listener: SubscriptionListener, options?: SubscriptionOptions) => Unsubscribe;
  subscribeToOffsetChange: (listener: SubscriptionListener, options?: SubscriptionOptions) => Unsubscribe;
  getSourceId: () => string;
  getTargetIds: () => string[];
  isDragging: () => boolean;
  getClientOffset: () => XYCoordinate;
  getClientSourceOffset: () => XYCoordinate;
  getInitialClientOffset: () => XYCoordinate;
  getInitialClientSourceOffset: () => XYCoordinate;
  getItem: () => DragSourceItem;
  getItemType: () => string;
  getDropResult: () => DropResult;
  didDrop: () => boolean;
}

export default class MonitorImpl implements Monitor {
  private manager: Manager;
  private currentDragOperation: DragOperation;
  private dirty: DirtyHandlers;
  private stateSubscriptions: Subscription[];
  private offsetSubscriptions: Subscription[];

  constructor(manager: Manager) {
    this.manager = manager;
    this.currentDragOperation = null;
    this.stateSubscriptions = [];
    this.offsetSubscriptions = [];
    this.dirty = { dragSources: [], dropTargets: [] };
  }

  subscribe = (listener: SubscriptionListener, options: SubscriptionOptions = { shouldUpdate: () => true }, store: Subscription[]): Unsubscribe => {
    const subscription: Subscription = { listener, options };
    store.push(subscription);

    const unsubscribe = () => {
      const index = store.indexOf(subscription);
      store.splice(index, 1);
    }

    return unsubscribe;
  }

  subscribeToStateChange = (listener: SubscriptionListener, options?: SubscriptionOptions): Unsubscribe => this.subscribe(listener, options, this.stateSubscriptions);
  subscribeToOffsetChange = (listener: SubscriptionListener, options?: SubscriptionOptions): Unsubscribe => this.subscribe(listener, options, this.offsetSubscriptions);

  publish = (subscriptions: Subscription[]) => {
    subscriptions.forEach((subscription) => {
      if (subscription.options.shouldUpdate(this.dirty)) {
        subscription.listener(this);
      }
    });
  }

  publishStateChanges = () => this.publish(this.stateSubscriptions);
  publishOffsetChanges = () => this.publish(this.offsetSubscriptions);

  getSourceId = (): string => {
    if (!this.isDragging()) { return null }
    return this.currentDragOperation.state.dragSourceId;
  }

  getTargetIds = (): string[] => {
    if (!this.isDragging()) { return null }
    return this.currentDragOperation.state.dropTargetIds;
  }

  isDragging = (): boolean => Boolean(this.currentDragOperation);
  isSourceDragging = (id: string) => {
    if (!this.isDragging()) { return false; }
    const source = this.manager.registry.getSource(id);
    return source.isDragging(this, id);
  }

  isOverTarget = (id: string, options: IsOverOptions = { shallow: false }): boolean => {
    if (!this.isDragging()) { return false; }
    const targets = this.manager.monitor.getTargetIds();
    const isLast = !options.shallow || targets[0] === id;

    return targets.indexOf(id) >= 0 && isLast
  }

  canDropOnTarget = (id: string): boolean => {
    if (!this.isDragging()) { return false; }
    const target = this.manager.registry.getTarget(id);
    const sourceItemType = this.getItemType();
    const targetItemType = this.manager.registry.getItemType(id);

    if (targetItemType !== sourceItemType) {
      return false;
    }

    return target.canDrop();
  }

  getItem = (): DragSourceItem => {
    if (!this.isDragging()) { return null; }
    return this.currentDragOperation.state.item;
  }

  getItemType = (): string => {
    if (!this.isDragging()) { return null; }
    return this.currentDragOperation.state.itemType;
  }

  getClientOffset = (): XYCoordinate => {
    if (!this.isDragging()) { return null; }
    return this.currentDragOperation.offset.clientOffset;
  }

  getClientSourceOffset = (): XYCoordinate => {
    if (!this.isDragging()) { return null; }
    return this.currentDragOperation.offset.clientSourceOffset;
  }

  getInitialClientOffset = (): XYCoordinate => {
    if (!this.isDragging()) { return null; }
    return this.currentDragOperation.offset.initialClientOffset;
  }

  getInitialClientSourceOffset = (): XYCoordinate => {
    if (!this.isDragging()) { return null; }
    return this.currentDragOperation.offset.initialClientSourceOffset;
  }

  getDropResult = (): DropResult => {
    if (!this.isDragging()) { return null; }
    return this.currentDragOperation.state.dragResult;
  }

  didDrop = (): boolean => {
    if (!this.isDragging()) { return false; }
    return Boolean(this.currentDragOperation.state.dragResult);
  }

  beginDrag = (sourceId: string, item: DragSourceItem, event: MouseEvent): void => {
    const sourcePosition = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const itemType = this.manager.registry.getItemType(sourceId);

    this.currentDragOperation = {
      offset: {
        clientOffset: { x: event.clientX, y: event.clientY },
        clientSourceOffset: { x: sourcePosition.left, y: sourcePosition.top },
        initialClientOffset: { x: event.clientX, y: event.clientY },
        initialClientSourceOffset: { x: sourcePosition.left, y: sourcePosition.top },
        diff: { x: event.clientX - sourcePosition.left, y: event.clientY - sourcePosition.top }
      },
      state: {
        isDragging: true,
        dragSourceId: sourceId,
        item,
        itemType,
        dropTargetIds: [],
        dragResult: null,
      }
    }

    this.dirty = { dragSources: [this.getSourceId()], dropTargets: [] };

    this.publishOffsetChanges();
    this.publishStateChanges();

    this.dirty = null;
  }

  move = (event: MouseEvent): void => {
    const diff = this.currentDragOperation.offset.diff;
    const sourcePosition = { x: event.clientX - diff.x, y: event.clientY - diff.y };
    const clientOffset = { x: event.clientX, y: event.clientY };
    const clientSourceOffset = sourcePosition;

    this.currentDragOperation.offset.clientOffset = clientOffset;
    this.currentDragOperation.offset.clientSourceOffset = clientSourceOffset;

    const newTargetIds = [];
    const prevTargetIds = [...this.getTargetIds()];

    for (const targetId of this.manager.registry.targets.keys()) {
      const target = this.manager.registry.getTarget(targetId);

      if (this.manager.registry.getItemType(targetId) !== this.getItemType()) { continue; }

      const { top, bottom, left, right } = target.element.getBoundingClientRect();

      if (clientOffset.x >= left && clientOffset.x <= right && clientOffset.y >= top && clientOffset.y <= bottom) {
        newTargetIds.push(targetId);
      }
    }

    this.currentDragOperation.state.dropTargetIds = newTargetIds;
    this.dirty = { dragSources: [this.getSourceId()], dropTargets: [...newTargetIds, ...prevTargetIds] }

    this.publishOffsetChanges();
    this.publishStateChanges();

    this.dirty = null;

    this.hover();
  }

  drop = (): void => {
    if (this.getTargetIds().length) {
      for (const targetId of this.getTargetIds()) {
        const target = this.manager.registry.getTarget(targetId);

        if (target.canDrop()) {
          const result = target.drop();

          if (result) {
            this.currentDragOperation.state.dragResult = result;
          }
        }
      }
    }

    this.dirty = { dragSources: [this.getSourceId()], dropTargets: [...this.getTargetIds()] };

    this.publishStateChanges();

    this.dirty = null;
  }

  endDrag = (): void => {
    this.dirty = { dragSources: [this.getSourceId()], dropTargets: [...this.getTargetIds()] };
    this.currentDragOperation = null;

    this.publishStateChanges();
    this.publishOffsetChanges();

    this.dirty = null;
  }

  hover = () => {
    if (this.getTargetIds().length) {
      for (const targetId of this.getTargetIds()) {
        const target = this.manager.registry.getTarget(targetId);
        target.hover();
      }
    }
  }
}
