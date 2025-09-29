
import { OWNER_NUM } from '../config.js'

import { OWNER_NAME} from '../config.js'


export async function owner(message, client) {

    const remoteJid = message.key.remoteJid;

    const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
            + 'VERSION:3.0\n' 
            + `FN: ${OWNER_NAME}\n` // full name
            + `ORG: ${OWNER_NAME};\n` // the organization of the contact
            + `TEL;type=CELL;type=VOICE;waid=${OWNER_NUM}:+${OWNER_NUM}\n` // WhatsApp ID + phone number
            + 'END:VCARD'

    await client.sendMessage(remoteJid,

        { 
            contacts: { 

                displayName: `_*${OWNER_NAME}*_`, 

                contacts: [{ vcard }] 
            }
        }
    );

}

export default owner;
