import { logger } from '@/logger';
import { prisma } from '@/prisma';
import { BotEventHandler } from '@/types';
import { ChannelType, Client, Guild, NonThreadGuildBasedChannel } from 'discord.js';

async function connectToDatabase() {
    try {
        logger.info('Attempting to connect to the database...');
        logger.debug(`Using database URL: ${process.env.DATABASE_URL}`);

        await prisma.$connect();

        logger.info('Successfully connected to the database');
    } catch (e) {
        logger.fatal('Failed to connect to the database:\n' + e);
        process.exit(1);
    }
}

async function syncGuildUsers(guild: Guild) {
    const members = await guild.members.fetch();
    const users = members.map(member => member.user).filter(user => !user.bot);

    for (const user of users) {
        const { id, username } = user;
        await prisma.user.upsert({
            where: { id },
            update: { username, avatarUrl: user.avatarURL() },
            create: { id, username, guildId: guild.id }
        });
    }

    logger.debug(`Synced members from guild "${guild.name}": ${users.length}`);
}

async function syncGuildChannels(guild: Guild) {
    const channels = await guild.channels.fetch();
    const textChannels = channels.filter(channel => channel?.type === ChannelType.GuildText);
    const voiceChannels = channels.filter(channel => channel?.type === ChannelType.GuildVoice);

    const syncChannel = async (channel: NonThreadGuildBasedChannel, type: 'TEXT' | 'VOICE') => {
        const { id, name } = channel;
        await prisma.channel.upsert({
            where: { id },
            update: { name },
            create: { id, name, type, guildId: guild.id }
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

async function syncGuild(guild: Guild) {
    const { id, name } = guild;
    await prisma.guild.upsert({
        where: { id },
        update: { name },
        create: { id, name }
    });

    logger.debug(`Synced guild "${name}"`);
}

async function syncGuilds(client: Client<true>) {
    for (const [_, guild] of client.guilds.cache) {
        try {
            await syncGuild(guild);
            await syncGuildUsers(guild);
            await syncGuildChannels(guild);
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
