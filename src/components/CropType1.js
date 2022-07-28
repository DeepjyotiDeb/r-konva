import React, { useEffect, useRef, useState } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Group,
  Text,
  Image,
} from 'react-konva';
import useImage from 'use-image';
import removeIcon from './remove.svg';
import sample from './sample.jpeg';

const Rectangle = (props) => {
  const {
    shapeProps,
    onSelect,
    onChange,
    index,
    handleDelete,
    drawMode,
    setDrawMode,
    selectMode,
    setSelectMode,
    drawRef,
    selectRef,
    selection,
  } = props;

  const shapeRef = useRef();
  const { x, y, width, height } = shapeProps;
  const [textCoord, setTextCoord] = useState({
    xPos: x,
    yPos: y,
  });
  const [toolTip, setToolTip] = useState(true);

  const mouseEnterIcon = (e) => {
    // style stage container:
    if (!drawMode) {
      const container = e.target.getStage().container();
      container.style.cursor = 'pointer';
    }
  };
  const mouseLeaveIcon = (e) => {
    if (!drawMode) {
      const container = e.target.getStage().container();
      container.style.cursor = 'default';
    }
  };

  return (
    <Group name='rectangleGroup'>
      <RemoveImg
        x={textCoord.xPos + width}
        y={textCoord.yPos - 12}
        onClick={handleDelete}
        mouseEnterIcon={mouseEnterIcon}
        mouseLeaveIcon={mouseLeaveIcon}
        toolTipVisible={toolTip}
      />
      <Text
        text={index === 0 ? 'Q' : 'A'}
        fontSize={15}
        x={textCoord.xPos + width / 2 - 5}
        y={textCoord.yPos + height / 2 - 10}
        visible={toolTip}
      />
      <Rect
        onMouseDown={() => {
          console.log('ms dwn happened', selectRef, drawRef);
          // setSelectMode(true);
          selectRef.current = true;
          // if (selectRef.current === true) {
          // setDrawMode(false);
          // drawRef.current = false
          // }
        }}
        onMouseUp={() => {
          if (selectRef.current === true) {
            console.log('select mode', selectMode, shapeRef);
            setDrawMode(false);
            onSelect(shapeRef);
          }
        }} //creates the selection area
        // onTap={() => onSelect(shapeRef)} //same here
        // ref={shapeRef.current[getKey]}
        ref={shapeRef}
        {...shapeProps}
        name='rectangle'
        draggable={drawMode ? false : true}
        fill='transparent'
        stroke='black'
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
          setTextCoord({
            xPos: e.target.x(),
            yPos: e.target.y(),
          });
          setToolTip(true);
        }}
        onDragMove={(e) => {
          setTextCoord({
            xPos: e.target.x(),
            yPos: e.target.y(),
          });
          setToolTip(false);
          // if (selectMode === false) {
          //   setDrawMode(true);
          // }
          if (selectRef.current === true) {
            drawRef.current = true;
            selectRef.current = false;
          }
        }}
        // onMouseEnter={(e) => {
        //   mouseEnterIcon(e);
        // }}
        // onMouseLeave={mouseLeaveIcon}
        onTransform={(e) => {
          setTextCoord({
            xPos: e.target.x(),
            yPos: e.target.y(),
          });
          setToolTip(false);
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          setToolTip(true);
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
          setTextCoord({
            xPos: node.x(),
            yPos: node.y(),
          });
        }}
      />
    </Group>
  );
};

// const initialRectangles = [
//   {
//     x: 10,
//     y: 10,
//     width: 100,
//     height: 100,
//     fill: 'transparent',
//     id: 'rect1',
//   },
//   {
//     x: 150,
//     y: 150,
//     width: 100,
//     height: 100,
//     fill: 'green',
//     id: 'rect2',
//   },
// ];

export const CropType1 = () => {
  // const [rectangles, setRectangles] = useState(initialRectangles);
  const [selectedId, selectShape] = useState(null);
  const [nodesArray, setNodes] = useState([]);

  const [drawMode, setDrawMode] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [selectMode, setSelectMode] = useState(false);

  const drawRef = useRef(true);
  const selectRef = useRef(false);
  // const [imageProps, setImageProps] = useState({
  //   width: 0,
  //   height: 0,
  // });

  const trRef = useRef();
  const layerRef = useRef();
  const Konva = window.Konva;

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty || e.target.parent.attrs.id === 'UrlImage') {
      selectShape(null);
      setDrawMode(true);
      setSelectMode(false);
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

  //delete box
  const handleDelete = (e) => {
    console.log('delete e triggered', e);

    const container = e.target.getStage().container();
    container.style.cursor = 'default';
    selectShape(null);
    trRef.current.nodes([]);
    setNodes([]);

    const groupId = e.target.parent._id;
    e.target.parent.destroy();
    let annoIndex = annotations.findIndex(
      (item) => item.id === groupId.toString()
    );
    annotations.splice(annoIndex, 1);
    console.log('ann', annoIndex);
    setAnnotations(annotations);
  };

  const oldPos = useRef(null);
  const onMouseDown = (e) => {
    // if (!drawMode) {
    const isElement = e.target.findAncestor('.elements-container');
    const isTransformer = e.target.findAncestor('Transformer');
    if (isElement || isTransformer) {
      return;
    }
    const pos = e.target.getStage().getPointerPosition();
    selection.current.visible = false;
    console.log('sel current', selection.current);
    selection.current.x1 = pos.x;
    selection.current.y1 = pos.y;
    selection.current.x2 = pos.x;
    selection.current.y2 = pos.y;
    updateSelectionRect();
    // } else
    if (drawMode && e.target.attrs.id !== 'removeImg') {
      if (newAnnotation.length === 0) {
        const { x, y } = e.target.getStage().getPointerPosition();
        setNewAnnotation([{ x, y, width: 0, height: 0, id: '0' }]);
      }
    }
  };

  const onMouseMove = (e) => {
    if (!drawMode) {
      if (!selection.current.visible) {
        return;
      }
      const pos = e.target.getStage().getPointerPosition();
      selection.current.x2 = pos.x;
      selection.current.y2 = pos.y;
      updateSelectionRect();
    } else if (drawMode) {
      if (newAnnotation.length === 1) {
        const sx = newAnnotation[0].x;
        const sy = newAnnotation[0].y;
        const { x, y } = e.target.getStage().getPointerPosition();
        if (x - sx <= 2 && y - sy <= 2) {
          return;
        }
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
    if (!drawMode) {
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
      // trRef.current.nodes(elements);
      selection.current.visible = true;
      // disable click event
      Konva.listenClickTap = false;
      updateSelectionRect();
    } else if (drawMode) {
      if (newAnnotation.length === 1) {
        const sx = newAnnotation[0].x;
        const sy = newAnnotation[0].y;
        const { x, y } = e.target.getStage().getPointerPosition();
        if (x - sx <= 2 && y - sy <= 2) {
          setNewAnnotation([]);
          return;
        }
        const annotationToAdd = {
          x: x - sx < 0 ? x : sx,
          y: y - sy < 0 ? y : sy,
          width: Math.abs(x - sx),
          height: Math.abs(y - sy),
          id: `${e.target.parent._id}`,
        };
        annotations.push(annotationToAdd);
        setNewAnnotation([]);
        setAnnotations(annotations);
      }
    }
  };

  const onClickTap = (e) => {
    // if we are selecting with rect, do nothing

    if (!drawMode) {
      let stage = e.target.getStage();
      let layer = layerRef.current;
      let tr = trRef.current;
      // if click on empty area - remove all selections
      if (e.target === stage || e.target.parent.attrs.id === 'UrlImage') {
        selectShape(null);
        setNodes([]);
        tr.nodes([]);
        layer.draw();
        return;
      }

      // do nothing if clicked NOT on our rectangles
      if (!e.target.hasName('.rect')) {
        console.log('working rect');
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
      console.log('was here');
      layer.draw();
    }
  };
  const annotationsToDraw = [...annotations, ...newAnnotation];
  return (
    <div>
      <button onClick={() => setDrawMode(!drawMode)}>Draw</button>
      {`${drawMode}`}
      <button onClick={() => console.log('annotations', annotations)}>
        log
      </button>
      <Stage
        width={1200}
        height={1200}
        onMouseDown={(e) => {
          onMouseDown(e);
        }}
        onMouseMove={onMouseMove}
        onMouseUp={(e) => {
          onMouseUp(e);
          console.log('registered from stage');
        }}
        // onTouchStart={checkDeselect}
        onClick={(e) => {
          console.log('registered click tap');
          onClickTap(e);
        }}
      >
        <Layer id='UrlImage' onClick={checkDeselect}>
          <UrlImage2 src={sample} x={0} />
        </Layer>
        <Layer ref={layerRef}>
          {annotationsToDraw.map((rect, i) => {
            return (
              <Rectangle
                key={i}
                getKey={i}
                shapeProps={rect}
                isSelected={rect.id === selectedId}
                getLength={annotations.length}
                selection={selection}
                selectMode={selectMode}
                setSelectMode={setSelectMode}
                drawRef={drawRef}
                selectRef={selectRef}
                onSelect={(e) => {
                  if (e.current !== undefined) {
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
                handleDelete={handleDelete}
                drawMode={drawMode}
                setDrawMode={setDrawMode}
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

const RemoveImg = ({ x, y, onClick, toolTipVisible }) => {
  const [removeImage] = useImage(removeIcon);
  return (
    <Image
      id='removeImg'
      image={removeImage}
      width={18}
      height={18}
      x={x}
      y={y}
      onClick={onClick}
      visible={toolTipVisible}
      onMouseEnter={(e) => {
        // style stage container:
        const container = e.target.getStage().container();
        container.style.cursor = 'pointer';
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage().container();
        container.style.cursor = 'default';
      }}
    />
  );
};

const UrlImage2 = (props) => {
  const [imageProps, setImageProps] = useState({
    imageSrc: null,
    width: 920,
    height: 1280,
  });

  useEffect(() => {
    const image = new window.Image();
    image.src = props.src;
    setImageProps((prevState) => ({
      ...prevState,
      imageSrc: image,
    }));
  }, [props.src]);

  // console.log('image props', imageProps);
  return (
    <Image
      x={props.x}
      y={props.y}
      image={imageProps.imageSrc}
      width={imageProps.width}
      height={imageProps.height}
      // ref={(node) => {
      //   imageNode  node;
      // }}
    />
  );
};
