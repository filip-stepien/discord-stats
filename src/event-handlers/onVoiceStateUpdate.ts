import { BotEventHandler } from '@/types';

export const onVoiceStateUpdate: BotEventHandler<'voiceStateUpdate'> = (oldState, newState) => {
    console.log(newState.member?.user.tag);
};
