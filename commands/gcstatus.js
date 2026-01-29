import { prepareWAMessageMedia, downloadContentFromMessage } from "baileys"

export async function gcstatus(message, client) {
    const from = message?.key?.remoteJid
    if (!from) return false

    const ctx = message?.message?.extendedTextMessage?.contextInfo
    const quoted = ctx?.quotedMessage
    if (!quoted) return false

    let statusPayload = null

    /* ---------- TEXT ---------- */
    if (quoted.conversation || quoted.extendedTextMessage?.text) {
        const text =
            quoted.conversation ||
            quoted.extendedTextMessage.text

        statusPayload = {
            groupStatusMessageV2: {
                message: {
                    extendedTextMessage: { text }
                }
            }
        }
    }

    /* ---------- IMAGE ---------- */
    else if (quoted.imageMessage) {
        const stream = await downloadContentFromMessage(
            quoted.imageMessage,
            "image"
        )

        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        const media = await prepareWAMessageMedia(
            { image: buffer },
            { upload: client.waUploadToServer }
        )

        statusPayload = {
            groupStatusMessageV2: {
                message: {
                    imageMessage: {
                        ...media.imageMessage,
                        caption: quoted.imageMessage.caption || ""
                    }
                }
            }
        }
    }

    /* ---------- VIDEO ---------- */
    else if (quoted.videoMessage) {
        const stream = await downloadContentFromMessage(
            quoted.videoMessage,
            "video"
        )

        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        const media = await prepareWAMessageMedia(
            { video: buffer },
            { upload: client.waUploadToServer }
        )

        statusPayload = {
            groupStatusMessageV2: {
                message: {
                    videoMessage: {
                        ...media.videoMessage,
                        caption: quoted.videoMessage.caption || ""
                    }
                }
            }
        }
    }

    if (!statusPayload) return false

    await client.relayMessage(from, statusPayload, {})
    return true
}

export default gcstatus
