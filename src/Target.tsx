import MonitorImpl from './Monitor';
import DropTargetMonitor from './DropTargetMonitor';
import { DropTargetSpecification } from './DropTarget';

export declare interface DropResult { [key: string]: any }

export declare interface Target {
  canDrop: () => boolean;
  drop: () => DropResult;
  enter: (monitor: MonitorImpl, targetId: string) => void;
  leave: (monitor: MonitorImpl, targetId: string) => void;
  hover: () => void;
}

export default class TargetImpl<Props> implements Target {
  monitor: DropTargetMonitor;
  spec: DropTargetSpecification<Props>;
  props: Props;
  element: Element;

  constructor(monitor: DropTargetMonitor, spec: DropTargetSpecification<Props>) {
    this.monitor = monitor
    this.spec = spec;
  }

  receiveProps(props: Props) {
    this.props = props;
  }

  receiveElement(element: Element) {
    this.element = element;
  }

  canDrop = (): boolean => {
    if (!this.props) { return false }
    if (!this.spec.canDrop) { return true }
    return this.spec.canDrop(this.props, this.monitor);
  }

  drop = (): DropResult => {
    if (!this.props) { return null; }
    return this.spec.drop(this.props, this.monitor);
  }

  enter = (contextMonitor: MonitorImpl, targetId: string): void => {
    if (!this.props) { return; }
    if (this.spec.enter) {
      this.spec.enter(this.props, this.monitor);
    }
    contextMonitor.enter(targetId);
  }

  leave = (contextMonitor: MonitorImpl, targetId: string): void => {
    if (!this.props) { return; }
    if (this.spec.leave) {
      this.spec.leave(this.props, this.monitor);
    }
    contextMonitor.leave(targetId);
  }

  hover = (): void => {
    if (!this.props) { return; }
    if (this.spec.hover) {
      this.spec.hover(this.props, this.monitor);
    }
  }
}
