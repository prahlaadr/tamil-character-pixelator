/**
 * Character Mapper Module
 * Converts brightness/color grids to Tamil character output
 */

import { CHARSETS, createBrightnessLookup } from './tamilCharsets.js';

export class CharMapper {
  constructor(options = {}) {
    this.options = {
      charset: 'full',
      colorMode: 'mono',
      inverted: false,
      fgColor: '#00ff88',
      bgColor: '#0a0a0a',
      gradientColors: ['#0a0a0a', '#003322', '#00ff88'],
      ...options
    };
    
    // Pre-compute brightness lookup for performance
    this.updateLookup();
  }

  /**
   * Update the brightness lookup table when settings change
   */
  updateLookup() {
    const charset = CHARSETS[this.options.charset] || CHARSETS.full;
    this.brightnessLookup = createBrightnessLookup(charset, this.options.inverted);
    this.currentCharset = charset;
  }

  /**
   * Set an option and update lookup if needed
   */
  setOption(key, value) {
    this.options[key] = value;
    if (key === 'charset' || key === 'inverted') {
      this.updateLookup();
    }
  }

  /**
   * Convert a grid of brightness/color values to HTML string
   * @param {Array<Array<{r, g, b, brightness}>>} grid - 2D grid from VideoProcessor
   * @returns {string} HTML string with colored characters
   */
  gridToHTML(grid) {
    if (!grid || !grid.length) return '';

    const lines = [];
    
    for (const row of grid) {
      let line = '';
      
      for (const cell of row) {
        const char = this.brightnessLookup[cell.brightness];
        
        switch (this.options.colorMode) {
          case 'color':
            // Use original pixel color
            line += `<span style="color:rgb(${cell.r},${cell.g},${cell.b})">${char}</span>`;
            break;
            
          case 'gradient':
            // Map brightness to gradient color
            const gradColor = this.getGradientColor(cell.brightness);
            line += `<span style="color:${gradColor}">${char}</span>`;
            break;
            
          case 'mono':
          default:
            // Single color - no span needed, more performant
            line += char;
            break;
        }
      }
      
      lines.push(line);
    }
    
    return lines.join('\n');
  }

  /**
   * Convert grid to plain text (fastest, for canvas rendering)
   */
  gridToText(grid) {
    if (!grid || !grid.length) return '';
    
    return grid.map(row => 
      row.map(cell => this.brightnessLookup[cell.brightness]).join('')
    ).join('\n');
  }

  /**
   * Get color from gradient based on brightness
   */
  getGradientColor(brightness) {
    const colors = this.options.gradientColors;
    const normalized = brightness / 255;
    
    if (colors.length === 2) {
      return this.interpolateColor(colors[0], colors[1], normalized);
    }
    
    // Multi-stop gradient
    const segment = normalized * (colors.length - 1);
    const idx = Math.floor(segment);
    const t = segment - idx;
    
    if (idx >= colors.length - 1) {
      return colors[colors.length - 1];
    }
    
    return this.interpolateColor(colors[idx], colors[idx + 1], t);
  }

  /**
   * Interpolate between two hex colors
   */
  interpolateColor(color1, color2, t) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    
    return `rgb(${r},${g},${b})`;
  }

  /**
   * Convert hex color to RGB object
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Render to canvas (fastest for high-res output)
   */
  renderToCanvas(grid, canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const {
      fontSize = 10,
      fontFamily = 'Noto Sans Tamil',
      fgColor = this.options.fgColor,
      bgColor = this.options.bgColor
    } = options;

    if (!grid || !grid.length) return;

    const rows = grid.length;
    const cols = grid[0].length;
    
    // Calculate canvas size
    canvas.width = cols * fontSize * 0.8;
    canvas.height = rows * fontSize;
    
    // Clear and set background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set font
    ctx.font = `${fontSize}px "${fontFamily}", monospace`;
    ctx.textBaseline = 'top';
    
    // Draw characters
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = grid[row][col];
        const char = this.brightnessLookup[cell.brightness];
        
        // Set color based on mode
        switch (this.options.colorMode) {
          case 'color':
            ctx.fillStyle = `rgb(${cell.r},${cell.g},${cell.b})`;
            break;
          case 'gradient':
            ctx.fillStyle = this.getGradientColor(cell.brightness);
            break;
          default:
            ctx.fillStyle = fgColor;
        }
        
        ctx.fillText(char, col * fontSize * 0.8, row * fontSize);
      }
    }
  }
}
