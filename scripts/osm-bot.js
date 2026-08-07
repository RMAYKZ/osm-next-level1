// OSM Next Level — Discord → syncOsmEvent bridge.
//
// Listens on DISCORD_CHANNEL_ID for new messages and forwards them to the
// syncOsmEvent Firebase Cloud Function, which upserts them into the
// `osmEvents` Firestore collection.
//
// Run with: npm run bot
// Needs a long-lived process (Discord gateway connection) — this will NOT
// work as a Vercel/Firebase serverless function. Run it on your own machine,
// a VPS, or a host like Railway/Fly.io that keeps a Node process alive.
//
// Discord Developer Portal → your bot → Bot → enable "MESSAGE CONTENT INTENT",
// otherwise message.content arrives empty for non-mention messages.

import "dotenv/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";

const { DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, API_SECRET_KEY } = process.env;

if (!DISCORD_BOT_TOKEN || !DISCORD_CHANNEL_ID || !API_SECRET_KEY) {
  console.error("[osm-bot] Missing DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID or API_SECRET_KEY in .env");
  process.exit(1);
}

const SYNC_ENDPOINT = "https://europe-west1-omerovvvvv.cloudfunctions.net/syncOsmEvent";
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

// Best-effort parse: OSM's monthly schedule message format isn't fixed, so this
// takes the embed/first line as the title and tries to spot a "1-2 Aug" style
// date range in the body. If no date pattern is found it falls back to the
// message's own timestamp. Tighten this once we have a real sample message.
function parseEventMessage(message) {
  const embed = message.embeds[0];
  const rawText = embed?.description || message.content || "";
  const title = (embed?.title || message.content.split("\n")[0] || "OSM Event").trim().slice(0, 120);
  const imageUrl = embed?.image?.url || message.attachments.first()?.url || "";

  const fallback = message.createdAt.toISOString().slice(0, 10);
  let startDate = fallback;
  let endDate = fallback;

  const dateMatch = rawText.match(/(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\s+([A-Za-z]{3,})/);
  if (dateMatch) {
    const monthIdx = MONTHS.indexOf(dateMatch[3].toLowerCase().slice(0, 3));
    if (monthIdx !== -1) {
      const year = message.createdAt.getUTCFullYear();
      const day1 = parseInt(dateMatch[1], 10);
      const day2 = dateMatch[2] ? parseInt(dateMatch[2], 10) : day1;
      startDate = new Date(Date.UTC(year, monthIdx, day1)).toISOString().slice(0, 10);
      endDate = new Date(Date.UTC(year, monthIdx, day2)).toISOString().slice(0, 10);
    }
  }

  return { title, description: rawText.trim(), imageUrl, startDate, endDate };
}

async function syncEvent(payload) {
  const res = await fetch(SYNC_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_SECRET_KEY },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error(`[osm-bot] sync failed (${res.status}):`, await res.text().catch(() => ""));
    return;
  }
  console.log("[osm-bot] synced:", payload.title, "→", await res.json().catch(() => ({})));
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Message, Partials.Channel],
});

client.once("clientReady", () => {
  console.log(`[osm-bot] logged in as ${client.user.tag}, watching channel ${DISCORD_CHANNEL_ID}`);
});

client.on("messageCreate", async (message) => {
  if (message.channelId !== DISCORD_CHANNEL_ID) return;
  if (message.author.bot) return;

  try {
    await syncEvent(parseEventMessage(message));
  } catch (err) {
    console.error("[osm-bot] error handling message:", err);
  }
});

client.login(DISCORD_BOT_TOKEN);
