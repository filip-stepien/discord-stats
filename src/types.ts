import { ClientEvents } from 'discord.js';

export type BotEventHandler<T extends keyof ClientEvents> = {
    mode: 'on' | 'once';
    event: T;
    handler: (...args: ClientEvents[T]) => void;
};
