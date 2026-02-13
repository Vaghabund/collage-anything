# Collage Anything

<p align="center">
  <img src="images/logo.png" alt="Collage Anything" width="400">
</p>

<h4 align="center">
  AI-powered object detection and collage creation using YOLO (You Only Look Once) in the browser
</h4>

<p align="center">
  <a href="https://lbesson.mit-license.org/">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT">
  </a>
  <a href="https://github.com/ellerbrock/open-source-badges/">
     <img src="https://badges.frapsoft.com/os/v1/open-source.svg?v=103g" alt="Open source">
  </a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#usage">Usage</a> •
  <a href="#yolo-parameters">YOLO Parameters</a> •
  <a href="#setup">Setup</a> •
  <a href="#development">Development</a>
</p>

## Features

**Collage Anything** is a browser-based application that combines state-of-the-art object detection with powerful collage creation tools. The application offers two main views:

### 1. Image Detection View
- **Real-time Object Detection**: Detect objects in images using YOLO neural networks
- **Customizable Detection Parameters**: Fine-tune detection with adjustable confidence thresholds, IOU thresholds, and max boxes
- **Visual Customization**: Configure bounding box colors, widths, and toggle labels
- **Image Preview**: Preview uploaded images before processing
- **Multiple YOLO Models**: Support for YOLOv1-tiny, YOLOv2-tiny, YOLOv3, and YOLOv3-tiny
- **Sample Images**: Test with pre-loaded sample images
- **Custom Image Upload**: Upload and analyze your own images

### 2. Collage Anything View
- **Automated Person Detection**: Automatically detect and extract people from images
- **Batch Processing**: Process multiple images at once
- **Intelligent Cutout Extraction**: Extract detected people with configurable padding
- **Collage Building**: Automatically arrange extracted cutouts into beautiful collages
- **Customizable Layouts**: Adjust grid columns, padding, background color, and maximum height
- **Individual Cutout Management**: Preview, download, or delete individual cutouts
- **Batch Download**: Download all collages from batch processing at once

### Modern UI
- **Dark Theme**: Easy on the eyes with a modern dark color scheme
- **Minimal Design**: Clean, distraction-free interface
- **Responsive**: Works on desktop and mobile devices
- **Intuitive Controls**: Easy-to-use sliders, toggles, and buttons

## Usage

### Getting Started

1. **Select a YOLO Model**: Choose from YOLOv1-tiny to YOLOv3 based on your needs
2. **Choose a View**: Image Detection or Collage Anything

### Image Detection View

1. **Configure Detection Parameters** (optional)
2. **Upload an Image**: Sample or custom
3. **Preview**: Review the uploaded image
4. **Process**: Click "Process Image" to run detection
5. **Review Results**: View detected objects with bounding boxes

### Collage Anything View

1. **Upload Images**: Single or multiple images
2. **Configure Settings** (optional)
3. **Extract People**: Automatic detection and extraction
4. **Build Collage**: Create beautiful collages
5. **Download**: Save your work

## YOLO Parameters

### Detection Parameters

- **Max Boxes** (1-50, default: 20): Maximum detections per image
- **Confidence Threshold** (0.0-1.0, default: 0.5): Minimum confidence for detection
- **IOU Threshold** (0.0-1.0, default: 0.3): Overlap filtering threshold

### Visual Parameters

- **Draw Boxes** (toggle): Show/hide bounding boxes
- **Draw Labels** (toggle): Show/hide class labels
- **Box Width** (1-15 px): Bounding box line thickness
- **Box Color**: Primary bounding box color
- **Selected Box Color**: Highlight color for selected detections

## Setup

```bash
git clone https://github.com/Vaghabund/collage-anything.git
cd collage-anything
npm install
npm start
```

## License

MIT License - see [LICENCE](LICENCE) file for details.

---

Made with ❤️ for the open-source community
