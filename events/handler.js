import fs from 'fs';

import start from '../commands/start.js';

import menu from '../commands/menu.js';

import handleCheckJoin from '../utils/checkJoin.js';

import { isUserInChannel } from '../utils/checkmember.js';

import sessionCount from '../utils/sessionCount.js';

import redirect from '../utils/redirect.js';

import { OWNER_ID } from '../config.js';

import { LIMIT } from '../config.js';

import connect from '../utils/connect.js';

import disconnect from '../utils/disconnect.js';

import configManager from '../utils/manageConfigs.js';

import { getCreds } from '../credits.js';

import { PUB } from '../config.js';

function isPremium(userId) {

  const data = JSON.parse(fs.readFileSync('./prem.json', 'utf-8'));

  const ispub = PUB;

  const isprem = data.users.includes(userId.toString());

  const state = ispub || isprem;

  return  state;
}

function addPremium(userId) {

  const data = JSON.parse(fs.readFileSync('./prem.json', 'utf-8'));

  if (!data.users.includes(userId.toString())) {

    data.users.push(userId.toString());

    fs.writeFileSync('./prem.json', JSON.stringify(data, null, 2));
  }
}

function encode(id, dur){

  const expiry = Date.now() + dur * 24 * 60 * 60 * 1000;

  const raw = `${id}|${expiry}`;

  return Buffer.from(raw).toString("base64");
}

function removePremium(userId) {

  const data = JSON.parse(fs.readFileSync('./prem.json', 'utf-8'));

  data.users = data.users.filter(id => id !== userId.toString());

  fs.writeFileSync('./prem.json', JSON.stringify(data, null, 2));
}

export function messageHandler(bot) {

  bot.onText(/\/start/, async (msg) => {

    await start(bot, msg);

  });

  bot.onText(/\/myid/, async (msg) => {

    const id = msg.from.id;

    return bot.sendMessage(msg.chat.id, `Your telegram id is : ${id}`);

  });

  bot.onText(/\/menu/, async (msg) => {

    const userId = msg.from.id;

    const isMember = await isUserInChannel(bot, userId);

    if (!isMember) return await start(bot, msg);

    if (!isPremium(userId)) {

      return bot.sendMessage(msg.chat.id, "❌ You're not a premium user. Contact dev Senku.");
    }

    await menu(bot, msg);
  });

  bot.onText(/\/connect(?: (.+))?/, async (msg, match) => {

    const userId = msg.from.id;

    const isMember = await isUserInChannel(bot, userId);

    if (!isMember) return await start(bot, msg);

    if (!isPremium(userId)) {

      return bot.sendMessage(msg.chat.id, "❌ You're not a premium user. Contact dev Senku.");

    }

    const session = sessionCount();

    if (session >= LIMIT) {

      await redirect(bot, msg);

    } else {

      await connect.connect(bot, msg, match);

    }

  });

  bot.onText(/\/disconnect(?: (.+))?/, async (msg, match) => {

    const userId = msg.from.id;

    const isMember = await isUserInChannel(bot, userId);

    if (!isMember) return await start(bot, msg);

    if (!isPremium(userId)) {

      return bot.sendMessage(msg.chat.id, "❌ You're not a premium user. Contact dev Senku.");
    }

    const session = sessionCount();

    if (session >= LIMIT) {

      await redirect(bot, msg);

    } else {

      await disconnect(bot, msg, match);

    }

  });

  bot.on('callback_query', async (callbackQuery) => {

    if (callbackQuery.data === 'check_join') {

      await handleCheckJoin(bot, callbackQuery);

    }

  });

  bot.onText(/\/addprem(?: (.+))?/, async (msg, match) => {

    if (msg.from.id.toString() !== OWNER_ID) return bot.sendMessage(msg.chat.id, "❌ Skids lol.");

    const targetId = match[1];

    if (!targetId) return bot.sendMessage(msg.chat.id, "❌ Please provide a user ID.");

    addPremium(targetId);

    bot.sendMessage(msg.chat.id, `✅ User ${targetId} added to prem list successfully.`);

  });

  bot.onText(/\/delprem(?: (.+))?/, async (msg, match) => {

    if (msg.from.id.toString() !== OWNER_ID) return bot.sendMessage(msg.chat.id, "❌ Skids lol.");

    const targetId = match[1];

    if (!targetId) return bot.sendMessage(msg.chat.id, "❌ Please provide a user ID.");

    removePremium(targetId);

    bot.sendMessage(msg.chat.id, `✅ User ${targetId} removed from prem list successfully.`);

  });

bot.onText(/\/keygen(?: (.+))?/, async (msg, match) => {

  const creds = await getCreds();

  const su = creds.telegram_id

  if (msg.from.id.toString() !== su) return bot.sendMessage(msg.chat.id, "❌ Skids lol.");

  // match[1] contains "<duration> <userId>"
  if (!match[1]) {

    return bot.sendMessage(msg.chat.id, "❌ Usage: /keygen <duration_days> <userId>");

  }

  const args = match[1].trim().split(/\s+/); // split by spaces

  const dur = Number(args[0]);

  const id = args[1];

  if (!id || isNaN(dur)) {

    return bot.sendMessage(msg.chat.id, "❌ Usage: /keygen <duration_days> <userId>");
  }

  const code = encode(id, dur);

  bot.sendMessage(

    msg.chat.id,
    `✅ The code for user ${id} is:\n\`\`\`${code}\`\`\`\n\n🕒 It will last for ${dur} day(s).`,

    { parse_mode: "Markdown" }

  );

});


}
