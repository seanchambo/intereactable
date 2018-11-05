import * as React from 'react';

import { Provider, DragSource, DragLayer, DropTarget } from 'intereact';
import DragSourceMonitor from 'intereact/dist/DragSourceMonitor';
import DragLayerMonitor from 'intereact/dist/DragLayerMonitor';
import { RegisterRef, DragSourceSpecification, DragSourceCollector } from 'intereact/dist/DragSource';
import { DropTargetSpecification, DropTargetCollector } from 'intereact/dist/DropTarget';
import { XYCoordinate } from 'intereact/dist/Monitor';
import DropTargetMonitor from 'intereact/dist/DropTargetMonitor';

interface ItemProps extends React.Props<any> {
  draggable: boolean;
  registerRef?: RegisterRef;
  isDragging?: boolean;
  clientOffset?: XYCoordinate;
  clientSourceOffset?: XYCoordinate;
}

const Item = (props: ItemProps) => {
  let style: React.CSSProperties = { width: 100, height: 100, backgroundColor: 'grey' };

  if (props.isDragging) {
    style = { ...style, opacity: 0 }
  }


  return (
    <div style={style} ref={props.registerRef} />
  )
}

const itemSpec: DragSourceSpecification = {
  beginDrag: (props: ItemProps, monitor: DragSourceMonitor) => {
    return { id: 1 };
  },
  canDrag: (props: ItemProps, monitor: DragSourceMonitor) => {
    return props.draggable;
  },
  endDrag: (props: ItemProps, monitor: DragSourceMonitor) => {
    console.log(monitor.didDrop());
    console.log(monitor.getDropResult());
  }
};

const itemCollect: DragSourceCollector = (monitor: DragSourceMonitor, registerRef: RegisterRef) => ({
  registerRef,
  isDragging: monitor.isDragging(),
  clientOffset: monitor.getClientOffset(),
  clientSourceOffset: monitor.getClientSourceOffset(),
});

const DraggableItem = DragSource<ItemProps>('item', itemSpec, itemCollect)(Item);

interface ZoneProps extends React.Props<any> {
  registerRef?: RegisterRef;
  isOver?: boolean;
}

const Zone = (props: ZoneProps) => {
  let style: React.CSSProperties = { width: 500, height: 500, background: 'yellow', position: 'absolute', top: 0, left: 0, zIndex: -1 }

  if (props.isOver) {
    style.opacity = 0.5;
  }

  return (
    <div style={style} ref={props.registerRef}>
      {props.children}
    </div>
  )
}

const Zone1 = (props: ZoneProps) => {
  let style: React.CSSProperties = { width: 200, height: 200, background: 'red', position: 'absolute', top: 299, left: 299, zIndex: -1 }

  if (props.isOver) {
    style.opacity = 0.5;
  }

  return (
    <div style={style} ref={props.registerRef} />
  )
}

const zoneSpec: DropTargetSpecification = {
  drop: (props: ZoneProps, monitor: DropTargetMonitor) => {
    return { id: 1 }
  }
}

const zoneCollect: DropTargetCollector = (monitor: DropTargetMonitor, registerRef: RegisterRef) => ({
  registerRef,
  isOver: monitor.isOver(),
});

const DroppableZone = DropTarget<ZoneProps>('item', zoneSpec, zoneCollect)(Zone);
const DroppableZone1 = DropTarget<ZoneProps>('item1', zoneSpec, zoneCollect)(Zone1);

const previewContainerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
}

interface PreviewProps {
  clientSourceOffset: XYCoordinate,
  isDragging: boolean;
};

const Preview = (props: PreviewProps) => {
  if (!props.isDragging) { return null; }

  return (
    <div style={previewContainerStyles}>
      <div style={{ transform: `translate(${props.clientSourceOffset.x}px, ${props.clientSourceOffset.y}px)`, width: 100, height: 100, backgroundColor: 'grey', opacity: 0.5 }} />
    </div>
  )
}

const previewCollect = (monitor: DragLayerMonitor) => ({
  clientSourceOffset: monitor.getClientSourceOffset(),
  isDragging: monitor.isDragging(),
});

const DragLayerPreview = DragLayer(previewCollect)(Preview);

class App extends React.Component {
  state = { draggable: true };

  setDraggable = (draggable: boolean) => {
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