// checkJoin.js
import { isUserInChannel } from '../utils/checkmember.js';

import { TELEGRAM_CHANNEL } from '../config.js'

import { TELEGRAM_GROUP } from '../config.js'

export async function handleCheckJoin(bot, callbackQuery, msg) {

  const chatId = callbackQuery.message.chat.id;

  const messageId = callbackQuery.message.message_id;

  const userId = callbackQuery.from.id;

  const user = callbackQuery.from.first_name || "unknown";


  await bot.answerCallbackQuery(callbackQuery.id); // Acknowledge button press

  try {

    await bot.deleteMessage(chatId, messageId); // Delete the button message

  } catch (e) {

    console.warn("Couldn't delete message:", e.message);
  }

  const isMember = await isUserInChannel(bot, userId);

  if (isMember) {

      await bot.sendPhoto(chatId, 'menu.jpg', {

      caption:

`👋 *Welcome back, ${user}!*

You're all set. Use /menu to explore available options.`,

      parse_mode: 'Markdown'

    });

  } else {

    await bot.sendPhoto(chatId, 'menu.jpg', {

      caption:
`🚫 *You're not in the required groups yet!*

Please make sure you've joined both the channel and group:

👉 [Join Channel](${TELEGRAM_CHANNEL})
👉 [Join Group](${TELEGRAM_GROUP})

Then press the button again.`,

      parse_mode: 'Markdown',

      reply_markup: {

        inline_keyboard: [

          [{ text: "✅ I've Joined", callback_data: 'check_join' }]

        ]
      }
    });
  }
}

export default handleCheckJoin;
