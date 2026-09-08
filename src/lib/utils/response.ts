import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: number) {
  return NextResponse.json({ success: true, data }, { status: init ?? 200 });
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, message, ...extra }, { status });
}

export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    return fail("Validation failed", 422, { issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
  }
  if (err instanceof ApiError) {
    return fail(err.message, err.status);
  }
  console.error(err);
  return fail("Something went wrong. Please try again.", 500);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
