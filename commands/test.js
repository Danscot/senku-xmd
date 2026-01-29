import fs from "fs"
import { prepareWAMessageMedia } from "baileys"

export async function test(message, client) {
    const from = message?.key?.remoteJid
    if (!from) return false

    const media = await prepareWAMessageMedia(
        {
            image: fs.readFileSync("./menu.jpg")
        },
        {
            upload: client.waUploadToServer
        }
    )

    await client.relayMessage(
        from,
        {
            groupStatusMessageV2: {
                message: {
                    imageMessage: {
                        ...media.imageMessage,
                        caption: "" // keep empty = safest
                    }
                }
            }
        },
        {}
    )

    return true
}

export default test
