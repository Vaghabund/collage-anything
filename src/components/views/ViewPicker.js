import React from 'react';
import ImageView from '../views/image/';
import VideoView from '../views/video/';
import SkiCollageView from '../views/ski-collage/';

export default {
  image_view: model => <ImageView model={model}/>,
  video_view: model => <VideoView model={model}/>,
  ski_collage_view: model => <SkiCollageView model={model}/>
}