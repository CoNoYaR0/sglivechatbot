require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const STAFF_CHANNEL_ID = process.env.STAFF_CHANNEL_ID;
const RELAY_URL = process.env.NETLIFY_RELAY_FUNCTION_URL;

client.once("ready", () => {
  console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || message.channel.id !== STAFF_CHANNEL_ID) return;

  if (message.content.startsWith("!reply ")) {
    const [, userId, ...msgParts] = message.content.split(" ");
    const text = msgParts.join(" ");

    if (!userId || !text) return message.reply("❌ Format: `!reply <userId> <message>`");

    try {
      await axios.post(RELAY_URL, {
        userId,
        message: text,
        sender: message.author.username,
        timestamp: Date.now()
      });
      message.react("✅");
    } catch (err) {
      console.error(err);
      message.reply("⚠️ Erreur lors de l'envoi.");
    }
  }
});

client.login(TOKEN);
