/**
 * Tamil Character Video Mapper
 * Main Application Entry Point
 */

import { VideoProcessor } from './videoProcessor.js';
import { CharMapper } from './charMapper.js';
import { CHARSETS } from './tamilCharsets.js';

class TamilCharMapperApp {
  constructor() {
    // DOM Elements
    this.video = document.getElementById('webcam');
    this.samplingCanvas = document.getElementById('sampling-canvas');
    this.output = document.getElementById('char-output');
    
    // Controls
    this.charsetSelect = document.getElementById('charset-select');
    this.gridWidthSlider = document.getElementById('grid-width');
    this.gridWidthValue = document.getElementById('grid-width-value');
    this.fontSizeSlider = document.getElementById('font-size');
    this.fontSizeValue = document.getElementById('font-size-value');
    this.colorModeSelect = document.getElementById('color-mode');
    this.bgColorInput = document.getElementById('bg-color');
    this.fgColorInput = document.getElementById('fg-color');
    this.invertedCheckbox = document.getElementById('inverted');
    this.mirrorCheckbox = document.getElementById('mirror');
    this.startBtn = document.getElementById('start-btn');
    this.screenshotBtn = document.getElementById('screenshot-btn');
    
    // State
    this.isRunning = false;
    this.animationId = null;
    this.fps = 0;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    
    // Initialize processors
    this.videoProcessor = new VideoProcessor(this.video, this.samplingCanvas);
    this.charMapper = new CharMapper({
      charset: 'full',
      colorMode: 'mono',
      inverted: false,
      fgColor: '#00ff88',
      bgColor: '#0a0a0a'
    });
    
    // Settings
    this.settings = {
      gridWidth: 160,
      fontSize: 10,
      mirror: true
    };
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateUI();
    document.body.classList.add('loading');
  }

  bindEvents() {
    // Start/Stop button
    this.startBtn.addEventListener('click', () => this.toggleCamera());
    
    // Screenshot
    this.screenshotBtn.addEventListener('click', () => this.takeScreenshot());
    
    // Charset selection
    this.charsetSelect.addEventListener('change', (e) => {
      this.charMapper.setOption('charset', e.target.value);
    });
    
    // Grid width
    this.gridWidthSlider.addEventListener('input', (e) => {
      this.settings.gridWidth = parseInt(e.target.value);
      this.gridWidthValue.textContent = e.target.value;
    });
    
    // Font size
    this.fontSizeSlider.addEventListener('input', (e) => {
      this.settings.fontSize = parseInt(e.target.value);
      this.fontSizeValue.textContent = `${e.target.value}px`;
      this.output.style.fontSize = `${e.target.value}px`;
      this.videoProcessor._charCellRatio = null; // re-measure at new size
    });
    
    // Color mode
    this.colorModeSelect.addEventListener('change', (e) => {
      this.charMapper.setOption('colorMode', e.target.value);
    });
    
    // Background color
    this.bgColorInput.addEventListener('input', (e) => {
      this.charMapper.setOption('bgColor', e.target.value);
      document.querySelector('.video-container').style.backgroundColor = e.target.value;
    });
    
    // Foreground color
    this.fgColorInput.addEventListener('input', (e) => {
      this.charMapper.setOption('fgColor', e.target.value);
      this.output.style.color = e.target.value;
    });
    
    // Invert
    this.invertedCheckbox.addEventListener('change', (e) => {
      this.charMapper.setOption('inverted', e.target.checked);
    });
    
    // Mirror
    this.mirrorCheckbox.addEventListener('change', (e) => {
      this.settings.mirror = e.target.checked;
      this.output.classList.toggle('mirror', e.target.checked);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.toggleCamera();
      } else if (e.code === 'KeyS' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.takeScreenshot();
      }
    });
  }

  updateUI() {
    this.output.style.fontSize = `${this.settings.fontSize}px`;
    this.output.style.color = this.charMapper.options.fgColor;
    document.querySelector('.video-container').style.backgroundColor = this.charMapper.options.bgColor;
    this.output.classList.toggle('mirror', this.settings.mirror);
  }

  async toggleCamera() {
    if (this.isRunning) {
      this.stop();
    } else {
      await this.start();
    }
  }

  async start() {
    try {
      this.startBtn.textContent = 'Starting...';
      this.startBtn.disabled = true;
      
      await this.videoProcessor.start();
      
      document.body.classList.remove('loading');
      this.isRunning = true;
      this.startBtn.textContent = 'Stop Camera';
      this.startBtn.disabled = false;
      this.screenshotBtn.disabled = false;
      
      // Start render loop
      this.render();
      
    } catch (err) {
      console.error('Failed to start camera:', err);
      this.startBtn.textContent = 'Start Camera';
      this.startBtn.disabled = false;
      alert('Failed to access camera. Please check permissions.');
    }
  }

  stop() {
    this.isRunning = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    this.videoProcessor.stop();
    
    this.startBtn.textContent = 'Start Camera';
    this.screenshotBtn.disabled = true;
    this.output.innerHTML = '';
    document.body.classList.add('loading');
  }

  render() {
    if (!this.isRunning) return;
    
    // Calculate FPS
    const now = performance.now();
    this.frameCount++;
    if (now - this.lastFrameTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = now;
      // console.log(`FPS: ${this.fps}`);
    }
    
    // Fill container: compute max cols/rows that fit, use slider as upper bound
    const container = this.output.parentElement;
    const containerW = container.clientWidth - 32;
    const containerH = container.clientHeight - 32;
    const charRatio = this.videoProcessor.measureCharCell();
    const charW = this.settings.fontSize * charRatio;
    const charH = this.settings.fontSize;
    const maxCols = Math.floor(containerW / charW);
    const maxRows = Math.floor(containerH / charH);
    // Use whichever is smaller: what fits or what the slider says
    const gridWidth = Math.min(maxCols, this.settings.gridWidth);
    // For height, fill the container vertically while maintaining aspect ratio
    const aspectHeight = this.videoProcessor.getOptimalGridHeight(gridWidth);
    const gridHeight = Math.min(aspectHeight, maxRows);

    // Get grid samples
    const grid = this.videoProcessor.getGridSamples(gridWidth, gridHeight);
    
    if (grid) {
      // Convert to HTML and display
      const html = this.charMapper.gridToHTML(grid);
      this.output.innerHTML = html;
    }
    
    // Continue loop
    this.animationId = requestAnimationFrame(() => this.render());
  }

  takeScreenshot() {
    if (!this.isRunning) return;
    
    // Create a temporary canvas for high-quality screenshot
    const canvas = document.createElement('canvas');
    const gridHeight = this.videoProcessor.getOptimalGridHeight(this.settings.gridWidth);
    const grid = this.videoProcessor.getGridSamples(this.settings.gridWidth, gridHeight);
    
    this.charMapper.renderToCanvas(grid, canvas, {
      fontSize: this.settings.fontSize * 2, // Higher res for screenshot
      fgColor: this.charMapper.options.fgColor,
      bgColor: this.charMapper.options.bgColor
    });
    
    // Apply mirror if enabled
    if (this.settings.mirror) {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.putImageData(imageData, 0, 0);
      ctx.restore();
    }
    
    // Download
    const link = document.createElement('a');
    link.download = `tamil-char-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new TamilCharMapperApp();
});

// Export for debugging
export { TamilCharMapperApp };
