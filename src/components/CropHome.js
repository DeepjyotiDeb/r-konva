// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import TestTool from './TestToolv1/TestTool';
// import { DrawAnnotations } from './Crop';

const CropHome = () => {
  // const [drag, setDrag] = useState(false);
  // const [select, setSelect] = useState(false);
  // const [isDelete, setIsDelete] = useState(false);

  // const handleDrag = () => {
  //   setDrag(!drag);
  // };
  // const handleSelect = () => {
  //   setSelect(!select);
  // };
  // const handleDelete = () => {
  //   setIsDelete(!isDelete);
  // };
  return (
    <div>
      <div>
        <TestTool />{' '}
        {/* TestTool component is expected to receive image as prop and give out coordinates */}
        {/* <p>Konva</p>
        <div style={{ display: 'flex' }}>
          <button onClick={handleDrag}>drag</button> <p>{`${drag}`}</p>
          <button onClick={handleSelect}>select</button> <p>{`${select}`}</p>
          <button onClick={handleDelete}>delete</button> <p>{`${isDelete}`}</p>
        </div>
        <div style={{ position: 'sticky' }}>
          <DrawAnnotations drag={drag} select={select} isDelete={isDelete} />
        </div> */}
      </div>
    </div>
  );
};

export default CropHome;
