import { headers } from "next/headers";

export async function getTenantFromHost(): Promise<string | null> {
  const h = await headers();

  const host = h.get("host") || "";

  const parts = host.split(".");
  if (parts.length < 2) return null;

  const subdomain = parts[0];
  if (subdomain === "www") return null;

  return subdomain;
}
