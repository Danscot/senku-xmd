import axios from 'axios';
import { OWNER_NAME } from '../config.js';

const API_KEY = "AIzaSyDV11sdmCCdyyToNU-XRFMbKgAA4IEDOS0"; // YouTube Data API key
const FASTAPI_URL = "https://api.danscot.dev/api"; // Your new API

export async function play(message, client) {
  const remoteJid = message.key.remoteJid;
  const messageBody = (message.message?.extendedTextMessage?.text || message.message?.conversation || '')

  try {
    const title = getArg(messageBody);

    if (!title) {
      await client.sendMessage(remoteJid, { text: '❌ Please provide a video title.' });
      return;
    }

    console.log(`🎯 Searching YouTube (API): ${title}`);

    await client.sendMessage(remoteJid, {
      text: `> _*Searching and processing: ${title}*_`,
      quoted: message,
    });

    // Step 1: Search YouTube via Data API v3
    const searchUrl = `https://www.googleapis.com/youtube/v3/search`;
    const { data: searchData } = await axios.get(searchUrl, {
      params: {
        part: "snippet",
        q: title,
        type: "video",
        maxResults: 1,
        key: API_KEY,
      },
    });

    if (!searchData.items || searchData.items.length === 0) {
      throw new Error("No video found.");
    }

    const video = searchData.items[0];
    const videoId = video.id.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const videoTitle = video.snippet.title;
    const thumbnail = video.snippet.thumbnails.high.url;

    console.log(`🎯 Found video: ${videoTitle} (${videoUrl})`);

    // Step 2: Call new FastAPI downloader
    const apiUrl = `${FASTAPI_URL}/youtube/downl/?url=${encodeURIComponent(videoUrl)}&fmt="mp3"`;
    const { data } = await axios.get(apiUrl);

    if (data.status !== 'ok' || !data.results?.download_url) {
      throw new Error('❌ Failed to get audio from API.');
    }

    const downloadUrl = data.results.download_url;

    // Step 3: Send thumbnail + info
    await client.sendMessage(remoteJid, {
      image: { url: thumbnail },
      caption: `> 🎵 *${videoTitle}*\n\n> 🔗 ${videoUrl}\n\n> 📥 Downloading audio...\n\n> Powered By ${OWNER_NAME} Tech`,
      quoted: message,
    });

    // Step 4: Send audio directly via URL
    await client.sendMessage(remoteJid, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${videoTitle}.mp3`,
      ptt: false,
      quoted: message,
    });

    console.log(`✅ Audio sent: ${videoTitle}.mp3`);

  } catch (err) {
    console.error('❌ Error in play command:', err);
    await client.sendMessage(remoteJid, { text: `❌ Failed to play: ${err.message}` });
  }
}

// Extract video title from the user's message
function getArg(body) {
  const parts = body.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(' ') : null;
}

export default play;
