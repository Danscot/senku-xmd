import connectToWhatsApp from './auth/authHandler.js';

import handleIncomingMessage from './events/messageHandler.js';

import reconnect from './events/reconnection.js';

import { startBot } from './events/bot.js';

import { MODE } from './config.js';

import isValidCode from './utils/validator.js';

if (MODE === "Default") {

  (async () => {

    await connectToWhatsApp(handleIncomingMessage);
    // await reconnect();
  })();

} else {

  const durationOrFalse = isValidCode(MODE);

  if (!durationOrFalse) {
    console.log(
      "❌ Sorry, you don't have permission to run your Telegram bot on Senku System.\nContact the creator @dev_senku"
    );
    process.exit(1);
  }

  console.log(`✅ Key valid! Bot can run for approximately ${Math.ceil(durationOrFalse / (1000 * 60 * 60 * 24))} days.`);
  
  startBot(durationOrFalse);
}
