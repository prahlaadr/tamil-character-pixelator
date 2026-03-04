# TouchDesigner Integration Guide

## Overview

This guide explains how to use the Tamil character mapping system within TouchDesigner, either by:
1. Using the Web Render TOP to capture the web app
2. Using native Python scripts in TouchDesigner
3. Integrating with MediaPipe for body/hand tracking

---

## Option 1: Web Render TOP (Easiest)

The simplest integration - render the web app inside TouchDesigner.

### Setup Steps

1. **Start the web app**
   ```bash
   cd tamil-char-mapper
   npm install
   npm run dev
   ```

2. **In TouchDesigner:**
   - Create a **Web Render TOP**
   - Set URL to `http://localhost:5173`
   - Set resolution to match your output (e.g., 1920x1080)
   - Enable "Allow Microphone/Camera" in the Web Render TOP parameters

3. **Route the output** to your desired destination (Render TOP, OUT, etc.)

### Pros & Cons
- ✅ Full UI controls
- ✅ No Python coding needed
- ✅ Automatic font rendering
- ❌ Slight latency from web rendering
- ❌ Less integration with TD parameters

---

## Option 2: Native Python Script (Best Performance)

Use TouchDesigner's built-in Python for direct video processing.

### Network Setup

```
[Video Device In TOP] → [Script TOP] → [Text TOP]
        or
[Movie File In TOP] → [Script TOP] → [Text TOP]
```

### Step-by-Step

1. **Create Video Input**
   - Add **Video Device In TOP** (for webcam) or **Movie File In TOP**
   - Set resolution (640x480 is fine for character art)

2. **Create Script TOP**
   - Add **Script TOP**
   - Wire the video input to it
   - Copy contents of `tamil_char_mapper.py` to the Script TOP's `onCook` function

3. **Add Custom Parameters to Script TOP**
   - Right-click Script TOP → Customize Component → Custom Parameters
   - Add:
     - `Gridcols` (Int, default 80, range 20-200)
     - `Charset` (Menu: full, solkattu, vowels, consonants)
     - `Inverted` (Toggle)

4. **Create Text TOP for Display**
   - Add **Text TOP**
   - Set Font to "Noto Sans Tamil" (install it first)
   - In the Text TOP's DAT parameter, reference the Script TOP's storage:
     ```python
     op('script1').fetch('charOutput', '')
     ```
   - Or use a **Text DAT** + **Text TOP** combo

5. **Alternative: Text DAT Approach**
   - Create a **Text DAT**
   - In its `onPulse` or frame callback:
     ```python
     from tamil_char_mapper import process_video_to_text
     op('text1').text = process_video_to_text(op('moviefilein1'), grid_cols=80)
     ```

### Font Setup

Tamil fonts must be installed on your system:
- **Windows**: Install Noto Sans Tamil, it will appear in TD
- **macOS**: Tamil Sangam MN is built-in, or install Noto Sans Tamil

---

## Option 3: MediaPipe Integration

Combine body/pose tracking with character mapping for reactive visuals.

### Required Components

1. **MediaPipe TouchDesigner Package**
   - Download from [Torin Blankensmith's GitHub](https://github.com/torinmb/mediapipe-touchdesigner)
   - Or use Derivative's Palette → MediaPipe components

2. **Network Setup**
   ```
   [Video Device In] ──┬──→ [MediaPipe TOP] → [MediaPipe CHOP]
                       │                              │
                       └──→ [Script TOP] ←────────────┘
                                  │
                                  ↓
                            [Text TOP]
   ```

### Example: Hand Position Affects Grid

```python
# In Script TOP

def onCook(scriptOp):
    video = scriptOp.inputs[0]
    mp_chop = op('mediapipe_chop')  # Reference your MediaPipe CHOP
    
    # Get base parameters
    base_grid = 80
    
    # Modify based on hand position
    if mp_chop.numSamples > 0:
        # Example: hand y position changes grid density
        hand_y = mp_chop['hand_0_y'][0] if 'hand_0_y' in mp_chop.chanNames else 0.5
        grid_cols = int(base_grid + (hand_y - 0.5) * 60)
        grid_cols = max(40, min(160, grid_cols))
    else:
        grid_cols = base_grid
    
    # Process video
    pixels = video.numpyArray(delayed=True)
    if pixels is None:
        return
    
    height, width = pixels.shape[:2]
    
    if not hasattr(scriptOp, 'mapper'):
        from tamil_char_mapper import TamilCharMapper
        scriptOp.mapper = TamilCharMapper('full')
    
    lines = scriptOp.mapper.process_frame(pixels, width, height, grid_cols)
    scriptOp.store('charOutput', '\n'.join(lines))
```

### Creative Ideas

- **Solkattu + Audio**: Use audio analysis CHOPs to drive character set selection based on rhythm
- **Pose Tracking**: Different body poses trigger different Tamil character sets
- **Face Mesh**: Map facial landmarks to character density gradients
- **Hand Tracking**: Draw with Tamil characters where hands move

---

## Performance Tips

1. **Reduce Resolution**: 640x480 input is plenty for character art
2. **Limit Grid Size**: 80-120 columns is a good balance
3. **Use `delayed=True`**: When calling `numpyArray()` to avoid blocking
4. **Pre-compute Lookup**: The `TamilCharMapper` class does this automatically
5. **Skip Frames**: Process every 2nd frame if needed:
   ```python
   if me.time.frame % 2 == 0:
       return
   ```

---

## Troubleshooting

### Tamil characters not displaying
- Ensure Noto Sans Tamil font is installed
- In Text TOP, explicitly set the font family
- Check font supports Tamil Unicode range (U+0B80-U+0BFF)

### Slow performance
- Reduce grid columns
- Lower input video resolution
- Use Script TOP instead of DAT Execute for processing

### Characters look stretched
- Adjust the aspect ratio calculation in `process_frame()`
- Tamil characters are roughly 1:1, so multiply rows by 0.5

---

## File Reference

- `tamil_char_mapper.py` - Main Python module
- `../src/tamilCharsets.js` - Character set reference (for web version)
- `../README.md` - Web app documentation
