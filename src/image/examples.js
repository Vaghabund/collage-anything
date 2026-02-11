/**
 * Example usage of CutoutExtractor and CollageBuilder
 * This shows how to use the utilities programmatically outside the React component
 */

import CutoutExtractor from './CutoutExtractor';
import CollageBuilder from './CollageBuilder';

/**
 * Example 1: Basic cutout extraction
 * Showing how to extract people from an image with default settings
 */
export function exampleBasicExtraction() {
  // Assume you have an image element
  const imageElement = document.getElementById('my-image');

  // Assume YOLO detection results
  const detectionResults = [
    {
      cls: 0, // person class
      confidence: 0.85,
      left: 100,
      top: 50,
      width: 80,
      height: 150,
    },
    {
      cls: 0,
      confidence: 0.72,
      left: 300,
      top: 40,
      width: 90,
      height: 160,
    },
  ];

  // Extract cutouts with default settings
  const cutouts = CutoutExtractor.extractCutouts(
    imageElement,
    detectionResults
  );

  console.log(`Extracted ${cutouts.length} cutouts`);
  cutouts.forEach((cutout, i) => {
    console.log(
      `Cutout ${i}: ${cutout.canvas.width}x${cutout.canvas.height}px`
    );
  });

  return cutouts;
}

/**
 * Example 2: Extraction with custom settings
 * Shows how to adjust extraction parameters
 */
export function exampleCustomExtraction(imageElement, detections) {
  const customConfig = {
    bboxPaddingPct: 5.0, // Larger padding
    minConfidence: 0.3, // Higher confidence threshold
  };

  const cutouts = CutoutExtractor.extractCutouts(
    imageElement,
    detections,
    customConfig
  );

  return cutouts;
}

/**
 * Example 3: Download a single cutout
 * Shows how to download one cutout as PNG
 */
export async function exampleDownloadSingleCutout(cutout, name = 'cutout') {
  await CutoutExtractor.downloadCanvasAsImage(
    cutout.canvas,
    `${name}.png`
  );
  console.log('Cutout downloaded');
}

/**
 * Example 4: Build a basic collage
 * Shows collage building with default settings
 */
export function exampleBasicCollage(cutouts) {
  const collageCanvas = CollageBuilder.buildCollage(cutouts);

  console.log(
    `Collage created: ${collageCanvas.width}x${collageCanvas.height}px`
  );

  // To display in the page:
  document.body.appendChild(collageCanvas);

  return collageCanvas;
}

/**
 * Example 5: Build a custom collage
 * Shows collage building with custom layout settings
 */
export function exampleCustomCollage(cutouts) {
  const customConfig = {
    columns: 4, // 4-column layout
    padding: 30, // 30px between images
    background: '#ffffff', // white background
    maxHeight: 600, // larger images
    allowUpscale: false,
  };

  const collageCanvas = CollageBuilder.buildCollage(cutouts, customConfig);
  return collageCanvas;
}

/**
 * Example 6: Complete workflow
 * Shows the full process from detection to download
 */
export async function exampleCompleteWorkflow(imageElement, yoloDetections) {
  console.log('Starting complete workflow...');

  // Step 1: Extract cutouts
  console.log('Extracting cutouts...');
  const cutouts = CutoutExtractor.extractCutouts(imageElement, yoloDetections, {
    bboxPaddingPct: 3.0,
    minConfidence: 0.25,
  });
  console.log(`✓ Extracted ${cutouts.length} cutouts`);

  // Step 2: Build collage
  console.log('Building collage...');
  const collageCanvas = CollageBuilder.buildCollage(cutouts, {
    columns: 6,
    padding: 20,
    background: '#F5F5F5',
    maxHeight: 700,
    allowUpscale: false,
  });
  console.log(`✓ Collage built: ${collageCanvas.width}x${collageCanvas.height}px`);

  // Step 3: Download collage
  console.log('Downloading collage...');
  const timestamp = new Date()
    .toISOString()
    .slice(0, 19)
    .replace(/[-:]/g, '-');
  await CollageBuilder.downloadCollage(collageCanvas, `collage_${timestamp}.png`);
  console.log('✓ Collage downloaded');

  return {
    cutouts,
    collageCanvas,
  };
}

/**
 * Example 7: Batch operations
 * Shows how to work with multiple cutouts programmatically
 */
export function exampleBatchOperations(cutouts) {
  // Filter by size
  const largerCutouts = cutouts.filter(
    (c) => c.canvas.width * c.canvas.height > 5000
  );
  console.log(`Found ${largerCutouts.length} larger cutouts`);

  // Filter by confidence
  const confidentialCutouts = cutouts.filter((c) => c.confidence > 0.8);
  console.log(`Found ${confidentialCutouts.length} high-confidence cutouts`);

  // Get statistics
  const areas = cutouts.map((c) => c.canvas.width * c.canvas.height);
  const avgArea = areas.reduce((a, b) => a + b, 0) / areas.length;
  console.log(`Average cutout area: ${avgArea.toFixed(0)}px²`);

  return {
    largerCutouts,
    confidentialCutouts,
    stats: { avgArea, total: cutouts.length },
  };
}

/**
 * Example 8: Advanced - Dynamic collage layout
 * Build collages with different layouts to compare
 */
export function exampleCompareLayouts(cutouts) {
  const layouts = [
    { columns: 4, padding: 10 },
    { columns: 6, padding: 20 },
    { columns: 8, padding: 10 },
  ];

  const collages = layouts.map((layout) => {
    return {
      layout,
      canvas: CollageBuilder.buildCollage(cutouts, {
        ...layout,
        background: '#F5F5F5',
        maxHeight: 700,
      }),
    };
  });

  return collages;
}

/**
 * Example 9: Working with canvas directly
 * Shows how to manipulate canvases manually
 */
export function exampleCanvasManipulation(cutout) {
  // Create a modified version
  const modifiedCanvas = document.createElement('canvas');
  modifiedCanvas.width = cutout.canvas.width;
  modifiedCanvas.height = cutout.canvas.height;

  const ctx = modifiedCanvas.getContext('2d');

  // Apply some effects
  ctx.filter = 'brightness(1.2) contrast(1.1)'; // Brighten
  ctx.drawImage(cutout.canvas, 0, 0);

  // Add border
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, modifiedCanvas.width, modifiedCanvas.height);

  // Save modified version
  return modifiedCanvas;
}

/**
 * Example 10: Responsive utility
 * Helper to display cutouts responsively
 */
export function exampleResponsiveDisplay(cutouts, containerElement) {
  // Get container dimensions
  const containerWidth = containerElement.clientWidth;
  const numCols = Math.floor(containerWidth / 150); // 150px per column

  // Create grid
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
  grid.style.gap = '10px';

  // Add cutouts
  cutouts.forEach((cutout, i) => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';

    const canvas = document.createElement('canvas');
    canvas.width = cutout.canvas.width;
    canvas.height = cutout.canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(cutout.canvas, 0, 0);

    wrapper.appendChild(canvas);
    grid.appendChild(wrapper);
  });

  containerElement.appendChild(grid);
}

/**
 * Quick reference for default configurations
 */
export const ConfigurationPresets = {
  TIGHT_EXTRACTION: {
    bboxPaddingPct: 0.5,
    minConfidence: 0.4,
  },
  NORMAL_EXTRACTION: {
    bboxPaddingPct: 2.0,
    minConfidence: 0.2,
  },
  LOOSE_EXTRACTION: {
    bboxPaddingPct: 5.0,
    minConfidence: 0.15,
  },
  COMPACT_COLLAGE: {
    columns: 8,
    padding: 10,
    background: '#FFF',
    maxHeight: 500,
  },
  NORMAL_COLLAGE: {
    columns: 6,
    padding: 20,
    background: '#F5F5F5',
    maxHeight: 700,
  },
  LARGE_COLLAGE: {
    columns: 4,
    padding: 30,
    background: '#FFF',
    maxHeight: 900,
  },
};

/**
 * Helper: Get extraction statistics
 */
export function getExtractionStats(cutouts) {
  const areas = cutouts.map((c) => c.canvas.width * c.canvas.height);
  const confidences = cutouts.map((c) => c.confidence);

  return {
    count: cutouts.length,
    totalArea: areas.reduce((a, b) => a + b, 0),
    avgArea: areas.reduce((a, b) => a + b, 0) / areas.length,
    minArea: Math.min(...areas),
    maxArea: Math.max(...areas),
    avgConfidence: confidences.reduce((a, b) => a + b, 0) / confidences.length,
    minConfidence: Math.min(...confidences),
    maxConfidence: Math.max(...confidences),
  };
}

// Example usage in console:
// const stats = getExtractionStats(cutouts);
// console.log(stats);
