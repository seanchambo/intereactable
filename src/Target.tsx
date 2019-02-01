import MonitorImpl from './Monitor';
import DropTargetMonitor from './DropTargetMonitor';
import { DropTargetSpecification } from './DropTarget';

export declare interface DropResult { [key: string]: any }

export declare interface Target {
  element: HTMLElement;
  canDrop: () => boolean;
  drop: () => DropResult;
  hover: () => void;
}

export default class TargetImpl<Props> implements Target {
  monitor: DropTargetMonitor;
  spec: DropTargetSpecification<Props>;
  props: Props;
  element: HTMLElement;

  constructor(monitor: DropTargetMonitor, spec: DropTargetSpecification<Props>) {
    this.monitor = monitor
    this.spec = spec;
  }

  receiveProps(props: Props) {
    this.props = props;
  }

  receiveElement(element: HTMLElement) {
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

  hover = (): void => {
    if (!this.props) { return; }
    if (this.spec.hover) {
      this.spec.hover(this.props, this.monitor);
    }
  }
}
