import { Client, Events, GatewayIntentBits } from 'discord.js';
import * as eventHandlers from './event-handlers';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

client.once(Events.ClientReady, eventHandlers.onceReady);

client.on(Events.VoiceStateUpdate, eventHandlers.onVoiceStateUpdate);

client.on(Events.ChannelCreate, eventHandlers.onChannelCreate);

client.on(Events.ChannelUpdate, eventHandlers.onChannelUpdate);

client.on(Events.ChannelDelete, eventHandlers.onChannelDelete);

client.login(process.env.TOKEN);
