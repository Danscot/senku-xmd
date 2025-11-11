import fs, { createWriteStream } from 'fs';
import path from 'path';

import ffmpeg from 'fluent-ffmpeg';
import configManager from '../utils/manageConfigs.js';

import { OWNER_NAME } from '../config.js'

import { downloadMediaMessage } from 'baileys';

// ======================= TAG FUNCTIONS =======================
export async function tagall(message, client) {
    const remoteJid = message.key.remoteJid;
    if (!remoteJid.includes('@g.us')) {
        await client.sendMessage(remoteJid, { text: '_⚠️ This command only works in group chats._' });
        return;
    }

    try {
        const groupMetadata = await client.groupMetadata(remoteJid);
        const participants = groupMetadata.participants.map(u => u.id);
        const mentionsText = participants.map(u => `➤ @${u.split('@')[0]}`).join('\n');

        const tagMessage = `
┏━━━━━━━━━━━━━━━━━━━┓
┃  📢 *Group Tag!* 📢  ┃
┗━━━━━━━━━━━━━━━━━━━┛

👥 *Group:* ${groupMetadata.subject}

${mentionsText}

💬 *Message by:* @${message.key.participant?.split('@')[0] || 'Someone'}

> Powered By ${OWNER_NAME} Tech 🥷🏾
        `.trim();

        await client.sendMessage(remoteJid, { text: tagMessage, mentions: participants });
    } catch (error) {
        console.error("❌ _Error mentioning all:_", error);
    }
}

export async function tagadmin(message, client) {
    const remoteJid = message.key.remoteJid;
    const botNumber = client.user.id.split(':')[0] + '@s.whatsapp.net';

    if (!remoteJid.includes('@g.us')) {
        await client.sendMessage(remoteJid, { text: '_This command only works in group chats._' });
        return;
    }

    try {
        const { participants } = await client.groupMetadata(remoteJid);
        const admins = participants.filter(p => p.admin && p.id !== botNumber).map(p => p.id);

        if (!admins.length) {
            await client.sendMessage(remoteJid, { text: "❌ No admins found in this group." });
            return;
        }

        const text = `👮‍♂️ *Admins tagged:* \n${admins.map(u => `@${u.split('@')[0]}`).join('\n')}`;
        await client.sendMessage(remoteJid, { text, mentions: admins });
    } catch (error) {
        console.error("❌ Error mentioning admins:", error);
        await client.sendMessage(remoteJid, { text: "❌ Error while tagging admins!" });
    }
}

// ======================= TAG AUDIO =======================
async function convertToPTT(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .audioCodec("libopus")
            .format("ogg")
            .audioBitrate("48k")
            .audioChannels(1)
            .save(outputPath)
            .on("end", () => resolve(outputPath))
            .on("error", reject);
    });
}

export async function respond(message, client, lid) {
    const number = client.user.id.split(":")[0];
    const remoteJid = message.key.remoteJid;
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || "";

    if (!configManager.config?.users[number]) return;
    const tagRespond = configManager.config.users[number]?.response;
    if (!message.key.fromMe && tagRespond && (messageBody.includes(`@${number}`) || messageBody.includes("@" + lid[0].split("@")[0]))) {
        console.log("yes");
        const inputAudio = configManager.config.users[number]?.tagAudioPath || "tag.mp3";
        const outputAudio = path.join("temp", `tag_${Date.now()}.ogg`);
        if (!fs.existsSync("temp")) fs.mkdirSync("temp");

        const convertedPath = await convertToPTT(inputAudio, outputAudio);
        await client.sendMessage(remoteJid, {
            audio: { url: convertedPath },
            mimetype: "audio/ogg; codecs=opus",
            ptt: false,
            contextInfo: { stanzaId: message.key.id, participant: message.key.participant || remoteJid, quotedMessage: message.message },
        });
        fs.unlinkSync(convertedPath);
    }
}

export async function settag(message, client) {
    const number = client.user.id.split(':')[0];
    const remoteJid = message.key.remoteJid;
    try {
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage || !quotedMessage.audioMessage) {
            await client.sendMessage(remoteJid, { text: "❌ Reply to an audio" });
            return;
        }

        const audio = await downloadMediaMessage({ message: quotedMessage }, "stream");
        const filePath = `${number}.mp3`;
        const writeStream = createWriteStream(filePath);
        audio.pipe(writeStream);

        configManager.config.users[number] = configManager.config.users[number] || {};
        configManager.config.users[number].tagAudioPath = filePath;
        configManager.save();

        await client.sendMessage(remoteJid, { text: "_Audio tag has been updated successfully_" });
    } catch (error) {
        console.error("_Error changing the tag audio:_", error);
    }
}

// ======================= TAG OPTION =======================
export async function tagoption(message, client) {
    const number = client.user.id.split(':')[0];
    const remoteJid = message.key.remoteJid;
    const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    const args = messageBody.slice(1).trim().split(/\s+/).slice(1);

    if (!configManager.config?.users[number]) return;

    try {
        const option = args.join(' ').toLowerCase();
        if (option.includes("on")) {
            configManager.config.users[number].response = true;
            configManager.save();
            await client.sendMessage(remoteJid, { text: "_*Your tag response is enabled*_" });
        } else if (option.includes("off")) {
            configManager.config.users[number].response = false;
            configManager.save();
            await client.sendMessage(remoteJid, { text: "_*Your tag response is disabled*_" });
        } else {
            await client.sendMessage(remoteJid, { text: "_*Select an option: On/off*_" });
        }
    } catch (error) {
        console.error("_Error changing the tag option:_", error);
    }
}

// ======================= TAG MESSAGE =======================
export async function tag(message, client) {
    const remoteJid = message.key.remoteJid;
    if (!remoteJid.includes('@g.us')) {
        await client.sendMessage(remoteJid, { text: '_This command only works in group chats._' });
        return;
    }

    try {
        const groupMetadata = await client.groupMetadata(remoteJid);
        const participants = groupMetadata.participants.map(u => u.id);
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (quotedMessage) {
            const quotedText = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text || "";
            const sticker = quotedMessage.stickerMessage;
            if (sticker) await client.sendMessage(remoteJid, { sticker, mentions: participants });
            else await client.sendMessage(remoteJid, { text: quotedText, mentions: participants });
            return;
        }

        const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const text = messageBody.slice(1).trim().split(/\s+/).slice(1).join(' ') || '@everyone';
        await client.sendMessage(remoteJid, { text, mentions: participants });
    } catch (error) {
        console.error("_Error mentioning all:_", error);
    }
}

export default { tagall, tagadmin, tagoption, settag, respond, tag };
