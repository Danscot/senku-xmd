
import configManager from '../utils/manageConfigs.js'

export async function info(message, client) {

    const remoteJid = message.key.remoteJid;

    const today = new Date();

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const currentDay = daysOfWeek[today.getDay()];

    const currentDate = today.getDate();

    const currentMonth = today.getMonth() + 1; 

    const currentYear = today.getFullYear();

    const owner = "𓂀 𝕊𝕖𝕟𝕜𝕦𓂀";

    const number = client.user.id.split(':')[0];

    const username = message.pushName || "Unknown";

    const t = ` 
╭─────────────────╮
       ༒ 𝕊𝕖𝕟𝕜𝕦 ༒
╰─────────────────╯
╭─────────────────╮
│ Prefix : ${configManager.config.users[number].prefix}
│ Hello, ${username}  
│ Day : ${currentDay}
│ Date : ${currentDate}/${currentMonth}/${currentYear} 
│ Version : 5.2.1
│ Plugins : 64
│ Type : X-MD        
╰─────────────────╯


╭──[ ✨ MENUS ✨ ]─────╮
│
│ ⇛ menu
│ ⇛ prem-menu
│ ⇛ bug-menu
╰─────────────────╯

╭──[ 📃 UTILS 📃 ]──────╮
│ 
│ ⇛ ping
│ ⇛ getid
│ ⇛ sudo
│ ⇛ tourl
│ ⇛ owner    
│ ⇛ fancy   
│ ⇛ update
│ ⇛ device 
│ ⇛ delsudo
│ ⇛ getsudo    
╰─────────────────╯

╭──[ 🔎 CONFIG 🔎 ]─────╮
│
│ ⇛ online
│ ⇛ welcome
│ ⇛ autotype
│ ⇛ autoreact
│ ⇛ setprefix
│ ⇛ getconfig
│ ⇛ statuslike
│ ⇛ autorecord        
╰─────────────────╯

╭──[ ✘ GROUP ✘ ]─────╮
│
│ ⇛ bye
│ ⇛ kick
│ ⇛ purge        
│ ⇛ mute
│ ⇛ unmute
│ ⇛ promote
│ ⇛ demote
│ ⇛ gclink      
│ ⇛ antilink
│ ⇛ kickall
│ ⇛ promoteall
│ ⇛ demoteall
╰─────────────────╯

╭──[ 💾 MEDIA 💾 ]─────╮
│
│ ⇛ vv 
│ ⇛ take  
│ ⇛ save 
│ ⇛ photo
│ ⇛ setpp
│ ⇛ getpp
│ ⇛ toaudio
│ ⇛ sticker
╰─────────────────╯


╭──[ 🔎 SEARCH 🔎 ]─────╮
│
│ ⇛ meme
│ ⇛ fact
│ ⇛ jokes
│ ⇛ quote 
│ ⇛ senku > question
│ ⇛ Wiki-en > topic
│ ⇛ Wiki-fr > topic       
╰─────────────────╯


╭──[ ♫ DOWNLOADER ♫ ]──╮
│ 
│ ⇛ img
│ ⇛ play
│ ⇛ tiktok
╰─────────────────╯

╭──[ 📣 TAGS 📣 ]──────╮
│
│ ⇛ tag
│ ⇛ tagadmin
│ ⇛ tagall
│ ⇛ settag  
│ ⇛ respons
╰─────────────────╯

> Powered By Senku Tech 🥷🏾
    `
;

    await client.sendMessage(remoteJid, {

        image: { url: "menu.jpg" },

        caption: t,

        quoted: message 


    });

    await client.sendMessage(remoteJid, {

            audio: { url: "menu.mp3" }, 

            mimetype: 'audio/mp4',

            ptt: true,

            quoted: message
        });
}   

export default info;
