# Quick Start: Ski Collage Web Interface

Get started with the Ski Collage web interface in 5 minutes.

## Prerequisites

- Node.js and npm installed
- The YOLO-in-browser repository set up
- A modern web browser (Chrome, Firefox, or Safari)
- Sample ski slope images (JPG or PNG)

## Setup

### 1. Install Dependencies
```bash
cd c:\Users\Joel\collage-anything
npm install
```

### 2. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
```

## First Use

### 1. Load YOLO Model
- When the app loads, you'll see a **ModelSelector** dropdown
- Select a YOLO model version (YOLOv3 recommended for first use)
- Wait for the model to download (30-60 seconds)
- You should see "Model loaded!" message

### 2. Open Ski Collage
- In the navigation bar at the top, click the **Ski Collage** tab
  - Icon: 📷 (image search icon)
- You'll see the Ski Collage interface with 4 main sections

### 3. Upload an Image
- In the "1. Upload Image" section, click the upload area
- Select a ski slope image from your computer
- Or drag and drop the image onto the upload area

### 4. Extract People
- In the "3. Extracted Cutouts" section, click **Extract People**
- Wait for processing (5-15 seconds)
- You should see:
  - Number of people detected
  - Number of cutouts extracted
  - Preview grid of extracted cutouts

### 5. Build Collage
- Click **Build Collage**
- Wait for processing (1-2 seconds)
- A preview of the collage will appear in section "4. Collage Preview"

### 6. Download
- Click **Download Collage** to save the result
- File will be named `collage_TIMESTAMP.png`

## Common Tasks

### Adjust Extraction Settings

Before clicking "Extract People", adjust these in the Configuration section:

**Bbox Padding %**
- Makes cutouts larger (more context) or smaller (tighter crops)
- Default: `2.0%`
- Try: `0.0%` for tight crops, `5.0%` for more context

**Min Confidence**
- Requires higher confidence scores from YOLO
- Default: `0.2` (very permissive)
- Try: `0.3` to `0.5` for stricter filtering

### Adjust Collage Settings

Before clicking "Build Collage", adjust these in the Configuration section:

**Grid Columns**
- How many images wide the collage is
- Default: `6`
- Try: `4` for larger images, `8` for smaller

**Padding**
- Space between images in pixels
- Default: `20`
- Try: `10` for compact, `30` for spacious

**Max Height**
- Maximum size for each image
- Default: `700` (pixels)
- Try: `500` for tighter layout, `800` for larger images

### Remove Bad Cutouts

1. In the cutout grid, hover over a cutout
2. Click the red **×** button in the top-right corner
3. Cutout will be removed from the list
4. Click **Build Collage** again to regenerate

## Tips & Tricks

### For Best Results
1. **Use clear images**: Bright daylight slopes work best
2. **Multiple people**: Larger groups create better collages
3. **No upscaling**: Keep "Allow Upscale" unchecked to preserve quality
4. **Adjust iteratively**: Try different settings and rebuild

### Performance
- First model load: ~30-60 seconds (one-time)
- Detection: ~5-15 seconds per image
- Cutout extraction: ~1 second
- Collage building: ~1 second

### Browser Tips
- Works offline once model is loaded
- Uses browser memory (close other tabs for large images)
- Clear cache if model won't download
- Chrome/Firefox recommended for stability

## Troubleshooting

### Nothing happens when I click "Extract People"
1. Make sure a YOLO model is loaded (check page title or console)
2. Make sure an image was uploaded successfully
3. Check browser console (F12 > Console tab) for errors
4. Try a different image

### No people detected
1. Try lowering "Min Confidence" to 0.1 or 0.2
2. Make sure people are visible and not too far away
3. Try a different, clearer image
4. Check that YOLO model is properly loaded

### Collage looks wrong
1. Adjust "Grid Columns" (try 4, 5, or 7)
2. Increase "Max Height" (try 800 or 900)
3. Decrease "Padding" (try 10 or 15)
4. Click "Build Collage" again after adjusting

### Model won't load
1. Check internet connection
2. Try a different model version
3. Clear browser cache (Ctrl+Shift+Delete)
4. Restart the development server

## Next Steps

### From Here
- Experiment with different images and settings
- Try different YOLO model versions
- Use **Download Collage** to save your creations
- Download individual cutouts by right-clicking them

### Integration with Python Scripts
Once you have your cutouts and collage from the web interface:

1. **Save individual cutouts manually** using the browser download
2. **Save the collage** as your final product
3. Or continue using the Python scripts for batch processing

### Want to Modify?
- Edit `src/components/views/ski-collage/index.js` to change UI
- Edit `src/image/CutoutExtractor.js` to change extraction logic
- Edit `src/image/CollageBuilder.js` to change collage building
- Run `npm start` to see changes live

## Key Differences from Python Scripts

| Task | Python | Web |
|------|--------|-----|
| Batch process images | ✓ | Single at a time |
| Manual curation | Command line | Visual UI |
| Build collage | CLI | Visual preview |
| Download results | Folders | Individual files |

## Support

### Common Issues
- **Model won't load**: Network issue, try restarting app
- **No detections**: Try different image or lower confidence
- **Cutouts look bad**: Adjust Bbox Padding setting
- **Slow performance**: Close other browser tabs

### Getting Help
1. Check browser console (F12) for error messages
2. Review the full documentation (SKI_COLLAGE_INTEGRATION.md)
3. Check YOLO-in-browser repository for model issues

## Example Workflow

```
1. Start app (npm start)
   ↓
2. Load YOLOv3 model
   ↓
3. Open Ski Collage tab
   ↓
4. Upload ski_slope_image.jpg
   ↓
5. Click "Extract People"
   ↓
6. Review extracted cutouts
   ↓
7. Delete unwanted cutouts (optional)
   ↓
8. Click "Build Collage"
   ↓
9. Adjust grid settings if needed
   ↓
10. Click "Download Collage"
    ↓
11. Save as collage_final.png
```

## Ready to Go!

Your Ski Collage web interface is ready to use. Start by uploading an image and following the on-screen instructions.

Happy collaging! 🎿

---

For detailed information, see: [SKI_COLLAGE_INTEGRATION.md](SKI_COLLAGE_INTEGRATION.md)
