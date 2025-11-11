import{ isJidGroup, getContentType } from 'baileys';

import configManager from '../utils/manageConfigs.js';

import channelSender from '../commands/channelSender.js'

export async function handleGroupAction(message, client, action) {

    const remoteJid = message.key.remoteJid;

    try {

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const commandAndArgs = messageBody.slice(1).trim(); // Remove prefix and trim

        const parts = commandAndArgs.split(/\s+/);

        const args = parts.slice(1);

        const user = message.key.participant;

        console.log(args)

        let participant;

        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {

            participant = message.message.extendedTextMessage.contextInfo.participant;

        } else if (args.length > 0) {

            if (user.includes("@lid")) {

                participant = args[0].replace('@', '') + '@lid';

            } else {

                participant = args[0].replace('@', '') + '@s.whatsapp.net';

            }

            console.log(participant);

        } else {

            throw new Error('No participant specified.');
        }
        
        const num = `@${participant.replace('@s.whatsapp.net', '')}`;

        await client.groupParticipantsUpdate(remoteJid, [participant], action);
        
        const actionMessages = {

            remove: `${num} has been removed.`,

            promote: `_${num} has been promoted to admin._`,

            demote: `_${num} has been removed as an admin._`
        };

        await client.sendMessage(remoteJid, { text: actionMessages[action] });

    } catch (error) {

        await client.sendMessage(remoteJid, { text: `_Error: Unable to perform action. ${error.message}_` });
    }
}

export async function kick(message, client) {

    await handleGroupAction(message, client, 'remove');
}

export async function promote(message, client) {

    await handleGroupAction(message, client, 'promote');
}

export async function demote(message, client) {

    await handleGroupAction(message, client, 'demote');
}

export async function kickall(message, client) {

    const remoteJid = message.key.remoteJid;

    try {

        const groupMetadata = await client.groupMetadata(remoteJid);

        const participants = groupMetadata.participants;

        for (const participant of participants) {

            if (!participant.admin) {

                try {

                    await client.groupParticipantsUpdate(remoteJid, [participant.id], 'remove');

                } catch (err) {

                    console.log(err)

                    //await client.sendMessage(remoteJid, { text: `_Failed to remove: @${participant.id.split('@')[0]} - ${err.message}_`, mentions: [participant.id] });
                }
            }
        }
        
        await client.sendMessage(remoteJid, { text: '_Group cleanup completed._' });

    } catch (error) {

        await client.sendMessage(remoteJid, { text: `_Error: Unable to process removal. ${error.message}_` });
    }
}

export async function purge(message, client) {

    const remoteJid = message.key.remoteJid;

    try {

        const groupMetadata = await client.groupMetadata(remoteJid);

        const nonAdmins = groupMetadata.participants.filter(p => !p.admin).map(p => p.id);

        if (nonAdmins.length === 0) {

            await client.sendMessage(remoteJid, { text: 'No non-admin members to remove.' });

            return;
        }

        await client.groupParticipantsUpdate(remoteJid, nonAdmins, 'remove');

        await client.sendMessage(remoteJid, { text: '_This group has been purified._' });

    } catch (error) {

         console.log(err)

        //await client.sendMessage(remoteJid, { text: `_Error: Unable to remove participants. ${error.message}_` });
    }
}

export async function bye(message, client) {

    const remoteJid = message.key.remoteJid;

    try {

        await client.sendMessage(remoteJid, { text: '_Goodbye!_' });

        await client.groupLeave(remoteJid);

    } catch (error) {

        await client.sendMessage(remoteJid, { text: `_Error: Unable to leave the group. ${error.message}_` });
    }
}


export async function pall(message, client) {

    const remoteJid = message.key.remoteJid;

    try {

        const groupMetadata = await client.groupMetadata(remoteJid);

        const nonAdmins = groupMetadata.participants.filter(p => !p.admin).map(p => p.id);

        await client.groupParticipantsUpdate(remoteJid, nonAdmins, 'promote');

    } catch (error) {

        await client.sendMessage(remoteJid, { text: `_Error: Unable to promote participants. ${error.message}_` });
    }
}

// Placeholder for new functions (dall, mute, unmute, gclink, antilink, linkDetection)
export async function dall(message, client, userLid) {
    
    const remoteJid = message.key.remoteJid;

    try {

        const { participants } = await client.groupMetadata(remoteJid);

        const botNumber = client.user.id.split(':')[0] + '@s.whatsapp.net';

        const botId = userLid 
    ? userLid.split(':')[0] + "@lid" 
    : "";   

        console.log(botId)

        console.log(participants)

        const admins = participants.filter(p => p.admin && p.id !== botNumber && p.id !== botId).map(p => p.id);

        if (admins.length > 0) {

            await  client.groupParticipantsUpdate(remoteJid, admins, 'demote');

            await client.sendMessage(remoteJid, { text: '_I am taking control of this group for now._' });
        }
    } catch (error) {

        await client.sendMessage(remoteJid, { text: `_Error: ${error.message}_` });
    }
}
export async function mute(message, client) {

    const remoteJid = message.key.remoteJid;

    try {

        await client.groupSettingUpdate(remoteJid, 'announcement');

        await client.sendMessage(remoteJid, { text: 'The group has been muted.' });

    } catch (error) {

        await client.sendMessage(remoteJid, { text: `_Error: ${error.message}_` });
    }

}
export async function unmute(message, client) {

    const remoteJid = message.key.remoteJid;

    try {

        await client.groupSettingUpdate(remoteJid, 'not_announcement');

        await client.sendMessage(remoteJid, { text: 'The group has been unmuted.' });

    } catch (error) {
        
        await client.sendMessage(remoteJid, { text: `_Error: ${error.message}_` });
    }
}
export async function gclink(message, client) {
    
    const remoteJid = message.key.remoteJid;

    try {

        const code = await client.groupInviteCode(remoteJid);

        await client.sendMessage(remoteJid, {

        text: `https://chat.whatsapp.com/${code}`
    });

    }catch (error) {

        await client.sendMessage(remoteJid, { text: `_Error generating group link you are not admin: ${error.message}_` });
    }
}
export async function antilink(message, client) {

    const number = client.user.id.split(':')[0];

    const remoteJid = message.key.remoteJid;

    const senderJid = message.key.participant || message.key.remoteJid;

    const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || "";

    try {

        if(messageBody.toLowerCase().includes("on")){

            if (configManager.config && configManager.config.users[number]) {

                    configManager.config.users[number].antilink = true;
            }


            configManager.save()

            await client.sendMessage(remoteJid, {text:"_*Antilink enable*_"})

        } else if (messageBody.toLowerCase().includes("off")) {

            if (configManager.config && configManager.config.users[number]) {

                configManager.config.users[number].antilink = false
            }

            configManager.save()

            await client.sendMessage(remoteJid, {text:"*_Antilink disable_*"})

        } else if (messageBody.toLowerCase().includes("kick")) {

              if (configManager.config && configManager.config.users[number]) {

                configManager.config.users[number].antilink = true
            }


            configManager.save()
        }

        else{

            await client.sendMessage(remoteJid, {text:"*_Set an option On / Off*"})
        }

        
    } catch (error) {
        console.error("❌ Error while processing message:", error);
    }
}
async function linkDetection(message, client, lids = []) {

    const number = client.user.id.split(':')[0];

    const remoteJid = message.key.remoteJid;

    const senderJid = message.key.participant || remoteJid;

    const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || "";

    const detect = configManager.config?.users[number]?.antilink;

    const botId = number + "@s.whatsapp.net";

    // Ensure lids is an array
    const botLids = Array.isArray(lids) ? lids : [lids];

    if (!remoteJid.endsWith("@g.us")) return;
    
    // If feature is off, return
    if (!detect) return;

    try {

        const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-z0-9]+\.(com|net|org|info|biz|io|me|app|site|link|store|xyz|online)\b)/gi;

        if (!linkRegex.test(messageBody)) return;

        console.log(`🔗 Link detected: "${messageBody}"`);

        // Check if sender is admin
        const senderIsAdmin = await isAdmin(client, remoteJid, senderJid);

        // Check if bot or any linked instance is admin
        const mainBotIsAdmin = await isAdmin(client, remoteJid, botId);

        const linkedBotsAreAdmin = await Promise.all(botLids.map(lid => isAdmin(client, remoteJid, lid)));

        const atLeastOneLinkedBotAdmin = linkedBotsAreAdmin.includes(true);

        const botIsAdmin = mainBotIsAdmin || atLeastOneLinkedBotAdmin;

        // Check if sender is the bot or any of its linked IDs
        const senderIsBot = senderJid === botId || botLids.includes(senderJid);

        if (!botIsAdmin || senderIsAdmin || senderIsBot) {

            console.log("⚠️ Skip deletion: bot not admin, or sender is admin/bot");

            return;
        }

        // All checks passed: delete
        await client.sendMessage(remoteJid, { text: "*_🚫 Links are not allowed! Message deleted._*" });

        await client.sendMessage(remoteJid, { delete: message.key });

        if (configManager.config?.users[number]?.antilink == "kick") {

            console.log(senderJid)

            await client.groupParticipantsUpdate(remoteJid, [senderJid], "remove");
        } 

    } catch (error) {
        console.error("❌ Error while processing message:", error);
    }
}


// Function to check if a user is an admin in the group
async function isAdmin(client, groupJid, userJid) {

    try {

        const metadata = await client.groupMetadata(groupJid);

        const participants = metadata.participants;

        return participants.some(p => p.id === userJid && (p.admin === "admin" || p.admin === "superadmin"));

    } catch (error) {

        console.error("❌ Error fetching group metadata:", error);

        return false;
    }
}
export async function welcome(update, client) {

    const metadata = await client.groupMetadata(update.id);

    const number = client.user.id.split(':')[0];

    const state = configManager.config?.users[number]?.welcome;

    for (const participant of update.participants) {

        console.log(participant)

        if (!state) continue;

        try {

            const pp = await client.profilePictureUrl(participant, 'image')

                .catch(() => 'https://i.ibb.co/2nF8vNk/default.jpg');

            const name = (await client.onWhatsApp(participant.split("@")[0]))

                ?.at(0)?.notify || participant.split("@")[0];

            if (update.action === 'add') {
                const welcomeMsg = `
┏━━━━━━━━━━━━━━━┓
┃ 🎉 *Welcome!* 🎉 ┃
┗━━━━━━━━━━━━━━━┛

👤 @${participant.split('@')[0]}
📌 You’ve joined *${metadata.subject}*!

✨ Make yourself at home.
📚 Don’t forget to read the group rules.

⚡ *Powered by Senku Tech*
                `.trim();

                await client.sendMessage(update.id, {
                    image: { url: pp },
                    caption: welcomeMsg,
                    mentions: [participant]
                });
            }

            if (update.action === 'remove') {
                const byeMsg = `
┏━━━━━━━━━━━━━━━━┓
┃ 😢 *Goodbye!* 😢 ┃
┗━━━━━━━━━━━━━━━━┛

👤 @${participant.split('@')[0]}
📤 Left *${metadata.subject}*

🕊️ We’ll miss you...

⚡ *Powered by Senku Tech*
                `.trim();

                await client.sendMessage(update.id, {
                    image: { url: pp },
                    caption: byeMsg,
                    mentions: [participant]
                });
            }
        } catch (err) {
            console.error("❌ Error in welcome/goodbye:", err);
        }
    }
}


export function gcid(message, client) {

    const remoteJid = message.key.remoteJid;

    if (remoteJid.endsWith('@g.us')) {

        channelSender(message, client, `The group Id is : ${remoteJid}`, 5);

    } else {

        channelSender(message, client, `Sorry this is not a group.`, 3);
    }
}

export async function mentiondetect(message, client, lids = []){

    const remoteJid = message.key.remoteJid;

    const number = client.user.id.split(':')[0];

    const senderJid = message.key.participant || remoteJid;

    const botId = number + "@s.whatsapp.net";

    // Ensure lids is an array
    const botLids = Array.isArray(lids) ? lids : [lids];

    const state = configManager.config?.users[number]?.mention;

    const type = getContentType(message.message);

    console.log(type)

    if (type  === 'groupStatusMentionMessage') {

        console.log("mention detected");

        const senderIsAdmin = await isAdmin(client, remoteJid, senderJid);

        // Check if bot or any linked instance is admin
        const mainBotIsAdmin = await isAdmin(client, remoteJid, botId);

        const linkedBotsAreAdmin = await Promise.all(botLids.map(lid => isAdmin(client, remoteJid, lid)));

        const atLeastOneLinkedBotAdmin = linkedBotsAreAdmin.includes(true);

        const botIsAdmin = mainBotIsAdmin || atLeastOneLinkedBotAdmin;

        // Check if sender is the bot or any of its linked IDs
        const senderIsBot = senderJid === botId || botLids.includes(senderJid);

        if (!botIsAdmin || senderIsAdmin || senderIsBot) return;

        await client.sendMessage(remoteJid, { delete: message.key });


    } else{

        console.log("None")
    }
}




export default { kick, kickall, promote, demote, bye, pall, dall, mute, unmute, gclink, antilink, linkDetection, purge, welcome, gcid, mentiondetect};