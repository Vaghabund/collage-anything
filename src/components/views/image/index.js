import React, {Component} from 'react';

import './index.css';
import ImageCarousel from './ImageCarousel';
import ImageManager from './../../../image/ImageManager';
import CanvasManager from '../../../image/CanvasImageManipulator';
import ResultVisualizer from './ResultVisualizer';

import Icon from '@mui/material/Icon';
import Fab from '@mui/material/Fab';
import Paper from '@mui/material/Paper';
import { withStyles } from '@mui/styles';
import {
  Typography,
  Grid,
  Slider,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function importAll(r) {
  let images = [];
  r.keys().forEach(item => { images.push(r(item)); });
  return images;
}
const images = importAll(require.context('./../../../yolo/test/images', false, /\.(png|jpe?g|svg)$/));

const styles = theme => ({
  container: {
    padding: 10,
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  topSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    flex: '0 0 auto',
  },
  canvasSection: {
    flex: '1 1 auto',
    minHeight: 0,
    display: 'flex',
  },
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
  },
  button: {
    margin: '5px',
  },
  carousel: {
    margin: 'auto',
    height: '100%',
    width: '100%',
    padding: '10px',
  },
  canvasContainer: {
    display: 'flex',
    width: '100%',
    background: theme.palette.background.default,
    overflow: 'auto',
    borderRadius: '4px',
  },
  canvas: {
    margin: 'auto',
  },
  configPanel: {
    padding: '10px',
  },
  configSection: {
    marginBottom: '15px',
  },
  previewContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '10px',
    backgroundColor: theme.palette.background.default,
    borderRadius: '4px',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
  },
});

class ImageView extends Component {
  canvasRef;
  inputRef;
  currentSampleImage;
  canvasManager;
  imageManager;

  state = {
    predictionHasBeenMade: false,
    lastBoxes: undefined,
    lastImage: undefined,
    lastTime: 0,
    uploadedImage: undefined,
    uploadedImageName: '',
    // YOLO parameters
    yoloParams: {
      maxBoxes: 20,
      scoreThreshold: 0.5,
      iouThreshold: 0.3,
      drawBoxes: true,
      drawLabels: true,
      boxWidth: 6,
      boxColor: '#7b1fa2',
      selectedBoxColor: '#1976d2',
    },
  };

  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.canvasManager = new CanvasManager(this.canvasRef.current);
    this.imageManager = new ImageManager();
  }

  setCurrentSampleImage = index => {
    this.currentSampleImage = images[index];
  };

  uploadSampleImage = () => {
    this.imageManager.loadImage(
        this.currentSampleImage,
        image => {
          this.setState({ 
            uploadedImage: image,
            uploadedImageName: 'Sample image'
          });
        });
  };

  uploadInputImage = () => {
    this.imageManager.loadImageFromInput(
        this.inputRef.current,
        image => {
          const fileName = this.inputRef.current.files[0]?.name || 'Uploaded image';
          this.setState({ 
            uploadedImage: image,
            uploadedImageName: fileName
          });
        });
  };

  processImage = () => {
    if (!this.state.uploadedImage) {
      return;
    }
    this.doPrediction(this.state.uploadedImage);
  };

  doPrediction = image => {
    const { yoloParams } = this.state;
    let t0 = performance.now();
    this.props.model.predict(image, {
      maxBoxes: yoloParams.maxBoxes,
      scoreThreshold: yoloParams.scoreThreshold,
      iouThreshold: yoloParams.iouThreshold,
    }).then(
        boxes => {
          this.canvasManager.drawBoxes(image, boxes, undefined, {
            drawBoxes: yoloParams.drawBoxes,
            drawLabels: yoloParams.drawLabels,
            boxWidth: yoloParams.boxWidth,
            boxColor: yoloParams.boxColor,
            selectedBoxColor: yoloParams.selectedBoxColor,
          });
         let t1 = performance.now();
          this.setState({
            predictionHasBeenMade: true,
            lastBoxes: boxes,
            lastImage: image,
            lastTime: t1 - t0,
          })
        }
    )
  };

  renderConfigPanel = () => {
    const { classes } = this.props;
    const { yoloParams } = this.state;

    return (
      <Paper>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">YOLO Detection Parameters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className={classes.configPanel}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Max Boxes: {yoloParams.maxBoxes}</Typography>
                  <Slider
                    value={yoloParams.maxBoxes}
                    onChange={this.handleParamChange('maxBoxes')}
                    min={1}
                    max={50}
                    step={1}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 20, label: '20' },
                      { value: 50, label: '50' }
                    ]}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Confidence Threshold: {yoloParams.scoreThreshold.toFixed(2)}</Typography>
                  <Slider
                    value={yoloParams.scoreThreshold}
                    onChange={this.handleParamChange('scoreThreshold')}
                    min={0}
                    max={1}
                    step={0.05}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 0.5, label: '0.5' },
                      { value: 1, label: '1' }
                    ]}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>IOU Threshold: {yoloParams.iouThreshold.toFixed(2)}</Typography>
                  <Slider
                    value={yoloParams.iouThreshold}
                    onChange={this.handleParamChange('iouThreshold')}
                    min={0}
                    max={1}
                    step={0.05}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 0.3, label: '0.3' },
                      { value: 1, label: '1' }
                    ]}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Box Width: {yoloParams.boxWidth}</Typography>
                  <Slider
                    value={yoloParams.boxWidth}
                    onChange={this.handleParamChange('boxWidth')}
                    min={1}
                    max={15}
                    step={1}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 6, label: '6' },
                      { value: 15, label: '15' }
                    ]}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Box Color"
                    type="color"
                    value={yoloParams.boxColor}
                    onChange={this.handleParamChange('boxColor')}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Selected Box Color"
                    type="color"
                    value={yoloParams.selectedBoxColor}
                    onChange={this.handleParamChange('selectedBoxColor')}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={yoloParams.drawBoxes}
                        onChange={this.handleToggleChange('drawBoxes')}
                        color="primary"
                      />
                    }
                    label="Draw Boxes"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={yoloParams.drawLabels}
                        onChange={this.handleToggleChange('drawLabels')}
                        color="primary"
                      />
                    }
                    label="Draw Labels"
                  />
                </Grid>
              </Grid>
            </div>
          </AccordionDetails>
        </Accordion>
      </Paper>
    );
  };

  renderControllers = () => {
    let {classes} = this.props;
    const { uploadedImage, uploadedImageName } = this.state;
    
    if (!this.state.predictionHasBeenMade) {
      return(
        <div>
          <Paper className={classes.buttonsContainer}>
            <Fab
                className={classes.button}
                variant='extended'
                color='secondary'
                onClick={this.uploadSampleImage}>
              Upload Sample
            </Fab>
            <Fab
                className={classes.button}
                variant='extended'
                color='secondary'
                onClick={() => {this.inputRef.current.click()}}>
              Upload Custom
            </Fab>
            {uploadedImage && (
              <Button
                  className={classes.button}
                  variant='contained'
                  color='primary'
                  size='large'
                  onClick={this.processImage}>
                Process Image
              </Button>
            )}
            <input
                ref={this.inputRef}
                style={{"display" : "none"}}
                onChange={this.uploadInputImage}
                type="file"/>
          </Paper>
          {uploadedImage && (
            <Paper style={{ marginTop: '10px' }}>
              <Typography variant="h6" style={{ padding: '10px' }}>
                Preview: {uploadedImageName}
              </Typography>
              <div className={classes.previewContainer}>
                <img 
                  src={uploadedImage.src} 
                  alt="Preview" 
                  className={classes.previewImage}
                />
              </div>
            </Paper>
          )}
        </div>
      )
    } else {
      return(
          <Paper className={classes.buttonsContainer}>
            <Fab
                className={classes.button}
                color='secondary'
                onClick={this.backwardPressed}>
              <Icon>arrow_back</Icon>
            </Fab>
          </Paper>
      )
    }
  };

  backwardPressed = () => {
    this.canvasManager.refreshCanvas();
    this.setState({predictionHasBeenMade: false});
  };

  setSelectedBox = (index) => {
    let {lastImage, lastBoxes, yoloParams} = this.state;
    this.canvasManager.drawBoxes(lastImage, lastBoxes, index, {
      drawBoxes: yoloParams.drawBoxes,
      drawLabels: yoloParams.drawLabels,
      boxWidth: yoloParams.boxWidth,
      boxColor: yoloParams.boxColor,
      selectedBoxColor: yoloParams.selectedBoxColor,
    });
  };

  handleParamChange = (param) => (event, value) => {
    const newValue = value !== undefined ? value : event.target.value;
    this.setState(prevState => ({
      yoloParams: {
        ...prevState.yoloParams,
        [param]: newValue
      }
    }));
  };

  handleToggleChange = (param) => (event) => {
    this.setState(prevState => ({
      yoloParams: {
        ...prevState.yoloParams,
        [param]: event.target.checked
      }
    }));
  };

  render() {
    let {classes} = this.props;
    return (
        <div className={classes.container}>
          {!this.state.predictionHasBeenMade && (
            <div className={classes.topSection}>
              {this.renderConfigPanel()}
            </div>
          )}
          <Paper className={classes.canvasSection}>
            <div className={classes.canvasContainer}>
              <canvas ref={this.canvasRef} className={classes.canvas}>
                Your browser does not support canvas
              </canvas>
            </div>
          </Paper>
          {this.renderControllers()}
          <Paper className={classes.carousel}>
            {
              this.state.predictionHasBeenMade ?
                  <ResultVisualizer
                    model={this.props.model}
                    boxes={this.state.lastBoxes}
                    time={this.state.lastTime}
                    onBoxSelected={this.setSelectedBox}/> :
                  <ImageCarousel
                      sampleImages={images}
                      setCurrentSampleImage={this.setCurrentSampleImage}/>
            }
          </Paper>
        </div>
    );
  }
}

export default withStyles(styles)(ImageView);