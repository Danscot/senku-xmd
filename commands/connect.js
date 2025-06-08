
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "bailey";

import configManager from '../utils/manageConfigs.js';

import fs from "fs";

import sender from '../commands/sender.js';

import handleIncomingMessage from '../events/messageHandler.js';

const SESSIONS_FILE = "./sessions.json";

const sessions = {};

function saveSessionNumber(number) {

    let sessionsList = [];

    if (fs.existsSync(SESSIONS_FILE)) {

        try {

            const data = JSON.parse(fs.readFileSync(SESSIONS_FILE));

            // Ensure sessionsList is an array
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

async function startSession(targetNumber, message, client) {

    console.log("Starting session for:", targetNumber);

    const sessionPath = `./sessions/${targetNumber}`;

    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const sock = makeWASocket({

        auth: state,

        printQRInTerminal: false,

        syncFullHistory: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {

        const { connection, lastDisconnect } = update;

        if (connection === 'close') {

            console.log("Session closed for:", targetNumber);

            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {

                console.log(`🔄 Reconnecting to ${targetNumber}...`);

                await startSession(targetNumber, message, client);

            } else {

                console.log(`❌ User logged out, removing session for ${targetNumber}`);

                removeSession(targetNumber);
            }
        } else if (connection === 'open') {

            console.log(`✅ Session open for ${targetNumber}`);
        }
    });


    setTimeout(async () => {

        if (!state.creds.registered) {

            const code = await sock.requestPairingCode(targetNumber);

            sender(message, client, `${code}`)
        }
    }, 5000);

    setTimeout(async () => {

        if (!state.creds.registered) {

            console.log(`❌ Pairing failed or expired for ${targetNumber}. Removing session.`);

            sender(message, client, `❌ Pairing failed or expired for ${targetNumber}. You need to reconnect wait 2 minutes.`);

            removeSession(targetNumber);
        }
    }, 60000);

    sock.ev.on('messages.upsert', async (msg) => handleIncomingMessage(msg, sock));

    sock.ev.on('creds.update', saveCreds);

    console.log(`✅ Session established for ${targetNumber}`);

    sessions[targetNumber] = sock;

    saveSessionNumber(targetNumber);  

    configManager.config.users[`${targetNumber}`] = {

        sudoList: [],

        tagAudioPath: "tag.mp3",

        antilink: false,

        response: true,

        autoreact: false,

        prefix: ".",

    };

    configManager.save();

    return sock;
}

async function reconnect(client) {

    if (!fs.existsSync(SESSIONS_FILE)) return;

    
    const data = JSON.parse(fs.readFileSync(SESSIONS_FILE));

    const sessionNumbers = Array.isArray(data.sessions) ? data.sessions : [];

    for (const number of sessionNumbers) {

        console.log(`🔄 Reconnecting session for: ${number}`);

        try {

            await startSession(number, null, client);

        } catch (error) {

            console.error(`❌ Failed to reconnect session for ${number}:`, error);

            removeSession(number);
        }
    }
}

async function connect(message, client) {

    let targetNumber;

    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {

        targetNumber = message.message.extendedTextMessage.contextInfo.participant;

    } else {

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const parts = messageBody.split(/\s+/);

        targetNumber = parts[1];
    }

    if (!targetNumber) {

        sender(message, client, "❌ Please provide a number or reply to a message to connect.");

        return;
    }

    targetNumber = targetNumber.replace('@s.whatsapp.net', '').trim();

    console.log("Checking connection for:", targetNumber);

    if (sessions[targetNumber]) {

        sender(message, client, "This number is already connected.");

    } else {

        await startSession(targetNumber, message, client);
    }
}

export default { connect, reconnect };
