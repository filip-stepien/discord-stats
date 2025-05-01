import { ChannelType, DMChannel, NonThreadGuildBasedChannel } from 'discord.js';

export class ChannelHelper {
    static isSupportedChannelType(type: ChannelType) {
        return type === ChannelType.GuildText || type === ChannelType.GuildVoice;
    }

    static isGuildChannel(
        channel: DMChannel | NonThreadGuildBasedChannel
    ): channel is NonThreadGuildBasedChannel {
        return (channel as NonThreadGuildBasedChannel).name !== undefined;
    }

    static channelTypeToString(channelType: ChannelType.GuildText | ChannelType.GuildVoice) {
        return channelType === ChannelType.GuildVoice ? 'VOICE' : 'TEXT';
    }
}
