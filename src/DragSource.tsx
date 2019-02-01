import * as React from 'react';
// const interact = require('interactjs');
const shallowEqual = require('shallowequal');

import { Unsubscribe } from './Monitor';
import Manager from './Manager';
import { Consumer } from './Context';
import DragSourceMonitor from './DragSourceMonitor';
import Source from './Source';

export declare interface DragSourceItem {
  id: string | number;
  [key: string]: any;
}

export declare interface DragSourceSpecification<Props> {
  canDrag?: (props: Props, monitor: DragSourceMonitor) => boolean;
  isDragging?: (props: Props, monitor: DragSourceMonitor) => boolean;
  beginDrag: (props: Props, monitor: DragSourceMonitor) => DragSourceItem;
  move?: (props: Props, monitor: DragSourceMonitor) => void;
  endDrag?: (props: Props, monitor: DragSourceMonitor) => void;
}

export declare type RegisterRef = (instance: React.ReactInstance | null) => any;
export declare type DragSourceCollector = (monitor: DragSourceMonitor, registerRef: RegisterRef) => { [key: string]: any };

export declare interface DragSourceOptions<Props> {
  arePropsEqual: (props: Props, prevProps: Props) => boolean;
}

const defaultOptions = { arePropsEqual: shallowEqual };

function DragSource<Props = React.Props<any>>(itemType: string, spec: DragSourceSpecification<Props>, collect: DragSourceCollector, options: DragSourceOptions<Props> = defaultOptions) {
  return (Decorated) => {
    return class DragSourceContainer extends React.Component<Props> {
      sourceId: string;
      isCurrentlyMounted: boolean;
      itemType: string = itemType;
      manager: Manager;
      monitor: DragSourceMonitor;
      source: Source<Props>;
      element: HTMLElement;
      // interact: any;
      unsubscriptions: Unsubscribe[] = [];

      displayName = `DragSource(${Decorated.displayName || Decorated.name || 'Component'})`;

      componentDidMount() {
        this.isCurrentlyMounted = true;

        this.source.receiveProps(this.props);
        this.handleChange();
      }

      componentDidUpdate(prevProps: Props) {
        if (!options.arePropsEqual(this.props, prevProps)) {
          this.source.receiveProps(this.props);
          this.handleChange();
        }

        // if (this.interact) {
        //   if (this.source.canDrag()) {
        //     (this.interact.draggable as any)(true);
        //   } else {
        //     (this.interact.draggable as any)(false);
        //   }
        // }
      }

      componentWillUnmount() {
        // this.unset();
        this.dispose();

        this.sourceId = null;
        this.isCurrentlyMounted = false;
        this.element = null;
        this.manager = null;
        // this.interact = null;
        this.monitor = null;
      }

      // unset = () => {
      //   if (this.interact) {
      //     this.interact['unset']();
      //   }
      // }

      registerRef = (element: React.ReactInstance) => {
        if (element === null) { return; }
        if (!this.isCurrentlyMounted) { return; }
        if (!this.manager) { return; }
        if (element === this.element) { return; }
        if (!(element instanceof HTMLElement)) { throw new Error('Ref must be applied to a native DOM Element') }

        // this.unset();
        this.element = element;
        // this.interact = interact(this.element);

        this.source.receiveElement(this.element);

        this.element.addEventListener('mousedown', (event: MouseEvent) => {
          const handleMove = (event: MouseEvent) => {
            this.source.move(this.manager.monitor, event);
          }

          const handleEnd = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            this.source.endDrag(this.manager.monitor);
          }

          this.source.beginDrag(this.manager.monitor, this.sourceId, event);
          document.addEventListener('mousemove', handleMove);
          document.addEventListener('mouseup', handleEnd);
        });

        // this.interact.draggable({
        //   maxPerElement: Infinity,
        //   autoScroll: true,
        //   onstart: (event: any) => {
        //     this.source.beginDrag(this.manager.monitor, this.sourceId, event);
        //   },
        //   onmove: (event: any) => {
        //     this.source.move(this.manager.monitor, event);
        //   },
        //   onend: () => {
        //     this.source.endDrag(this.manager.monitor);
        //   },
        // });
      }

      receiveManager = (manager: Manager) => {
        if (this.manager !== manager) {
          if (this.manager) {
            this.dispose();
          }

          this.manager = manager;
          this.monitor = new DragSourceMonitor(this.manager);
          this.source = new Source(this.monitor, spec);
          const { id, unregister } = this.manager.registry.registerSource(itemType, this.source);

          this.sourceId = id;
          this.monitor.receiveId(this.sourceId);

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

export default DragSource;
