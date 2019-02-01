import * as React from 'react';

import { Provider, DragSource, DragLayer, DropTarget } from '../../dist';

const Item = (props) => {
  let style = { width: 100, height: 100, backgroundColor: 'grey' };

  if (props.isDragging) {
    style = { ...style, opacity: 0 }
  }


  return (
    <div style={style} ref={props.registerRef} />
  )
}

const itemSpec = {
  beginDrag: (props, monitor) => {
    return { id: 1 };
  },
  canDrag: (props, monitor) => {
    return props.draggable;
  },
  endDrag: (props, monitor) => {
    console.log(monitor.didDrop());
    console.log(monitor.getDropResult());
  }
};

const itemCollect = (monitor, registerRef) => ({
  registerRef,
  isDragging: monitor.isDragging(),
  clientOffset: monitor.getClientOffset(),
  clientSourceOffset: monitor.getClientSourceOffset(),
});

const DraggableItem = DragSource('item', itemSpec, itemCollect)(Item);

const Zone = (props) => {
  let style = { width: 500, height: 500, background: 'yellow', position: 'absolute', top: 0, left: 0, zIndex: -1 }

  if (props.isOver) {
    style.opacity = 0.5;
  }

  console.log('** Big Zone: ', props.isOver);

  return (
    <div style={style} ref={props.registerRef}>
      {props.children}
    </div>
  )
}

const Zone1 = (props) => {
  let style = { width: 200, height: 200, background: 'red', position: 'absolute', top: 299, left: 299, zIndex: -1 }

  console.log('** Small Zone:', props.isOver);

  if (props.isOver) {
    style.opacity = 0.5;
  }

  return (
    <div style={style} ref={props.registerRef} />
  )
}

const zoneSpec = {
  drop: (props, monitor) => {
    return { id: 1 }
  }
}

const zoneCollect = (monitor, registerRef) => ({
  registerRef,
  isOver: monitor.isOver(),
});

const DroppableZone = DropTarget('item', zoneSpec, zoneCollect)(Zone);
const DroppableZone1 = DropTarget('item', zoneSpec, zoneCollect)(Zone1);

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
      <div style={{ transform: `translate(${props.clientSourceOffset.x}px, ${props.clientSourceOffset.y}px)`, width: 100, height: 100, backgroundColor: 'grey', opacity: 0.5 }} />
    </div>
  )
}

const previewCollect = (monitor) => ({
  clientSourceOffset: monitor.getClientSourceOffset(),
  isDragging: monitor.isDragging(),
});

const DragLayerPreview = DragLayer(previewCollect)(Preview);

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = { draggable: true };

    this.setDraggable = this.setDraggable.bind(this);
  }

  setDraggable(draggable) {
    this.setState({ draggable });
  }

  render() {
    return (
      <div style={{ width: 2000, height: 2000 }}>
        <button onClick={() => { this.setDraggable(!this.state.draggable) }}>{this.state.draggable ? 'Unset' : 'Set'} Draggable</button>
        <Provider>
          <DroppableZone>
            <DroppableZone1 />
          </DroppableZone>
          <DraggableItem draggable={this.state.draggable} />
          <DragLayerPreview />
        </Provider>
      </div >
    )
  }
}

export default App;
