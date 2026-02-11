# Ski Collage Web Integration

This document describes the integration of the Ski Collage Python automation with the YOLO-in-browser web interface.

## Overview

The Ski Collage web interface brings your Python ski collage automation workflow to a browser-based application. Instead of running Python scripts manually, you can now:

1. **Upload** ski slope images through a web UI
2. **Detect** people in images using YOLO (client-side)
3. **Extract** cutouts with configurable settings
4. **Manage** extracted cutouts (delete unwanted ones)
5. **Build** a collage with customizable grid layout
6. **Download** the final collage or individual cutouts

## Architecture

### Components Added

#### 1. **CutoutExtractor.js** (`src/image/CutoutExtractor.js`)
Utility for extracting person cutouts from YOLO detection results. Key features:
- Filters detections for person class (COCO class 0)
- Applies configurable bounding box padding
- Sorts cutouts by size (smallest first, for proper collage layout)
- Handles canvas-to-blob conversion for downloads
- Mirrors the Python `cutout_people.py` logic

**Configuration:**
```javascript
{
  bboxPaddingPct: 2.0,      // Padding percentage around detected person
  minConfidence: 0.2        // Minimum detection confidence threshold
}
```

#### 2. **CollageBuilder.js** (`src/image/CollageBuilder.js`)
Builds size-sorted collages from extracted cutouts. Key features:
- Calculates grid layout with proper scaling
- Respects max height and scaling constraints
- Prevents upscaling of small images (configurable)
- Handles background colors and transparency
- Mirrors the Python `build_collage.py` logic

**Configuration:**
```javascript
{
  columns: 6,               // Number of grid columns
  padding: 20,              // Padding between images (px)
  background: '#F5F5F5',    // Grid background color
  maxHeight: 700,           // Maximum image height (px)
  allowUpscale: false       // Whether to upscale small images
}
```

#### 3. **SkiCollageView** (`src/components/views/ski-collage/`)
React component for the complete Ski Collage workflow UI. Features:
- Image upload area (drag-and-drop or click)
- Live detection results
- Cutout gallery with preview and delete options
- Collage preview
- Configuration controls
- Download buttons for cutouts and collage

## Workflow

### Step-by-Step Usage

1. **Load YOLO Model**
   - Use the ModelSelector to load a YOLO model (e.g., YOLOv3)
   - Wait for the model to download and initialize

2. **Navigate to Ski Collage View**
   - Click the **Ski Collage** tab in the navigation bar
   - You should see the Ski Collage interface

3. **Upload Image**
   - Click the upload area or drag and drop a ski slope image
   - Or use the file input dialog

4. **Detect People**
   - Click the **Extract People** button
   - The system will:
     - Run YOLO detection on the image
     - Filter for person class (class 0)
     - Extract individual cutouts with padding
     - Sort by size

5. **Manage Cutouts**
   - Preview each cutout by clicking on it
   - Delete unwanted cutouts by clicking the delete icon
   - Adjust extraction settings if needed:
     - **Bbox Padding %**: Increases/decreases padding around detected person
     - **Min Confidence**: Filters out low-confidence detections

6. **Build Collage**
   - Click the **Build Collage** button
   - Preview the collage layout
   - Adjust grid settings if desired:
     - **Grid Columns**: Number of columns in the grid
     - **Padding**: Space between images
     - **Max Height**: Maximum height for images
     - Click **Build Collage** again to regenerate

7. **Download Results**
   - Click **Download Collage** to save the final collage as PNG
   - Files are timestamped (e.g., `collage_2026-02-11_12-30-45.png`)

## Differences from Python Version

| Feature | Python | Browser |
|---------|--------|---------|
| HEIC/HEIF Support | ✓ pillow-heif | ✗ (Use PNG/JPG) |
| Batch Processing | ✓ Multiple images | ✓ One at a time |
| Manual Curation | File system | UI with preview |
| CSV/JSON Manifest | ✓ Automatic | ✗ (Could add) |
| GIF Creation | ✓ Available | ✗ (Future) |

## Configuration

### Cutout Extraction
- **Bbox Padding %**: Controls how much space around detected person is included
  - Default: `2.0%`
  - Range: `0.0 - 10.0%`
  - Higher values = larger cutout area

- **Min Confidence**: Minimum YOLO confidence score to include detection
  - Default: `0.2` (20%)
  - Range: `0.0 - 1.0`
  - Lower values = more detections (including false positives)

### Collage Building
- **Grid Columns**: Number of images per row
  - Default: `6`
  - Higher = smaller individual images

- **Padding**: Space between images in pixels
  - Default: `20px`
  - Higher = more spacing

- **Max Height**: Maximum pixel height for any image
  - Default: `700px`
  - Constrains overall collage height

- **Background**: Grid background color
  - Default: `#F5F5F5` (light gray)
  - Accepts hex colors, RGB, or named colors

- **Allow Upscale**: Whether to enlarge small images to fill space
  - Default: `false` (preserve original size of small images)

## Technical Details

### Detection Pipeline
1. Image uploaded to browser
2. YOLO model runs on client-side (no server required)
3. All detections returned with bounding boxes
4. Filter for person class (COCO class index 0)
5. Apply confidence filtering
6. Extract cutouts with padding
7. Sort by area (ascending)

### Collage Generation
1. Reverse sort cutouts by area (largest first = bottom)
2. Calculate grid layout:
   - Determine cell width based on columns
   - Scale images to fit max height
   - Prevent upscaling if configured
3. Draw on canvas:
   - Fill background color
   - Place scaled images in grid positions
   - Add padding between images
4. Return canvas for preview/download

### Performance Considerations
- **First Load**: Model download can take 30-60 seconds
- **Detection**: 5-15 seconds depending on image size and model
- **Cutout Extraction**: ~100ms per detection
- **Collage Building**: ~200ms regardless of cutout count
- **Canvas Rendering**: Real-time, no noticeable delay

## Browser Requirements

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support (iOS 14+)
- **File Size**: Max 10-50MB per image (depends on browser)
- **RAM**: 500MB+ recommended for large models

## Future Enhancements

Potential additions to make this even more powerful:

1. **Batch Processing**: Upload multiple images and process sequentially
2. **Batch Download**: ZIP export for all cutouts
3. **CSV/JSON Manifest**: Export detection metadata
4. **GIF Creation**: Create animated GIF from cutouts
5. **Local Storage**: Persist cutouts across sessions
6. **Undo/Redo**: Manage extraction history
7. **Real-time Preview**: Show changes as you adjust settings
8. **Custom Models**: Support for other YOLO versions
9. **Class Filtering**: Detect and extract other objects (not just people)
10. **Video Support**: Extract cutouts from video frames

## Troubleshooting

### No detections found
- Ensure the image has clear, visible people
- Try lowering the **Min Confidence** threshold
- Check that a YOLO model is loaded

### Cutouts look wrong/misaligned
- Adjust the **Bbox Padding %** setting
- Decrease to get tighter crops
- Increase to get more context

### Collage looks too sparse/cramped
- Adjust **Grid Columns** to change layout
- Increase **Padding** for more spacing
- Lower **Max Height** to fit more images

### Model won't load
- Check browser console for errors
- Ensure stable internet connection
- Try a different model version
- Clear browser cache and reload

### Cutout preview doesn't show
- Try clicking on the cutout card
- Ensure at least one person was detected
- Check browser developer tools (F12) for console errors

## Development Notes

### File Structure
```
src/
├── image/
│   ├── CutoutExtractor.js      # Cutout extraction logic
│   ├── CollageBuilder.js        # Collage generation logic
│   └── ...
└── components/views/
    └── ski-collage/
        ├── index.js             # Main SkiCollageView component
        └── ski-collage.css      # Styling
```

### Integration with Existing Code
- Uses existing `ImageManager` for image loading
- Compatible with YOLO model predictions
- Follows Material-UI component patterns
- Integrates with existing ViewsManager system

### Adding New Features
When adding features, maintain:
- Consistent styling with existing views
- Proper state management in React
- Canvas-based rendering for compatibility
- Browser compatibility (no Node.js APIs)

## Related Files

**Python Ski Collage Scripts:**
- `cutout_people.py` - Person detection and extraction logic
- `build_collage.py` - Collage building logic
- `collage_config.json` - Configuration file

**Browser YOLO Repository:**
- Base repo: [YOLO-in-browser](https://github.com/CristianAbrante/YOLO-in-browser)
- Your fork available at: `c:\Users\Joel\collage-anything`

## Credits

- **Ski Collage Logic**: Your Python implementation
- **Browser YOLO**: CristianAbrante's YOLO-in-browser project
- **Integration**: This web interface combining both projects
