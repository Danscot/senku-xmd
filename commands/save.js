import { normalizeMessageContent } from '../utils/normalizeContent.js';
import { downloadMediaMessage } from 'baileys';

import fs from 'fs';
import path from 'path';

export async function save(message, client) {

  const remoteJid = message.key.remoteJid;

  const bot = client.user.id.split(':')[0] + '@s.whatsapp.net';

  const contextInfo = message.message?.extendedTextMessage?.contextInfo;

  const quotedMessage = contextInfo?.quotedMessage;

  const quotedId = contextInfo?.stanzaId;
  
  const quotedJid = contextInfo?.participant || remoteJid;

  // Check if it's ViewOnce
  const isViewOnce =

    quotedMessage?.imageMessage?.viewOnce ||

    quotedMessage?.videoMessage?.viewOnce ||

    quotedMessage?.audioMessage?.viewOnce;

  // If NOT view once, just forward the quoted message
  if (!isViewOnce) {
    const forwardableMessage = {
      key: {
        remoteJid: quotedJid,
        fromMe: false,
        id: quotedId
      },
      message: quotedMessage
    };

    await client.sendMessage(bot, { forward: forwardableMessage });

    return;
  }

  const content = normalizeMessageContent(quotedMessage);

  // Disable ViewOnce
  function modifyViewOnce(obj) {

    if (typeof obj !== 'object' || obj === null) return;

    for (const key in obj) {

      if (key === 'viewOnce') obj[key] = false;

      else if (typeof obj[key] === 'object') modifyViewOnce(obj[key]);
    }
  }

  modifyViewOnce(content);

  try {
    let type = '';
    let filePath = '';
    let sendOptions = {};

    if (content?.imageMessage) {
      type = 'image';
      filePath = './temp_vo_image.jpg';
      sendOptions = { image: { url: filePath } };
    } else if (content?.videoMessage) {
      type = 'video';
      filePath = './temp_vo_video.mp4';
      sendOptions = { video: { url: filePath } };
    } else if (content?.audioMessage) {
      type = 'audio';
      filePath = './temp_vo_audio.mp3';
      sendOptions = { audio: { url: filePath } };
    } else {
      return await client.sendMessage(remoteJid, {
        text: '_No supported ViewOnce media found._'
      });
    }

    const buffer = await downloadMediaMessage({ message: content }, 'buffer', {});

    if (!buffer) {
      return await client.sendMessage(remoteJid, {
        text: '_Failed to download ViewOnce media._'
      });
    }

    fs.writeFileSync(filePath, buffer);
    await client.sendMessage(bot, sendOptions);
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Error:', err);
    await client.sendMessage(remoteJid, {
      text: '_An error occurred while processing the ViewOnce message._'
    });
  }
}

export default save;
