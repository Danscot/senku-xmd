export async function modifySudoList(message, client, list, action) {

    try {

        const remoteJid = message.key?.remoteJid;

        if (!remoteJid) throw new Error("Invalid remote JID.");

        const user = message.key?.participant || "";

        // Normalize command input
        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const commandAndArgs = messageBody.slice(1).trim(); // Remove prefix and trim

        const parts = commandAndArgs.split(/\s+/);

        const args = parts.slice(1); // Extract arguments

        let participant;

        // Handle reply to message
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {

            participant = (message.message?.extendedTextMessage?.contextInfo?.participant).split("@")[0] || (message.key.participant).split("@")[0];

        } else if (args.length > 0) {

            const jidMatch = args[0].match(/\d+/); // Extract numbers only

            if (!jidMatch) throw new Error("Invalid participant format.");

            participant = jidMatch[0];

        } else {

            throw new Error("No participant specified.");
        }

        if (action === "add") {

            if (!list.includes(participant)) {

                list.push(participant);

                await client.sendMessage(remoteJid, { text: `✅ _${participant} is now a sudo user_` });

            } else {

                await client.sendMessage(remoteJid, { text: `⚠️ _${participant} is already a sudo user_` });
            }

        } else if (action === "remove") {

            const index = list.indexOf(participant);

            if (index !== -1) {

                list.splice(index, 1);

                await client.sendMessage(remoteJid, { text: `🚫 _${participant} is no longer a sudo user_` });

            } else {

                await client.sendMessage(remoteJid, { text: `⚠️ _${participant} was not a sudo user_` });
            }
        }
    } catch (error) {

        console.error("Error in modifySudoList:", error);

        await client.sendMessage(message.key?.remoteJid || message.key.participant, { 

            text: `❌ Error: Unable to modify sudo users. ${error.message}` 

        });
    }
}

// Export individual functions
export async function sudo(message, client, list) {

    await modifySudoList(message, client, list, "add");
}

export async function delsudo(message, client, list) {
    
    await modifySudoList(message, client, list, "remove");

}

export async function getsudo(message, client, list) {
    const remoteJid = message.key.remoteJid;

    let msg = `Your sudo list is as follows:\n\n`;
    for (let i = 0; i < list.length; i++) {
        msg += `${i + 1}. ${list[i]}\n`;
    }

    await client.sendMessage(remoteJid, { text: msg });
}

export default { sudo, delsudo, getsudo };
