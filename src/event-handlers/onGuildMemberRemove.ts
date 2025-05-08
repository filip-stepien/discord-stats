import { logger } from '@/logger';
import { prisma } from '@/prisma';
import { BotEventHandler } from '@/types';

export const onGuildMemberRemove: BotEventHandler<'guildMemberRemove'> = async member => {
    const user = member.user;
    const { id, username } = user;

    try {
        const foundUser = await prisma.user.findFirst({
            where: { id }
        });
        if (foundUser) return;

        await prisma.user.delete({ where: { id } });
        logger.debug(`Member "${username}" (id: ${id}) removal detected`);
    } catch (e) {
        logger.warn(`Failed to delete user "${username}" (id: ${id}):\n${e}`);
    }
};
