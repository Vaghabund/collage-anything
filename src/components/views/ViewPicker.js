import React from 'react';
import ImageView from '../views/image/';
import CollageAnythingView from '../views/collage-anything/';

export default {
  image_view: model => <ImageView model={model}/>,
  collage_anything_view: model => <CollageAnythingView model={model}/>
}