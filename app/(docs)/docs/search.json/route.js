import { getSearchIndex } from "../../../../lib/docs.js";

export const dynamic = "force-static";

export function GET() {
  return Response.json(getSearchIndex());
}
