import { proto } from "baileys"
import channelSender from './channelSender.js'

export async function settitle(message, client) {
  const remoteJid = message.key.remoteJid
  const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''

  const commandAndArgs = messageBody.slice(1).trim()
  const parts = commandAndArgs.split(/\s+/)
  const args = parts.slice(1)
  const title = args.join(' ') // ✅ join all words after the command

  if (!title) {
    return await client.sendMessage(remoteJid, { text: "Please provide a title." })
  }

  try {
    await client.relayMessage(
      remoteJid,
      {
        protocolMessage: {
          type: proto.Message.ProtocolMessage.Type.GROUP_MEMBER_LABEL_CHANGE,
          memberLabel: {
            label: title,
            labelTimestamp: Math.floor(Date.now() / 1000),
          }
        }
      },
      {}
    )

    await channelSender(message, client, "Group title changed successfully", 1)
  } catch (error) {
    console.error("Error changing group title:", error)
    await client.sendMessage(remoteJid, { text: `An error occurred while trying to modify the title: ${error.message}` })
  }
}

export default settitle
