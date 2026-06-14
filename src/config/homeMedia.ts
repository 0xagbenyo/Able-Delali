/** Optional YouTube embed on homepage Speaking block — set `VITE_HOME_SPEAKING_YOUTUBE_EMBED_ID` in `.env` (ID only). */
export const HOME_SPEAKING_YOUTUBE_EMBED_ID: string =
  (import.meta.env.VITE_HOME_SPEAKING_YOUTUBE_EMBED_ID as string | undefined) ?? "";
