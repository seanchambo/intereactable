import Model from "./Model";
import Registry, { Unsubscribe } from "./Registry";

export default class Controller {
  model: Model;
  registry: Registry;

  constructor(model: Model) {
    this.model = model;
  }

  setRegistry = (registry: Registry) => {
    this.registry = registry;
  }

  registerDragSource = (id: string, element: HTMLElement): Unsubscribe => {
    const handleMouseMove = (event: MouseEvent) => {
      this.model.move(event);
    }

    const handleMouseUp = (event: MouseEvent) => {
      this.model.endDrag(event);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    const handleMouseDown = (event: MouseEvent) => {
      const viewModel = this.registry.getDragSourceViewModel(id);
      if (!viewModel.canDrag()) { return; }

      this.model.beginDrag(id, event);

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    element.addEventListener('mousedown', handleMouseDown);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
    }
  }
}
