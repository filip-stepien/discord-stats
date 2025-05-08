import { ChannelHelper } from '@/helpers/ChannelHelper';
import { logger } from '@/logger';
import { prisma } from '@/prisma';
import { BotEventHandler } from '@/types';

export const onChannelCreate: BotEventHandler<'channelCreate'> = async channel => {
    const { id, name, type, guildId } = channel;
    if (!ChannelHelper.isSupportedChannelType(type)) return;

    try {
        await prisma.channel.create({
            data: { id, name, guildId, type: ChannelHelper.channelTypeToString(type) }
        });

        logger.debug(`New channel "${name}" (id: ${id}) detected`);
    } catch (e) {
        logger.warn(`Failed to register new channel "${channel.name}" (id: ${channel.id}):\n${e}`);
    }
};
