import { Sticker, StickerTypes } from "wa-sticker-formatter";
import { downloadMediaMessage } from 'baileys';
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";

export async function sticker(message, client) {

    try {

        const remoteJid = message.key.remoteJid;

        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const username = message.pushName || "Unknown"; // Sender's name

        if (!quotedMessage) {
            
            return client.sendMessage(remoteJid, { text: "❌ Reply to an image or video to convert it into a sticker!" });
        }

        // Detect media type
        const isVideo = !!quotedMessage.videoMessage;
        const isImage = !!quotedMessage.imageMessage;

        if (!isVideo && !isImage) {
            return client.sendMessage(remoteJid, { text: "❌ The quoted message is not an image or video!" });
        }

        // Download media
        const mediaBuffer = await downloadMediaMessage({ message: quotedMessage, client }, "buffer");

        if (!mediaBuffer) {
            return client.sendMessage(remoteJid, { text: "❌ Failed to download media!" });
        }

        // Define temp file paths
        const tempInput = isVideo ? "./temp_video.mp4" : "./temp_image.jpg";
        const tempOutput = "./temp_sticker.webp";

        fs.writeFileSync(tempInput, mediaBuffer);

        if (isVideo) {
            console.log("⚙️ Processing video for sticker...");

            await new Promise((resolve, reject) => {
                ffmpeg(tempInput)
                    .output(tempOutput)
                    .outputOptions([
                        "-vf scale=512:512:flags=lanczos",
                        "-c:v libwebp",
                        "-q:v 50",
                        "-preset default",
                        "-loop 0",
                        "-an",
                        "-vsync 0"
                    ])
                    .on("end", resolve)
                    .on("error", reject)
                    .run();
            });

        } else {
            console.log("⚙️ Processing image for sticker...");

            await sharp(tempInput)
                .resize(512, 512, { fit: "inside" })
                .webp({ quality: 80 })
                .toFile(tempOutput);
        }

        // Create sticker
        const sticker = new Sticker(tempOutput, {
            pack: `${username}`,
            author: `${username}`,
            type: isVideo ? StickerTypes.FULL : StickerTypes.DEFAULT, // Preserve animations
            quality: 80,
            animated: isVideo,
        });

        // Convert to sticker format
        const stickerMessage = await sticker.toMessage();

        // Send sticker
        await client.sendMessage(remoteJid, stickerMessage);

        // Cleanup temp files
        fs.unlinkSync(tempInput);
        fs.unlinkSync(tempOutput);

    } catch (error) {
        console.error("❌ Error:", error);
        await client.sendMessage(message.key.remoteJid, { text: "⚠️ Error converting media to sticker." });
    }
}

export default sticker;
