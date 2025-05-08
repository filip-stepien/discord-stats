import { logger } from '@/logger';
import { prisma } from '@/prisma';
import { BotEventHandler } from '@/types';
import { ChannelHelper } from '@/helpers/ChannelHelper';

export const onChannelUpdate: BotEventHandler<'channelUpdate'> = async (_, newChannel) => {
    if (!ChannelHelper.isGuildChannel(newChannel)) return;
    const { id, name, guildId, type } = newChannel;

    if (!ChannelHelper.isSupportedChannelType(type)) return;

    try {
        const foundChannel = await prisma.channel.findFirst({ where: { id } });

        if (!foundChannel) {
            logger.debug(
                `Attempted to update channel "${name}" (id: ${id}), but it does not exist. Proceeding to create it.`
            );

            await prisma.channel.create({
                data: { id, name, guildId, type: ChannelHelper.channelTypeToString(type) }
            });

            return;
        }

        if (foundChannel.name !== name) {
            logger.debug(
                `Detected channel "${foundChannel.name}" (id: ${id}) name change: "${foundChannel.name}" -> "${name}"`
            );

            await prisma.channel.update({
                where: { id },
                data: { id, name, type: ChannelHelper.channelTypeToString(type) }
            });
        }
    } catch (e) {
        logger.warn(`Failed to update channel "${newChannel.name}" (id: ${newChannel.id}):\n${e}`);
    }
};
