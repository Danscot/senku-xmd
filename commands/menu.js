import { BOT_NAME } from '../config.js'

import { OWNER_NAME } from '../config.js'



export async function menu(bot, msg) {

	const chatId = msg.chat.id;

	const userId = msg.from.id;

    const today = new Date();

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const currentDay = daysOfWeek[today.getDay()];

    const currentDate = today.getDate();

    const currentMonth = today.getMonth() + 1; 

    const currentYear = today.getFullYear();

	const t = ` 
╭─────────────────╮
      ༒ ${BOT_NAME} ༒
╰─────────────────╯
╭─────────────────╮
│ Hello,  ${msg.from.first_name} 
│ Day : ${currentDay}
│ Date : ${currentDate}/${currentMonth}/${currentYear} 
│ Version : 1.6.0
│ Plugins : 6  
╰─────────────────╯

╭─[ ✧ BOT CMD ✧ ]──╮
│      
│ ⬢ /start    
│ ⬢ /menu          
│ ⬢ /connect 237xxxxx     
│ ⬢ /disconnect 237xxxxx   
╰─────────────────╯   



╭─[ ✧ OWNER CMD ✧ ]──╮
│      
│ ⬢ /addprem id   
│ ⬢ /delprem id            
╰─────────────────╯      

 Powered By ${OWNER_NAME}Tech 🥷🏾
 `

	await bot.sendPhoto(chatId, 'menu.jpg', {

      caption: t,

      parse_mode: 'Markdown'

    });


}


export default menu;
