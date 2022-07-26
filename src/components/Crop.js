import React, { useState } from 'react';
import { Stage, Layer, Rect, Image, Text, Group } from 'react-konva';
import useImage from 'use-image';
import sample from './sample.jpeg';
import removeIcon from './remove.svg';

export const DrawAnnotations = (props) => {
  const { drag, select, isDelete } = props;
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [dragState, setDragState] = useState({
    isDragging: false,
    x: null,
    y: null,
  });
  const handleDelete = (e) => {
    console.log('delete e', e.target.parent._id);
    const groupId = e.target.parent._id;
    e.target.parent.destroy();
    let annoIndex = annotations.findIndex((item) => item.key === groupId);
    annotations.splice(annoIndex, 1);
    console.log('ann', annoIndex);
    setAnnotations(annotations);
    // console.log('layer', layerId);
  };

  const handleMouseDown = (e) => {
    console.log('mouse down', e);
    if (newAnnotation.length === 0 && !drag && !select) {
      const { x, y } = e.target.getStage().getPointerPosition();
      setNewAnnotation([{ x, y, width: 0, height: 0, key: 0 }]);
    } else if (select) {
      console.log('e after down', e);
    }
  };

  const handleMouseMove = (e) => {
    if (newAnnotation.length === 1 && !drag && !select) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      const { x, y } = e.target.getStage().getPointerPosition();
      setNewAnnotation([
        {
          x: sx,
          y: sy,
          width: x - sx,
          height: y - sy,
          key: 0,
        },
      ]);
    }
  };
  const handleMouseUp = (e) => {
    if (newAnnotation.length === 1 && !drag && !select) {
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
        key: e.target.parent._id,
      };
      annotations.push(annotationToAdd);
      setNewAnnotation([]);
      setAnnotations(annotations);
    }
  };
  const annotationsToDraw = [...annotations, ...newAnnotation];
  return (
    <div>
      <button onClick={() => console.log('anno', annotations, newAnnotation)}>
        Log
      </button>
      <Stage
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        width={window.innerWidth}
        height={1280}
      >
        <Layer>
          <URLImage src={sample} x={0} />
          {annotationsToDraw.map((value, index) => {
            return (
              <Group
                draggable={drag ? true : false}
                key={index}
                width={value.width}
                height={value.height}
              >
                {/* <Text
                  text='X'
                  fontSize={15}
                  x={value.x - 10}
                  y={value.y}
                  onMouseDown={handleDelete}
                /> */}
                <Text
                  text={index === 0 ? 'Q' : 'A'}
                  fontSize={15}
                  x={value.x + value.width}
                  y={value.y}
                />
                <RemoveImg
                  x={value.x - 18}
                  y={value.y - 5}
                  onClick={handleDelete}
                />
                <Text
                  text={index === 0 ? 'Question' : 'Answer'}
                  fontSize={15}
                  x={value.x + value.width / 2 - 25}
                  y={value.y + value.height / 2 - 10}
                />
                <Rect
                  key={index}
                  x={value.x}
                  y={value.y}
                  width={value.width}
                  height={value.height}
                  fill='transparent'
                  stroke={dragState.isDragging ? 'blue' : 'black'}
                  onDragStart={() => {
                    setDragState({
                      isDragging: true,
                    });
                  }}
                  onDragEnd={(e) => {
                    setDragState({
                      isDragging: false,
                      x: e.target.x(),
                      y: e.target.y(),
                    });
                  }}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

class URLImage extends React.Component {
  state = {
    image: null,
  };
  componentDidMount() {
    this.loadImage();
  }
  componentDidUpdate(oldProps) {
    if (oldProps.src !== this.props.src) {
      this.loadImage();
    }
  }
  componentWillUnmount() {
    this.image.removeEventListener('load', this.handleLoad);
  }
  loadImage() {
    // save to "this" to remove "load" handler on unmount
    this.image = new window.Image();
    this.image.src = this.props.src;
    // this.image.width = this.props.src.naturalWidth;
    // this.image.height = this.props.src.naturalHeight;
    this.image.addEventListener('load', this.handleLoad);
  }
  handleLoad = () => {
    // after setState react-konva will update canvas and redraw the layer
    // because "image" property is changed
    this.setState({
      image: this.image,
    });
    // if you keep same image object during source updates
    // you will have to update layer manually:
    // this.imageNode.getLayer().batchDraw();
  };
  render() {
    return (
      <Image
        x={this.props.x}
        y={this.props.y}
        height={1280}
        width={800}
        image={this.state.image}
        ref={(node) => {
          this.imageNode = node;
        }}
      />
    );
  }
}

const RemoveImg = ({ x, y, onClick }) => {
  const [removeImage] = useImage(removeIcon);
  return (
    <Image
      image={removeImage}
      width={18}
      height={18}
      x={x}
      y={y}
      onClick={onClick}
    />
  );
};
