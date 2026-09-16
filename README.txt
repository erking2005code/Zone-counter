ZONE COUNTER PWA

This folder is a complete starter Progressive Web App.

Features:
- 4 entrances by default
- Add/remove entrances or directions
- Rename entrances
- "Someone passed" workflow
- Male/Female
- Age ranges: 0-10, 11-20, 21-30, 31-40, 41-50, 51-60, 60+
- Single or Group
- Group asks number of people
- Date and time recorded automatically
- Local device storage
- CSV export
- Offline caching through service worker

PWABuilder:
1. Host this folder on HTTPS (GitHub Pages, Netlify, Vercel, etc.).
2. Give PWABuilder the HTTPS URL.
3. Build/package it for Android.

Important:
PWABuilder expects a publicly reachable HTTPS PWA URL. You cannot normally give it only a local ZIP and expect the website audit/build flow to work.

Data:
Records are stored in the browser/device using localStorage. Export the CSV regularly if the data is important. Clearing browser/site data can remove locally stored records.
