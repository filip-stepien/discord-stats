import { logger } from '@/logger';
import { prisma } from '@/prisma';
import { BotEventHandler } from '@/types';

export const onGuildMemberAdd: BotEventHandler<'guildMemberAdd'> = async member => {
    const user = member.user;
    const guild = member.guild;
    const { id, username } = user;

    try {
        const foundUser = await prisma.user.findFirst({ where: { id } });
        if (foundUser) return;

        await prisma.user.create({
            data: { id, username, guildId: guild.id, avatarUrl: user.avatarURL() }
        });

        logger.debug(`New user "${username}" (id: ${id}) detected`);
    } catch (e) {
        logger.warn(`Failed to register new user "${username}" (id: ${id}):\n${e}`);
    }
};
