import { Client, Events, GatewayIntentBits } from 'discord.js';
import { PrismaClient } from '@prisma-client';
import pino from 'pino';
import 'dotenv/config';

const logger = pino();
const prisma = new PrismaClient();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

client.once(Events.ClientReady, async client => {
    try {
        await prisma.$connect();
        logger.info('Connected to the database');
    } catch (e) {
        logger.error(`There was en error while connecting to the database:\n${e}`);
    }

    logger.info(`Bot logged as "${client.user.tag}"`);

    for (const [_, guild] of client.guilds.cache) {
        const members = await guild.members.fetch();
        const users = members.map(member => member.user).filter(user => !user.bot);

        for (const user of users) {
            const { id, username } = user;
            await prisma.user.upsert({
                where: { id },
                update: { username, avatarUrl: user.avatarURL() },
                create: { id, username }
            });
        }

        logger.info(`Synced users from guild "${guild.name}"`);
    }
});

client.login(process.env.TOKEN);
