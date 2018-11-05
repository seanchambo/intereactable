import * as React from 'react';
const shallowEqual = require('shallowequal');

import { Unsubscribe } from './Monitor';
import Manager from './Manager';
import { Consumer } from './Context';
import DragLayerMonitor from './DragLayerMonitor';

export declare type DragLayerCollector = (monitor: DragLayerMonitor) => { [key: string]: any };

function DragLayer<Props = React.Props<any>>(collect: DragLayerCollector) {
  return (Decorated) => {
    return class DragLayerContainer extends React.Component<Props> {
      isCurrentlyMounted: boolean;
      manager: Manager;
      monitor: DragLayerMonitor;
      unsubscriptions: Unsubscribe[] = [];

      displayName = `DragLayer(${Decorated.displayName || Decorated.name || 'Component'})`;

      componentDidMount() {
        this.isCurrentlyMounted = true;

        this.handleChange();
      }

      componentWillUnmount() {
        this.dispose();

        this.isCurrentlyMounted = false;
        this.manager = null;
        this.monitor = null;
      }

      receiveManager = (manager: Manager) => {
        if (this.manager !== manager) {
          if (this.manager) {
            this.dispose();
          }
          this.manager = manager;
          this.monitor = new DragLayerMonitor(this.manager);
          this.unsubscriptions.push(this.monitor.subscribeToOffsetChange(this.handleChange));
          this.unsubscriptions.push(this.monitor.subscribeToStateChange(this.handleChange));
        }
      }

      handleChange = () => {
        if (!this.isCurrentlyMounted) { return; }

        const state = collect(this.monitor);

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

export default DragLayer;