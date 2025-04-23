const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Validate image buffer signatures
function isValidImageBuffer(buffer) {
  const signatures = {
    jpeg: ['FF', 'D8'],
    png: ['89', '50', '4E', '47'],
    webp: ['52', '49', '46', '46']
  };

  const hex = buffer.toString('hex').toUpperCase();
  return Object.values(signatures).some(sig => hex.startsWith(sig.join('')));
}

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
      return cb(new Error('Only JPEG, PNG and WebP images are supported'), false);
    }
    cb(null, true);
  }
});

// Decode base64 JSON credentials
if (!process.env.GOOGLE_CREDENTIALS_BASE64) {
  console.error('Missing GOOGLE_CREDENTIALS_BASE64 in environment variables.');
  process.exit(1);
}

let credentials;
try {
  const decoded = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
  credentials = JSON.parse(decoded);
} catch (error) {
  console.error('Failed to parse Google credentials from base64:', error);
  process.exit(1);
}

const client = new vision.ImageAnnotatorClient({ credentials });

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Analyze image
app.post('/analyze', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    if (!req.file.buffer || req.file.buffer.length === 0) {
      throw new Error('Invalid image buffer');
    }

    if (!isValidImageBuffer(req.file.buffer)) {
      throw new Error('Invalid image format or corrupted file');
    }

    console.log(`Processing ${req.file.mimetype} image of size ${req.file.size} bytes`);

    const [result] = await client.labelDetection({
      image: { content: req.file.buffer }
    });

    if (!result.labelAnnotations || result.labelAnnotations.length === 0) {
      return res.json({ labels: [] });
    }

    const labels = result.labelAnnotations.map(l => l.description);
    res.json({ labels });
  } catch (err) {
    console.error('Error processing image:', err);
    res.status(500).json({ 
      error: 'Image processing failed',
      detail: 'Please ensure you are uploading a valid JPEG, PNG, or WebP image file.'
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: err.message,
    detail: 'An unexpected error occurred while processing your request.'
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));