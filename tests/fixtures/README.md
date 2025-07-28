# Test Fixtures

This directory contains test files used in Playwright tests.

## Files needed:

1. **test-image.jpg** - A sample image file for testing photo uploads
2. **test-video.mp4** - A sample video file for testing video uploads  
3. **test-document.txt** - A text file for testing invalid file type validation

## Creating test files:

You can create these files manually or use the following commands:

```bash
# Create a simple test image (requires ImageMagick)
convert -size 100x100 xc:red tests/fixtures/test-image.jpg

# Create a simple test video (requires FFmpeg)
ffmpeg -f lavfi -i testsrc=duration=1:size=320x240:rate=1 tests/fixtures/test-video.mp4

# Create a test text file
echo "This is a test document" > tests/fixtures/test-document.txt
```

## Note:

Make sure these files are small in size to keep the test suite fast and the repository lightweight.
