import { NextResponse } from "next/server";
import { listReports } from "@/lib/store/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ reports: listReports() });
}
