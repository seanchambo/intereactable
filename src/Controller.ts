import Model from "./Model";
import { Unsubscribe } from "./Registry";

export default class Controller {
  model: Model;

  constructor(model: Model) {
    this.model = model;
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
