# CoverCraft

**CoverCraft** is a modern, responsive web application that generates professional school project cover pages from predefined templates.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## ✨ Features

- **4 Professional Templates**: Classic CBSE, Modern Minimal, Royal Academic, Gradient Accent
- **7 Pre-loaded Schools**: St. Thomas, DAV, KV, DPS, Ryan International, Army Public, La Martinière + Custom
- **Live Preview**: A4 preview updates instantly as you type
- **PDF Export**: High-quality PDF using html2canvas + jsPDF
- **Print Support**: Print directly from browser
- **Dark / Light Mode**: Toggle in header
- **Custom Logo Upload**: Upload your own school logo
- **12 Theme Colors + Custom Color Picker**: Per-school color theming
- **Auto Font Scaling**: Long names scale automatically to fit

## 🏗 Project Structure

```
src/
  components/
    CoverPreview.jsx   # All 4 template renderers + A4 paper
    FormPanel.jsx      # Left form panel with all inputs
    PreviewPanel.jsx   # Right panel with PDF/Print controls
  data/
    schools.json       # 8 school entries
    templates.json     # 4 template definitions
  App.jsx              # Root app with state, dark mode, toasts
  index.css            # Full design system

public/
  logos/               # SVG logos for each school (PNG extension)
```

## 📄 Adding Real School Logos

Replace the SVG placeholder files in `public/logos/` with actual PNG images:
- `st_thomas.png`
- `dav.png`
- `kv.png`
- `dps.png`
- `ryan.png`
- `aps.png`
- `lm.png`

## 🏫 Adding More Schools

Edit `src/data/schools.json`:

```json
{
  "id": "my_school",
  "name": "My School Full Name",
  "shortName": "My School",
  "logo": "/logos/my_school.png",
  "theme": "#1e3a8a",
  "address": "City, State"
}
```

## 🛠 Tech Stack

- React 19 + Vite 8
- Tailwind CSS v4
- jsPDF + html2canvas (PDF export)
- Google Fonts (Inter, Playfair Display, EB Garamond)
