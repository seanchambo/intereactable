import Model, { ShouldUpdateSubscription } from "./Model";
import Controller from "./Controller";

export type Unsubscribe = () => void;

interface ViewModel {
  element: HTMLElement;
  itemType: string;
  handleChange: () => void;
}

export default class Registry {
  controller: Controller;
  model: Model;
  dragSources: { [key: string]: { viewModel: ViewModel, subscriptions: Unsubscribe[] } } = {};
  dropTargets: { [key: string]: { viewModel: ViewModel, subscriptions: Unsubscribe[] } } = {};

  constructor(model: Model, controller: Controller) {
    this.model = model;
    this.controller = controller;
  }

  getDragSourceViewModel = (id: string): ViewModel | null => {
    return (this.dragSources[id] && this.dragSources[id].viewModel) || null;
  }
  getDropTargetViewModel = (id: string): ViewModel | null => {
    return (this.dropTargets[id] && this.dropTargets[id].viewModel) || null;
  }

  registerDragSourceViewModel = (id: string, viewModel: ViewModel): void => {
    const shouldUpdate: ShouldUpdateSubscription = (dirtyView) => {
      return dirtyView.dragSources.indexOf(id) >= 0;
    }

    const unsubscribeState = this.model.subscribeToStateChange(viewModel.handleChange, shouldUpdate);
    const unsubscribeOffsets = this.model.subscribeToOffsetChange(viewModel.handleChange, shouldUpdate);
    const unsubscribeController = this.controller.registerDragSource(id, viewModel.element);
    const unregister = () => delete this.dragSources[id];

    const subscriptions = [unsubscribeController, unsubscribeState, unsubscribeOffsets, unregister];

    this.dragSources[id] = { viewModel, subscriptions };
  }
  registerDropTargetViewModel = (id: string, viewModel: ViewModel): void => {
    const shouldUpdate: ShouldUpdateSubscription = (dirtyView) => {
      return dirtyView.dropTargets.indexOf(id) >= 0;
    }

    const unsubscribeState = this.model.subscribeToStateChange(viewModel.handleChange, shouldUpdate);
    const unsubscribeOffsets = this.model.subscribeToOffsetChange(viewModel.handleChange, shouldUpdate);
    const unregister = () => delete this.dropTargets[id];

    const subscriptions = [unsubscribeState, unsubscribeOffsets, unregister];

    this.dropTargets[id] = { viewModel, subscriptions };
  }

  unregisterDragSourceViewModel = (id: string) => {
    this.dragSources[id] && this.dragSources[id].subscriptions.forEach(unsubscribe => unsubscribe());
  }
  unregisterDropTargetViewModel = (id: string) => {
    this.dropTargets[id] && this.dropTargets[id].subscriptions.forEach(unsubscribe => unsubscribe());
  }
}
