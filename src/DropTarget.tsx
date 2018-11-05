import * as React from 'react';
const interact = require('interactjs');
const shallowEqual = require('shallowequal');

import { Unsubscribe } from './Monitor';
import Manager from './Manager';
import { Consumer } from './Context';
import DropTargetMonitor from './DropTargetMonitor';
import Target from './Target';

export declare interface DropTargetSpecification<Props> {
  canDrop?: (props: Props, monitor: DropTargetMonitor) => boolean;
  drop: (props: Props, monitor: DropTargetMonitor) => any;
  enter?: (props: Props, monitor: DropTargetMonitor) => void;
  leave?: (props: Props, monitor: DropTargetMonitor) => void;
  hover?: (props: Props, monitor: DropTargetMonitor) => void;
}

export declare type RegisterRef = (instance: React.ReactInstance | null) => any;
export declare type DropTargetCollector = (monitor: DropTargetMonitor, registerRef: RegisterRef) => { [key: string]: any };

export declare interface DropTargetOptions<Props> {
  arePropsEqual: (props: Props, prevProps: Props) => boolean;
}

const defaultOptions = { arePropsEqual: shallowEqual };

function DropTarget<Props = React.Props<any>>(itemType: string, spec: DropTargetSpecification<Props>, collect: DropTargetCollector, options: DropTargetOptions<Props> = defaultOptions) {
  return (Decorated) => {
    return class DropTargetContainer extends React.Component<Props> {
      targetId: string;
      isCurrentlyMounted: boolean;
      itemType: string = itemType;
      manager: Manager;
      monitor: DropTargetMonitor;
      target: Target<Props>;
      element: Element;
      interact: any;
      unsubscriptions: Unsubscribe[] = [];

      displayName = `DropTarget(${Decorated.displayName || Decorated.name || 'Component'})`;

      componentDidMount() {
        this.isCurrentlyMounted = true;

        this.target.receiveProps(this.props);
        this.handleChange();
      }

      componentDidUpdate(prevProps: Props) {
        if (!options.arePropsEqual(this.props, prevProps)) {
          this.target.receiveProps(this.props);
          this.handleChange();
        }
      }

      componentWillUnmount() {
        this.unset();
        this.dispose();

        this.target = null;
        this.isCurrentlyMounted = false;
        this.element = null;
        this.manager = null;
        this.interact = null;
        this.monitor = null;
      }

      unset = () => {
        if (this.interact) {
          this.interact['unset']();
        }
      }

      registerRef = (element: React.ReactInstance) => {
        if (element === null) { return; }
        if (!this.isCurrentlyMounted) { return; }
        if (!this.manager) { return; }
        if (element === this.element) { return; }
        if (!(element instanceof Element)) { throw new Error('Ref must be applied to a native DOM Element') }

        this.unset();
        this.element = element;
        this.interact = interact(this.element);

        this.target.receiveElement(this.element);

        this.interact.dropzone({
          ondragenter: () => {
            if (this.monitor.getItemType() === this.itemType) {
              this.target.enter(this.manager.monitor, this.targetId);
            }
          },
          ondragleave: () => {
            if (this.monitor.getItemType() === this.itemType) {
              this.target.leave(this.manager.monitor, this.targetId);
            }
          },
        });
      }

      receiveManager = (manager: Manager) => {
        if (this.manager !== manager) {
          if (this.manager) {
            this.dispose();
          }

          this.manager = manager;
          this.monitor = new DropTargetMonitor(this.manager);
          this.target = new Target(this.monitor, spec);
          const { id, unregister } = this.manager.registry.registerTarget(itemType, this.target);

          this.targetId = id;
          this.monitor.receiveId(this.targetId);

          this.unsubscriptions.push(unregister);
          this.unsubscriptions.push(this.monitor.subscribeToOffsetChange(this.handleChange));
          this.unsubscriptions.push(this.monitor.subscribeToStateChange(this.handleChange));
        }
      }

      handleChange = () => {
        if (!this.isCurrentlyMounted) { return; }

        const state = collect(this.monitor, this.registerRef);

        if (!shallowEqual(state, this.state)) {
          this.setState(state);
        }
      }

      dispose = () => {
        this.unsubscriptions.forEach((unsubscribe) => unsubscribe());
        this.unsubscriptions = [];
      }

      render() {
        return (
          <Consumer>
            {({ manager }) => {
              if (!manager) { return null; }

              this.receiveManager(manager);

              if (!this.isCurrentlyMounted) { return null; }

              return (
                <Decorated
                  {...this.props}
                  {...this.state} />
              )
            }}
          </Consumer>
        )
      }
    }
  }
}

export default DropTarget;