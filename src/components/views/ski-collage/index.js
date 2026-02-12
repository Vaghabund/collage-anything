import React, { Component } from 'react';
import CutoutExtractor from './../../../image/CutoutExtractor';
import CollageBuilder from './../../../image/CollageBuilder';
import ImageManager from './../../../image/ImageManager';

import {
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';
import { withStyles } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GetAppIcon from '@mui/icons-material/GetApp';
import DeleteIcon from '@mui/icons-material/Delete';

const styles = theme => ({
  container: {
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    height: '90vh',
    gap: 20,
    overflowY: 'auto',
    [theme.breakpoints.down('sm')]: {
      padding: 10,
      gap: 10,
    },
  },
  section: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  uploadArea: {
    border: '2px dashed #007bff',
    borderRadius: 4,
    padding: 20,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#e8f4f8',
    },
  },
  buttonGroup: {
    display: 'flex',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  cutoutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
    gap: 10,
    marginTop: 10,
    maxHeight: 400,
    overflowY: 'auto',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 4,
    border: '1px solid #ddd',
  },
  cutoutCardWrapper: {
    position: 'relative',
    cursor: 'pointer',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.2s ease',
    '&:hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    },
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 4,
    minWidth: 32,
    minHeight: 32,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: 'rgba(255,100,100,0.9)',
    },
  },
  collagePreview: {
    maxWidth: '100%',
    maxHeight: 400,
    border: '1px solid #ddd',
    marginTop: 10,
    borderRadius: 4,
        backgroundColor: '#f5f5f5',
  },
  statsText: {
    marginTop: 10,
    fontSize: '0.9rem',
    color: '#666',
  },
  progress: {
    marginTop: 10,
  },
});

/**
 * CollagePreview component - renders the final collage from canvas
 */
class CollagePreview extends Component {
  canvasRef = React.createRef();

  componentDidMount() {
    this.renderCollage();
  }

  componentDidUpdate() {
    this.renderCollage();
  }

  renderCollage = () => {
    if (this.canvasRef.current && this.props.collageCanvas) {
      const canvas = this.canvasRef.current;
      const collageCanvas = this.props.collageCanvas;

      // Set canvas dimensions
      canvas.width = collageCanvas.width;
      canvas.height = collageCanvas.height;

      // Draw the collage
      const ctx = canvas.getContext('2d');
      ctx.drawImage(collageCanvas, 0, 0);
    }
  };

  render() {
    const { classes } = this.props;

    return (
      <canvas
        ref={this.canvasRef}
        className={classes.collagePreview}
        style={{ maxWidth: '100%', maxHeight: 400 }}
      />
    );
  }
}

/**
 * CutoutCard component - renders a single cutout from canvas
 */
class CutoutCard extends Component {
  canvasRef = React.createRef();

  componentDidMount() {
    this.renderCanvas();
  }

  componentDidUpdate() {
    this.renderCanvas();
  }

  renderCanvas = () => {
    if (this.canvasRef.current && this.props.cutout) {
      const canvas = this.canvasRef.current;
      const cutout = this.props.cutout;

      // Set canvas size to match cutout
      canvas.width = cutout.canvas.width;
      canvas.height = cutout.canvas.height;

      // Draw the cutout
      const ctx = canvas.getContext('2d');
      ctx.drawImage(cutout.canvas, 0, 0);
    }
  };

  render() {
    const { cutout, index, onDelete, classes } = this.props;

    return (
      <div
        className={classes.cutoutCardWrapper}
        onClick={() => {
          if (this.props.onSelect) {
            this.props.onSelect(cutout, index);
          }
        }}
      >
        <canvas
          ref={this.canvasRef}
          style={{
            width: '100%',
            height: 110,
            display: 'block',
            objectFit: 'cover',
          }}
        />
        <button
          className={classes.deleteButton}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(index);
          }}
          title="Delete cutout"
        >
          <DeleteIcon fontSize="small" />
        </button>
      </div>
    );
  }
}

class SkiCollageView extends Component {
  inputRef;
  imageManager;
  batchQueue = [];
  currentBatchIndex = 0;

  state = {
    // Current image processing
    selectedImage: null,
    selectedImageName: '',
    cutouts: [],
    collageCanvas: null,
    isProcessing: false,
    progress: 0,
    detectionResults: [],

    // Batch processing
    batchMode: false,
    batchFiles: [],
    batchResults: [], // { fileName, cutouts, collage, detected, extracted }
    currentBatchIndex: 0,
    batchOverallProgress: 0,

    // Configuration
    config: {
      bboxPaddingPct: 2.0,
      minConfidence: 0.2,
      columns: 6,
      padding: 20,
      background: '#F5F5F5',
      maxHeight: 700,
      allowUpscale: false,
    },
    selectedCutout: null,
    openPreview: false,
  };

  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.imageManager = new ImageManager();
  }

  handleImageUpload = () => {
    const files = this.inputRef.current.files;
    
    if (files.length === 1) {
      // Single file - load normally
      this.imageManager.loadImageFromInput(
        this.inputRef.current,
        (image) => {
          this.setState({ 
            selectedImage: image,
            selectedImageName: files[0].name,
            batchMode: false,
            batchFiles: [],
          });
          this.detectPeople(image);
        }
      );
    } else if (files.length > 1) {
      // Multiple files - start batch processing
      this.startBatchProcessing(files);
    }
  };

  startBatchProcessing = (files) => {
    const fileArray = Array.from(files);
    this.setState({
      batchMode: true,
      batchFiles: fileArray,
      batchResults: [],
      currentBatchIndex: 0,
      batchOverallProgress: 0,
      selectedImage: null,
      cutouts: [],
      collageCanvas: null,
    });

    // Start processing first image
    this.processBatchItem(0, fileArray);
  };

  processBatchItem = async (index, fileArray) => {
    if (index >= fileArray.length) {
      // Batch complete
      this.setState({ isProcessing: false });
      alert(`✅ Batch complete! Processed ${fileArray.length} images.`);
      return;
    }

    const file = fileArray[index];
    this.setState({
      currentBatchIndex: index,
      batchOverallProgress: Math.round((index / fileArray.length) * 100),
    });

    try {
      // Load image from file
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = async () => {
          // Detect people in image
          const boxes = await this.props.model.predict(img);
          const personBoxes = boxes.filter((box) => box.cls === 0);

          // Extract cutouts
          let cutouts = [];
          if (personBoxes.length > 0) {
            cutouts = CutoutExtractor.extractCutouts(
              img,
              personBoxes,
              {
                bboxPaddingPct: this.state.config.bboxPaddingPct,
                minConfidence: this.state.config.minConfidence,
              }
            );
          }

          // Build collage
          let collage = null;
          if (cutouts.length > 0) {
            const cutoutCanvases = cutouts.map((c) => ({ canvas: c.canvas }));
            collage = CollageBuilder.buildCollage(
              cutoutCanvases,
              this.state.config
            );
          }

          // Store result
          const result = {
            fileName: file.name,
            cutouts,
            collage,
            detected: personBoxes.length,
            extracted: cutouts.length,
          };

          const newResults = [...this.state.batchResults, result];
          this.setState({ batchResults: newResults });

          // Process next image
          setTimeout(() => {
            this.processBatchItem(index + 1, fileArray);
          }, 500);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      
      // Add error result and continue
      const result = {
        fileName: file.name,
        error: error.message,
        cutouts: [],
        collage: null,
        detected: 0,
        extracted: 0,
      };

      const newResults = [...this.state.batchResults, result];
      this.setState({ batchResults: newResults });

      // Process next image
      setTimeout(() => {
        this.processBatchItem(index + 1, fileArray);
      }, 500);
    }
  };

  downloadAllCollages = async () => {
    const { batchResults } = this.state;
    const validResults = batchResults.filter((r) => r.collage && !r.error);

    if (validResults.length === 0) {
      alert('No collages to download.');
      return;
    }

    for (let i = 0; i < validResults.length; i++) {
      const result = validResults[i];
      const baseName = result.fileName.split('.')[0];
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[-:]/g, '-');
      
      await CollageBuilder.downloadCollage(
        result.collage,
        `collage_${baseName}_${timestamp}.png`
      );

      // Small delay between downloads
      if (i < validResults.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    alert(`✅ Downloaded ${validResults.length} collages!`);
  };

  clearBatchResults = () => {
    this.setState({
      batchMode: false,
      batchFiles: [],
      batchResults: [],
      currentBatchIndex: 0,
    });
  };

  detectPeople = async (image) => {
    if (!this.props.model) {
      alert('YOLO model not loaded. Please load a model first.');
      return;
    }

    this.setState({ isProcessing: true, progress: 0 });

    try {
      this.setState({ progress: 30 });

      // Run YOLO detection
      const boxes = await this.props.model.predict(image);

      this.setState({ progress: 60 });

      // Filter for person class (class 0)
      const personBoxes = boxes.filter((box) => box.cls === 0);

      this.setState({ detectionResults: personBoxes, progress: 80 });

      // Extract cutouts
      if (personBoxes.length > 0) {
        const extractedCutouts = CutoutExtractor.extractCutouts(
          image,
          personBoxes,
          {
            bboxPaddingPct: this.state.config.bboxPaddingPct,
            minConfidence: this.state.config.minConfidence,
          }
        );

        this.setState({
          cutouts: extractedCutouts,
          progress: 100,
          isProcessing: false,
        });
      } else {
        this.setState({
          cutouts: [],
          progress: 100,
          isProcessing: false,
        });
        alert('No people detected in this image.');
      }
    } catch (error) {
      console.error('Error during detection:', error);
      alert('Error during detection: ' + error.message);
      this.setState({ isProcessing: false });
    }
  };

  buildCollage = () => {
    if (this.state.cutouts.length === 0) {
      alert('No cutouts available. Extract people first.');
      return;
    }

    try {
      this.setState({ isProcessing: true, progress: 50 });

      // Extract just the canvas from cutout objects
      const cutoutCanvases = this.state.cutouts.map((c) => ({
        canvas: c.canvas,
      }));

      const collage = CollageBuilder.buildCollage(
        cutoutCanvases,
        this.state.config
      );

      this.setState({
        collageCanvas: collage,
        progress: 100,
        isProcessing: false,
      });
    } catch (error) {
      console.error('Error building collage:', error);
      alert('Error building collage: ' + error.message);
      this.setState({ isProcessing: false });
    }
  };

  downloadCollage = async () => {
    if (!this.state.collageCanvas) {
      alert('No collage to download. Build a collage first.');
      return;
    }

    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[-:]/g, '-'); // Format: YYYY-MM-DD_HH-MM-SS
    await CollageBuilder.downloadCollage(
      this.state.collageCanvas,
      `collage_${timestamp}.png`
    );
  };

  downloadCutout = async (cutout, index) => {
    await CutoutExtractor.downloadCanvasAsImage(
      cutout.canvas,
      `cutout_${index.toString().padStart(4, '0')}.png`
    );
  };

  deleteCutout = (index) => {
    const newCutouts = this.state.cutouts.filter((_, i) => i !== index);
    this.setState({ cutouts: newCutouts });
  };

  handleConfigChange = (key) => (event) => {
    const newConfig = { ...this.state.config };
    const value = event.target.value;

    // Parse numbers
    if (
      key === 'columns' ||
      key === 'padding' ||
      key === 'maxHeight' ||
      key === 'bboxPaddingPct' ||
      key === 'minConfidence'
    ) {
      newConfig[key] = parseFloat(value);
    } else if (key === 'allowUpscale') {
      newConfig[key] = event.target.checked;
    } else {
      newConfig[key] = value;
    }

    this.setState({ config: newConfig });
  };

  render() {
    const { classes } = this.props;
    const {
      selectedImage,
      cutouts,
      collageCanvas,
      isProcessing,
      progress,
      detectionResults,
      batchMode,
      batchFiles,
      batchResults,
      currentBatchIndex,
      batchOverallProgress,
    } = this.state;

    // Show batch UI if in batch mode
    if (batchMode) {
      return (
        <div className={classes.container}>
          {/* Batch Processing Header */}
          <Paper className={classes.section}>
            <Typography variant="h5">Batch Processing</Typography>
            <Typography className={classes.statsText}>
              Processing: {currentBatchIndex + 1} / {batchFiles.length} images
            </Typography>
            <LinearProgress
              variant="determinate"
              value={batchOverallProgress}
              className={classes.progress}
            />
          </Paper>

          {/* Batch Results */}
          <Paper className={classes.section}>
            <Typography variant="h5">Results</Typography>
            <Typography className={classes.statsText}>
              Completed: {batchResults.length} | 
              Detected: {batchResults.reduce((sum, r) => sum + r.detected, 0)} people |
              Extracted: {batchResults.reduce((sum, r) => sum + r.extracted, 0)} cutouts
            </Typography>

            {/* Results Table */}
            {batchResults.length > 0 && (
              <div style={{ marginTop: 15, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e0e0e0' }}>
                      <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #999' }}>File</th>
                      <th style={{ padding: 8, textAlign: 'center', borderBottom: '1px solid #999' }}>Detected</th>
                      <th style={{ padding: 8, textAlign: 'center', borderBottom: '1px solid #999' }}>Extracted</th>
                      <th style={{ padding: 8, textAlign: 'center', borderBottom: '1px solid #999' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchResults.map((result, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: 8 }}>{result.fileName}</td>
                        <td style={{ padding: 8, textAlign: 'center' }}>{result.detected}</td>
                        <td style={{ padding: 8, textAlign: 'center' }}>{result.extracted}</td>
                        <td style={{ padding: 8, textAlign: 'center' }}>
                          {result.error ? (
                            <span style={{ color: 'red' }}>Error</span>
                          ) : result.collage ? (
                            <span style={{ color: 'green' }}>Complete</span>
                          ) : result.extracted > 0 ? (
                            <span style={{ color: 'orange' }}>No collage</span>
                          ) : (
                            <span style={{ color: 'gray' }}>No people</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className={classes.buttonGroup}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<GetAppIcon />}
                disabled={batchResults.filter((r) => r.collage).length === 0}
                onClick={this.downloadAllCollages}
              >
                Download All Collages ({batchResults.filter((r) => r.collage).length})
              </Button>
              <Button
                variant="outlined"
                color="primary"
                disabled={batchOverallProgress < 100}
                onClick={this.clearBatchResults}
              >
                Clear & Start New
              </Button>
            </div>
          </Paper>
        </div>
      );
    }

    return (
      <div className={classes.container}>
        {/* Upload Section */}
        <Paper className={classes.section}>
          <Typography variant="h5">1. Upload Image</Typography>
          <div
            className={classes.uploadArea}
            onClick={() => this.inputRef.current.click()}
          >
            <CloudUploadIcon style={{ fontSize: 48, color: '#007bff' }} />
            <Typography>
              Click here or drag and drop ski slope images (multiple supported!)
            </Typography>
            <Typography style={{ fontSize: '0.9rem', color: '#999', marginTop: 8 }}>
              Single image: Extract & build collage | Multiple images: Batch process all
            </Typography>
            <input
              ref={this.inputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={this.handleImageUpload}
            />
          </div>
          {selectedImage && (
            <Typography className={classes.statsText}>
              Image loaded: {this.state.selectedImageName}
            </Typography>
          )}
        </Paper>

        {/* Detection Section */}
        <Paper className={classes.section}>
          <Typography variant="h5">2. Detection Results</Typography>
          {isProcessing && (
            <LinearProgress
              variant="determinate"
              value={progress}
              className={classes.progress}
            />
          )}
          <Typography className={classes.statsText}>
            Detected: {detectionResults.length} people | Extracted:{' '}
            {cutouts.length} cutouts
          </Typography>
        </Paper>

        {/* Cutouts Section */}
        <Paper className={classes.section}>
          <Typography variant="h5">3. Extracted Cutouts</Typography>
          <div className={classes.buttonGroup}>
            <Button
              variant="contained"
              color="primary"
              disabled={!selectedImage || isProcessing}
              onClick={() => this.detectPeople(selectedImage)}
            >
              Extract People
            </Button>
          </div>

          {cutouts.length > 0 && (
            <div>
              <div className={classes.cutoutGrid}>
                {cutouts.map((cutout, index) => (
                  <CutoutCard
                    key={index}
                    cutout={cutout}
                    index={index}
                    classes={classes}
                    onDelete={this.deleteCutout}
                    onSelect={(cutout, index) =>
                      this.setState({ selectedCutout: cutout, openPreview: true })
                    }
                  />
                ))}
              </div>

              <div className={classes.buttonGroup}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={this.buildCollage}
                  disabled={cutouts.length === 0 || isProcessing}
                >
                  Build Collage
                </Button>
              </div>
            </div>
          )}
        </Paper>

        {/* Collage Section */}
        {collageCanvas && (
          <Paper className={classes.section}>
            <Typography variant="h5">4. Collage Preview</Typography>
            <CollagePreview collageCanvas={collageCanvas} classes={classes} />
            <div className={classes.buttonGroup}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<GetAppIcon />}
                onClick={this.downloadCollage}
              >
                Download Collage
              </Button>
            </div>
          </Paper>
        )}

        {/* Configuration Section */}
        <Paper className={classes.section}>
          <Typography variant="h5">Configuration</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Grid Columns"
                type="number"
                value={this.state.config.columns}
                onChange={this.handleConfigChange('columns')}
                inputProps={{ min: 1, max: 20, step: 1 }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Padding (px)"
                type="number"
                value={this.state.config.padding}
                onChange={this.handleConfigChange('padding')}
                inputProps={{ min: 0, max: 50, step: 1 }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Max Height (px)"
                type="number"
                value={this.state.config.maxHeight}
                onChange={this.handleConfigChange('maxHeight')}
                inputProps={{ min: 100, max: 2000, step: 50 }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Min Confidence"
                type="number"
                value={this.state.config.minConfidence}
                onChange={this.handleConfigChange('minConfidence')}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                fullWidth
              />
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(SkiCollageView);
