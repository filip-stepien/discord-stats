import { Client, Events, GatewayIntentBits } from 'discord.js';
import * as eventHandlers from './event-handlers';
import 'dotenv/config';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

client.once(Events.ClientReady, eventHandlers.onceReady);

client.on(Events.VoiceStateUpdate, eventHandlers.onVoiceStateUpdate);

client.login(process.env.TOKEN);
