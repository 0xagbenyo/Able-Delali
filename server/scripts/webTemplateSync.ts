/**
 * Sync **Web Template** → **Fields** (child table **Web Template Field**) via REST
 * so Desk Page Builder shows new columns after the template was first created from an older seed.
 */
import { getERPNextDocument, updateERPNextDocument } from "../erpnextAuth.js";

export type WebTemplateFieldRow = {
  label: string;
  fieldname: string;
  fieldtype: string;
  description?: string;
};

function unwrapDoc<T extends Record<string, unknown>>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res) {
    const d = (res as { data: unknown }).data;
    if (d && typeof d === "object") return d as T;
  }
  return (res as T) ?? ({} as T);
}

function fieldRowsSignature(
  rows: { fieldname?: string; label?: string; fieldtype?: string; description?: string }[],
): string {
  return JSON.stringify(
    rows.map((r) => ({
      fieldname: String(r.fieldname ?? ""),
      label: String(r.label ?? ""),
      fieldtype: String(r.fieldtype ?? ""),
    })),
  );
}

/**
 * Updates **Web Template** `fields` to match `desired` when labels/types/order/descriptions drift.
 */
export async function syncWebTemplateFieldsIfNeeded(
  templateName: string,
  desired: WebTemplateFieldRow[],
): Promise<void> {
  const raw = await getERPNextDocument("Web Template", templateName);
  const doc = unwrapDoc<Record<string, unknown>>(raw);
  const existingRows = Array.isArray(doc.fields) ? (doc.fields as Record<string, unknown>[]) : [];
  const existingSig = fieldRowsSignature(
    existingRows.map((r) => ({
      fieldname: r.fieldname,
      label: r.label,
      fieldtype: r.fieldtype,
      description: r.description,
    })),
  );
  const desiredSig = fieldRowsSignature(desired);

  if (existingSig === desiredSig) {
    console.log(`Web Template "${templateName}" field schema already matches repo.`);
    return;
  }

  const fields = desired.map((f, i) => {
    const row: Record<string, unknown> = {
      doctype: "Web Template Field",
      idx: i + 1,
      label: f.label,
      fieldname: f.fieldname,
      fieldtype: f.fieldtype,
    };
    return row;
  });

  await updateERPNextDocument("Web Template", templateName, { fields });
  console.log(`Synced Web Template "${templateName}" (${fields.length} field rows) to match repo.`);
}
