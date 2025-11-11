import { downloadMediaMessage } from 'baileys';

import sharp from 'sharp';

export async function pp(message, client) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const targetMsg = quoted?.imageMessage || message.message.imageMessage;

        if (!targetMsg) {
            return await client.sendMessage(message.key.remoteJid, {
                text: 'Reply or send an image with the command to set as profile picture.'
            });
        }

        // Download the image media
        const buffer = await downloadMediaMessage({ message: quoted, client }, "buffer");

        // Use sharp to process the image
        const imageBuffer = await sharp(buffer)
            .resize(256, 256) // Resize the image if needed
            .toFormat('png')  // Convert to PNG format
            .toBuffer();  // Get the final image buffer

        // Update the profile picture
        await client.updateProfilePicture(client.user.id, imageBuffer);

        await client.sendMessage(message.key.remoteJid, {
            text: '✅ Profile picture updated successfully!'
        });

    } catch (err) {
        console.log(err);

        await client.sendMessage(message.key.remoteJid, {
            text: '❌ Failed to update profile picture.'
        });
    }
}

export default pp;
