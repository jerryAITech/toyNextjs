import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { resolveDateRange } from "@/lib/services/dashboardService";
import { REPORT_RUNNERS, type ReportType } from "@/lib/services/reportService";
import { toCSV } from "@/lib/utils/csv";
import { ok, fail, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const type = req.nextUrl.searchParams.get("type") as ReportType;
    if (!type || !(type in REPORT_RUNNERS)) return fail("Invalid report type.", 422);

    const range = req.nextUrl.searchParams.get("range") || "30d";
    const from = req.nextUrl.searchParams.get("from") || undefined;
    const to = req.nextUrl.searchParams.get("to") || undefined;
    const format = req.nextUrl.searchParams.get("format") || "json";

    const { start, end } = resolveDateRange(range, from, to);
    const rows = await REPORT_RUNNERS[type]({ start, end });

    if (format === "csv") {
      const csv = toCSV(rows as unknown as Record<string, unknown>[]);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${type}-report.csv"`,
        },
      });
    }

    return ok({ rows });
  } catch (err) {
    return handleApiError(err);
  }
}
