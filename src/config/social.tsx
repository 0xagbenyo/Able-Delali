// src/config/social.tsx

const baseStyle = {
  width: "18px",
  height: "18px",
  display: "block",
};

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

export const socialLinks = [
  {
    label: "Facebook",
    icon: FacebookIcon,
    link: "https://www.facebook.com/share/1Ha68oisNs/",
  },
  {
    label: "Instagram",
    icon: InstagramIcon,
    link: "https://www.instagram.com/abledelalie?igsh=YzhvbzF4eTQydmZj",
  },
  {
    label: "X",
    icon: XIcon,
    link: "https://x.com/abledelalie",
  },
] as const;
