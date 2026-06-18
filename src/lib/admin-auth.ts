const KEY = "tensorcode_admin_pw";

export function getAdminPassword(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function setAdminPassword(pw: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, pw);
}

export function clearAdminPassword() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
