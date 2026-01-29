# WorldTimeBoy Chrome Extension

A Chrome Extension that displays multiple timezones in a WorldTimeBuddy-style interface.

## Features

- Multi-timezone time display with 24-hour time scale
- Search and add timezones
- Auto-detect user's local timezone
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
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── popup/          # Popup entry point
├── public/             # Static assets (manifest.json, icons)
└── dist/               # Build output (generated)
```

## Technologies

- React 18
- TypeScript
- Vite
- date-fns-tz
- Chrome Extension Manifest V3
