import { logger } from '@/logger';
import { prisma } from '@/prisma';
import { BotEventHandler } from '@/types';
import { User, VoiceBasedChannel } from 'discord.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

function formatDuration(start: Date, end: Date) {
    const startTime = dayjs(start);
    const endTime = dayjs(end);
    const timespan = dayjs.duration(endTime.diff(startTime));
    return timespan.format('HH:mm:ss');
}

async function startVoiceSession(user: User, channel: VoiceBasedChannel) {
    const syncedUser = await prisma.user.findFirst({
        where: { id: user.id }
    });

    if (!syncedUser) {
        logger.debug(
            `User "${user.tag}" (id: ${user.id}) not found while trying to start new voice session.`
        );
        return;
    }

    await prisma.voiceSession.create({
        data: {
            userId: user.id,
            channelId: channel.id
        }
    });

    logger.debug(`Started new voice session for user "${user.tag}" (id: ${user.id})`);
}

async function endVoiceSession(user: User) {
    const syncedUser = await prisma.user.findFirst({
        where: { id: user.id },
        include: { voiceSessions: true }
    });

    if (!syncedUser) {
        logger.debug(
            `Session owner "${user.tag}" (id: ${user.id}) not found while trying to end voice session.`
        );
        return;
    }

    if (syncedUser.voiceSessions.length === 0) {
        logger.debug(
            `No active sessions found for user "${user.tag}" (id: ${user.id}) while trying to register voice session.`
        );
        return;
    }

    const sortedSessions = syncedUser.voiceSessions.sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    const recentSession = sortedSessions[0];
    recentSession.endTime = new Date();

    await prisma.voiceSession.update({
        where: { id: recentSession.id },
        data: { ...recentSession }
    });

    logger.debug(
        `Registered voice session for user "${syncedUser.username}" (id: ${user.id}): ` +
            formatDuration(recentSession.startTime, recentSession.endTime)
    );
}

export const onVoiceStateUpdate: BotEventHandler<'voiceStateUpdate'> = async (prev, curr) => {
    const user = prev.member?.user;
    if (!user || user.bot) return;

    const oldChannel = prev.channel;
    const newChannel = curr.channel;

    if (oldChannel === null && newChannel) {
        await startVoiceSession(user, newChannel);
    } else if (oldChannel && newChannel == null) {
        await endVoiceSession(user);
    }
};
