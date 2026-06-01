/** Desired properties required by Stratum bridge routing. */
export const stratumDesiredProperties = {
  user: {
    id: true,
    bot: true,
    username: true,
  },
  message: {
    id: true,
    content: true,
    channelId: true,
    guildId: true,
    author: true,
  },
  interaction: {
    id: true,
    type: true,
    token: true,
    data: true,
    user: true,
    guildId: true,
    channelId: true,
    acknowledged: true,
  },
} as const;
