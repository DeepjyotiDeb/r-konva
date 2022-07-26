import React, { useState } from 'react';
import { DrawAnnotations } from './Crop';

const CropHome = () => {
  const [drag, setDrag] = useState(false);
  const [select, setSelect] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  const handleDrag = () => {
    setDrag(!drag);
  };
  const handleSelect = () => {
    setSelect(!select);
  };
  const handleDelete = () => {
    setIsDelete(!isDelete);
  };
  return (
    <div>
      <div>
        <p>Konva</p>
        <div style={{ display: 'flex' }}>
          <button onClick={handleDrag}>drag</button> <p>{`${drag}`}</p>
          <button onClick={handleSelect}>select</button> <p>{`${select}`}</p>
          <button onClick={handleDelete}>delete</button> <p>{`${isDelete}`}</p>
        </div>
        <div style={{ position: 'sticky' }}>
          {/* <img src={sample} alt='sample'></img> */}
          <DrawAnnotations drag={drag} select={select} isDelete={isDelete} />
        </div>
      </div>
    </div>
  );
};

export default CropHome;
