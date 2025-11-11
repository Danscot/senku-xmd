import pkg from 'baileys';
const { makeWASocket, useMultiFileAuthState, DisconnectReason} = pkg;


async function connectToWhatsApp(handleMessage) {

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileyss');

    const sock = makeWASocket({ auth: state, printQRInTerminal: true, syncFullHistory: false });

    sock.ev.on('connection.update', (update) => {

        const { connection, lastDisconnect } = update;

        if (connection === 'close') {

            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) connectToWhatsApp(handleMessage);

        } else if (connection === 'open') {

            console.log('WhatsApp connection established.');
        }

    });

    sock.ev.on('messages.upsert', async (msg) => handleMessage(msg, sock));
    
    sock.ev.on('creds.update', saveCreds);

    return sock;
}

export default connectToWhatsApp;
