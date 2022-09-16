import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Image,
  Group,
  Text,
} from 'react-konva';
import React, { useEffect, useRef, useState } from 'react';
import removeIcon from './remove.svg';
import useImage from 'use-image';
import sample from './sample.jpeg';

const Rectangle = ({
  shapeProps,
  onSelect,
  onChange,
  index,
  handleDelete,
  drawMode,
}) => {
  const shapeRef = useRef();
  // console.log('shape', shapeProps);
  const { x, y, width, height } = shapeProps;

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
  const mouseDownIcon = (e) => {
    if (!drawMode) {
      const container = e.target.getStage().container();
      container.style.cursor = 'grabbing';
    }
  };

  return (
    <Group
      id='rectangleGroup'
      name='rectangleGroup'
      // draggable={drawMode ? false : true}
      // onClick={(e) => {
      //   onSelect(shapeRef);
      //   console.log('group event', e);
      // }}
      // onTap={() => onSelect(shapeRef)}
      // ref={shapeRef}
      // onDragEnd={(e) => {
      //   if (drawMode === 'false') {
      //     onChange({
      //       ...shapeProps,
      //       x: e.target.x(),
      //       y: e.target.y(),
      //     });
      //   }
      // }}
      // onTransformEnd={(e) => {
      //   // transformer is changing scale of the node
      //   // and NOT its width or height
      //   // but in the store we have only width and height
      //   // to match the data better we will reset scale on transform end
      //   const node = shapeRef.current;
      //   const scaleX = node.scaleX();
      //   const scaleY = node.scaleY();

      //   // we will reset it back
      //   node.scaleX(1);
      //   node.scaleY(1);
      //   onChange({
      //     ...shapeProps,
      //     x: node.x(),
      //     y: node.y(),
      //     // set minimal value
      //     width: Math.max(5, node.width() * scaleX),
      //     height: Math.max(node.height() * scaleY),
      //   });
      // }}
    >
      <Text
        text={index === 0 ? 'Q' : 'A'}
        fontSize={15}
        x={x - 12}
        y={y - 5}
        // align='center'
      />
      <RemoveImg
        x={x + width}
        y={y - 12}
        onClick={handleDelete}
        mouseEnterIcon={mouseEnterIcon}
        mouseLeaveIcon={mouseLeaveIcon}
      />
      <Text
        text={index === 0 ? 'Question' : 'Answer'}
        fontSize={15}
        x={x + width / 2 - 25}
        y={y + height / 2 - 10}
      />
      <Rect
        onClick={() => onSelect(shapeRef)}
        onTap={() => onSelect(shapeRef)}
        // draggable={drawMode ? false : true}
        // ref={shapeRef.current[getKey]}
        ref={shapeRef}
        {...shapeProps}
        name='rectangle'
        fill='transparent'
        stroke={onmousedown ? 'green' : 'black'}
        onMouseEnter={mouseEnterIcon}
        onMouseLeave={mouseLeaveIcon}
        onMouseDown={(e) => {
          mouseDownIcon(e);
          // console.log('e', e);
        }}
        onMouseUp={(e) => {
          // console.log('mouse up');
          mouseEnterIcon(e);
        }}
        // onMouseMove={(e) => {
        //   // console.log('m move', e);
        //   mouseDownIcon(e);
        // }}
        // onMouseMove={mouseDownIcon}
        onDragEnd={(e) => {
          if (drawMode === 'false') {
            onChange({
              ...shapeProps,
              x: e.target.x(),
              y: e.target.y(),
            });
          }
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

// const initialRectangles = [
//   {
//     x: 10,
//     y: 10,
//     width: 100,
//     height: 100,
//     fill: 'red',
//     id: 1,
//   },
//   {
//     x: 150,
//     y: 150,
//     width: 100,
//     height: 100,
//     fill: 'green',
//     id: 2,
//   },
//   {
//     x: 150,
//     y: 10,
//     width: 100,
//     height: 100,
//     fill: 'green',
//     id: 3,
//   },
// ];

export const CropSelect = () => {
  // const [rectangles, setRectangles] = useState(initialRectangles);
  const [selectedId, selectShape] = useState(null);
  const [nodesArray, setNodes] = useState([]);

  const [drawMode, setDrawMode] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [imageProps, setImageProps] = useState({
    width: 0,
    height: 0,
  });

  const trRef = useRef();
  const layerRef = useRef();
  const Konva = window.Konva;
  const image = new window.Image();
  image.src = sample;

  useEffect(() => {
    setImageProps({
      width: image.width,
      height: image.height,
    });
  }, [image.height, image.width]);

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    const clickedOnImage = e.currentTarget.attrs.id;
    if (clickedOnEmpty || clickedOnImage === 'UrlImage') {
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
    // console.log('node', node);
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
  const handleDelete = (e) => {
    console.log('delete e triggered', e);
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
    // console.log('mouse down', e.target.attrs.id === 'removeImg');
    // if (e.target)
    if (!drawMode) {
      const isElement = e.target.findAncestor('.elements-container');
      const isTransformer = e.target.findAncestor('Transformer');
      if (isElement || isTransformer) {
        return;
      }

      const pos = e.target.getStage().getPointerPosition();
      // console.log('pos', pos, e.target.getStage().children);
      selection.current.visible = true;
      selection.current.x1 = pos.x;
      selection.current.y1 = pos.y;
      selection.current.x2 = pos.x;
      selection.current.y2 = pos.y;
      updateSelectionRect();
    } else if (drawMode && e.target.attrs.id !== 'removeImg') {
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
      if (!selection.current.visible && e.target.attrs.id === 'removeImg') {
        return;
      }

      if (e.target.attrs.id === 'removeImg') {
        console.log('rem img', e.target.attrs.id);
        // Konva.listenClickTap = false;
        // return;
      }
      const selBox = selectionRectRef.current.getClientRect();
      // console.log('sel box', selBox);
      const elements = [];
      // console.log(
      //   'layer ref',
      //   layerRef.current.find('.rectangle'),
      //   layerRef.current.children
      // );
      layerRef.current.find('.rectangleGroup').forEach((elementNode) => {
        const elBox = elementNode.getClientRect();
        console.log('elBox', elBox);
        if (Konva.Util.haveIntersection(selBox, elBox)) {
          elements.push(elementNode);
        }
      });
      trRef.current.nodes(elements.parent);
      console.log('first', elements);
      selection.current.visible = false;
      // disable click event
      updateSelectionRect();
      Konva.listenClickTap = false;
      // }
    } else if (drawMode) {
      if (newAnnotation.length === 1) {
        console.log('mouse up', e);
        const sx = newAnnotation[0].x;
        const sy = newAnnotation[0].y;
        const { x, y } = e.target.getStage().getPointerPosition();
        const annotationToAdd = {
          x: x - sx < 0 ? x : sx,
          y: y - sy < 0 ? y : sy,
          width: Math.abs(x - sx),
          height: Math.abs(y - sy),
          // x: sx,
          // y: sy,
          // width: x - sx,
          // height: y - sy,
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
    // if (selectionRectangle.visible()) {
    //   return;
    // }
    // if (!drawMode) {
    let stage = e.target.getStage();
    console.log('stage', stage);
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
    // if (!e.target.hasName('.rect')) {
    // console.log('came here');
    //   return;
    // }
    // do we pressed shift or ctrl?
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = tr.nodes().indexOf(e.target) >= 0;

    console.log(
      'tr nodes',
      tr.nodes([e.target]),
      'isSelected',
      tr.nodes().indexOf(e.target) >= 0
    );
    if (!metaPressed && !isSelected) {
      // if no key pressed and the node is not selected
      // select just one
      console.log('came here');
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
    // }
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
        width={imageProps.width}
        height={imageProps.height}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        // onTouchStart={checkDeselect}
        onClick={onClickTap}
      >
        <Layer id='UrlImage' onClick={checkDeselect}>
          {/* <URLImage src={sample} x={0} /> */}
          <UrlImage2 src={sample} x={0} />
          {/* <Sample2 /> */}
        </Layer>
        <Layer ref={layerRef} draggable={drawMode ? false : true}>
          {/* {rectangles.map((rect, i) => { */}
          {annotationsToDraw.map((rect, i) => {
            return (
              <Group
                draggable={drawMode ? false : true}
                key={i}
                width={rect.width}
                height={rect.height}
              >
                {/* <Text
                  text={i === 0 ? 'Q' : 'A'}
                  fontSize={15}
                  x={rect.x - 12}
                  y={rect.y - 5}

                  // align='center'
                />
                <RemoveImg
                  x={rect.x + rect.width}
                  y={rect.y}
                  onClick={handleDelete}
                />
                <Text
                  text={i === 0 ? 'Question' : 'Answer'}
                  fontSize={15}
                  x={rect.x + rect.width / 2 - 25}
                  y={rect.y + rect.height / 2 - 10}
                /> */}
                <Rectangle
                  key={i}
                  getKey={i}
                  shapeProps={rect}
                  index={i}
                  handleDelete={handleDelete}
                  drawMode={drawMode}
                  isSelected={rect.id === selectedId}
                  // getLength={rectangles.length}
                  getLength={annotations.length}
                  onSelect={(e) => {
                    if (e.current !== undefined) {
                      console.log('e', { e });
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
                    // const rects = rectangles.slice();
                    const rects = annotations.slice();
                    rects[i] = newAttrs;
                    setAnnotations(rects);
                    // console.log(rects)
                  }}
                ></Rectangle>
                <Transformer
                  // ref={trRef.current[getKey]}
                  ref={trRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    // limit resize
                    console.log('old box , new box', oldBox, newBox);
                    if (newBox.width < 5 || newBox.height < 5) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                />
                <Rect fill='rgba(0,0,255,0.5)' ref={selectionRectRef} />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

const RemoveImg = ({ x, y, onClick }) => {
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
    // loadImage();
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
