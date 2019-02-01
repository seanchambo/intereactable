import * as React from 'react';

import { Provider, DragPreviewViewModel, DragSourceViewModel } from '../../dist';

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

const DraggableItem = DragSourceViewModel(() => `1`, 'item', {}, itemCollect)(Item);

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
        <DraggableItem />
        <DragLayerPreview />
      </Provider>
    )
  }
}

export default App;
