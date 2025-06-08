
export async function getpp(message, client) {
  const remoteJid = message.key.remoteJid;
  const quoted = message.message?.extendedTextMessage?.contextInfo;
  let targetJid;

  // 1) If they mentioned someone: use the first mentioned JID
  const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (mentions && mentions.length) {
    targetJid = mentions[0];
  }
  // 2) Else if they replied to someone: use the participant of the quoted message
  else if (quoted?.quotedMessage) {

  	if (quotedMessage.participant.includes('@')) {

  		await client.sendMessage(remoteJid, '> Please specify the target phone number');

  		return;

  	} else {

	    targetJid = quoted.participant;
  	}

  }
  // 3) Else if they passed a number in the text: parse it
  else {
    const args = (message.message?.conversation || '').trim().split(/\s+/);
    if (args[1]) {
      // make sure it ends with @s.whatsapp.net
      targetJid = args[1].includes('@') ? args[1] : `${args[1]}@s.whatsapp.net`;
    }
  }
  // 4) Fallback: use the sender themselves
  if (!targetJid) {
    targetJid = message.key.fromMe
      ? client.user.id // your own JID
      : message.key.participant || message.key.remoteJid;
  }

  try {
    // This will throw if no profile picture is set
    const url = await client.profilePictureUrl(targetJid, 'image');

    await client.sendMessage(remoteJid, {
      image: { url },
      caption: `📸 Profile picture of *@${targetJid.split('@')[0]}*`,
    }, { quoted: message });

  } catch (err) {
    console.error('❌ Error fetching profile picture:', err);
    await client.sendMessage(remoteJid, {
      text: `❌ Could not fetch profile picture for *@${targetJid.split('@')[0]}*.`,
    }, { quoted: message });
  }
}

export default getpp;