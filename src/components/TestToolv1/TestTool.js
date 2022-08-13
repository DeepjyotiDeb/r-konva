import React, { useRef, useState } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Group,
  Text,
  Transformer,
  Image,
} from 'react-konva';
import useImage from 'use-image';
import expandIcon from './../expand-arrow.svg';
const Rectangle = (props) => {
  const { shapeProps, onSelect, onChange, index, draw, setDraw } = props;
  const { x, y, width, height } = shapeProps;

  const shapeRef = useRef();

  const MyImage = ({ x, y }) => {
    const [image] = useImage(expandIcon);
    return <Image image={image} width={10} height={10} x={x} y={y} draggable />;
  };

  const [coord, setCoord] = useState({
    xPos: x,
    yPos: y,
  });
  return (
    <>
      <Group key={index} visible={(width || height) < 2 ? false : true}>
        <Text text='a' x={coord.xPos + 10} y={coord.yPos + 10} />
        <MyImage x={coord.xPos - 10} y={coord.yPos - 10} />

        <Rect
          // ref={shapeRef}
          onMouseDown={() => {
            console.log('mouse down');
            // setDraw(true);
          }}
          onMouseMove={() => {
            // setDraw(false);
          }}
          onMouseUp={() => {
            console.log('mouse up', draw);
            // if (draw) {
            onSelect(shapeRef);
            // }
          }}
          x={coord.xPos}
          y={coord.yPos}
          width={width}
          height={height}
          fill='transparent'
          stroke='black'
          // draggable
          onDragMove={(e) => {
            setCoord({ xPos: e.target.x(), yPos: e.target.y() });
          }}
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
            console.log('node', node);
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
        <Rect
          onClick={() => {
            console.log('clicked on small rect');
          }}
          ref={shapeRef}
          onMouseEnter={() => setDraw(false)}
          onMouseLeave={() => setDraw(true)}
          draggable
          onDragMove={(e) => {
            setCoord({ xPos: e.target.x(), yPos: e.target.y() });
          }}
          // onDragEnd={(e) => {
          //   onChange({
          //     ...shapeProps,
          //     x: e.target.x(),
          //     y: e.target.y(),
          //   });
          // }}
          stroke='black'
          x={coord.xPos}
          y={coord.yPos}
          width={width}
          height={10}
        />
      </Group>
    </>
  );
};

const TestTool = () => {
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [selectedId, selectShape] = useState(null);
  const [nodesArray, setNodes] = useState([]);
  const trRef = useRef();
  const layerRef = useRef();

  const [draw, setDraw] = useState(true);

  const selectionRectRef = useRef();
  const selection = useRef({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    setDraw(true);
    if (clickedOnEmpty || e.target.parent.attrs.id === 'UrlImage') {
      selectShape(null);
      trRef.current.nodes([]);
      setNodes([]);
      // layerRef.current.remove(selectionRectangle);
    }
  };

  const handleMouseDown = (event) => {
    if (draw) {
      if (newAnnotation.length === 0) {
        const { x, y } = event.target.getStage().getPointerPosition();
        setNewAnnotation([{ x, y, width: 0, height: 0, key: '0' }]);
      }
    }
  };
  const handleMouseMove = (event) => {
    if (draw) {
      if (newAnnotation.length === 1) {
        const sx = newAnnotation[0].x;
        const sy = newAnnotation[0].y;
        const { x, y } = event.target.getStage().getPointerPosition();

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
    }
  };
  const handleMouseUp = (event) => {
    if (draw) {
      if (newAnnotation.length === 1) {
        const sx = newAnnotation[0].x;
        const sy = newAnnotation[0].y;
        const { x, y } = event.target.getStage().getPointerPosition();
        if ((x - sx || y - sy) < 2) {
          setNewAnnotation([]);
          return;
        }
        const annotationToAdd = {
          x: sx,
          y: sy,
          width: x - sx,
          height: y - sy,
          key: annotations.length + 1,
        };
        annotations.push(annotationToAdd);
        setNewAnnotation([]);
        setAnnotations(annotations);
      }
    }
  };
  const annotationsToDraw = [...annotations, ...newAnnotation];
  return (
    <>
      <button
        onClick={() => {
          console.log({ annotations, draw });
          setDraw(!draw);
        }}
      >
        draw toggle
      </button>
      <button
        onClick={() => {
          console.log({ annotations, draw });
        }}
      >
        log
      </button>
      <Stage
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClick={checkDeselect}
        width={900}
        height={700}
      >
        <Layer ref={layerRef}>
          {annotationsToDraw.map((rect, i) => {
            return (
              <Rectangle
                draw={draw}
                setDraw={setDraw}
                key={i}
                getKey={i}
                shapeProps={rect}
                isSelected={rect.id === selectedId}
                getLength={annotations.length}
                selection={selection}
                // selectMode={selectMode}
                // setSelectMode={setSelectMode}
                // drawRef={drawRef}
                onSelect={(e) => {
                  if (e.current !== undefined) {
                    setDraw(false);
                    let temp = nodesArray;
                    if (!nodesArray.includes(e.current)) temp.push(e.current);
                    console.log('nodes set', temp);
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
                index={i}
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
    </>
  );
};

export default TestTool;
