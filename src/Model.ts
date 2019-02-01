import Registry, { Unsubscribe } from "./Registry";

interface XYCoordinate {
  x: number;
  y: number;
}

interface DragOperationState {
  dragSourceId: string;
  dropTargetIds: string[];
  itemType: string;
}

interface DragOperationOffsets {
  clientOffset: XYCoordinate;
  sourceClientOffset: XYCoordinate;
  initialSourceClientOffset: XYCoordinate;
  initialClientOffset: XYCoordinate;
  diff: XYCoordinate
}

interface DropResult { [key: string]: any };

interface DragOperation {
  state: DragOperationState;
  offsets: DragOperationOffsets;
  result: DropResult;
}

type SubscriptionListener = (model: Model) => void;
export type ShouldUpdateSubscription = (dirty: DirtyViews) => boolean;
interface DirtyViews { dropTargets: string[], dragSources: string[] }

interface Subscription {
  listener: SubscriptionListener;
  shouldUpdate?: ShouldUpdateSubscription;
}

export default class Model {
  registry: Registry;
  currentOperation: DragOperation | null = null;
  stateSubscriptions: Subscription[] = [];
  offsetSubscriptions: Subscription[] = [];
  dirtyViews: DirtyViews | null = null;

  setRegistry = (registry: Registry) => {
    this.registry = registry;
  }

  subscribe = (subscription: Subscription, subscriptionStore: Subscription[]): Unsubscribe => {
    subscriptionStore.push(subscription);

    return () => {
      const index = subscriptionStore.indexOf(subscription);
      subscriptionStore.splice(index, 1);
    }
  }
  subscribeToStateChange = (listener: SubscriptionListener, shouldUpdate: ShouldUpdateSubscription = () => true): Unsubscribe => {
    return this.subscribe({ listener, shouldUpdate }, this.stateSubscriptions);
  }
  subscribeToOffsetChange = (listener: SubscriptionListener, shouldUpdate: ShouldUpdateSubscription = () => true): Unsubscribe => {
    return this.subscribe({ listener, shouldUpdate }, this.offsetSubscriptions);
  }

  push = (store: Subscription[]) => {
    for (const subscription of store) {
      if (subscription.shouldUpdate(this.dirtyViews)) {
        subscription.listener(this);
      }
    }
  }
  pushStateChanges = () => this.push(this.stateSubscriptions)
  pushOffsetChanges = () => this.push(this.offsetSubscriptions)

  getItemType = (): string | null  => {
    if (this.currentOperation) {
      return this.currentOperation.state.itemType;
    }
    return null;
  }

  getDragSourceId = (): string | null => {
    if (this.currentOperation) {
      return this.currentOperation.state.dragSourceId;
    }
    return null;
  }

  getDropTargetIds = (): string[] | null => {
    if (this.currentOperation) {
      return this.currentOperation.state.dropTargetIds;
    }
    return null;
  }

  isDragging = (): boolean => {
    if (this.currentOperation) {
      return true;
    }
    return false;
  }

  isDraggingSource = (id: string): boolean => {
    if (!this.currentOperation) {
      return false;
    }
    return this.currentOperation.state.dragSourceId === id;
  }

  isOverTarget = (id: string): boolean => {
    if (!this.currentOperation) {
      return false
    }
    return this.currentOperation.state.dropTargetIds.indexOf(id) >= 0;
  }

  getClientOffset = (): XYCoordinate | null => {
    if (this.currentOperation) {
      return this.currentOperation.offsets.clientOffset;
    }
    return null;
  }

  getSourceClientOffset = (): XYCoordinate | null => {
    if (this.currentOperation) {
      return this.currentOperation.offsets.sourceClientOffset;
    }
    return null;
  }


  getInitialClientOffset = (): XYCoordinate | null => {
    if (this.currentOperation) {
      return this.currentOperation.offsets.initialClientOffset;
    }
  }

  getInitialSourceClientOffset = (): XYCoordinate | null => {
    if (this.currentOperation) {
      return this.currentOperation.offsets.initialSourceClientOffset;
    }
    return null
  }

  getSourceClientOffsetDifference = (): XYCoordinate | null => {
    if (this.currentOperation) {
      return this.currentOperation.offsets.diff;
    }
    return null;
  }

  getDropResult = (): DropResult | null => {
    if (this.currentOperation) {
      return this.currentOperation.result;
    }
    return null;
  }

  didDrop = (): boolean => {
    if (this.getDropResult()) {
      return true;
    }
    return false;
  }

  beginDrag = (id: string, event: MouseEvent) => {
    const dragSourceViewModel = this.registry.getDragSourceViewModel(id);
    const sourcePosition = (event.currentTarget as HTMLElement).getBoundingClientRect();

    this.currentOperation = {
      state: {
        dragSourceId: id,
        dropTargetIds: [],
        itemType: dragSourceViewModel.itemType,
      },
      offsets: {
        clientOffset: { x: event.clientX, y: event.clientY },
        sourceClientOffset: { x: sourcePosition.left, y: sourcePosition.top },
        initialClientOffset: { x: event.clientX, y: event.clientY },
        initialSourceClientOffset: { x: sourcePosition.left, y: sourcePosition.top },
        diff: { x: event.clientX - sourcePosition.left, y: event.clientY - sourcePosition.top }
      },
      result: null,
    }

    this.dirtyViews = { dragSources: [id], dropTargets: [] };

    this.pushStateChanges();
    this.pushOffsetChanges();

    this.dirtyViews = null;
  }

  move = (event: MouseEvent) => {
    const diff = this.currentOperation.offsets.diff;
    const sourcePosition = { x: event.clientX - diff.x, y: event.clientY - diff.y };
    const clientOffset = { x: event.clientX, y: event.clientY };
    const sourceClientOffset = sourcePosition;

    this.currentOperation.offsets.clientOffset = clientOffset;
    this.currentOperation.offsets.sourceClientOffset = sourceClientOffset;

    this.dirtyViews = { dragSources: [this.getDragSourceId()], dropTargets: [] };

    this.pushOffsetChanges();

    this.dirtyViews = null;
  }

  endDrag = (event: Event) => {
    this.dirtyViews = { dragSources: [this.getDragSourceId()], dropTargets: [] };
    this.currentOperation = null;

    this.pushStateChanges();
    this.pushOffsetChanges();

    this.dirtyViews = null;
  }
}
