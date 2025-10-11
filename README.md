# Islamic Hub

A comprehensive Islamic web application featuring Quran reading, prayer times, hadith exploration, and AI-powered Islamic assistant.

## Features

### 📖 Quran Reader
- Complete Quran with Arabic text and English translation
- Accurate Mushaf page view (604 pages matching the standard Uthmanic script)
- Multiple reading modes: verse-by-verse, page view, and fullscreen mushaf mode
- Audio recitation with multiple reciters
- Advanced search functionality
- Reading statistics and bookmarks
- Tajweed highlighting
- Loop and repeat functionality

### 🕌 Prayer Times
- Accurate prayer times based on location
- Multiple calculation methods
- Automatic location detection
- Manual location search
- Prayer time notifications
- Qibla direction

### 📚 Hadith Explorer
- Browse authentic hadiths from major collections
- Search by keyword
- Filter by hadith collection
- Easy navigation

### 🤖 Islamic AI Assistant
- AI-powered Islamic knowledge assistant
- Get answers to Islamic questions
- Powered by Gemini AI

## Technology Stack

- **Frontend**: Pure HTML, CSS, and JavaScript (no frameworks)
- **Data Sources**: 
  - Quran API (AlQuran Cloud)
  - Prayer Times API
  - Hadith API
- **Audio**: Quranic recitations from multiple reciters

## Getting Started

1. Clone the repository
2. Open `quran.html` in your web browser to access the Quran reader
3. Or serve the files using any web server

No build process or dependencies required!

## File Structure

```
.
├── quran.html                              # Main Quran reader application
├── prayer-times.html                       # Prayer times calculator
├── hadith-explorer.html                    # Hadith browser
├── islamic-ai.html                         # AI assistant
├── quran.json                              # Complete Quran text data
├── quran-pages-with-translation.json       # Quran with translations
├── complete-mushaf-pages-verified.json     # Accurate mushaf page mapping
├── mushaf-pages.js                         # Mushaf page utilities
└── favicon.ico                             # Site icon
```

## Features in Detail

### Mushaf Page Accuracy
The application uses a verified mapping of all 604 pages of the standard Uthmanic Mushaf (Hafs narration), ensuring that:
- Each page displays the exact ayahs as they appear in printed mushaf copies
- Page breaks match traditional mushaf pagination
- Multi-surah pages are handled correctly

### Audio Features
- Multiple reciter options
- Playback speed control
- Volume control
- Verse-by-verse playback
- Loop and repeat modes
- Automatic page navigation during audio playback

### Reading Modes
1. **Verse View**: Read ayah by ayah with translation
2. **Page View**: Browse by mushaf page number
3. **Fullscreen Mushaf**: Immersive full-page reading experience

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## License

This project is open source and available for educational and non-commercial use.

## Credits

- Quran text and translations: [AlQuran Cloud API](https://alquran.cloud)
- Audio recitations: Various reciters via AlQuran Cloud
- Prayer time calculations: Aladhan API
- Hadith data: Hadith API

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

---

**Note**: This application requires an internet connection to load Quran data and audio files.
