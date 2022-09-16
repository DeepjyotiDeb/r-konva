import {
  ContentCopyOutlined,
  ModeEdit,
  PhotoSizeSelectSmall,
} from '@mui/icons-material';
import { Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { useRef, useState } from 'react';
import { Group, Layer, Rect, Stage, Text, Transformer } from 'react-konva';
import { uuid } from './helperFuntions/CustomUuid';
import { useKeyPress, useKeyUp } from './helperFuntions/useKey';

// import RemoveShape from './remove.svg';
import UrlImageViewer from './TestToolv1/UrlImageViewer';
import sample from './sample.jpeg';
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
  index,
  // dragState,
  setDragState,
}) => {
  const shapeRef = useRef();
  const { x, y, width, height } = shapeProps;
  // console.log({ shapeProps });
  const [toolVisible, setToolVisible] = useState(true);
  const [coords, setCoords] = useState({
    xPos: x,
    yPos: y,
    Cwidth: width,
    Cheight: height,
  });
  const mouseEnterIcon = (e) => {
    const container = e.target.getStage().container();
    container.style.cursor = 'pointer';
  };
  const mouseLeaveIcon = (e) => {
    const container = e.target.getStage().container();
    container.style.cursor = 'default';
  };
  return (
    <Group
      visible={(Math.abs(width) || Math.abs(height)) < 2 ? false : true}
      id={`${shapeProps.id}`}
    >
      <Text
        fill={index === 0 ? '#ff0000' : '#000000'}
        text={shapeProps.label}
        // text={index === 0 ? 'Q' : 'A'}
        fontSize={15}
        x={coords.xPos + width / 2 - 6}
        y={coords.yPos + height / 2 - 10}
        visible={toolVisible}
      />
      {/* <RemoveShape
        x={coords.xPos + width}
        y={coords.yPos - 12}
        onClick={handleDelete}
        mouseEnterIcon={mouseEnterIcon}
        mouseLeaveIcon={mouseLeaveIcon}
        // draw={draw}
        // setDraw={setDraw}
        visible={toolVisible && index !== 0}
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
        stroke={index === 0 ? '#c87878' : '#000000'}
        fill={index === 0 ? '#ffa5a510' : '#bbbbbb50'}
        draggable={draw === true ? false : true}
        onDragStart={() => {
          // console.log('dragState', dragState);
          setDragState(true);
        }}
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
  //   // stageHeight,
  //   // stageWidth,
  //   // imgSrc,
  //   // // coordinates,
  //   // onChange,
  //   // onDelete,
  //   // draw,
  // } = props;
  let stageHeight = 1280;
  let stageWidth = 920;
  let imgSrc = sample;
  const onChange = (values) => {
    setCoordinates(values);
  };
  const onDelete = () => console.log('log anot');
  const [selectedId, selectShape] = useState(null);
  const [nodesArray, setNodes] = useState([]);
  const trRef = useRef();
  const layerRef = useRef();
  const Konva = window.Konva;

  const [annotations, setAnnotations] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  // const [annos, setAnnos] = useState([]);
  const [draw, setDraw] = useState(true);
  const [select, setSelect] = useState(false); //used for determining whether single box is selected or draw-to-multiselect happened
  const [shiftKeyDown, setShiftKeyDown] = useState(false);
  const [dragState, setDragState] = useState(false);

  const [disableDraw, setDisableDraw] = useState(false);
  // const [copiedObj, setCopiedObj] = useState([]);

  const onKeyDown = () => {
    setShiftKeyDown(true);
  };
  const onKeyUp = () => {
    setShiftKeyDown(false);
  };
  useKeyPress(['Shift'], onKeyDown);
  useKeyUp(['Shift'], onKeyUp);

  const handleDelete = (e) => {
    const groupId = e.target.parent.attrs.id;

    let annoIndex = coordinates.findIndex((item) => item.id === groupId);
    // let annotatIndex = annotations.findIndex((item) => item.id === groupId);
    const container = e.target.getStage().container();
    container.style.cursor = 'default';
    e.target.parent.destroy(); //canvas remove
    // let newAnnot = annotations.filter((ann) => ann.id !== groupId.toString());

    coordinates.splice(annoIndex, 1);
    coordinates.forEach((item, index) => {
      if (index !== 0) {
        item.label = `A${index}`;
        annotations.forEach((innerAnno) => {
          if (innerAnno.id === item.id) {
            innerAnno.label = `A${index}`;
          }
        });
      }
    });
    onDelete(coordinates);
    setAnnotations(annotations);
    console.log({ annoIndex, coordinates });
    // onDelete(coordinates);
  };

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.currentTarget.getStage();
    // const clickedOnImage = e.target.parent.attrs.id;
    // console.log('in here', clickedOnImage, e.target.parent.getStage());
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

  const oldPos = useRef(null);
  const onMouseDown = (e) => {
    // console.log('abt obj', e);
    // if (e.evt.shiftKey === true) {
    //   setShiftKeyDown(true);
    // } else setShiftKeyDown(false);
    if (disableDraw) return;
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
        setNewAnnotation([
          {
            x,
            y,
            width: 0,
            height: 0,
            id: '0',
            label: annotations.length === 0 ? 'Q' : `A${coordinates.length}`,
          },
        ]);
      }
    }
  };

  const onMouseMove = (e) => {
    if (disableDraw) return;
    if (draw === false) {
      // console.log('mouse move', dragState, select);
      // setSelect(true);
      // if (dragState === true) {
      //   // console.log('ms move drag', dragState);
      // }
      if (!selection.current.visible) {
        return;
      }
      const pos = e.target.getStage().getPointerPosition();
      selection.current.x2 = pos.x;
      selection.current.y2 = pos.y;
      updateSelectionRect();
      setSelect(true);
    }
    if (draw) {
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
            label: annotations.length === 0 ? 'Q' : `A${coordinates.length}`,
            // label: 'o',
          },
        ]);
      }
    }
  };
  // console.log('trRef current', trRef.current);
  const onMouseUp = (e) => {
    if (disableDraw) return;
    if (draw === false) {
      oldPos.current = null;
      if (!selection.current.visible) {
        return;
      }
      const selBox = selectionRectRef.current.getClientRect();
      // if (e.target.attrs.name === 'rectangle') {
      //   // setCopiedObj(e.target.getClientRect());
      //   console.log('rect', e.target.getClientRect());
      // }
      let elements = [];
      layerRef.current.find('.rectangle').forEach((elementNode) => {
        const elBox = elementNode.getClientRect();
        if (Konva.Util.haveIntersection(selBox, elBox)) {
          // console.log('mouse up dragState', dragState);
          if (select) {
            elements.push(elementNode);
            // console.log('triggered if');
          } else {
            elements = [];
            // console.log('triggered else', dragState);
            elements.push(elementNode);
          }
        }
      });
      if (!dragState) {
        trRef.current.nodes(elements);
      }
      selection.current.visible = false;
      // disable click event
      Konva.listenClickTap = false;
      setSelect(false);
      setDragState(false);
      updateSelectionRect();
    }
    if (draw) {
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
          // x: sx,
          // y: sy,
          // width: x - sx,
          // height: y - sy,
          // id: `${annotations.length + 1}`,
          id: `${uuid()}`,
          label: annotations.length === 0 ? 'Q' : `A${coordinates.length}`,
        };
        annotations.push(annotationToAdd);
        setNewAnnotation([]);
        setAnnotations(annotations);
        // console.log('annotationToAdd', annotationToAdd);
        // annos.push(annotationToAdd);
        // setAnnos(annos);
        coordinates.push(annotationToAdd);
        onChange(coordinates);
      }
    }
  };

  const handleCopy = () => {
    const copyButton = document.querySelector('#toolBar');
    const toolBarY = window.scrollY + copyButton.getBoundingClientRect().top;
    const toolBarX = window.scrollX + copyButton.getBoundingClientRect().left;
    //checking to see if there are rects inside the selection
    if (trRef.current.nodes().length !== 0) {
      //// looping over each shape inside the selection, finding the rect attrs, pushing them to annotations for display
      const tempObj = trRef.current.nodes();
      const lastObj = tempObj[tempObj.length - 1];
      // trRef.current.nodes().forEach((node) => {
      // console.log('node', lastObj.attrs);
      const tempCopiedObj = lastObj.attrs;
      const annotationToAdd = {
        x: toolBarX,
        y: toolBarY - 50,
        width: tempCopiedObj.width,
        height: tempCopiedObj.height,
        id: `${uuid()}`,
        label: annotations.length === 0 ? 'Q' : `A${coordinates.length}`,
      };
      annotations.push(annotationToAdd);
      coordinates.push(annotationToAdd);
      setAnnotations(annotations);
      onChange(coordinates);
      // setCopiedObj([]);
      // });
    }
  };

  const onClickTap = (e) => {
    if (disableDraw) return;
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
  const handleAlignment = (event, newAlignment) => {
    if (newAlignment !== null) {
      setDraw(newAlignment);
      // console.log('trRef', trRef.current.nodes());
      console.log({ coordinates, annotations });
    }
  };
  console.log('diable draw', disableDraw);

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
      >
        <ToggleButtonGroup
          value={draw}
          exclusive
          onChange={handleAlignment}
          sx={{
            backgroundColor: '#fbfbfbd3',
          }}
        >
          <ToggleButton
            value={true}
            sx={{
              color: '#000000',
              '&.Mui-selected, &.Mui-selected:hover': {
                color: '#000',
                backgroundColor: '#d0d0d0d3',
              },
            }}
          >
            <ModeEdit />{' '}
          </ToggleButton>
          <ToggleButton
            value={false}
            sx={{
              color: '#000000',
              '&.Mui-selected, &.Mui-selected:hover': {
                color: '#000',
                backgroundColor: '#d0d0d0d3',
              },
            }}
          >
            <PhotoSizeSelectSmall />{' '}
          </ToggleButton>
        </ToggleButtonGroup>
        <Button
          id='copyButton'
          disabled={draw}
          variant='contained'
          startIcon={<ContentCopyOutlined />}
          color={'success'}
          onClick={handleCopy}
          sx={{
            mb: 2,
            ml: 2,
            height: '48px',
          }}
        >
          COPY
        </Button>
      </div>
      <Stage
        width={stageWidth}
        height={stageHeight}
        // onMouseDown={onMouseDown}
        // onMouseMove={onMouseMove}
        // onMouseUp={onMouseUp}
        // onTouchStart={checkDeselect}
        // onClick={onClickTap}
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
                draw={draw}
                setDragState={setDragState}
                coordinates={coordinates}
                isSelected={rect.id === selectedId}
                getLength={annotations.length}
                onSelect={(e) => {
                  if (
                    e.current !== undefined &&
                    draw === false &&
                    shiftKeyDown
                  ) {
                    let temp = nodesArray;
                    if (!nodesArray.includes(e.current)) temp.push(e.current);
                    setNodes(temp);
                    trRef.current.nodes(nodesArray);
                    // trRef.current.nodes(nodesArray);
                    trRef.current.getLayer().batchDraw();
                  }
                  selectShape(rect.id);
                }}
                onChange={(newAttrs) => {
                  const rects = annotations.slice();
                  rects[i] = newAttrs;
                  setAnnotations(rects);
                  console.log({ annotations, rects });
                  const coordIndex = coordinates.findIndex(
                    (coord) => coord.id === rects[i].id
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
            onMouseEnter={() => setDisableDraw(true)}
            onMouseLeave={() => setDisableDraw(false)}
          />
        </Layer>
      </Stage>
    </div>
  );
};
