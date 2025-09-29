import axios from 'axios';

import { OWNER_NAME } from '../config.js'


const GOOGLE_API_KEY = "AIzaSyDo09jHOJqL6boMeac-xmPHB-yD9dKOKGU"; // Get the API key from the environment
const GOOGLE_CX = 'd1a5b18a0be544a0e'; // Your Custom Search Engine ID

async function searchImages(query) {
    try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                q: query, // Search query
                cx: GOOGLE_CX, // Custom Search Engine ID
                searchType: 'image', // Limit results to images
                key: GOOGLE_API_KEY // Your API key
            }
        });

        if (response.data.items && response.data.items.length > 0) {
            // Randomly select an image from the results
            const randomIndex = Math.floor(Math.random() * response.data.items.length);
            const imageUrl = response.data.items[randomIndex].link;
            return imageUrl;
        } else {
            return 'No image results found.';
        }
    } catch (error) {
        console.error('Error fetching from Google API:', error);
        return 'Error: Unable to retrieve image.';
    }
}

export default async function img(message, client) {
    const remoteJid = message.key?.remoteJid;

    if (!remoteJid) {
        throw new Error('Message JID is undefined.');
    }

    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
    const parts = messageBody.trim().split(/\s+/);
    const args = parts.slice(1); // Remove the ".img" command itself

    if (args.length === 0) {
        await client.sendMessage(remoteJid, {
            text: '> _No topic was specified. Please follow this example: .img Senku_'
        });
    } else {
        const query = args.join(' ');
        await client.sendMessage(remoteJid, {
            text: `> _Searching for images related to "${query}"..._`
        });

        const imageUrl = await searchImages(query);

        if (imageUrl.startsWith('http')) {
            // Send the image URL as an image message
            await client.sendMessage(remoteJid, { image: { url: imageUrl }, caption: `> Powered by ${OWNER_NAME} Tech` });
        } else {
            await client.sendMessage(remoteJid, {
                text: imageUrl
            });
        }
    }
}
