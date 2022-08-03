import { useEffect, useState } from 'react';
import { Image } from 'react-konva';

const UrlImageViewer = (props) => {
  const { urlImage } = props;
  const [imageProps, setImageProps] = useState({
    imageSrc: null,
    width: 920,
    height: 1280,
  });

  useEffect(() => {
    const image = new window.Image();
    image.src = urlImage;
    console.log('image', urlImage);
    setImageProps((prevState) => ({
      ...prevState,
      imageSrc: image,
    }));
  }, [urlImage]);

  return (
    <Image
      image={imageProps.imageSrc}
      width={imageProps.width}
      height={imageProps.height}
    />
  );
};

export default UrlImageViewer;
