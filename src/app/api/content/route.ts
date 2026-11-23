import { json, isAdmin } from "@/lib/admin";
import { getLive, getDraft } from "@/lib/content-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const wantDraft = new URL(req.url).searchParams.get("draft") === "1";
  const content = wantDraft && (await isAdmin(req)) ? await getDraft() : await getLive();
  return json({ content });
}
