/**
 * Utility for extracting person cutouts from detection results
 * Mirrors the functionality of Python's cutout_people.py
 */

export class CutoutExtractor {
  static DEFAULT_CONFIG = {
    bboxPaddingPct: 2.0,
    minConfidence: 0.2,
  };

  /**
   * Extract person cutouts from detection results
   * @param {HTMLImageElement|HTMLCanvasElement} sourceImage - Source image
   * @param {Array} boxes - YOLO detection boxes
   * @param {Object} config - Configuration options
   * @returns {Array} Array of cutout objects with canvas and metadata
   */
  static extractCutouts(sourceImage, boxes, config = {}) {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const cutouts = [];

    if (!boxes || boxes.length === 0) {
      return cutouts;
    }

    // Get source dimensions
    const sourceCanvas = this.getCanvasFromImage(sourceImage);
    const sourceWidth = sourceCanvas.width;
    const sourceHeight = sourceCanvas.height;

    // Filter for person class (class 0 in COCO) and confidence
    boxes.forEach((box, index) => {
      if (box.cls !== 0) return; // Only extract people (class 0)
      if (box.confidence < finalConfig.minConfidence) return;

      try {
        // Calculate padded bounding box
        const paddedBox = this.calculatePaddedBox(
          box,
          sourceWidth,
          sourceHeight,
          finalConfig.bboxPaddingPct
        );

        // Extract cutout
        const cutoutCanvas = document.createElement('canvas');
        cutoutCanvas.width = paddedBox.width;
        cutoutCanvas.height = paddedBox.height;

        const cutoutCtx = cutoutCanvas.getContext('2d');
        cutoutCtx.drawImage(
          sourceCanvas,
          paddedBox.x,
          paddedBox.y,
          paddedBox.width,
          paddedBox.height,
          0,
          0,
          paddedBox.width,
          paddedBox.height
        );

        // Create cutout object
        cutouts.push({
          index,
          canvas: cutoutCanvas,
          bbox: paddedBox,
          source: box,
          confidence: box.confidence,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Error extracting cutout ${index}:`, error);
      }
    });

    // Sort by area (smallest first, like Python version)
    cutouts.sort((a, b) => {
      const areaA = a.canvas.width * a.canvas.height;
      const areaB = b.canvas.width * b.canvas.height;
      return areaA - areaB;
    });

    return cutouts;
  }

  /**
   * Calculate padded bounding box keeping within image bounds
   */
  static calculatePaddedBox(box, imageWidth, imageHeight, paddingPct) {
    let x = Math.max(0, box.left);
    let y = Math.max(0, box.top);
    let width = Math.min(box.width, imageWidth - x);
    let height = Math.min(box.height, imageHeight - y);

    // Apply padding percentage
    const paddingX = (width * paddingPct) / 100;
    const paddingY = (height * paddingPct) / 100;

    x = Math.max(0, x - paddingX);
    y = Math.max(0, y - paddingY);
    width = Math.min(imageWidth - x, width + 2 * paddingX);
    height = Math.min(imageHeight - y, height + 2 * paddingY);

    return {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  /**
   * Convert canvas to blob for download
   */
  static canvasToBlob(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
  }

  /**
   * Get canvas from image element or return if already canvas
   */
  static getCanvasFromImage(source) {
    if (source instanceof HTMLCanvasElement) {
      return source;
    }

    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0);
    return canvas;
  }

  /**
   * Download canvas as PNG file
   */
  static async downloadCanvasAsImage(canvas, filename = 'cutout.png') {
    const blob = await this.canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Download multiple cutouts as zip (requires zip library)
   */
  static async downloadCutoutsAsZip(cutouts, zipLibrary, filename = 'cutouts.zip') {
    if (!zipLibrary) {
      console.error('ZIP library not available');
      return;
    }

    const zip = new zipLibrary();

    for (let i = 0; i < cutouts.length; i++) {
      const cutout = cutouts[i];
      const blob = await this.canvasToBlob(cutout.canvas);
      zip.file(`cutout_${i.toString().padStart(4, '0')}.png`, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default CutoutExtractor;
