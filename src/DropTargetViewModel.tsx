import * as React from 'react';
const shallowEqual = require('shallowequal');

import Model from './Model';
import Registry from './Registry';
import { Consumer } from './Provider';

export interface DropTargetViewModelImpl {
  id: string | null;
  element: HTMLElement | null;
  itemType: string;
  registry: Registry | null;
  model: Model | null;
  handleChange: () => void;
  canDrop: () => boolean;
  hover: () => void;
  drop: () => { [key: string]: any } | null;
}

export type GetId<Props> = (props: Props) => string;
export type Hover<Props> = (props: Props, model: Model) => void;
export type Drop<Props> = (props: Props, model: Model) => { [key: string]: any } | undefined;
export type CanDrop<Props> = (props: Props, model: Model) => boolean;
export type RegisterRef = (element: HTMLElement) => void;
export type DropTargetViewModelCollector = (id: string, model: Model, registerRef: RegisterRef) => { [key: string]: any };

export interface DropTargetViewModelSpecification<Props> {
  hover?: Hover<Props>,
  drop?: Drop<Props>,
  canDrop?: CanDrop<Props>,
}

export default function DropTargetViewModel<Props>(
  getId: GetId<Props>,
  itemType: string,
  spec: DropTargetViewModelSpecification<Props>,
  collect: DropTargetViewModelCollector,
) {
  return (WrappedComponent: React.ComponentClass) => {
    return class DropTargetViewModel extends React.Component<Props> implements DropTargetViewModelImpl {
      id: string | null = null;
      isCurrentlyMounted: boolean;
      element: HTMLElement | null = null;
      itemType: string = itemType;
      registry: Registry | null = null;
      model: Model | null = null;

      public componentDidMount() {
        this.isCurrentlyMounted = true;

        this.receivePropsAndElement(this.props, this.element);
        this.handleChange();
      }

      public componentDidUpdate(prevProps: Props) {
        if (!shallowEqual(this.props, prevProps)) {
          this.receivePropsAndElement(this.props, this.element);
          this.handleChange();
        }
      }

      public componentWillUnmount() {
        this.registry.unregisterDropTargetViewModel(this.id);
        this.id = null;
        this.element = null;
        this.isCurrentlyMounted = false;
      }

      public handleChange = () => {
        if (!this.isCurrentlyMounted) { return; }

        const state = collect(this.id, this.model, this.registerRef);

        if (!shallowEqual(state, this.state)) {
          this.setState(state);
        }
      }

      public registerRef = (element: HTMLElement | null) => {
        this.receivePropsAndElement(this.props, element);
        this.handleChange();
      }

      public receivePropsAndElement = (props: Props, element: HTMLElement | null) => {
        const id = getId(props);

        if ((id !== this.id || this.element !== element) && element !== null) {
          this.registry.unregisterDropTargetViewModel(this.id);
          this.id = id;
          this.element = element;
          this.registry.registerDropTargetViewModel(this.id, this);
        }
      }

      public hover = (): void => spec.hover && spec.hover(this.props, this.model);
      public drop = (): { [key: string]: any } | undefined => spec.drop && spec.drop(this.props, this.model);
      public canDrop = (): boolean => spec.canDrop ? spec.canDrop(this.props, this.model) : true;

      render() {
        return (
          <Consumer>
            {({ model, registry }) => {
              this.model = model;
              this.registry = registry;

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
