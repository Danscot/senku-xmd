import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import axiosRetry from 'axios-retry';
import { OWNER_NAME } from '../config.js';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const API_KEY = "AIzaSyDV11sdmCCdyyToNU-XRFMbKgAA4IEDOS0"; // Load your API key

const FASTAPI_URL = "https://api.danscot.tech";

export async function play(message, client) {

  const remoteJid = message.key.remoteJid;

  const messageBody = (message.message?.extendedTextMessage?.text || message.message?.conversation || '').toLowerCase();

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

    // Step 2: Call your FastAPI downloader
    
    const apiUrl = `${FASTAPI_URL}/youtube/mp3?url=${videoUrl}`;
    
    const { data, headers } = await axios.get(apiUrl, {
    
      responseType: 'arraybuffer',
    
    });

    
    const fileName =
    
      headers['content-disposition']?.match(/filename="(.+)"/)?.[1] ||
    
      `${uuidv4()}.mp3`;

    const audioBuffer = Buffer.from(data); // Convert arraybuffer to Buffer

    // Step 3: Send thumbnail + info
    await client.sendMessage(remoteJid, {
    
      image: { url: thumbnail },
    
      caption: `> 🎵 *${videoTitle}*\n\n> 🔗 ${videoUrl}\n\n> 📥 Downloading audio...\n\n> Powered By ${OWNER_NAME} Tech`,
    
      quoted: message,
    
    });

    // Step 4: Send audio
    await client.sendMessage(remoteJid, {
    
      audio: audioBuffer,
    
      mimetype: 'audio/mpeg', // Correct MIME type for MP3
    
      fileName: fileName,
    
      ptt: false,
    
      quoted: message,
    
    });

    console.log(`✅ Audio sent: ${fileName}`);
  
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
