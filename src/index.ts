import { Client, GatewayIntentBits } from 'discord.js';
import * as eventHandlers from './event-handlers';
import 'dotenv/config';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

function registerEventHandlers(client: Client) {
    for (const { mode, event, handler } of Object.values(eventHandlers)) {
        if (mode === 'once') {
            client.once(event, handler);
        } else if (mode === 'on') {
            client.on(event, handler);
        }
    }
}

registerEventHandlers(client);
client.login(process.env.TOKEN);
