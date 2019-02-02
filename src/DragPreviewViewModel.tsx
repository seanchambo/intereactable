import * as React from 'react';
const shallowEqual = require('shallowequal');

import Model from './Model';
import { Unsubscribe } from './Registry';
import { Consumer } from './Provider';

export type DragPreviewViewModelCollector = (model: Model) => { [key: string]: any };

export default function DragPreviewViewModel<Props>(collect: DragPreviewViewModelCollector) {
  return (WrappedComponent: React.ComponentClass) => {
    return class DragPreviewViewModel extends React.Component<Props> {
      isCurrentlyMounted: boolean;
      model: Model | null = null;
      subscriptions: Unsubscribe[] = [];

      public componentDidMount() {
        this.isCurrentlyMounted = true;

        this.handleChange();
      }

      public componentWillUnmount() {
        this.subscriptions.forEach(unsubscribe => unsubscribe());
        this.subscriptions = [];
        this.model = null;
        this.isCurrentlyMounted = false;
      }

      public handleChange = () => {
        if (!this.isCurrentlyMounted) { return; }

        const state = collect(this.model);

        if (!shallowEqual(state, this.state)) {
          this.setState(state);
        }
      }

      public receiveModel = (model: Model) => {
        this.model = model;
        const unsubscribeState = model.subscribeToOffsetChange(this.handleChange);
        const unsubscribeOffset = model.subscribeToStateChange(this.handleChange);

        this.subscriptions = [unsubscribeOffset, unsubscribeState];
      }

      render() {
        return (
          <Consumer>
            {({ model }) => {
              this.receiveModel(model);

              if (!this.isCurrentlyMounted) { return null; }

              return (
                <WrappedComponent
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
