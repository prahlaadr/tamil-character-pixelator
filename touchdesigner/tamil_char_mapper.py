"""
Tamil Character Video Mapper for TouchDesigner
================================================

This script processes video input and outputs Tamil character art.
Use in a Script TOP or Text DAT in TouchDesigner.

Setup:
1. Create a Movie File In TOP or Video Device In TOP
2. Create a Script TOP, paste this code
3. Wire the video TOP to the Script TOP

For MediaPipe integration:
1. Use the MediaPipe TOP from Palette or install mediapipe-touchdesigner
2. Wire both video and MediaPipe outputs to the script
"""

import numpy as np

# Tamil character sets ordered by visual density (darkest first)
CHARSETS = {
    'full': [
        'க்ஷ', 'ஸ்ரீ', 'ஞ', 'ஜ', 'ஷ', 'ஸ', 'ஹ',
        'ஔ', 'ஓ', 'ஒ', 'ஐ', 'ஊ', 'ஆ',
        'க', 'ங', 'ச', 'ட', 'ண', 'த', 'ந', 'ப', 'ம', 'ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன',
        'ஏ', 'ஈ', 'உ', 'இ', 'எ', 'அ',
        'க்', 'ங்', 'ச்', 'ட்', 'ண்', 'த்', 'ந்', 'ப்', 'ம்',
        '்', ' '
    ],
    'solkattu': [
        'தரிகிட', 'தகதிமி', 'தோம்', 'தாம்', 'நம்', 'தீம்',
        'திம்', 'தம்', 'கும்', 'ஜம்',
        'தக', 'திக', 'தொக', 'ஜணு',
        'தா', 'தி', 'தோ', 'நா',
        'கி', 'ட', 'தொ', 'மி',
        'த', 'க', 'ஜ', 'ன',
        '|', ' '
    ],
    'vowels': [
        'ஔ', 'ஓ', 'ஒ', 'ஐ', 'ஏ', 'ஈ',
        'ஊ', 'ஆ', 'உ', 'இ', 'எ', 'அ', ' '
    ],
    'consonants': [
        'க்ஷ', 'ஞ', 'ஜ', 'ஷ', 'ஸ', 'ஹ',
        'ங', 'ண', 'ம', 'ழ', 'ள', 'ற',
        'க', 'ச', 'ட', 'த', 'ந', 'ப',
        'ய', 'ர', 'ல', 'வ', 'ன', ' '
    ]
}


class TamilCharMapper:
    """
    Convert video frames to Tamil character art.
    """
    
    def __init__(self, charset_name='full', inverted=False):
        self.charset = CHARSETS.get(charset_name, CHARSETS['full'])
        self.inverted = inverted
        self._build_lookup()
    
    def _build_lookup(self):
        """Pre-compute brightness to character lookup."""
        self.lookup = []
        for i in range(256):
            brightness = 255 - i if self.inverted else i
            idx = int((brightness / 256) * len(self.charset))
            idx = min(idx, len(self.charset) - 1)
            self.lookup.append(self.charset[idx])
    
    def set_charset(self, charset_name):
        """Change character set."""
        if charset_name in CHARSETS:
            self.charset = CHARSETS[charset_name]
            self._build_lookup()
    
    def set_inverted(self, inverted):
        """Toggle brightness inversion."""
        if self.inverted != inverted:
            self.inverted = inverted
            self._build_lookup()
    
    def process_frame(self, pixels, width, height, grid_cols=80, grid_rows=None):
        """
        Convert pixel data to Tamil character grid.
        
        Args:
            pixels: numpy array of shape (height, width, 4) RGBA or (height, width, 3) RGB
            width: frame width
            height: frame height
            grid_cols: number of character columns
            grid_rows: number of character rows (auto-calculated if None)
        
        Returns:
            List of strings, one per row
        """
        if grid_rows is None:
            # Maintain aspect ratio (Tamil chars are roughly square)
            grid_rows = int(grid_cols * (height / width) * 0.5)
        
        cell_w = width / grid_cols
        cell_h = height / grid_rows
        
        lines = []
        
        for row in range(grid_rows):
            line = ''
            for col in range(grid_cols):
                # Sample center of cell
                x = int(col * cell_w + cell_w / 2)
                y = int(row * cell_h + cell_h / 2)
                
                # Clamp to bounds
                x = min(x, width - 1)
                y = min(y, height - 1)
                
                # Get pixel (handle both RGB and RGBA)
                if len(pixels.shape) == 3:
                    r, g, b = pixels[y, x, :3]
                else:
                    r, g, b = pixels[y, x], pixels[y, x], pixels[y, x]
                
                # Perceived brightness
                brightness = int(0.299 * r + 0.587 * g + 0.114 * b)
                
                line += self.lookup[brightness]
            
            lines.append(line)
        
        return lines


# TouchDesigner Script TOP integration
def onCook(scriptOp):
    """
    Called each frame by TouchDesigner.
    Wire a video input to the Script TOP.
    """
    # Get input
    if len(scriptOp.inputs) == 0:
        return
    
    input_top = scriptOp.inputs[0]
    
    # Get parameters (create these as Custom Parameters on the Script TOP)
    grid_cols = scriptOp.par.Gridcols.eval() if hasattr(scriptOp.par, 'Gridcols') else 80
    charset = scriptOp.par.Charset.eval() if hasattr(scriptOp.par, 'Charset') else 'full'
    inverted = scriptOp.par.Inverted.eval() if hasattr(scriptOp.par, 'Inverted') else False
    
    # Get pixel data as numpy array
    pixels = input_top.numpyArray(delayed=True)
    
    if pixels is None:
        return
    
    height, width = pixels.shape[:2]
    
    # Create or update mapper
    if not hasattr(scriptOp, 'mapper'):
        scriptOp.mapper = TamilCharMapper(charset, inverted)
    else:
        scriptOp.mapper.set_charset(charset)
        scriptOp.mapper.set_inverted(inverted)
    
    # Process frame
    lines = scriptOp.mapper.process_frame(pixels, width, height, grid_cols)
    
    # Output to Text DAT (wire a Text DAT to receive output)
    output_text = '\n'.join(lines)
    
    # Store for Text DAT to pick up
    scriptOp.store('charOutput', output_text)


# Alternative: Use in a Text DAT with onPulse
def process_video_to_text(video_top, grid_cols=80, charset='full', inverted=False):
    """
    Standalone function to convert video TOP to text.
    Call from a Text DAT or CHOP Execute.
    
    Example:
        result = process_video_to_text(op('moviefilein1'), grid_cols=100)
        op('text1').text = result
    """
    pixels = video_top.numpyArray(delayed=True)
    if pixels is None:
        return ''
    
    height, width = pixels.shape[:2]
    mapper = TamilCharMapper(charset, inverted)
    lines = mapper.process_frame(pixels, width, height, grid_cols)
    
    return '\n'.join(lines)


# MediaPipe integration example
def process_with_mediapipe(video_top, mediapipe_chop, grid_cols=80):
    """
    Use MediaPipe pose/hand landmarks to modify the character output.
    
    Args:
        video_top: Video input TOP
        mediapipe_chop: MediaPipe CHOP with landmark data
        grid_cols: Number of character columns
    """
    # Get base character grid
    text = process_video_to_text(video_top, grid_cols)
    
    # Get MediaPipe landmarks (example: hand position affects grid density)
    if mediapipe_chop.numSamples > 0:
        # Example: Use hand position to create local effects
        # Landmark indices depend on your MediaPipe setup
        pass
    
    return text
