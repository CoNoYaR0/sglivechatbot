require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Retrieve environment variables
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const STAFF_CHANNEL_ID = process.env.STAFF_CHANNEL_ID;
const RELAY_URL = process.env.NETLIFY_RELAY_FUNCTION_URL;

// Event handler for when the bot is ready
client.once("ready", () => {
  console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
});

// Event handler for new messages
client.on("messageCreate", async (message) => {
  // Ignore messages from bots or from channels other than the staff channel
  if (message.author.bot || message.channel.id !== STAFF_CHANNEL_ID) return;

  // Check if the message starts with the "!reply" command
  if (message.content.startsWith("!reply ")) {
    // Parse the command arguments
    const [, userId, ...msgParts] = message.content.split(" ");
    const text = msgParts.join(" ");

    // Validate userId
    if (!userId || userId.includes(" ")) {
      return message.reply("❌ User ID cannot be empty or contain spaces.");
    }

    // Validate text
    if (!text) {
      return message.reply("❌ Message cannot be empty.");
    }

    try {
      // Send the message to the relay function
      await axios.post(RELAY_URL, {
        userId,
        message: text,
        sender: message.author.username,
        timestamp: Date.now()
      });
      // React to the original message to indicate success
      message.react("✅");
    } catch (err) {
      // Log the specific error from axios and a generic error message
      console.error("Error sending message via relay:", err.message);
      message.reply("⚠️ Erreur lors de l'envoi. Please check the logs for more details.");
    }
  }
});

// Log in to Discord with the bot token
client.login(TOKEN);
