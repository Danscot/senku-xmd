import { makeWASocket, useMultiFileAuthState, DisconnectReason } from 'baileys';
import configManager from '../utils/manageConfigs.js';

import fs from "fs";

import fsp from "fs/promises";

import sender from '../utils/sender.js';

import handleIncomingMessage from '../events/messageHandler.js';

import autoJoin from '../utils/autoJoin.js'

const SESSIONS_FILE = "./sessions.json";

const sessions = {};

function saveSessionNumber(number) {

    let sessionsList = [];

    if (fs.existsSync(SESSIONS_FILE)) {

        try {

            const data = JSON.parse(fs.readFileSync(SESSIONS_FILE));

            sessionsList = Array.isArray(data.sessions) ? data.sessions : [];

        } catch (err) {

            console.error("Error reading sessions file:", err);

            sessionsList = [];
        }
    }

    if (!sessionsList.includes(number)) {

        sessionsList.push(number);

        fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions: sessionsList }, null, 2));
    }
}

function removeSession(number) {

    console.log(`❌ Removing session data for ${number} due to failed pairing.`);

    if (fs.existsSync(SESSIONS_FILE)) {

        let sessionsList = [];

        try {
            const data = JSON.parse(fs.readFileSync(SESSIONS_FILE));

            sessionsList = Array.isArray(data.sessions) ? data.sessions : [];

        } catch (err) {

            console.error("Error reading sessions file:", err);

            sessionsList = [];
        }

        sessionsList = sessionsList.filter(num => num !== number);

        fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions: sessionsList }, null, 2));
    }

    const sessionPath = `./sessions/${number}`;

    if (fs.existsSync(sessionPath)) {

        fs.rmSync(sessionPath, { recursive: true, force: true });
    }


    delete sessions[number];

    console.log(`✅ Session for ${number} fully removed.`);
}

async function startSession(targetNumber, bot, msg) {

    try {            

            console.log("Starting session for:", targetNumber);

            sender(bot, msg, `Starting session for ${targetNumber}\nWait for your pairing code....`);

            const sessionPath = `./sessions/${targetNumber}`;

            if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

            const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

            const sock = makeWASocket({

                auth: state,

                printQRInTerminal: false,

                syncFullHistory: false,
                version: [2, 3000, 1027934701],

                markOnlineOnConnect: false

            });

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on('connection.update', async (update) => {

                const { connection, lastDisconnect } = update;

                if (connection === 'close') {

                    console.log("Session closed for:", targetNumber);

                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

                    if (shouldReconnect) {
                        
                        startSession(targetNumber, bot, msg);

                    } else {

                        console.log(`❌ User logged out, removing session for ${targetNumber}`);

                        removeSession(targetNumber);
                    }
                } else if (connection === 'open') {

                    console.log(`✅ Session open for ${targetNumber}`);
                    
                    
		    await autoJoin(sock, "120363418427132205@newsletter")
		        
		    
		    await autoJoin(sock, "120363372527138760@newsletter")

                    await sender(bot, msg, `✅ Session open for ${targetNumber}\nThanks for using our service\nHope you enjoy.`);

                }
            });


            setTimeout(async () => {

                if (!state.creds.registered) {

                    const code = await sock.requestPairingCode(targetNumber, "DEVSENKU");

                    sender(bot, msg, `Your pairing code is : ${code}\nConnect it to your WhatsApp to enjoy the bot.`);
                }
            }, 5000);

            setTimeout(async () => {

                if (!state.creds.registered) {

                    console.log(`❌ Pairing failed or expired for ${targetNumber}. Removing session.`);

                    sender(bot, msg, `❌ Pairing failed or expired for ${targetNumber}. You need to reconnect, wait 2 minutes.`);

                    removeSession(targetNumber);

                    return;
                }
            }, 60000);

            sock.ev.on('messages.upsert', async (msg) => handleIncomingMessage(msg, sock));

            sessions[targetNumber] = sock;

            saveSessionNumber(targetNumber);

            configManager.config.users[`${targetNumber}`] = {

                    sudoList: [],

                    tagAudioPath: "tag.mp3",

                    antilink: false,

                    response: true,

                    autoreact: false,

                    prefix: ".",

                    welcome: false,

                    record: false,

                    type: false, 

                    like: false, 

                    online: false,
                };

            configManager.save();

            return sock;

    } catch (err) {

        console.error("Error creating session :", err);

        return sender(bot, msg, `An error occured creating your sessions\n Invalid number\nUsage : /connect 237xxxxx.\n${err}`);
        
    }
}

export async function connect(bot, msg, match) {

    const chatId = msg.chat.id;

    const text = match?.[1]?.trim();

    if (!text) {

        return bot.sendMessage(chatId, "❌ Please provide a phone number.\nUsage: `/connect <number>`", { parse_mode: "Markdown" });
    }

    const targetNumber = text.replace(/\D/g, "");

    console.log("Sanitized number:", targetNumber);

    if (!targetNumber || targetNumber.length < 8) {

        return bot.sendMessage(chatId, "❌ Invalid number provided.", { parse_mode: "Markdown" });
    }

    if (sessions[targetNumber]) {

        return sender(bot, msg, `ℹ️ ${targetNumber} is already connected.`);
    }

    return startSession(targetNumber, bot, msg);

}

export default { connect };
