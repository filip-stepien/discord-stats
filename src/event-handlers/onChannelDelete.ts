import { ChannelHelper } from '@/helpers/ChannelHelper';
import { logger } from '@/logger';
import { prisma } from '@/prisma';
import { BotEventHandler } from '@/types';

export const onChannelDelete: BotEventHandler<'channelDelete'> = async channel => {
    if (!ChannelHelper.isGuildChannel(channel)) return;
    const { id, name, type } = channel;

    if (!ChannelHelper.isSupportedChannelType(type)) return;

    try {
        await prisma.channel.delete({
            where: { id }
        });

        logger.debug(`Detected deletion of channel "${name}" (id: ${id}) and removed its record`);
    } catch (e) {
        logger.warn(`Failed to delete channel "${channel.name}" (id: ${channel.id}):\n${e}`);
    }
};
