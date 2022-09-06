import React, { useRef, useState } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Group,
  Image,
  Text,
} from 'react-konva';
import useImage from 'use-image';
import removeIcon from './remove.svg';
import sample from './sample.jpeg';
import UrlImageViewer from './TestToolv1/UrlImageViewer';

const Rectangle = ({
  shapeProps,
  onSelect,
  onChange,
  draw,
  setDraw,
  isShift,
  handleDelete,
  index,
}) => {
  const shapeRef = useRef();
  const { x, y, width, height, label } = shapeProps;

  // console.log({ x, y, label });
  const [toolVisible, setToolVisible] = useState(true);
  const [coords, setCoords] = useState({
    xPos: x,
    yPos: y,
  });
  const mouseEnterIcon = (e) => {
    // style stage container:
    //  if (!drawMode) {
    const container = e.target.getStage().container();
    container.style.cursor = 'pointer';
    //  }
  };
  const mouseLeaveIcon = (e) => {
    //  if (!drawMode) {
    const container = e.target.getStage().container();
    container.style.cursor = 'default';
    //  }
  };
  return (
    <Group visible={(Math.abs(width) || Math.abs(height)) < 2 ? false : true}>
      <Text
        // text={index === 0 ? 'Q' : 'A'}
        text={label}
        fontSize={15}
        x={coords.xPos + width / 2 - 10}
        y={coords.yPos + height / 2 - 10}
        // align='center'
        visible={toolVisible}
      />
      <RemoveImg
        x={coords.xPos + width}
        y={coords.yPos - 12}
        onClick={handleDelete}
        mouseEnterIcon={mouseEnterIcon}
        mouseLeaveIcon={mouseLeaveIcon}
        draw={draw}
        setDraw={setDraw}
        visible={toolVisible}
      />
      <Rect
        onClick={(e) => {
          onSelect(shapeRef);
          console.log('e of rect', e);
        }}
        onTap={() => onSelect(shapeRef)}
        ref={shapeRef}
        {...shapeProps}
        name='rectangle'
        stroke='black'
        // draggable={draw === true ? false : true}
        draggable={isShift === true ? true : false}
        onDragMove={(e) => {
          setCoords((prevState) => ({
            ...prevState,
            xPos: e.target.x(),
            yPos: e.target.y(),
          }));
          setToolVisible(false);
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
  const [annos, setAnnos] = useState([]);
  const [draw, setDraw] = useState(true);

  const [isShift, setIsShift] = useState(false);

  const handleDelete = (e) => {
    const groupId = e.target.parent._id;

    let annosIndex = annos.findIndex((item) => item.id === groupId.toString());
    let annotationIndex = annotations.findIndex(
      (item) => item.id === groupId.toString()
    );
    const container = e.target.getStage().container();
    container.style.cursor = 'default';
    e.target.parent.destroy(); //canvas remove
    // let newAnnot = annotations.filter((ann) => ann.id !== groupId.toString());
    // setAnnotations(newAnnot);
    // annotations.splice(annoIndex, 1);
    // setAnnotations(annotations);
    annos.splice(annosIndex, 1);
    setAnnos(annos);

    annotations[annotationIndex].label = '0';
    // setAnnotations(annotations);
    console.log('annota', annotations);
    let coordlabel = 0;
    annotations.forEach((coord) => {
      if (coord.label !== 'Q' || coord.label !== '0') {
        console.log('coord label', coord.label);
        coord.label = `A${(coordlabel += 1)}`;
      }
    });
    setAnnotations(annotations);
  };

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    const clickedOnImage = e.target.parent.attrs.id;
    console.log('triggered out', e);
    if (
      e.evt.shiftKey === true &&
      (clickedOnEmpty || clickedOnImage === 'UrlImage')
    ) {
      selectShape(null);
      trRef.current.nodes([]);
      setNodes([]);
      console.log('triggered');
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
    // if (draw === false) {
    if (e.evt.shiftKey === true) {
      setIsShift(true);
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
    // if (draw) {
    if (e.evt.shiftKey === false) {
      setIsShift(false);
      console.log('evt', e.evt.shiftKey);
      if (newAnnotation.length === 0) {
        const { x, y } = e.target.getStage().getPointerPosition();
        setNewAnnotation([{ x, y, width: 0, height: 0, id: '0' }]);
      }
    }
  };

  const onMouseMove = (e) => {
    // if (draw === false) {
    if (e.evt.shiftKey === true) {
      setIsShift(true);
      if (!selection.current.visible) {
        return;
      }
      const pos = e.target.getStage().getPointerPosition();
      selection.current.x2 = pos.x;
      selection.current.y2 = pos.y;
      updateSelectionRect();
    }
    // if (draw) {
    if (e.evt.shiftKey === false) {
      setIsShift(false);
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
    // if (draw === false) {
    if (e.evt.shiftKey === true) {
      setIsShift(true);
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
    // if (draw) {
    if (e.evt.shiftKey === false) {
      setIsShift(false);
      if (newAnnotation.length === 1) {
        const sx = newAnnotation[0].x;
        const sy = newAnnotation[0].y;
        const { x, y } = e.target.getStage().getPointerPosition();
        if (Math.abs(x - sx) < 2 || Math.abs(y - sy) < 2) {
          // console.log('inhere');
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
          id: `${e.target.parent._id}`,
          label: annotations.length < 1 ? 'Q' : `A${annotations.length}`,
        };
        annotations.push(annotationToAdd);
        setNewAnnotation([]);
        setAnnotations(annotations);

        annos.push(annotationToAdd);
        setAnnos(annos);
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
      <button onClick={() => console.log({ annotations, annos })}>anno</button>
      <Stage
        width={window.innerWidth + 400}
        height={window.innerHeight + 400}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        // onTouchStart={checkDeselect}
        onClick={checkDeselect}
      >
        <Layer id='UrlImage'>
          <UrlImageViewer urlImage={sample} />
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
                isShift={isShift}
                draw={draw}
                setDraw={setDraw}
                isSelected={rect.id === selectedId}
                getLength={annotations.length}
                onSelect={(e) => {
                  if (e.current !== undefined) {
                    console.log('nodes selected');
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

const RemoveImg = ({ x, y, onClick, draw, setDraw, visible }) => {
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
      visible={visible}
      onMouseEnter={(e) => {
        // style stage container:
        const container = e.target.getStage().container();
        container.style.cursor = 'pointer';
        // setDraw(false);
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage().container();
        container.style.cursor = 'default';
        // setDraw(true);
      }}
    />
  );
};
