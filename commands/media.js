import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

import { downloadMediaMessage } from 'baileys';


export async function photo(message, client) {

    try {

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const target = quoted?.stickerMessage;

        if (!target) return await client.sendMessage(message.key.remoteJid, { text: "No sticker found." })

        const buffer = await downloadMediaMessage({ message: quoted, client }, "buffer");

        const filename = `./temp/sticker-${Date.now()}.png`

        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')

        fs.writeFileSync(filename, buffer)

        await client.sendMessage(message.key.remoteJid, { image: fs.readFileSync(filename), caption: "> Powered by Senku Tech" })

        fs.unlinkSync(filename)

    } catch (e) {

        console.log(e)

        await client.sendMessage(message.key.remoteJid, { text: "❌ Error converting sticker to image." })
    }
}

export async function tomp3(message, client) {

    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const target = quoted?.videoMessage;

        if (!target) return await client.sendMessage(message.key.remoteJid, { text: "No video found." })

        const buffer = await downloadMediaMessage({ message: quoted, client }, "buffer");

        const inputPath = `./temp/video-${Date.now()}.mp4`

        const outputPath = `./temp/audio-${Date.now()}.mp3`

        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')
            
        fs.writeFileSync(inputPath, buffer)

        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${inputPath} -vn -ab 128k -ar 44100 -y ${outputPath}`, (err) => {
                if (err) return reject(err)
                resolve()
            })
        })

        await client.sendMessage(message.key.remoteJid, { audio: fs.readFileSync(outputPath), mimetype: 'audio/mp4', ptt: false })

        fs.unlinkSync(inputPath)
        fs.unlinkSync(outputPath)

    } catch (e) {
        console.log(e)
        await client.sendMessage(message.key.remoteJid, { text: "❌ Error converting video to audio." })
    }
}

export default { photo, tomp3 }
