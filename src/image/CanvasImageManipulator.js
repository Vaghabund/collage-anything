import Theme from './../components/theme';

export default class CanvasImageManipulator {
  static BOX_COLOR = Theme.palette.secondary.dark;
  static SELECTED_BOX_COLOR = Theme.palette.primary.dark;
  static BOX_WIDTH = '6';
  canvas;

  constructor(canvas) {
    this.setCanvas(canvas);
  }

  /**
   * Calculate appropriate text color based on background luminance
   * @param {string} hexColor - Background color in hex format
   * @returns {string} - Either '#ffffff' or '#000000'
   */
  getContrastColor(hexColor) {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate relative luminance using ITU-R BT.709
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  drawBoxes(image, boxes, selectedIndex, options = {}) {
    const drawBoxes = options.drawBoxes !== undefined ? options.drawBoxes : true;
    const drawLabels = options.drawLabels !== undefined ? options.drawLabels : true;
    const boxWidth = options.boxWidth || CanvasImageManipulator.BOX_WIDTH;
    const boxColor = options.boxColor || CanvasImageManipulator.BOX_COLOR;
    const selectedBoxColor = options.selectedBoxColor || CanvasImageManipulator.SELECTED_BOX_COLOR;
    
    this.drawImage(image);
    
    if (!drawBoxes) {
      return;
    }
    
    let ctx = this.canvas.getContext('2d');

    ctx.beginPath();
    ctx.lineWidth = boxWidth;
    ctx.strokeStyle = boxColor;
    ctx.font = '16px Arial';
    ctx.fillStyle = boxColor;
    
    boxes.forEach((box, index) => {
      const isSelected = selectedIndex !== undefined && selectedIndex === index;
      const currentColor = isSelected ? selectedBoxColor : boxColor;
      
      ctx.strokeStyle = currentColor;
      ctx.strokeRect(box.left, box.top, box.width, box.height);
      
      if (drawLabels && box.class) {
        ctx.fillStyle = currentColor;
        const label = `${box.class} ${(box.score * 100).toFixed(0)}%`;
        const textWidth = ctx.measureText(label).width;
        const textHeight = 16;
        const padding = 4;
        const labelHeight = textHeight + padding * 2;
        
        // Determine label position: above box if space available, otherwise below
        const labelAboveBox = box.top >= labelHeight;
        const labelY = labelAboveBox 
          ? box.top - labelHeight 
          : box.top + box.height;
        const textY = labelAboveBox 
          ? box.top - padding 
          : box.top + box.height + textHeight + padding;
        
        // Draw background rectangle for label
        ctx.fillRect(
          box.left - 1,
          labelY,
          textWidth + padding * 2,
          labelHeight
        );
        
        // Draw label text with contrast-appropriate color
        ctx.fillStyle = this.getContrastColor(currentColor);
        ctx.fillText(label, box.left + padding, textY);
        ctx.fillStyle = currentColor;
      }
    });
    ctx.stroke();
  }

  drawImage(image) {
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    let ctx = this.canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
  }

  setCanvas(canvas) {
    if (canvas !== undefined)
      this.canvas = canvas;
  }

  refreshCanvas() {
    this.canvas.width = 0;
    this.canvas.height = 0;
  }
}