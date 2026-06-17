/**
 * Contact / enquiry form topics — kept in one place for the dropdown and server-side labels (ERPNext feedback type).
 * URL: `/contact?topic=<value>` or `?enquiry=<value>`. Legacy: `navigate("/contact", { state: { enquiryTopic } })`.
 */
export const ENQUIRY_TOPICS = [
  { value: "general", label: "General enquiry" },
  { value: "speaking", label: "Speaking engagement" },
  { value: "workshops", label: "Workshops & training" },
  { value: "policy-advisory", label: "Policy & advisory" },
  { value: "media", label: "Writing & media / interviews" },
  { value: "partnerships", label: "Partnerships & collaborations" },
  { value: "pastor", label: "Leadership & voice (pastoral pillar)" },
  { value: "data-analyst", label: "Public health & policy (analyst pillar)" },
  { value: "writer", label: "Writing & advocacy (writer pillar)" },
  { value: "books", label: "Books" },
  { value: "journal", label: "Journal / blog" },
  { value: "newsletter", label: "Newsletter or website" },
  { value: "press-kit", label: "Press kit / bio / assets" },
] as const;

export type EnquiryTopicValue = (typeof ENQUIRY_TOPICS)[number]["value"];

export function isEnquiryTopicValue(v: string): v is EnquiryTopicValue {
  return ENQUIRY_TOPICS.some((t) => t.value === v);
}

export function labelForEnquiryTopic(value: string): string {
  const row = ENQUIRY_TOPICS.find((t) => t.value === value);
  return row?.label ?? value;
}

export type LocationLike = {
  search: string;
  state: unknown;
};

/** Resolve topic from `?topic=` / `?enquiry=` first, then React Router `location.state.enquiryTopic`. */
export function resolveEnquiryTopicFromLocation(location: LocationLike): EnquiryTopicValue | null {
  const params = new URLSearchParams(location.search);
  const fromQuery = (params.get("topic") ?? params.get("enquiry") ?? "").trim();
  if (fromQuery && isEnquiryTopicValue(fromQuery)) return fromQuery;

  const st = location.state as { enquiryTopic?: string } | null | undefined;
  const fromState = typeof st?.enquiryTopic === "string" ? st.enquiryTopic.trim() : "";
  if (fromState && isEnquiryTopicValue(fromState)) return fromState;

  return null;
}
