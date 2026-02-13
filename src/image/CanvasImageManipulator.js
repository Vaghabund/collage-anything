import Theme from './../components/theme';

export default class CanvasImageManipulator {
  static BOX_COLOR = Theme.palette.secondary.dark;
  static SELECTED_BOX_COLOR = Theme.palette.primary.dark;
  static BOX_WIDTH = '6';
  canvas;

  constructor(canvas) {
    this.setCanvas(canvas);
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
        
        // Draw background rectangle for label
        ctx.fillRect(
          box.left - 1,
          box.top - textHeight - padding * 2,
          textWidth + padding * 2,
          textHeight + padding * 2
        );
        
        // Draw label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, box.left + padding, box.top - padding);
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