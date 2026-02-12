/**
 * Collage builder utility - ports Python build_collage.py to JavaScript
 */

export class CollageBuilder {
  static DEFAULT_CONFIG = {
    columns: 6,
    padding: 20,
    background: '#F5F5F5',
    maxHeight: 700,
    allowUpscale: false,
  };

  /**
   * Build a collage from cutout canvases
   * @param {Array} cutouts - Array of cutout canvases (sorted by size)
   * @param {Object} config - Configuration options
   * @returns {HTMLCanvasElement} Collage canvas
   */
  static buildCollage(cutouts, config = {}) {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    if (!cutouts || cutouts.length === 0) {
      throw new Error('No cutouts provided');
    }

    // Sort by area descending (largest first) - reverse of extraction order
    const sortedCutouts = [...cutouts].sort((a, b) => {
      const areaA = a.canvas.width * a.canvas.height;
      const areaB = b.canvas.width * b.canvas.height;
      return areaB - areaA; // Descending
    });

    // Calculate grid dimensions and scaled sizes
    const gridInfo = this.calculateGridLayout(
      sortedCutouts,
      finalConfig.columns,
      finalConfig.maxHeight,
      finalConfig.padding,
      finalConfig.allowUpscale
    );

    // Create collage canvas
    const collageCanvas = document.createElement('canvas');
    collageCanvas.width = gridInfo.totalWidth;
    collageCanvas.height = gridInfo.totalHeight;

    // Fill background
    const ctx = collageCanvas.getContext('2d');
    const bgColor = this.parseColor(finalConfig.background);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, collageCanvas.width, collageCanvas.height);

    // Place images in grid
    let col = 0;
    let yPos = finalConfig.padding;

    sortedCutouts.forEach((cutout, index) => {
      const scaledDim = gridInfo.scaledDimensions[index];
      const xPos =
        finalConfig.padding +
        col * (scaledDim.width + finalConfig.padding);

      // Draw scaled image
      ctx.drawImage(
        cutout.canvas,
        xPos,
        yPos,
        scaledDim.width,
        scaledDim.height
      );

      col++;
      if (col >= finalConfig.columns) {
        col = 0;
        yPos += scaledDim.height + finalConfig.padding;
      }
    });

    return collageCanvas;
  }

  /**
   * Calculate grid layout with proper scaling
   */
  static calculateGridLayout(
    cutouts,
    columns,
    maxHeight,
    padding,
    allowUpscale
  ) {
    const scaledDimensions = [];
    const availableWidth =
      Math.max(800, columns * (maxHeight + padding)) - padding; // Minimum width
    const cellWidth = (availableWidth - (columns + 1) * padding) / columns;

    let maxRowHeight = 0;
    let totalHeight = padding;
    let totalWidth = availableWidth;

    cutouts.forEach((cutout, index) => {
      const col = index % columns;

      // Calculate aspect ratio
      const aspectRatio = cutout.canvas.width / cutout.canvas.height;

      // Scale based on available cell width
      let scaledWidth = cellWidth;
      let scaledHeight = scaledWidth / aspectRatio;

      // Ensure height doesn't exceed maxHeight or upscale if not allowed
      if (scaledHeight > maxHeight) {
        scaledHeight = maxHeight;
        scaledWidth = scaledHeight * aspectRatio;
      }

      if (!allowUpscale) {
        const originalScale = Math.min(
          scaledWidth / cutout.canvas.width,
          scaledHeight / cutout.canvas.height
        );
        if (originalScale < 1) {
          scaledWidth = scaledWidth * originalScale;
          scaledHeight = scaledHeight * originalScale;
        }
      }

      scaledDimensions.push({
        width: Math.round(scaledWidth),
        height: Math.round(scaledHeight),
      });

      maxRowHeight = Math.max(maxRowHeight, scaledHeight);

      // Check if next item starts new row
      if (col === columns - 1 || index === cutouts.length - 1) {
        totalHeight += maxRowHeight + padding;
        maxRowHeight = 0;
      }
    });

    return {
      totalWidth: Math.round(totalWidth),
      totalHeight: Math.round(totalHeight),
      scaledDimensions,
      columns,
    };
  }

  /**
   * Parse CSS color to RGB strings
   */
  static parseColor(colorStr) {
    if (colorStr.toLowerCase() === 'transparent') {
      return 'rgba(0,0,0,0)';
    }

    // Handle hex colors
    if (colorStr.startsWith('#')) {
      return colorStr;
    }

    // Handle named colors
    const temp = document.createElement('div');
    temp.style.color = colorStr;
    document.body.appendChild(temp);
    const rgbColor = window
      .getComputedStyle(temp)
      .getPropertyValue('color');
    document.body.removeChild(temp);
    return rgbColor;
  }

  /**
   * Download collage as PNG
   */
  static async downloadCollage(canvas, filename = 'collage.png') {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    });
  }
}

export default CollageBuilder;
