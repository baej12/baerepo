Place your desired favicon source image here and generate the production icons.

Steps:

1. Save your source PNG into `public/favicon-source.png` (recommended: square, >= 512x512)
2. Install the generator dependencies:

```bash
npm install --save-dev sharp png-to-ico
```

3. Run the generator script:

```bash
npm run generate:favicon
```

This will create/overwrite:

- `public/favicon-16x16.png`
- `public/favicon-32x32.png`
- `public/favicon-48x48.png`
- `public/favicon.ico`
- `public/apple-touch-icon.png`
- `public/android-chrome-192x192.png`
- `public/android-chrome-512x512.png`

After running, refresh your dev server or rebuild the app so the new icons are picked up.

If you'd rather use ImageMagick instead of Node tools, run this locally:

```bash
convert public/favicon-source.png -resize 16x16 public/favicon-16x16.png
convert public/favicon-source.png -resize 32x32 public/favicon-32x32.png
convert public/favicon-source.png -resize 48x48 public/favicon-48x48.png
convert public/favicon-source.png -resize 180x180 public/apple-touch-icon.png
convert public/favicon-source.png -resize 192x192 public/android-chrome-192x192.png
convert public/favicon-source.png -resize 512x512 public/android-chrome-512x512.png
png2ico public/favicon.ico public/favicon-16x16.png public/favicon-32x32.png public/favicon-48x48.png
```

If you want, upload the image here and I can generate the icons for you.
