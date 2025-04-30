import { logger } from '@/logger';
import { prisma } from '@/prisma';
import { BotEventHandler } from '@/types';
import { ChannelType, Client, Guild, NonThreadGuildBasedChannel } from 'discord.js';

async function connectToDatabase() {
    try {
        await prisma.$connect();
        logger.info('Connected to the database');
    } catch (e) {
        logger.fatal(`There was en error while connecting to the database:\n${e}`);
        process.exit(1);
    }
}

async function syncUsers(guild: Guild) {
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

    logger.debug(`Synced members from guild "${guild.name}": ${users.length}`);
}

async function syncChannels(guild: Guild) {
    const channels = await guild.channels.fetch();
    const textChannels = channels.filter(channel => channel?.type === ChannelType.GuildText);
    const voiceChannels = channels.filter(channel => channel?.type === ChannelType.GuildVoice);

    const syncChannel = async (channel: NonThreadGuildBasedChannel, type: 'TEXT' | 'VOICE') => {
        const { id, name } = channel;
        await prisma.channel.upsert({
            where: { id },
            update: { name },
            create: { id, name, type }
        });
    };

    for (const [_, channel] of textChannels) {
        await syncChannel(channel, 'TEXT');
    }

    for (const [_, channel] of voiceChannels) {
        await syncChannel(channel, 'VOICE');
    }

    logger.debug(
        `Synced channels from guild "${guild.name}":\n` +
            `- voice channels: ${voiceChannels.size}\n` +
            `- text channels: ${textChannels.size}`
    );
}

async function syncGuilds(client: Client<true>) {
    for (const [_, guild] of client.guilds.cache) {
        try {
            await syncUsers(guild);
            await syncChannels(guild);
        } catch (e) {
            logger.error(`There was an error while trying to sync guild "${guild.name}":\n${e}`);
        }
    }
}

export const onceReady: BotEventHandler<'ready'> = async client => {
    await connectToDatabase();
    logger.info(`Bot logged as "${client.user.tag}"`);
    await syncGuilds(client);
};
