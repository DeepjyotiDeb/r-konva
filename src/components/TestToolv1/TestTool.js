// import React, { useEffect, useRef, useState } from 'react';
// import { Group, Layer, Rect, Stage, Text, Transformer } from 'react-konva';
// import UrlImageViewer from './UrlImageViewer';
// import sample from './../sample.jpeg';

// const Rectangle = (props) => {
//   const { shapeProps, onSelect, onChange, index } = props;
//   const shapeRef = useRef();
//   const { x, y, width, height } = shapeProps;
//   const [textCoord, setTextCoord] = useState({
//     xPos: x,
//     yPos: y,
//   });
//   const [toolTip, setToolTip] = useState(true);

//   return (
//     <Group name='rectGrp'>
//       <Text
//         text={index === 0 ? 'Q' : 'A'}
//         fontSize={15}
//         x={textCoord.xPos + width / 2 - 5}
//         y={textCoord.yPos + height / 2 - 10}
//         visible={toolTip}
//       />
//       <Rect x={x} y={y} width={width} height={20} />
//       <Rect
//         onClick={() => onSelect(shapeRef)}
//         onTap={() => onSelect(shapeRef)}
//         // ref={shapeRef.current[getKey]}
//         ref={shapeRef}
//         {...shapeProps}
//         // x={x}
//         // y={y}
//         // width={width}
//         // height={height}
//         name='rectangle'
//         draggable
//         onDragStart={() => {
//           setToolTip(false);
//         }}
//         onDragEnd={(e) => {
//           onChange({
//             ...shapeProps,
//             x: e.target.x(),
//             y: e.target.y(),
//           });
//           setToolTip(false);
//         }}
//         onTransformEnd={(e) => {
//           // transformer is changing scale of the node
//           // and NOT its width or height
//           // but in the store we have only width and height
//           // to match the data better we will reset scale on transform end
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
//         }}
//       />
//     </Group>
//   );
// };

// const TestTool = () => {
//   // eslint-disable-next-line no-unused-vars
//   const urlLink =
//     'https://smartpaper-crops.s3.ap-south-1.amazonaws.com/nirmal/Maths+Test+3-1.jpg';
//   const [annotations, setAnnotations] = useState([]);
//   const [newAnnotation, setNewAnnotation] = useState([]);
//   const [selectedId, selectShape] = useState(null);
//   const [nodesArray, setNodes] = useState([]);
//   const trRef = useRef();
//   const selectionRectRef = useRef();
//   const layerRef = useRef();
//   const Konva = window.Konva;

//   const handleMouseDown = (event) => {
//     if (newAnnotation.length === 0) {
//       const { x, y } = event.target.getStage().getPointerPosition();
//       setNewAnnotation([{ x, y, width: 0, height: 0, key: '0' }]);
//     }
//   };

//   const handleMouseMove = (event) => {
//     if (newAnnotation.length === 1) {
//       const sx = newAnnotation[0].x;
//       const sy = newAnnotation[0].y;
//       const { x, y } = event.target.getStage().getPointerPosition();
//       setNewAnnotation([
//         {
//           x: sx,
//           y: sy,
//           width: x - sx,
//           height: y - sy,
//           key: '0',
//         },
//       ]);
//     }
//   };

//   const handleMouseUp = (event) => {
//     if (newAnnotation.length === 1) {
//       const sx = newAnnotation[0].x;
//       const sy = newAnnotation[0].y;
//       const { x, y } = event.target.getStage().getPointerPosition();
//       const annotationToAdd = {
//         x: x - sx < 0 ? x : sx,
//         y: y - sy < 0 ? y : sy,
//         width: Math.abs(x - sx),
//         height: Math.abs(y - sy),
//         key: annotations.length + 1,
//       };
//       annotations.push(annotationToAdd);
//       setNewAnnotation([]);
//       setAnnotations(annotations);
//     }
//   };

//   const annotationsToDraw = [...annotations, ...newAnnotation];

//   return (
//     <div>
//       <Stage
//         width={920}
//         height={1280}
//         onMouseDown={handleMouseDown}
//         onMouseUp={handleMouseUp}
//         onMouseMove={handleMouseMove}
//       >
//         <Layer>
//           <UrlImageViewer urlImage={sample} x={0} />
//         </Layer>
//         <Layer>
//           {annotationsToDraw.map((rect, i) => {
//             return (
//               <Rectangle
//                 key={i}
//                 getKey={i}
//                 shapeProps={rect}
//                 isSelected={rect.id === selectedId}
//                 getLength={annotations.length}
//                 onSelect={(e) => {
//                   if (e.current !== undefined) {
//                     let temp = nodesArray;
//                     if (!nodesArray.includes(e.current)) temp.push(e.current);
//                     setNodes(temp);
//                     trRef.current.nodes(nodesArray);
//                     trRef.current.nodes(nodesArray);
//                     trRef.current.getLayer().batchDraw();
//                   }
//                   selectShape(rect.id);
//                 }}
//                 onChange={(newAttrs) => {
//                   const rects = annotations.slice();
//                   rects[i] = newAttrs;
//                   setAnnotations(rects);
//                   // console.log(rects)
//                 }}
//               />
//             );
//           })}
//           <Transformer
//             // ref={trRef.current[getKey]}
//             ref={trRef}
//             boundBoxFunc={(oldBox, newBox) => {
//               // limit resize
//               if (newBox.width < 5 || newBox.height < 5) {
//                 return oldBox;
//               }
//               return newBox;
//             }}
//           />
//           <Rect fill='rgba(0,0,255,0.5)' ref={selectionRectRef} />
//         </Layer>
//       </Stage>
//     </div>
//   );
// };

// export default TestTool;

import React, { useState } from 'react';
import { Stage, Layer, Rect, Group, Text } from 'react-konva';

const TestTool = () => {
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);

  const handleMouseDown = (event) => {
    if (newAnnotation.length === 0) {
      const { x, y } = event.target.getStage().getPointerPosition();
      setNewAnnotation([{ x, y, width: 0, height: 0, key: '0' }]);
    }
  };
  const handleMouseMove = (event) => {
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
  };
  const handleMouseUp = (event) => {
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
  };
  const annotationsToDraw = [...annotations, ...newAnnotation];
  return (
    <>
      <button onClick={() => console.log({ annotations })}>show</button>
      <Stage
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        width={900}
        height={700}
      >
        <Layer>
          {annotationsToDraw.map((value, index) => {
            return (
              <Group
                key={index}
                visible={(value.width || value.height) < 2 ? false : true}
              >
                <Text text='a' x={value.x + 10} y={value.y + 10} />
                <Rect
                  x={value.x}
                  y={value.y}
                  width={value.width}
                  height={value.height}
                  fill='transparent'
                  stroke='black'
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </>
  );
};

export default TestTool;
