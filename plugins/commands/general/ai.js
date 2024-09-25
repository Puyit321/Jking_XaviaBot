import axios from 'axios';

const config = {
    name: "ai",
    aliases: ["chatgpt"],
    description: "Ask a question to the GPT",
    usage: "[query]",
    cooldown: 3,
    permissions: [0, 1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "RN",
};

const previousResponses = new Map(); // Map to store previous responses for each user

async function onCall({ message, args }) {
    const id = message.senderID; // User ID
    if (!args.length) {
        message.reply("•| 𝙱𝙾𝙶𝙰𝚁𝚃 𝙰𝙸 𝙱𝙾𝚃 |•\n\nHello! How can I assist you today?\n\n•| 𝙾𝚆𝙽𝙴𝚁 : 𝙷𝙾𝙼𝙴𝚁 𝚁𝙴𝙱𝙰𝚃𝙸𝚂 |•");
        return;
    }

    let query = args.join(" ");
    const previousResponse = previousResponses.get(id); // Get the previous response for the user

    // If there's a previous response, handle it as a follow-up
    if (previousResponse) {
        query = `Follow-up on: "${previousResponse}"\nUser reply: "${query}"`;
    }

    try {
        const typ = global.api.sendTypingIndicator(message.threadID);

        // Send request to the API with the query
        const response = await axios.get(`https://deku-rest-api.gleeze.com/new/gpt-3_5-turbo?prompt=${encodeURIComponent(query)}`);

        typ();

        // Log the response to check its structure
        console.log("API response: ", response.data);

        // Extract the reply from the response
        if (response.data && response.data.result && response.data.result.reply) {
            const gptResponse = response.data.result.reply;
            await message.send(`•| 𝙱𝙾𝙶𝙰𝚁𝚃 𝙰𝙸 𝙱𝙾𝚃 |•\n\n${gptResponse}\n\n•| 𝙾𝚆𝙽𝙴𝚁 : 𝙷𝙾𝙼𝙴𝚁 𝚁𝙴𝙱𝙰𝚃𝙸𝚂 |•`);

            // Store the response for follow-up
            previousResponses.set(id, gptResponse);
        } else {
            await message.send("•| 𝙱𝙾𝙶𝙰𝚁𝚃 𝙰𝙸 𝙱𝙾𝚃 |•\n\nError: Unexpected response format from API.\n\n•| 𝙾𝚆𝙽𝙴𝚁 : 𝙷𝙾𝙼𝙴𝚁 𝚁𝙴𝙱𝙰𝚃𝙸𝚂 |•");
        }
    } catch (error) {
        // Log the error for debugging
        console.error("API call failed: ", error);
        message.react(`âŽ`);
    }
}

export default {
    config,
    onCall
};
