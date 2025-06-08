async function test(message, client) {

  const remoteJid = message.key.remoteJid;

  await client.updateBlockStatus(remoteJid, "block");
}

export default test;
