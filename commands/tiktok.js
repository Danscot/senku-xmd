import axios from 'axios';

export async function tiktok(message, client) {
  const remoteJid = message.key.remoteJid;

  const messageBody = (
    message.message?.extendedTextMessage?.text ||
    message.message?.conversation ||
    ''
  );

  try {

    let url = getArg(messageBody);

    if (!url || !url.includes('tiktok.com')) {
      await client.sendMessage(remoteJid, {
        text: '❌ Please provide a valid TikTok URL.'
      });
      return;
    }

    console.log(`🎯 Processing TikTok URL: ${url}`);

    await client.sendMessage(remoteJid, {
      text: '> _*Downloading TikTok video...*_',
      quoted: message
    });

    // Call the API
    const apiUrl = `https://api.danscot.dev/api/tiktok/download?url=${encodeURIComponent(url)}`;

    const { data } = await axios.get(apiUrl);

    console.log(data)

    if (data.status !== 'ok' || !Array.isArray(data.results) || data.results.length === 0) {
      throw new Error('❌ No downloadable video found.');
    }

    // Pick best video: HD > MP4 > Watermark
    const videoResult =
      data.results.find(r => r.type === 'hd') ||
      data.results.find(r => r.type === 'mp4') ||
      data.results.find(r => r.type === 'watermark');

    if (!videoResult) {
      throw new Error('❌ No video available to download.');
    }

    console.log(`🎯 Sending video: ${videoResult.label}`);

    // Send video via WhatsApp
    await client.sendMessage(remoteJid, {
      video: { url: videoResult.url },
      mimetype: 'video/mp4',
      caption: `> 🎵 TikTok Video: ${videoResult.label}\n> Powered by Senku Tech`,
      quoted: message
    });

    console.log('✅ TikTok video sent.');

  } catch (err) {
    console.error('❌ Error in TikTok command:', err);
    await client.sendMessage(remoteJid, {
      text: `❌ Failed to download TikTok video: ${err.message}`
    });
  }
}

// Extract TikTok URL from user message
function getArg(body) {
  const parts = body.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(' ') : null;
}

export default tiktok;
