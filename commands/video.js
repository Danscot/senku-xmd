import axios from 'axios';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

export async function video(message, client) {
  const remoteJid = message.key.remoteJid;

  const messageBody = (
    message.message?.extendedTextMessage?.text ||
    message.message?.conversation ||
    ''
  ).toLowerCase();

  try {
    // Extract URL from the message
    const url = getArg(messageBody); // e.g. .video https://link

    console.log(url)

    if (!url || !url.startsWith('http')) {
      await client.sendMessage(remoteJid, {
        text: '❌ Please provide a valid video URL.',
        quoted: message
      });
      return;
    }

    console.log(`🎯 Extracted URL: ${url}`);

    await client.sendMessage(remoteJid, {
      text: `> _*Processing download for URL: ${url}*_`,
      quoted: message
    });

    // Call the video downloader API
    const response = await axios.post(
      'https://downloader-api-7mul.onrender.com/api/download',
      { url },
      { responseType: 'json' }
    );

    const downloadLink = response.data.filepath;
    const videoTitle = response.data.title || 'Video';
    const thumbnail = response.data.thumbnail;

    const fileName = `${uuidv4()}.mp4`;
    const filePath = path.resolve('./', fileName);

    console.log(`⬇️ Downloading video from: ${downloadLink}`);

    const videoResponse = await axios.get(downloadLink, { responseType: 'stream' });

    const writer = fs.createWriteStream(filePath);
    videoResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', (err) => {
        console.error("❌ Error writing file:", err);
        reject(new Error('Failed to save the video file.'));
      });
    });

    console.log(`✅ Video downloaded: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error("❌ File not found:", filePath);
      await client.sendMessage(remoteJid, { text: "❌ Failed to find the downloaded video file." });
      return;
    }

    await client.sendMessage(remoteJid, {
      image: { url: thumbnail },
      caption: `> 🎥 *${videoTitle}*\n\n> 🔗 ${url}\n\n> 📥 Download complete. Sending video...\n\n> Powered by Senku Tech`,
      quoted: message
    });

    await client.sendMessage(remoteJid, {
      video: { url: filePath },
      mimetype: 'video/mp4',
      ptt: false,
      quoted: message
    });

    fs.unlinkSync(filePath);
    console.log(`🧹 Deleted local file: ${filePath}`);

  } catch (err) {
    console.error('❌ Error in download command:', err);
    await client.sendMessage(remoteJid, {
      text: `❌ Failed to download: ${err.message}`,
      quoted: message
    });
  }
}

// Extracts second word from the message body (after the command)
function getArg(body) {

  const commandAndArgs = body.slice(1).trim(); // Remove prefix and trim

  const parts = commandAndArgs.split(/\s+/);

  const args = parts.slice(1); // Extract arguments

  return args[0];

}

export default video;
