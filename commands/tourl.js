import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import pkg from 'baileys';
const { downloadMediaMessage } = pkg;
import { OWNER_NAME } from '../config.js'

import { v4 as uuidv4 } from 'uuid';

export async function tourl(message, client) {
  const remoteJid = message.key.remoteJid;
  const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  if (!quoted) {
    await client.sendMessage(remoteJid, {
      text: '❌ Please reply to an image, video, audio, or document to convert to URL.'
    });
    return;
  }

  const mimeType =
    quoted.imageMessage?.mimetype ||
    quoted.videoMessage?.mimetype ||
    quoted.audioMessage?.mimetype ||
    quoted.documentMessage?.mimetype;

  if (!mimeType) {
    await client.sendMessage(remoteJid, {
      text: '❌ Unsupported or missing media type.'
    });
    return;
  }

  try {
    // Download media buffer
    const mediaBuffer = await downloadMediaMessage(
      { message: quoted },
      'buffer',
      {},
      { reuploadRequest: client.reuploadRequest }
    );

    // Save to temp file
    const ext = mimeType.split('/')[1];
    const fileName = `${uuidv4()}.${ext}`;
    const filePath = path.join('./', fileName);
    fs.writeFileSync(filePath, mediaBuffer);

    // Upload to Catbox
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', fs.createReadStream(filePath));

    const upload = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    });

    // Cleanup
    fs.unlinkSync(filePath);

    // Send Catbox URL
    await client.sendMessage(remoteJid, {
      text: `✅ File changed successfully to an url:\n${upload.data}\n\n> Powered By ${OWNER_NAME} Tech`,
      quoted: message
    });

  } catch (err) {
    console.error('❌ Error in tourl:', err.message);
    await client.sendMessage(remoteJid, {
      text: '❌ Failed to convert media to URL.',
      quoted: message
    });
  }
}

export default tourl;