export type CommandCategories =
  | 'development'
  | 'moderation'
  | 'utilities'
  | 'unlisted'
  | 'settings'
  | 'stream'
  | 'potato'
  | 'emotes'
  | 'spam'
  | 'misc'
  | 'fun';

export type UserRequires =
  | 'none'
  | 'subscriber'
  | 'vip'
  | 'mod'
  | 'ambassador'
  | 'broadcaster';

export type BotCommandRequirements = 'none' | 'vip' | 'mod';

export type CommandConditions = {
  offlineOnly?: boolean;
  whisperable?: boolean;
  ignoreBots?: boolean;
  isBlockable?: boolean;
  isNotPipable?: boolean;
  superuser?: boolean;
};

export type FlagDetails = {
  name: string;
  type: 'boolean' | 'string';
  level: InternalLevels;
  userRequires?: UserRequires;
  required: boolean;
  description: string;
  usage?: string;
  aliases?: string[];
};

export interface KeyString {
  [key: number | string]: string;
}

export interface Command {
  name: string;
  description: string;
  title: string;
  detailedDescription?: string;
  usage: string;
  category: CommandCategories;
  aliases: string[];
  flags: FlagDetails[];
  cooldown: number;
  level: InternalLevels;
  botRequires: BotCommandRequirements;
  userRequires: UserRequires;
  conditions: CommandConditions;
}
