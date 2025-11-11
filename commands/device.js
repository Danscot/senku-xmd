import { getDevice } from 'baileys';


export async function device(message, client) {

    const remoteJid = message.key.remoteJid;

     try {
        // Execute the get device command

        const quotedMessageId = message.message.extendedTextMessage.contextInfo.stanzaId;

        const device = getDevice(quotedMessageId);

        await client.sendMessage(remoteJid, {text: `_The target is using an ${device} system_`})


    } catch (error) {

        await client.sendMessage(remoteJid, { text: `_Error: Unable to get device info. ${error.message}_`});
    }


}

export default device;
