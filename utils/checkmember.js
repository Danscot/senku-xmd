import { TELEGRAM_CHANNEL } from '../config.js'

import { TELEGRAM_GROUP } from '../config.js'


export async function isUserInChannel(bot, userId) {

  const CHANNEL_USERNAME = TELEGRAM_CHANNEL;

  const GROUP_USERNAME = TELEGRAM_GROUP;

  try {

    const c_member = await bot.getChatMember(CHANNEL_USERNAME, userId);

    const g_member = await bot.getChatMember(GROUP_USERNAME, userId);

    const validStatuses = ['member', 'administrator', 'creator'];

    const isInChannel = validStatuses.includes(c_member.status);

    const isInGroup = validStatuses.includes(g_member.status);

    return isInChannel && isInGroup;

  } catch (error) {

    console.error("Error checking membership:", error.message);

    return false;
  }
}
