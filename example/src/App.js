import * as React from 'react';

import { Provider, DragPreviewViewModel, DragSourceViewModel, DropTargetViewModel } from '../../dist';

const Item = (props) => {
  let style = { width: 100, height: 100, backgroundColor: 'grey' };

  if (props.isDragging) {
    style.opacity = 0;
  }

  return (
    <div style={style} ref={props.registerRef} />
  )
}

const itemCollect = (id, model, registerRef) => ({
  registerRef,
  isDragging: model.isDraggingSource(id),
  clientOffset: model.getClientOffset(),
  sourceClientOffset: model.getSourceClientOffset(),
});

const itemSpec = {
  beginDrag: (props, model) => console.log('** beginDrag'),
  endDrag: (props, model) => console.log('** endDrag'),
}

const DraggableItem = DragSourceViewModel((props) => props.id.toString(), 'item', itemSpec, itemCollect)(Item);

const Zone = (props) => {
  let style = { width: 500, height: 500, backgroundColor: 'yellow', opacity: 0.5 };

  if (props.isOver) {
    style.opacity = 1;
  }

  return (
    <div style={style} ref={props.registerRef} />
  )
}

const zoneCollect = (id, model, registerRef) => ({
  registerRef,
  isOver: model.isOverTarget(id),
});

const zoneSpec = {
  hover: (props, model) => console.log('** hover'),
  drop: (props, model) => console.log('** drop'),
}

const DroppableZone = DropTargetViewModel(() => `1`, 'item', zoneSpec, zoneCollect)(Zone);

const previewContainerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
}

const Preview = (props) => {
  if (!props.isDragging) { return null; }

  return (
    <div style={previewContainerStyles}>
      <div style={{ transform: `translate(${props.sourceClientOffset.x}px, ${props.sourceClientOffset.y}px)`, width: 100, height: 100, backgroundColor: 'grey', opacity: 0.5 }} />
    </div>
  )
}

const previewCollect = (model) => ({
  sourceClientOffset: model.getSourceClientOffset(),
  isDragging: model.isDragging(),
});

const DragLayerPreview = DragPreviewViewModel(previewCollect)(Preview);

class App extends React.Component {
  render() {
    return (
      <Provider>
        <DraggableItem id={1} />
        <DraggableItem id={2} />
        <DroppableZone />
        <DragLayerPreview />
      </Provider>
    )
  }
}

export default App;
