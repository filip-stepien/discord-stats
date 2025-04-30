import { logger } from '@/logger';
import { prisma } from '@/prisma';
import { BotEventHandler } from '@/types';
import { Client } from 'discord.js';

async function connectToDatabase() {
    try {
        await prisma.$connect();
        logger.info('Connected to the database');
    } catch (e) {
        logger.fatal(`There was en error while connecting to the database:\n${e}`);
        process.exit(1);
    }
}

async function syncUsers(client: Client<true>) {
    for (const [_, guild] of client.guilds.cache) {
        try {
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
        } catch (e) {
            logger.error(
                `There was an error while fetching users from guild "${guild.name}":\n${e}`
            );
        }
    }
}

export const onceReady: BotEventHandler<'ready'> = async client => {
    await connectToDatabase();
    logger.info(`Bot logged as "${client.user.tag}"`);
    await syncUsers(client);
};
