import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect, Transformer, Group } from 'react-konva';
const Rectangle = ({ shapeProps, onSelect, onChange, draw }) => {
  const shapeRef = useRef();
  const { x, y, width, height } = shapeProps;
  return (
    <Group visible={(width || height) < 2 ? false : true}>
      <Rect
        onClick={() => onSelect(shapeRef)}
        onTap={() => onSelect(shapeRef)}
        ref={shapeRef}
        {...shapeProps}
        name='rectangle'
        stroke='black'
        draggable={draw === true ? false : true}
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

export const CropType1 = () => {
  const [selectedId, selectShape] = useState(null);
  const [nodesArray, setNodes] = useState([]);
  const trRef = useRef();
  const layerRef = useRef();
  const Konva = window.Konva;

  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [draw, setDraw] = useState(true);

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
    if (draw === false) {
      const isElement = e.target.findAncestor('.elements-container');
      const isTransformer = e.target.findAncestor('Transformer');
      if (isElement || isTransformer) {
        return;
      }

      const pos = e.target.getStage().getPointerPosition();
      selection.current.visible = true;
      selection.current.x1 = pos.x;
      selection.current.y1 = pos.y;
      selection.current.x2 = pos.x;
      selection.current.y2 = pos.y;
      updateSelectionRect();
    }
    if (draw) {
      if (newAnnotation.length === 0) {
        const { x, y } = e.target.getStage().getPointerPosition();
        setNewAnnotation([{ x, y, width: 0, height: 0, id: '0' }]);
      }
    }
  };

  const onMouseMove = (e) => {
    if (draw === false) {
      if (!selection.current.visible) {
        return;
      }
      const pos = e.target.getStage().getPointerPosition();
      selection.current.x2 = pos.x;
      selection.current.y2 = pos.y;
      updateSelectionRect();
    }
    if (draw) {
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
            id: '0',
          },
        ]);
      }
    }
  };

  const onMouseUp = (e) => {
    if (draw === false) {
      oldPos.current = null;
      if (!selection.current.visible) {
        return;
      }
      const selBox = selectionRectRef.current.getClientRect();

      const elements = [];
      layerRef.current.find('.rectangle').forEach((elementNode) => {
        const elBox = elementNode.getClientRect();
        if (Konva.Util.haveIntersection(selBox, elBox)) {
          elements.push(elementNode);
        }
      });
      trRef.current.nodes(elements);
      selection.current.visible = false;
      // disable click event
      Konva.listenClickTap = false;
      updateSelectionRect();
    }
    if (draw) {
      if (newAnnotation.length === 1) {
        const sx = newAnnotation[0].x;
        const sy = newAnnotation[0].y;
        const { x, y } = e.target.getStage().getPointerPosition();
        // if (Math.abs(x - sx) < 2 || Math.abs(y - sy) < 2) {
        //   console.log('inhere');
        //   setNewAnnotation([]);
        //   return;
        // }
        const annotationToAdd = {
          x: x - sx < 0 ? x : sx,
          y: y - sy < 0 ? y : sy,
          width: Math.abs(x - sx),
          height: Math.abs(y - sy),
          id: `${annotations.length + 1}`,
        };
        annotations.push(annotationToAdd);
        setNewAnnotation([]);
        setAnnotations(annotations);
      }
    }
  };

  // const onClickTap = (e) => {
  //   // if we are selecting with rect, do nothing
  //   let stage = e.target.getStage();
  //   let layer = layerRef.current;
  //   let tr = trRef.current;
  //   // if click on empty area - remove all selections
  //   if (e.target === stage) {
  //     selectShape(null);
  //     setNodes([]);
  //     tr.nodes([]);
  //     layer.draw();
  //     return;
  //   }

  //   // do nothing if clicked NOT on our rectangles
  //   if (!e.target.hasName('.rect')) {
  //     return;
  //   }

  //   // do we pressed shift or ctrl?
  //   const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
  //   const isSelected = tr.nodes().indexOf(e.target) >= 0;

  //   if (!metaPressed && !isSelected) {
  //     // if no key pressed and the node is not selected
  //     // select just one
  //     tr.nodes([e.target]);
  //   } else if (metaPressed && isSelected) {
  //     // if we pressed keys and node was selected
  //     // we need to remove it from selection:
  //     const nodes = tr.nodes().slice(); // use slice to have new copy of array
  //     // remove node from array
  //     nodes.splice(nodes.indexOf(e.target), 1);
  //     tr.nodes(nodes);
  //   } else if (metaPressed && !isSelected) {
  //     // add the node into selection
  //     const nodes = tr.nodes().concat([e.target]);
  //     tr.nodes(nodes);
  //   }
  //   layer.draw();
  // };
  const annotationsToDraw = [...annotations, ...newAnnotation];
  return (
    <div>
      <button
        onClick={() => {
          setDraw(!draw);
          console.log('draw', draw);
        }}
      >
        toggle draw{`${draw}`}
      </button>
      <button onClick={() => console.log([annotations])}>anno</button>
      <Stage
        width={window.innerWidth + 400}
        height={window.innerHeight + 400}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onTouchStart={checkDeselect}
        // onClick={onClickTap}
      >
        <Layer ref={layerRef}>
          {annotationsToDraw.map((rect, i) => {
            return (
              <Rectangle
                key={i}
                getKey={i}
                shapeProps={rect}
                draw={draw}
                isSelected={rect.id === selectedId}
                getLength={annotations.length}
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
    </div>
  );
};
