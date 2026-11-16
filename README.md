# Career e-portfolio

A static, single-page portfolio (HTML, CSS and vanilla JS), served by GitHub Pages.

## Structure
- `index.html`: all page content
- `css/style.css`: styles. The palette lives in CSS variables at the top.
- `js/main.js`: nav highlighting, reveal animations, project tabs, lightbox, resume viewer (PDF.js from cdnjs)
- `assets/img/`: project screenshots, design gallery (full size plus thumbnails), certificate previews
- `assets/docs/`: resume and certificate PDFs

## To fill in later
Search `index.html` for `TODO`: the three "View on GitHub" links use placeholder repository names.

## Preview locally
```bash
python -m http.server 8000
```
Then open http://localhost:8000. The resume viewer needs a server; it won't load from `file://`.
