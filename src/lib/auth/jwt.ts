import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  sub: string;
  role: "USER" | "ADMIN";
  name: string;
  email: string;
};

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set. Add it to .env.local");
  return new TextEncoder().encode(secret);
}

const SESSION_TTL = "7d";

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ role: payload.role, name: payload.name, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      sub: payload.sub as string,
      role: payload.role as SessionPayload["role"],
      name: payload.name as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}
