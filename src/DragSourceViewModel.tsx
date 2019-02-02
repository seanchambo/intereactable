import * as React from 'react';
const shallowEqual = require('shallowequal');

import Model from './Model';
import Registry from './Registry';
import { Consumer } from './Provider';

export interface DragSourceViewModelImpl {
  id: string | null;
  element: HTMLElement | null;
  itemType: string;
  registry: Registry | null;
  model: Model | null;
  handleChange: () => void;
  canDrag: () => boolean;
  beginDrag: () => void;
  endDrag: () => void;
}

export type GetId<Props> = (props: Props) => string;
export type BeginDrag<Props> = (props: Props, model: Model) => void;
export type EndDrag<Props> = (props: Props, model: Model) => void;
export type CanDrag<Props> = (props: Props, model: Model) => boolean;
export type RegisterRef = (element: HTMLElement) => void;
export type DragSourceViewModelCollector = (id: string, model: Model, registerRef: RegisterRef) => { [key: string]: any };

export interface DragSourceViewModelSpecification<Props> {
  beginDrag?: BeginDrag<Props>,
  endDrag?: EndDrag<Props>,
  canDrag?: CanDrag<Props>,
}

export default function DragSourceViewModel<Props>(
  getId: GetId<Props>,
  itemType: string,
  spec: DragSourceViewModelSpecification<Props>,
  collect: DragSourceViewModelCollector,
) {
  return (WrappedComponent: React.ComponentClass) => {
    return class DragSourceViewModel extends React.Component<Props> implements DragSourceViewModelImpl {
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
        this.registry.unregisterDragSourceViewModel(this.id);
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
          this.registry.unregisterDragSourceViewModel(this.id);
          this.id = id;
          this.element = element;
          this.registry.registerDragSourceViewModel(this.id, this);
        }
      }

      public canDrag = (): boolean => spec.canDrag ? spec.canDrag(this.props, this.model) : true;
      public beginDrag = (): void => spec.beginDrag && spec.beginDrag(this.props, this.model);
      public endDrag = (): void => spec.endDrag && spec.endDrag(this.props, this.model);

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
