import React from 'react';
import ImageView from '../views/image/';
import SkiCollageView from '../views/ski-collage/';

export default {
  image_view: model => <ImageView model={model}/>,
  ski_collage_view: model => <SkiCollageView model={model}/>
}