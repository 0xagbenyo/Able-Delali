// src/config/social.tsx

import { linkedinProfileUrl } from "../content/facebookPublicThemes";

const baseStyle = {
  width: "18px",
  height: "18px",
  display: "block",
};

/** Paste your TikTok profile URL when ready (e.g. https://www.tiktok.com/@handle). */
export const TIKTOK_PROFILE_URL = "";

/** Paste your YouTube channel URL when ready (e.g. https://www.youtube.com/@handle). */
export const YOUTUBE_CHANNEL_URL = "";

export const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={baseStyle}>
    <path d="M18.5 3h2l-6.5 7.4L22 21h-6.5l-5-6.3L4 21H2l7.1-8.1L2 3h6.6l4.6 5.9L18.5 3z" />
  </svg>
);

export const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={baseStyle}>
    <path d="M7 2C4.8 2 3 3.8 3 6v12c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4V6c0-2.2-1.8-4-4-4H7zm5 5a5 5 0 110 10 5 5 0 010-10zm6.2-.8a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0zM12 9.2A2.8 2.8 0 1012 15a2.8 2.8 0 000-5.6z" />
  </svg>
);

export const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={baseStyle}>
    <path d="M13 3h3V0h-3c-3 0-5 2-5 5v3H5v4h3v12h4V12h3l.4-4H12V6c0-.6.4-1 1-1z" />
  </svg>
);

export const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={baseStyle}>
    <path d="M4.98 3.5C4 3.5 3 4.4 3 5.48c0 1.06 1 1.98 2 1.98h.02c1 0 2-.92 2-1.98C7 4.4 6 3.5 5 3.5h-.02zM3 8.75h4V21H3V8.75zm6.5 0H14v1.7h.06c.6-1.1 2.1-2.26 4.3-2.26 4.6 0 5.5 3.03 5.5 6.97V21H18v-5.6c0-1.34-.02-3.06-1.86-3.06-1.87 0-2.16 1.46-2.16 2.97V21h-4V8.75z" />
  </svg>
);

export const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={baseStyle}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

export const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={baseStyle}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const linkedInHref = linkedinProfileUrl.trim() || "https://www.linkedin.com/";
const tiktokHref = TIKTOK_PROFILE_URL.trim() || "https://www.tiktok.com/";
const youtubeHref = YOUTUBE_CHANNEL_URL.trim() || "https://www.youtube.com/";

/** Order matches the reference footer rail: Facebook → LinkedIn → TikTok → Instagram → YouTube → X */
export const socialLinks = [
  {
    label: "Facebook",
    icon: FacebookIcon,
    link: "https://www.facebook.com/share/1Ha68oisNs/",
  },
  {
    label: "LinkedIn",
    icon: LinkedInIcon,
    link: linkedInHref,
  },
  {
    label: "TikTok",
    icon: TikTokIcon,
    link: tiktokHref,
  },
  {
    label: "Instagram",
    icon: InstagramIcon,
    link: "https://www.instagram.com/abledelalie?igsh=YzhvbzF4eTQydmZj",
  },
  {
    label: "YouTube",
    icon: YouTubeIcon,
    link: youtubeHref,
  },
  {
    label: "X",
    icon: XIcon,
    link: "https://x.com/abledelalie",
  },
];
