import { BOT_NAME, OWNER_NAME } from '../config.js';
import fs from 'fs';
import path from 'path';

export async function menu(bot, msg) {
  const chatId = msg.chat.id;

  const today = new Date();
  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'
  ];
  const currentDay = daysOfWeek[today.getDay()];
  const currentDate = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // 🧩 Caption text (original layout)
  let caption = `
╭─────────────────╮
      ༒ ${BOT_NAME} ༒
╰─────────────────╯
╭─────────────────╮
│ Hello, ${msg.from.first_name}
│ Day : ${currentDay}
│ Date : ${currentDate}/${currentMonth}/${currentYear}
│ Version : 1.6.0
│ Plugins : 6
╰─────────────────╯

╭─[ ✧ BOT CMD ✧ ]──╮
│
│ ⬢ /start
│ ⬢ /menu
│ ⬢ /connect 237xxxxx
│ ⬢ /disconnect 237xxxxx
╰─────────────────╯

╭─[ ✧ OWNER CMD ✧ ]──╮
│
│ ⬢ /addprem id
│ ⬢ /delprem id
╰─────────────────╯

Powered By ${OWNER_NAME}Tech 🥷🏾
`;

  // 🧹 Escape MarkdownV2 special characters
  const escapeMarkdownV2 = (text) => {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
  };

  caption = escapeMarkdownV2(caption);

  const photoPath = path.resolve('./menu.jpg');
  if (!fs.existsSync(photoPath)) {
    await bot.sendMessage(chatId, '⚠️ The file *menu.jpg* was not found in the project folder.', { parse_mode: 'MarkdownV2' });
    return;
  }

  try {
    await bot.sendPhoto(chatId, fs.createReadStream(photoPath), {
      caption,
      parse_mode: 'MarkdownV2'
    });
  } catch (err) {
    console.error('❌ Error sending menu:', err.message);
    await bot.sendMessage(chatId, `❌ Failed to send menu.\nError: ${err.message}`, { parse_mode: 'MarkdownV2' });
  }
}

export default menu;
