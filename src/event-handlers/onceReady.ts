import { logger } from '@/logger';
import { prisma } from '@/prisma';
import { BotEventHandler } from '@/types';
import { Client } from 'discord.js';

async function handler(client: Client<true>) {
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
}

export const onceReady: BotEventHandler<'ready'> = { mode: 'once', event: 'ready', handler };
