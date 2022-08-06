import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect, Transformer, Group } from 'react-konva';
import UrlImageViewer from '../TestToolv1/UrlImageViewer';
import sample from './../sample.jpeg';
const Rectangle = ({ shapeProps, onSelect, onChange }) => {
  const shapeRef = useRef();
  const { x, y, width, height } = shapeProps;
  const mouseEnterIcon = (e) => {
    // style stage container:
    const container = e.target.getStage().container();
    container.style.cursor = 'pointer';
  };
  const mouseLeaveIcon = (e) => {
    // style stage container:
    const container = e.target.getStage().container();
    container.style.cursor = 'default';
  };
  let rect1 = {
    x: x - 10,
    y: y,
    width: width + 10,
    height: 10,
    fill: 'blue',
    mouseProperty: true,
    isDraggable: true,
    isSelectable: true,
    stroke: 'black',
    name: 'headerRect',
  };
  let rect2 = {
    x: x,
    y: y,
    width: width,
    height: height,
    fill: 'transparent',
    mouseProperty: false,
    isDraggable: false,
    isSelectable: true,
    stroke: 'black',
    hasShapeRef: true,
    name: 'rectangle',
    isTransformable: true,
  };
  let TwoArr = [rect2, rect1];
  return (
    // <Group>
    //   {TwoArr.map((rect, index) => (
    //     <Rect
    //       onMouseEnter={(e) => {
    //         if (rect.mouseProperty === true) {
    //           // console.log('mouse entered');
    //           mouseEnterIcon(e);
    //         }
    //       }}
    //       onMouseLeave={(e) => {
    //         if (rect.mouseProperty === true) {
    //           // console.log('mouse left');
    //           mouseLeaveIcon(e);
    //         }
    //       }}
    //       onMouseDown={(e) => {
    //         console.log('mouse down');
    //       }}
    //       onMouseUp={(e) => {
    //         console.log('mouse up');
    //       }}
    //       key={index}
    //       onClick={() => {
    //         if (rect.isSelectable === true) {
    //           console.log('is selectable');
    //           onSelect(shapeRef);
    //         }
    //       }}
    //       // onTap={() => onSelect(shapeRef)}
    //       // ref={shapeRef.current[getKey]}
    //       ref={rect.hasShapeRef ? shapeRef : null}
    //       // {...shapeProps}
    //       x={rect.x}
    //       y={rect.y}
    //       width={rect.width}
    //       height={rect.height}
    //       name={rect.name}
    //       stroke='black'
    //       // draggable
    //       onDragEnd={(e) => {
    //         onChange({
    //           ...shapeProps,
    //           x: e.target.x(),
    //           y: e.target.y(),
    //         });
    //       }}
    //       onTransformEnd={(e) => {
    //         // transformer is changing scale of the node
    //         // and NOT its width or height
    //         // but in the store we have only width and height
    //         // to match the data better we will reset scale on transform end
    //         if (rect.isTransformable === true) {
    //           const node = shapeRef.current;
    //           const scaleX = node.scaleX();
    //           const scaleY = node.scaleY();

    //           // we will reset it back
    //           node.scaleX(1);
    //           node.scaleY(1);
    //           onChange({
    //             ...shapeProps,
    //             x: node.x(),
    //             y: node.y(),
    //             // set minimal value
    //             width: Math.max(5, node.width() * scaleX),
    //             height: Math.max(node.height() * scaleY),
    //           });
    //         }
    //       }}
    //     />
    //   ))}
    // </Group>
    <Group>
      <Rect
        onMouseEnter={mouseEnterIcon}
        onMouseLeave={mouseLeaveIcon}
        x={x - 10}
        y={y}
        width={width + 20}
        height={30}
        fill='blue'
        draggable
        onClick={() => console.log('clicked on inner rect')}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
      />
      <Rect
        onClick={() => onSelect(shapeRef)}
        onTap={() => onSelect(shapeRef)}
        // ref={shapeRef.current[getKey]}
        ref={shapeRef}
        // {...shapeProps}
        x={x}
        y={y}
        width={width}
        height={height}
        name='rectangle'
        stroke='black'
        // draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
    </Group>
  );
};

const initialRectangles = [
  {
    x: 10,
    y: 10,
    width: 100,
    height: 100,
    fill: 'red',
    id: 'rect1',
  },
  {
    x: 150,
    y: 150,
    width: 100,
    height: 100,
    fill: 'green',
    id: 'rect2',
  },
];

export const DragOnly = () => {
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [rectangles, setRectangles] = useState(initialRectangles);
  const [selectedId, selectShape] = useState(null);
  const [nodesArray, setNodes] = useState([]);
  const trRef = useRef();
  const layerRef = useRef();
  const Konva = window.Konva;

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
      trRef.current.nodes([]);
      setNodes([]);
      // layerRef.current.remove(selectionRectangle);
    }
  };

  const selectionRectRef = useRef();
  const selection = useRef({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });

  const updateSelectionRect = () => {
    const node = selectionRectRef.current;
    node.setAttrs({
      visible: selection.current.visible,
      x: Math.min(selection.current.x1, selection.current.x2),
      y: Math.min(selection.current.y1, selection.current.y2),
      width: Math.abs(selection.current.x1 - selection.current.x2),
      height: Math.abs(selection.current.y1 - selection.current.y2),
      fill: 'rgba(0, 161, 255, 0.3)',
    });
    node.getLayer().batchDraw();
  };

  const oldPos = useRef(null);
  const onMouseDown = (e) => {
    if (newAnnotation.length === 0) {
      const { x, y } = e.target.getStage().getPointerPosition();
      setNewAnnotation([{ x, y, width: 0, height: 0, key: '0' }]);
    }
    //multi select rectangle
    // const isElement = e.target.findAncestor('.elements-container');
    // const isTransformer = e.target.findAncestor('Transformer');
    // if (isElement || isTransformer) {
    //   return;
    // }
    // const pos = e.target.getStage().getPointerPosition();
    // selection.current.visible = true;
    // selection.current.x1 = pos.x;
    // selection.current.y1 = pos.y;
    // selection.current.x2 = pos.x;
    // selection.current.y2 = pos.y;
    // updateSelectionRect();
  };

  const onMouseMove = (e) => {
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      const { x, y } = e.target.getStage().getPointerPosition();
      setNewAnnotation([
        {
          x: sx,
          y: sy,
          width: x - sx,
          height: y - sy,
          key: '0',
        },
      ]);
    }
    // if (!selection.current.visible) {
    //   return;
    // }
    // const pos = e.target.getStage().getPointerPosition();
    // selection.current.x2 = pos.x;
    // selection.current.y2 = pos.y;
    // updateSelectionRect();
  };

  const onMouseUp = (e) => {
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      const { x, y } = e.target.getStage().getPointerPosition();
      const annotationToAdd = {
        x: x - sx < 0 ? x : sx,
        y: y - sy < 0 ? y : sy,
        width: Math.abs(x - sx),
        height: Math.abs(y - sy),
        key: annotations.length + 1,
      };
      annotations.push(annotationToAdd);
      setNewAnnotation([]);
      setAnnotations(annotations);
    }
    // oldPos.current = null;
    // if (!selection.current.visible) {
    //   return;
    // }
    // const selBox = selectionRectRef.current.getClientRect();
    // const elements = [];
    // layerRef.current.find('.rectangle').forEach((elementNode) => {
    //   const elBox = elementNode.getClientRect();
    //   if (Konva.Util.haveIntersection(selBox, elBox)) {
    //     elements.push(elementNode);
    //   }
    // });
    // trRef.current.nodes(elements);
    // selection.current.visible = false;
    // // disable click event
    // Konva.listenClickTap = false;
    // updateSelectionRect();
  };

  const onClickTap = (e) => {
    let stage = e.target.getStage();
    let layer = layerRef.current;
    let tr = trRef.current;
    // if click on empty area - remove all selections
    if (e.target === stage) {
      selectShape(null);
      setNodes([]);
      tr.nodes([]);
      layer.draw();
      return;
    }

    // do nothing if clicked NOT on our rectangles
    if (!e.target.hasName('.rect')) {
      return;
    }

    // do we pressed shift or ctrl?
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = tr.nodes().indexOf(e.target) >= 0;

    if (!metaPressed && !isSelected) {
      // if no key pressed and the node is not selected
      // select just one
      tr.nodes([e.target]);
    } else if (metaPressed && isSelected) {
      // if we pressed keys and node was selected
      // we need to remove it from selection:
      const nodes = tr.nodes().slice(); // use slice to have new copy of array
      // remove node from array
      nodes.splice(nodes.indexOf(e.target), 1);
      tr.nodes(nodes);
    } else if (metaPressed && !isSelected) {
      // add the node into selection
      const nodes = tr.nodes().concat([e.target]);
      tr.nodes(nodes);
    }
    layer.draw();
  };

  const annotationsToDraw = [...annotations, ...newAnnotation];

  return (
    <Stage
      width={window.innerWidth + 400}
      height={window.innerHeight + 400}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      // onTouchStart={checkDeselect}
      onClick={checkDeselect}
    >
      {/* <Layer>
        <UrlImageViewer urlImage={sample} x={0} />
      </Layer> */}
      <Layer ref={layerRef}>
        {annotationsToDraw.map((rect, i) => {
          return (
            <Rectangle
              key={i}
              getKey={i}
              shapeProps={rect}
              isSelected={rect.id === selectedId}
              getLength={rectangles.length}
              onSelect={(e) => {
                if (e.current !== undefined) {
                  let temp = nodesArray;
                  if (!nodesArray.includes(e.current)) temp.push(e.current);
                  setNodes(temp);
                  trRef.current.nodes(nodesArray);
                  trRef.current.nodes(nodesArray);
                  trRef.current.getLayer().batchDraw();
                }
                selectShape(rect.id);
              }}
              onChange={(newAttrs) => {
                const rects = annotations.slice();
                rects[i] = newAttrs;
                setAnnotations(rects);
                // console.log(rects)
              }}
            />
          );
        })}

        <Transformer
          // ref={trRef.current[getKey]}
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
        <Rect fill='rgba(0,0,255,0.5)' ref={selectionRectRef} />
      </Layer>
    </Stage>
  );
};
