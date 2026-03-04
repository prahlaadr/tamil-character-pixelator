# Tamil Character Video Mapper

A real-time webcam-to-Tamil-character ASCII art converter. This web application captures your webcam feed and renders it using Tamil Unicode characters based on pixel brightness.

## Overview

This project creates a visual effect similar to ASCII art, but using Tamil script characters. Denser/more complex characters represent darker areas, while simpler characters represent lighter areas.

## Quick Start

```bash
# Navigate to project directory
cd tamil-char-mapper

# Install dependencies
npm install

# Start the development server
npm run dev

# Open http://localhost:5173 in your browser
```

## Project Structure

```
tamil-char-mapper/
├── index.html          # Entry point
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
├── src/
│   ├── main.js         # Application entry
│   ├── styles.css      # Styling
│   ├── charMapper.js   # Core character mapping logic
│   ├── videoProcessor.js   # Webcam handling
│   └── tamilCharsets.js    # Tamil character definitions
└── README.md
```

## How It Works

1. **Video Capture**: Webcam feed is captured using the MediaDevices API
2. **Frame Processing**: Each frame is drawn to a hidden canvas
3. **Brightness Sampling**: The canvas is divided into a grid; each cell's average brightness is calculated
4. **Character Mapping**: Brightness values (0-255) map to Tamil characters ordered by visual density
5. **Rendering**: Characters are rendered to a visible canvas or DOM element

## Tamil Character Sets

The app includes multiple character sets you can switch between:

- **Full Tamil**: Complete Unicode range (U+0B80 - U+0BFF)
- **Solkattu**: Rhythmic syllables (த, தி, தோம், etc.) - great for your mridangam connection!
- **Vowels Only**: Tamil vowels for a cleaner look
- **Consonants Only**: Tamil consonants for more density variation

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `gridWidth` | 80 | Number of character columns |
| `gridHeight` | 60 | Number of character rows |
| `fontSize` | 12 | Character size in pixels |
| `fontFamily` | 'Noto Sans Tamil' | Font for rendering |
| `colorMode` | 'mono' | 'mono', 'color', or 'gradient' |
| `inverted` | false | Swap light/dark mapping |
| `charset` | 'full' | Which Tamil character set to use |

## Requirements

- Modern browser with WebRTC support (Chrome, Firefox, Edge, Safari)
- Webcam access
- Tamil font installed (Noto Sans Tamil recommended)

## Fonts

For best results, install one of these Tamil fonts:
- [Noto Sans Tamil](https://fonts.google.com/noto/specimen/Noto+Sans+Tamil) (recommended)
- Latha
- Vijaya
- Tamil Sangam MN (macOS)

The app loads Noto Sans Tamil from Google Fonts automatically.

## TouchDesigner Integration

If you want to use this with TouchDesigner instead:

1. Run the web app and use TouchDesigner's Web Render TOP to capture it
2. Or use the character mapping logic in a Python Script DAT
3. See `touchdesigner/` folder for a `.tox` component and Python scripts

## Customization Ideas

- **Audio Reactivity**: Map audio amplitude to font size or character set
- **MediaPipe Integration**: Use hand/pose tracking to affect the mapping
- **Color Modes**: Extract color from source video for colored characters
- **Solkattu Mode**: Display rhythmic syllables that animate with beat detection

## License

MIT
