const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();
const PORT = process.env.PORT || 8080;

// Aktifkan CORS
app.use(cors());

// Serve file HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Endpoint API untuk mendapatkan info video
app.get('/get-video-info', async (req, res) => {
  try {
    const videoURL = req.query.url;
    if (!videoURL) {
      return res.status(400).json({ error: 'URL video diperlukan' });
    }

    const info = await ytdl.getInfo(videoURL);
    
    // Menyiapkan data untuk dikirim
    const videoData = {
      title: info.videoDetails.title,
      duration: formatDuration(info.videoDetails.lengthSeconds),
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      formats: info.formats
        .filter(format => format.hasVideo && format.hasAudio)
        .map(format => ({
          url: format.url,
          quality: format.qualityLabel || 'Unknown',
          mimeType: format.mimeType.split(';')[0]
        }))
    };

    res.json(videoData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function untuk format durasi
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
