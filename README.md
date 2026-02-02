# WorldTimeBoy Chrome Extension

A lightweight Chrome Extension that displays multiple timezones in [WorldTimeBuddy.com](https://www.worldtimebuddy.com/) styled interface.

## Features

- Multi-timezone time display with 12/24-hour time scale
- Search and add timezones
- Time range selection with drag-to-select
- Real-time time updates

## Development

1. Install dependencies:
```bash
npm install
```

2. Build for development:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Loading the Extension

1. Build the extension: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` directory

## Project Structure

```
worldtimeboy/
├── src/
│   ├── components/     # React components
│   ├── data/           # Custom city-timezone data
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── popup/          # Popup entry point
├── public/             # Static assets (manifest.json, icons)
└── dist/               # Build output (generated)
└── screenshots/        # Screenshots
```

## Technologies

- React 18
- TypeScript
- Vite
- date-fns-tz
- Chrome Extension Manifest V3

## Version

1.1.0

## Credits

- Developed with AI assistance using Cursor
- Inspired by [WorldTimeBuddy](https://www.worldtimebuddy.com/)
- Extension icon from [Flaticon](https://www.flaticon.com/)
- UI icons (SVG) from [Lucide](https://lucide.dev/)