import TelegramBot from 'node-telegram-bot-api';

import axios from 'axios';

import { TELEGRAM_BOT_TOKEN } from '../config.js';

import { messageHandler } from '../events/handler.js';

import reconnect from '../events/reconnection.js';

export let bot;

export async function startBot() {

  try {
    
    const response = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);

    const updates = response.data.result;

    const lastUpdate = updates.length > 0

      ? updates[updates.length - 1].update_id + 1

      : 0;

    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: { autoStart: false } });

    bot.startPolling({ offset: lastUpdate }); // 🔥 starts fresh

    reconnect();

    messageHandler(bot);

    console.log('🤖 Telegram bot is running...');

  } catch (error) {

    console.error('❌ Failed to start Telegram bot:', error);

   reconnect()
  

  }

}
