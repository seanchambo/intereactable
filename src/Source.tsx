import DragSourceMonitor from "./DragSourceMonitor";
import { DragSourceItem, DragSourceSpecification } from "./DragSource";
import MonitorImpl, { Monitor } from './Monitor';
import { InteractEvent } from 'interactjs';

export declare interface Source {
  element: HTMLElement;
  beginDrag: (monitor: MonitorImpl, sourceId: string, event: MouseEvent) => DragSourceItem;
  canDrag: () => boolean;
  isDragging: (monitor: MonitorImpl, sourceId: string) => boolean;
  move: (monitor: MonitorImpl, event: MouseEvent) => void;
  endDrag: (monitor: MonitorImpl) => void;
}

export default class SourceImpl<Props> implements Source {
  monitor: DragSourceMonitor;
  spec: DragSourceSpecification<Props>;
  props: Props;
  element: HTMLElement;

  constructor(monitor: DragSourceMonitor, spec: DragSourceSpecification<Props>) {
    this.monitor = monitor
    this.spec = spec;
  }

  receiveProps(props: Props) {
    this.props = props;
  }

  receiveElement(element: HTMLElement) {
    this.element = element;
  }

  beginDrag = (contextMonitor: MonitorImpl, sourceId: string, event: MouseEvent): DragSourceItem => {
    if (!this.props) { return null }
    const item = this.spec.beginDrag(this.props, this.monitor);
    contextMonitor.beginDrag(sourceId, item, event);
    return item;
  }

  isDragging = (contextMonitor: MonitorImpl, sourceId: string): boolean => {
    if (!this.props) { return false }
    if (!this.spec.isDragging) { return sourceId === contextMonitor.getSourceId() }
    return this.spec.isDragging(this.props, this.monitor);
  }

  canDrag = (): boolean => {
    if (!this.props) { return false }
    if (!this.spec.canDrag) { return true }
    return this.spec.canDrag(this.props, this.monitor);
  }

  move = (contextMonitor: MonitorImpl, event: MouseEvent): void => {
    if (!this.props) { return; }
    if (this.spec.move) {
      this.spec.move(this.props, this.monitor);
    }
    contextMonitor.move(event);
    contextMonitor.hover();
  }

  endDrag = (contextMonitor: MonitorImpl): void => {
    if (!this.props) { return; }

    contextMonitor.drop();

    if (this.spec.endDrag) {
      this.spec.endDrag(this.props, this.monitor);
    }

    contextMonitor.endDrag();
  }
}
