import { Client, Events, GatewayIntentBits } from 'discord.js';
import { PrismaClient } from '@prisma-client';
import 'dotenv/config';

const prisma = new PrismaClient();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

client.once(Events.ClientReady, async readyClient => {
    console.log(`Hello ${readyClient.user.tag}!`);
});

client.on(Events.VoiceStateUpdate, oldState => {
    console.log(oldState.member?.displayName);
});

client.login(process.env.TOKEN);
