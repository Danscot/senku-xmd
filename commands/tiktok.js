import axios from 'axios';

export async function tiktok(message, client) {
  const remoteJid = message.key.remoteJid;

  const messageBody = (
    message.message?.extendedTextMessage?.text ||
    message.message?.conversation ||
    ''
  ).toLowerCase();

  try {
    const url = getArg(messageBody);

    if (!url || !url.includes('tiktok.com')) {
      await client.sendMessage(remoteJid, {
        text: '❌ Please provide a valid TikTok URL.'
      });
      return;
    }

    console.log(`🎯 Fetching TikTok video from: ${url}`);

    await client.sendMessage(remoteJid, {
      text: `> _*Downloading TikTok video...*_`,
      quoted: message
    });

    // Call tiktokv4 API
    const apiUrl = `https://apis.davidcyriltech.my.id/download/tiktokv4?url=${url}`;
    const { data } = await axios.get(apiUrl);

    if (!data.success || !data.results?.no_watersmark) {
      throw new Error('❌ Failed to fetch video from API.');
    }

    const { thumbnail, no_watersmark, watersmark, audio } = data.results;

    // Send the no-watersmark video
    await client.sendMessage(remoteJid, {
      video: { url: no_watersmark },
      mimetype: 'video/mp4',
      caption: `> 🎵 TikTok Video Hope You Enjoy\n\n> Powered by Senku Tech`,
      quoted: message
    });

    console.log('✅ TikTok video sent.');

  } catch (err) {
    console.error('❌ Error in tiktok command:', err);
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
