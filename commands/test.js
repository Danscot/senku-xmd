import { proto } from "baileys"

export async function test(message, client) {
    const remoteJid = message.key.remoteJid

    await client.relayMessage(
        remoteJid,
        {
            protocolMessage: {
                type: proto.Message.ProtocolMessage.Type.GROUP_MEMBER_LABEL_CHANGE,
                memberLabel: {
                    label: "test",
                    labelTimestamp: Math.floor(Date.now() / 1000),
                },
            },
        },
        {}
    )
}

export default test
