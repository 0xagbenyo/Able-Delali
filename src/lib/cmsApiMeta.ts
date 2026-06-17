import { setErpPublicOriginFromApi } from "../config/erpnextPublic";

export type CmsSectionsApiResponse = {
  ok?: boolean;
  public_asset_origin?: string;
  error?: string;
  sections?: unknown[];
};

export function applyCmsApiMeta(data: CmsSectionsApiResponse | null | undefined): void {
  setErpPublicOriginFromApi(data?.public_asset_origin);
}
