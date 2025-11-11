
import { getCreds } from './credits.js'

const creds = await getCreds()

export const TELEGRAM_BOT_TOKEN = ''; // bot telegram token

export const REDIRECT_BOT = "" // a redirect bot when the bot is full

export const OWNER_ID = "7879830646" // owner id

export const LIMIT = 30; //number of max sessions for the tele bot

export const MODE = "Default"; // Your access key to run this bot

export const PUB = false; // Is it a private or public bot 

export const OWNER_NAME = creds.dev_name // Your Dev username

export const OWNER_NUM = creds.number // Your number

export const OWNER_TELEGRAM = creds.telegram_id; // Your telegram username

export const BOT_NAME = creds.bot_name // Bot name

export const TELEGRAM_CHANNEL = creds.telegram_channel // Your telegram channel name

export const TELEGRAM_GROUP = creds.telegram_group // Your telegram group name

export const WA_CHANNEL = creds.wa_channel //whatsapp channel


