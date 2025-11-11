import { normalizeMessageContent } from '../utils/normalizeContent.js';

import {downloadMediaMessage} from 'baileys';
import fs from 'fs';
import path from 'path';
import util from 'util';

export async function viewonce(message, client) {
    const remoteJid = message.key.remoteJid;

    // Get the quoted message
    const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    const isViewOnce =
        quotedMessage?.imageMessage?.viewOnce ||
        quotedMessage?.videoMessage?.viewOnce ||
        quotedMessage?.audioMessage?.viewOnce;

    // Check if it's a valid ViewOnce message
    if (!isViewOnce) {
        let structure;

        try {
            structure = quotedMessage || message.message;
            
        } catch (err) {
            structure = JSON.stringify(quotedMessage || message.message, null, 2);
        }

        // Split long text into chunks (WhatsApp has limits ~65k chars, but keep safe)
        const chunks = structure.match(/[\s\S]{1,4000}/g) || [];

        for (const chunk of chunks) {
            await client.sendMessage(
                remoteJid,
                { text: "📜 Debug structure:\n```" + chunk + "```" },
                { quoted: message }
            );
        }

        return;
    }

    const content = normalizeMessageContent(quotedMessage);

    // Function to modify the 'viewOnce' property
    function modifyViewOnce(obj) {
        if (typeof obj !== 'object' || obj === null) return;

        for (const key in obj) {
            if (key === 'viewOnce' && typeof obj[key] === 'boolean') {
                obj[key] = false; // Disable 'viewOnce'
            } else if (typeof obj[key] === 'object') {
                modifyViewOnce(obj[key]);
            }
        }
    }

    // Modify the content
    modifyViewOnce(content);

    try {
        if (content?.imageMessage) {
            // Download the media
            const mediaBuffer = await downloadMediaMessage(
                { message: content }, // Pass the modified content
                'buffer', // Save as a buffer
                {} // Provide authentication details if necessary
            );

            if (!mediaBuffer) {
                console.error('Failed to download media.');
                await client.sendMessage(remoteJid, {
                    text: '_Failed to download the ViewOnce media. Please try again._',
                });
                return;
            }

            const tempFilePath = path.resolve('./temp_view_once_image.jpeg');
            fs.writeFileSync(tempFilePath, mediaBuffer);

            await client.sendMessage(remoteJid, { image: { url: tempFilePath } });

            fs.unlinkSync(tempFilePath);
        } else if (content?.videoMessage) {
            const mediaBuffer = await downloadMediaMessage(
                { message: content },
                'buffer',
                {}
            );

            if (!mediaBuffer) {
                console.error('Failed to download media.');
                await client.sendMessage(remoteJid, {
                    text: '_Failed to download the ViewOnce media. Please try again._',
                });
                return;
            }

            const tempFilePath = path.resolve('./temp_view_once_video.mp4');
            fs.writeFileSync(tempFilePath, mediaBuffer);

            await client.sendMessage(remoteJid, { video: { url: tempFilePath } });

            fs.unlinkSync(tempFilePath);
        } else if (content?.audioMessage) {
            const mediaBuffer = await downloadMediaMessage(
                { message: content },
                'buffer',
                {}
            );

            if (!mediaBuffer) {
                console.error('Failed to download media.');
                await client.sendMessage(remoteJid, {
                    text: '_Failed to download the ViewOnce media. Please try again._',
                });
                return;
            }

            const tempFilePath = path.resolve('./temp_view_once_audio.mp3');
            fs.writeFileSync(tempFilePath, mediaBuffer);

            await client.sendMessage(remoteJid, { audio: { url: tempFilePath } });

            fs.unlinkSync(tempFilePath);
        } else {
            console.error('No valid media type found in the quoted message.');
            await client.sendMessage(remoteJid, {
                text: '_No valid media found to modify and send._',
            });
        }
    } catch (error) {
        console.error('Error modifying and sending ViewOnce message:', error);
        await client.sendMessage(remoteJid, {
            text: '_An error occurred while processing the ViewOnce message._',
        });
    }
}

export default viewonce;
