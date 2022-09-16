/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { Group, Layer, Rect, Stage, Text, Transformer } from 'react-konva';
import { uuid } from './helperFuntions/CustomUuid';
import { useKeyPress, useKeyUp } from './helperFuntions/useKey';
import UrlImageViewer from './TestToolv1/UrlImageViewer';

import sample from './sample.jpeg';
// import { RemoveShape } from './RemoveShape';
// import removeIcon from './../../../Assets/removeV2.png';
// import removeIcon from './../../../Assets/removeV3.png';

const Rectangle = ({
  shapeProps,
  onSelect,
  onChange,
  draw,
  // setDraw,
  // coordinates,
  handleDelete,
  // index,
  // dragState,
  // setDragState,
}) => {
  const shapeRef = useRef();
  // const { x, y, width, height } = shapeProps;
  const [coords, setCoords] = useState({
    xPos: 0,
    yPos: 0,
    Cwidth: 0,
    Cheight: 0,
  });
  useEffect(() => {
    const { x, y, width, height } = shapeProps;
    // console.log('rect effect')
    setCoords({
      xPos: x,
      yPos: y,
      Cwidth: width,
      Cheight: height,
    });
  }, [shapeProps]);
  // console.log({ shapeProps });
  const [toolVisible, setToolVisible] = useState(true);

  return (
    <Group
      visible={
        (Math.abs(coords.Cwidth) || Math.abs(coords.Cheight)) < 2 ? false : true
      }
      id={`${shapeProps.id}`}
    >
      <Text
        fill={shapeProps.label === 'Q' ? '#ff0000' : '#000000'}
        text={shapeProps.label}
        // text={index === 0 ? 'Q' : 'A'}
        stroke={shapeProps.label === 'Q' ? '#ff0000' : '#000000'}
        strokeWidth={1}
        fontSize={18}
        x={coords.xPos + coords.Cwidth / 2 - 6}
        y={coords.yPos + coords.Cheight / 2 - 10}
        visible={toolVisible}
      />
      {/* <RemoveShape
        x={coords.xPos + coords.Cwidth}
        y={coords.yPos - 12}
        onClick={handleDelete}
        label={shapeProps.label}
        // draw={draw}
        // setDraw={setDraw}
        visible={toolVisible}
      /> */}
      <Rect
        perfectDrawEnabled={false}
        onClick={() => {
          onSelect(shapeRef);
        }}
        onTap={() => onSelect(shapeRef)}
        ref={shapeRef}
        {...shapeProps}
        name='rectangle'
        cornerRadius={2}
        stroke={shapeProps.label === 'Q' ? '#c87878' : '#000000'}
        fill={shapeProps.label === 'Q' ? '#ffa5a510' : '#bbbbbb50'}
        draggable={draw === true ? true : false}
        // onDragStart={() => {
        // console.log('dragState', dragState);
        // setDragState(true);
        // }}
        onDragMove={(e) => {
          setCoords((prevState) => ({
            ...prevState,
            xPos: e.target.x(),
            yPos: e.target.y(),
          }));
          setToolVisible(false);
          // console.log('dragState', dragState);
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
          setCoords((prevState) => ({
            ...prevState,
            xPos: e.target.x(),
            yPos: e.target.y(),
          }));
          setToolVisible(true);
          // console.log('drag end', dragState);
        }}
        onTransformStart={() => {
          setToolVisible(false);
        }}
        onTransformEnd={() => {
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
          setCoords({
            xPos: node.x(),
            yPos: node.y(),
          });
          setToolVisible(true);
        }}
      />
    </Group>
  );
};

export const KonvaCropper = (props) => {
  // const {
  //   stageHeight,
  //   stageWidth,
  //   imgSrc,
  //   coordinates,
  //   onChange,
  //   onDelete,
  //   metaData,
  //   editState,
  //   // handleEdit,
  // } = props;
  const stageHeight = 1280,
    stageWidth = 920,
    imgSrc = sample;
  const onChange = (values) => {
    setCoordinates(values);
  };
  const onDelete = () => console.log();
  const [selectedId, selectShape] = useState(null);
  const [nodesArray, setNodes] = useState([]);
  const trRef = useRef();
  const layerRef = useRef();
  // const oldPos = useRef(null);
  const Konva = window.Konva;

  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [disableMouseAction, setDisableMouseAction] = useState(false);
  //used for determining whether single box is selected or draw-to-multiselect happened
  // const [select, setSelect] = useState(false);
  const [shiftKeyDown, setShiftKeyDown] = useState(false);
  // const [dragState, setDragState] = useState(false);
  const [copiedObj, setCopiedObj] = useState([]);

  const trRefState = () => {
    return trRef.current.nodes().length;
  };

  const copy = (e) => {
    console.log({ coordinates, annotations });
    if (e.key === 'c') {
      // console.log('copy', trRef.current.nodes());
      try {
        if (trRef.current.nodes().length !== 0 && copiedObj.length === 0) {
          const tempCopy =
            trRef.current.nodes()[trRef.current.nodes().length - 1];
          console.log({ tempCopy, trRef });
          setCopiedObj(tempCopy.attrs);
        }
      } catch (error) {
        console.log({ error });
      }
    }
  };

  const paste = (e) => {
    if (e.key === 'v') {
      // console.count('paste', copiedObj, trRef.current?.nodes());
      if (trRefState() !== 0 && copiedObj.length !== 0) {
        const copyButton = document.querySelector('#toolBar');
        const toolBarY =
          window.scrollY + copyButton.getBoundingClientRect().top;
        const toolBarX =
          window.scrollX + copyButton.getBoundingClientRect().left;
        const annotationToAdd = {
          x: toolBarX - 150,
          y: toolBarY + 50,
          width: copiedObj.width,
          height: copiedObj.height,
          id: `${uuid()}`,
          label: annotations.length === 0 ? 'Q' : `A${annotations.length}`,
        };
        updateAnnotations(annotationToAdd);
        setCopiedObj([]);
      }
    }
  };

  const onKeyDown = () => {
    setShiftKeyDown(true);
    // setCKey(true);
    // console.log(`key down: ${event.key}`);
  };
  const onKeyUp = () => {
    setShiftKeyDown(false);
    // setCKey(false);
  };

  useKeyPress(['Shift'], onKeyDown);
  useKeyUp(['Shift'], onKeyUp);
  useKeyPress(['r'], () => {
    setAnnotations([]);
    setNodes([]);
    coordinates.splice(0);
    onDelete(coordinates);
  });
  useKeyPress(['c'], copy);
  useKeyUp(['v'], paste);

  const handleDelete = (e) => {
    const groupId = e.target.parent.attrs.id;

    let annoIndex = coordinates.findIndex((item) => item.id === groupId);
    // let annotatIndex = annotations.findIndex((item) => item.id === groupId);
    const container = e.target.getStage().container();
    container.style.cursor = 'default';
    // trRef.current?.nodes([]); //clear selection if object is selected during delete
    // e.target.parent.destroy(); //canvas remove
    // let newAnnot = annotations.filter((ann) => ann.id !== groupId.toString());

    coordinates.splice(annoIndex, 1);
    coordinates.forEach((item, index) => {
      if (index >= annoIndex) {
        // if (index !== 0) {
        const newLabel = index === 0 ? 'Q' : `A${index}`;
        item.label = newLabel;
        annotations.forEach((innerAnno) => {
          if (innerAnno.id === item.id) {
            innerAnno.label = newLabel;
          }
        });
        // }
      }
    });
    onDelete(coordinates);
    setAnnotations(coordinates);
    console.log({ annoIndex, coordinates });
    // onDelete(coordinates);
  };

  const updateAnnotations = (annotationToAdd) => {
    // console.log({ annotationToAdd });
    annotations.push(annotationToAdd);
    setAnnotations(annotations);
    coordinates.push(annotationToAdd);
    onChange(coordinates);
  };

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.currentTarget.getStage();
    // console.log('in here', clickedOnEmpty);
    if (clickedOnEmpty) {
      // console.log('in deselect');
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

  const onMouseDown = (e) => {
    if (disableMouseAction) return;
    if (shiftKeyDown) {
      const isElement = e.target.findAncestor('.elements-container');
      const isTransformer = e.target.findAncestor('Transformer');
      if (isElement || isTransformer) {
        console.log('failed mouse down');
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
    if (trRefState() === 0 && shiftKeyDown === false) {
      // if (draw) {
      if (newAnnotation.length === 0) {
        const { x, y } = e.target.getStage().getPointerPosition();
        setNewAnnotation([
          {
            x,
            y,
            width: 0,
            height: 0,
            id: '0',
            label: annotations.length === 0 ? 'Q' : `A${annotations.length}`,
          },
        ]);
      }
    }
  };

  const onMouseMove = (e) => {
    if (disableMouseAction) return;
    // if (draw === false) {
    // console.assert(newAnnotation.length > 0);
    if (shiftKeyDown) {
      // console.log('mouse move', dragState, select);
      // setSelect(true);
      // if (dragState === true) {
      //   // console.log('ms move drag', dragState);
      // }
      if (!selection.current.visible) {
        // console.log('failed mouse move');
        return;
      }
      const pos = e.target.getStage().getPointerPosition();
      selection.current.x2 = pos.x;
      selection.current.y2 = pos.y;
      updateSelectionRect();
      // setSelect(true); // need to set this
    }
    // if (draw) {
    if (trRefState() === 0 && shiftKeyDown === false) {
      if (newAnnotation.length === 1) {
        const sx = newAnnotation[0].x;
        const sy = newAnnotation[0].y;
        const { x, y } = e.target.getStage().getPointerPosition();
        if (x - sx < 0 || y - sy < 0) {
          setNewAnnotation([]);
          return;
        }
        // console.log('mouse move props', e);
        setNewAnnotation([
          {
            x: sx,
            y: sy,
            width: x - sx,
            height: y - sy,
            id: '0',
            label: annotations.length === 0 ? 'Q' : `A${annotations.length}`,
            // label: 'o',
          },
        ]);
      }
    }
  };
  // console.log('trRef current', trRef.current);
  const onMouseUp = (e) => {
    if (disableMouseAction) return;
    // if (draw === false) {
    if (shiftKeyDown === true) {
      // console.log('newAnnot ms up', newAnnotation);
      // oldPos.current = null;
      if (!selection.current.visible) {
        return;
      }
      const selBox = selectionRectRef.current.getClientRect();
      let elements = [];
      layerRef.current.find('.rectangle').forEach((elementNode) => {
        const elBox = elementNode.getClientRect();
        if (Konva.Util.haveIntersection(selBox, elBox)) {
          elements.push(elementNode);
          // if (select) {
          //   elements.push(elementNode);
          //   // console.log('triggered if');
          // } else {
          //   elements = [];
          //   // console.log('triggered else', dragState);
          //   elements.push(elementNode);
          // }
        }
      });

      // console.log('elements', elements, 'trRef', trRef);
      // if (dragState) {
      // console.log('first pass', trRef.current.nodes(), elements);
      try {
        console.log('try block', trRef.current.nodes(), elements);
        trRef.current.nodes([...elements]);
      } catch (error) {
        console.log('error', error);
      }
      // trRef.current.getLayer().batchDraw();
      // }
      selection.current.visible = false;
      Konva.listenClickTap = false;
      // setSelect(false);
      // setDragState(false);
      updateSelectionRect();
    }
    // if (draw) {
    if (trRefState() === 0 && shiftKeyDown === false) {
      if (newAnnotation.length === 1) {
        const sx = newAnnotation[0].x;
        const sy = newAnnotation[0].y;
        const { x, y } = e.target.getStage().getPointerPosition();
        if (Math.abs(x - sx) < 2 || Math.abs(y - sy) < 2) {
          setNewAnnotation([]);
          return;
        }
        const annotationToAdd = {
          x: x - sx < 0 ? x : sx,
          y: y - sy < 0 ? y : sy,
          width: Math.abs(x - sx),
          height: Math.abs(y - sy),
          id: `${uuid()}`,
          label: annotations.length === 0 ? 'Q' : `A${annotations.length}`,
        };
        updateAnnotations(annotationToAdd);
        setNewAnnotation([]);
      }
    }
  };

  const onClickTap = (e) => {
    if (disableMouseAction) return;
    if (!shiftKeyDown) {
      let stage = e.target.getStage();
      let layer = layerRef.current;
      let tr = trRef.current;
      // if click on empty area - remove all selections
      if (e.target === stage) {
        selectShape(null);
        setNodes([]);
        tr.nodes([]);
        layer.draw();
        // console.log('trRef', tr.nodes());
        return;
      }

      // do nothing if clicked NOT on our rectangles
      if (e.target.hasName('.rect')) {
        // console.log('rect');
        return;
      }

      // do we pressed shift or ctrl?
      const metaPressed = e.evt.ctrlKey || e.evt.metaKey;
      const isSelected = tr.nodes().indexOf(e.target) >= 0;
      if (!metaPressed && !isSelected && e.target.attrs.id !== 'removeImg') {
        // if no key pressed and the node is not selected
        // select just one
        // console.log('selecting one');
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
    }
  };
  const annotationsToDraw = [...annotations, ...newAnnotation];
  console.log('diable draw', disableMouseAction);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        id='toolBar'
        style={{
          position: 'sticky',
          top: '20px',
          zIndex: '1000',
        }}
      ></div>
      <Stage
        width={stageWidth}
        height={stageHeight}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        // onTouchStart={checkDeselect}
        onTap={onClickTap}
        onClick={onClickTap}
        onDblClick={checkDeselect}
      >
        <Layer id='UrlImage' listening={false}>
          <UrlImageViewer
            urlImage={imgSrc}
            x={0}
            y={0}
            imageHeight={stageHeight}
            imageWidth={stageWidth}
          />
        </Layer>
        <Layer ref={layerRef}>
          {annotationsToDraw.map((rect, i) => {
            return (
              <Rectangle
                key={i}
                index={i}
                handleDelete={handleDelete}
                getKey={i}
                shapeProps={rect}
                draw={trRefState() !== 0}
                // draw={draw}
                // setDragState={setDragState}
                coordinates={coordinates}
                isSelected={rect.id === selectedId}
                getLength={annotations.length}
                onSelect={(e) => {
                  if (
                    e.current !== undefined &&
                    shiftKeyDown
                    // draw === false &&
                  ) {
                    try {
                      let temp = nodesArray;
                      if (!nodesArray.includes(e.current)) temp.push(e.current);
                      setNodes(temp);
                      trRef.current.nodes(nodesArray);
                      // trRef.current.nodes(nodesArray);
                      trRef.current.getLayer().batchDraw();
                    } catch (error) {
                      console.log('error', error);
                    }
                  }
                  selectShape(rect.id);
                }}
                onChange={(newAttrs) => {
                  annotations[i] = newAttrs;
                  setAnnotations(annotations);
                  const coordIndex = coordinates.findIndex(
                    (coord) => coord.id === annotations[i].id
                  );
                  coordinates[coordIndex] = newAttrs;
                  onChange(coordinates);
                  // console.log(rects, coordinates);
                }}
              />
            );
          })}

          <Transformer
            // ref={trRef.current[getKey]}
            onMousedown={() => setDisableMouseAction(true)}
            onMouseUp={() => setDisableMouseAction(false)}
            rotateEnabled={false}
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
          <Rect
            fill='rgba(0,0,255,0.5)'
            ref={selectionRectRef}
            onMousedown={() => setDisableMouseAction(true)}
            onMouseUp={() => setDisableMouseAction(false)}
          />
        </Layer>
      </Stage>
    </div>
  );
};
