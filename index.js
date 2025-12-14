
import connectToWhatsApp from './auth/authHandler.js';

import handleIncomingMessage from './events/messageHandler.js';

import reconnect from './events/reconnection.js'


(async () => {

    await connectToWhatsApp(handleIncomingMessage);

    //await reconnect()
    
})();

//237693037567