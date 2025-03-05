export const activeIntervalCacheId = (guild: { id: string }) =>
  `${guild.id}/activeInterval`

export const lastActiveCountCacheId = (guild: { id: string }) =>
  `${guild.id}/lastActiveCount`

export const helpingFooterCacheId = (channel: { id: string }) =>
  `${channel.id}/helpingFooter`
