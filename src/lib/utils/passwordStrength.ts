export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Very Weak" | "Weak" | "Fair" | "Good" | "Strong";
  color: string;
};

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const clamped = Math.min(4, Math.max(0, password.length === 0 ? 0 : score - 1)) as PasswordStrength["score"];

  const map: Record<PasswordStrength["score"], Omit<PasswordStrength, "score">> = {
    0: { label: "Very Weak", color: "bg-danger" },
    1: { label: "Weak", color: "bg-accent-500" },
    2: { label: "Fair", color: "bg-sun-500" },
    3: { label: "Good", color: "bg-mint-400" },
    4: { label: "Strong", color: "bg-mint-600" },
  };

  return { score: clamped, ...map[clamped] };
}
