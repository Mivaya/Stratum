import type { ChannelType, CommandContextMeta } from "@stratum/core";
import {
  ChannelType as DjsChannelType,
  type ChatInputCommandInteraction,
  type GuildChannel,
  type GuildMember,
  type Message,
} from "discord.js";
import type { StratumMessage, StratumSlashInteraction, StratumUser } from "./shapes.js";

function mapChannelType(type: DjsChannelType): ChannelType {
  switch (type) {
    case DjsChannelType.DM:
      return "dm";
    case DjsChannelType.GroupDM:
      return "group_dm";
    case DjsChannelType.GuildText:
      return "guild_text";
    case DjsChannelType.GuildVoice:
      return "guild_voice";
    case DjsChannelType.GuildAnnouncement:
      return "guild_news";
    case DjsChannelType.AnnouncementThread:
      return "guild_news_thread";
    case DjsChannelType.PublicThread:
      return "guild_public_thread";
    case DjsChannelType.PrivateThread:
      return "guild_private_thread";
    case DjsChannelType.GuildStageVoice:
      return "guild_stage";
    case DjsChannelType.GuildForum:
      return "guild_forum";
    default:
      return "unknown";
  }
}

export function userFromDiscordJs(user: { id: string; bot?: boolean; username?: string }): StratumUser {
  const out: StratumUser = { id: user.id };
  if (user.bot !== undefined) (out as { bot?: boolean }).bot = user.bot;
  if (user.username !== undefined) (out as { username?: string }).username = user.username;
  return out;
}

export function messageFromDiscordJs(message: Message): StratumMessage {
  return {
    id: message.id,
    content: message.content,
    channelId: message.channelId,
    guildId: message.guildId,
    author: userFromDiscordJs(message.author),
  };
}

export function slashInteractionFromDiscordJs(
  interaction: ChatInputCommandInteraction,
): StratumSlashInteraction {
  return {
    id: interaction.id,
    token: interaction.token,
    user: userFromDiscordJs(interaction.user),
    guildId: interaction.guildId,
    channelId: interaction.channelId,
  };
}

function metaFromGuildChannel(channel: GuildChannel): CommandContextMeta {
  const meta: CommandContextMeta = {
    channelType: mapChannelType(channel.type),
  };
  if ("nsfw" in channel && typeof channel.nsfw === "boolean") {
    meta.channelNsfw = channel.nsfw;
  }
  return meta;
}

function memberPermissions(member: GuildMember | null): bigint | undefined {
  return member?.permissions.bitfield;
}

function clientPermissionsInChannel(member: GuildMember | null, channelId: string): bigint | undefined {
  if (!member) return undefined;
  return member.permissionsIn(channelId).bitfield;
}

export function metaFromDiscordJsMessage(message: Message): CommandContextMeta | undefined {
  const channel = message.channel;

  if (channel.isDMBased()) {
    return { channelType: "dm", channelNsfw: false };
  }

  if (!channel.isTextBased()) return undefined;

  const guildChannel = channel as GuildChannel;
  const meta = metaFromGuildChannel(guildChannel);
  const memberPerms = memberPermissions(message.member);
  const clientPerms = message.guild
    ? clientPermissionsInChannel(message.guild.members.me, message.channelId)
    : undefined;

  if (memberPerms !== undefined) meta.memberPermissions = memberPerms;
  if (clientPerms !== undefined) meta.clientPermissions = clientPerms;
  return meta;
}

export function metaFromDiscordJsSlash(
  interaction: ChatInputCommandInteraction,
): CommandContextMeta | undefined {
  if (!interaction.inGuild()) {
    return { channelType: "dm", channelNsfw: false };
  }

  const channel = interaction.channel;
  const meta: CommandContextMeta = {};

  if (channel && "type" in channel) {
    const guildChannel = channel as GuildChannel;
    meta.channelType = mapChannelType(guildChannel.type);
    if ("nsfw" in guildChannel && typeof guildChannel.nsfw === "boolean") {
      meta.channelNsfw = guildChannel.nsfw;
    }
  }

  if (interaction.memberPermissions) {
    meta.memberPermissions = interaction.memberPermissions.bitfield;
  }

  if (interaction.appPermissions) {
    meta.clientPermissions = interaction.appPermissions.bitfield;
  }

  return Object.keys(meta).length > 0 ? meta : undefined;
}
