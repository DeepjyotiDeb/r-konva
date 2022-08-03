import React, { useEffect, useRef, useState } from 'react';
import { Group, Layer, Rect, Stage, Text } from 'react-konva';
import UrlImageViewer from './UrlImageViewer';
import sample from './../sample.jpeg';

const Rectangle = (props) => {
  const { shapeProps, onSelect, onChange, index } = props;
  const shapeRef = useRef();
  const { x, y, width, height } = shapeProps;
  const [textCoord, setTextCoord] = useState({
    xPos: x,
    yPos: y,
  });
  const [toolTip, setToolTip] = useState(true);

  return (
    <Group name='rectGrp'>
      <Text
        text={index === 0 ? 'Q' : 'A'}
        fontSize={15}
        x={textCoord.xPos + width / 2 - 5}
        y={textCoord.yPos + height / 2 - 10}
        visible={toolTip}
      />
    </Group>
  );
};

const TestTool = () => {
  // eslint-disable-next-line no-unused-vars
  const urlLink =
    'https://smartpaper-crops.s3.ap-south-1.amazonaws.com/nirmal/Maths+Test+3-1.jpg';
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);

  const handleMouseDown = (event) => {
    if (newAnnotation.length === 0) {
      const { x, y } = event.target.getStage().getPointerPosition();
      setNewAnnotation([{ x, y, width: 0, height: 0, key: '0' }]);
    }
  };

  const handleMouseUp = (event) => {
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      const { x, y } = event.target.getStage().getPointerPosition();
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

  const annotationsToDraw = [...annotations, ...newAnnotation];

  return (
    <div>
      <Stage
        width={920}
        height={1280}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <Layer>
          <UrlImageViewer urlImage={sample} x={0} />
        </Layer>
        <Layer>
          {annotationsToDraw.map((value) => {
            return (
              <Rect
                x={value.x}
                y={value.y}
                width={value.width}
                height={value.height}
                fill='transparent'
                stroke='black'
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default TestTool;
