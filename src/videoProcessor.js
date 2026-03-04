/**
 * Video Processor Module
 * Handles webcam capture and frame extraction
 */

export class VideoProcessor {
  constructor(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d', { willReadFrequently: true });
    this.stream = null;
    this.isRunning = false;
  }

  /**
   * Start webcam capture
   */
  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      this.video.srcObject = this.stream;
      await this.video.play();
      
      // Set canvas size to match video
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      
      this.isRunning = true;
      return true;
    } catch (err) {
      console.error('Failed to start webcam:', err);
      throw err;
    }
  }

  /**
   * Stop webcam capture
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isRunning = false;
  }

  /**
   * Get current frame as ImageData
   */
  getFrame() {
    if (!this.isRunning) return null;
    
    this.ctx.drawImage(this.video, 0, 0);
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Get frame sampled to a grid
   * @param {number} gridWidth - Number of columns
   * @param {number} gridHeight - Number of rows
   * @returns {Array<Array<{r, g, b, brightness}>>} 2D grid of color/brightness values
   */
  getGridSamples(gridWidth, gridHeight) {
    if (!this.isRunning) return null;

    const frame = this.getFrame();
    if (!frame) return null;

    const { width, height, data } = frame;
    const cellWidth = width / gridWidth;
    const cellHeight = height / gridHeight;
    
    const grid = [];
    
    for (let row = 0; row < gridHeight; row++) {
      const rowData = [];
      for (let col = 0; col < gridWidth; col++) {
        // Sample center of each cell
        const x = Math.floor(col * cellWidth + cellWidth / 2);
        const y = Math.floor(row * cellHeight + cellHeight / 2);
        
        // Get pixel index (RGBA = 4 bytes per pixel)
        const idx = (y * width + x) * 4;
        
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        // Calculate perceived brightness (human eye is more sensitive to green)
        const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        
        rowData.push({ r, g, b, brightness });
      }
      grid.push(rowData);
    }
    
    return grid;
  }

  /**
   * Get averaged grid samples (better quality, slightly slower)
   * Averages all pixels in each cell instead of sampling center
   */
  getAveragedGridSamples(gridWidth, gridHeight) {
    if (!this.isRunning) return null;

    const frame = this.getFrame();
    if (!frame) return null;

    const { width, height, data } = frame;
    const cellWidth = width / gridWidth;
    const cellHeight = height / gridHeight;
    
    const grid = [];
    
    for (let row = 0; row < gridHeight; row++) {
      const rowData = [];
      for (let col = 0; col < gridWidth; col++) {
        const startX = Math.floor(col * cellWidth);
        const startY = Math.floor(row * cellHeight);
        const endX = Math.floor((col + 1) * cellWidth);
        const endY = Math.floor((row + 1) * cellHeight);
        
        let totalR = 0, totalG = 0, totalB = 0;
        let pixelCount = 0;
        
        // Average all pixels in cell
        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const idx = (y * width + x) * 4;
            totalR += data[idx];
            totalG += data[idx + 1];
            totalB += data[idx + 2];
            pixelCount++;
          }
        }
        
        const r = Math.round(totalR / pixelCount);
        const g = Math.round(totalG / pixelCount);
        const b = Math.round(totalB / pixelCount);
        const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        
        rowData.push({ r, g, b, brightness });
      }
      grid.push(rowData);
    }
    
    return grid;
  }

  /**
   * Get video dimensions
   */
  getDimensions() {
    return {
      width: this.video.videoWidth,
      height: this.video.videoHeight
    };
  }

  /**
   * Measure actual character cell dimensions from the output element
   */
  measureCharCell() {
    if (this._charCellRatio) return this._charCellRatio;

    const span = document.createElement('span');
    span.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;';
    const output = document.getElementById('char-output');
    if (output) {
      span.style.font = getComputedStyle(output).font;
      span.style.lineHeight = getComputedStyle(output).lineHeight;
    }
    span.textContent = 'தமிழ்கணபரசல';
    document.body.appendChild(span);
    const charWidth = span.offsetWidth / 12;
    const charHeight = span.offsetHeight;
    document.body.removeChild(span);

    this._charCellRatio = charWidth / charHeight;
    return this._charCellRatio;
  }

  /**
   * Calculate optimal grid height to maintain aspect ratio
   */
  getOptimalGridHeight(gridWidth) {
    const { width, height } = this.getDimensions();
    const aspectRatio = height / width;
    const charRatio = this.measureCharCell();
    return Math.round(gridWidth * aspectRatio * charRatio * 1.15);
  }
}
