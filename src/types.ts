import { ClientEvents } from 'discord.js';

export type BotEventHandler<T extends keyof ClientEvents> = (...args: ClientEvents[T]) => void;
