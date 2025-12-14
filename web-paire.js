
import startSession from './utils/connector.js'

import handleIncomingMessage from './events/messageHandler.js';

const number = process.env.NUMBER;

await startSession(number, handleIncomingMessage, false);

