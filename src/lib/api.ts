import { logEvent } from "./security";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";
const TOKEN_KEY = "auth_token";

export function getAuthToken(): string | null {
	try {
		return localStorage.getItem(TOKEN_KEY);
	} catch {
		return null;
	}
}

export function setAuthToken(token: string | null): void {
	try {
		if (token) localStorage.setItem(TOKEN_KEY, token);
		else localStorage.removeItem(TOKEN_KEY);
	} catch {
		// ignore
	}
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T>(path: string, options: {
	method?: HttpMethod;
	body?: unknown;
	auth?: boolean;
} = {}): Promise<T> {
	const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
	const headers: Record<string, string> = { "Content-Type": "application/json" };
	if (options.auth) {
		const token = getAuthToken();
		if (token) headers["Authorization"] = `Bearer ${token}`;
	}
	const res = await fetch(url, {
		method: options.method || "GET",
		headers,
		body: options.body ? JSON.stringify(options.body) : undefined,
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		logEvent({ level: "warn", message: "API error", context: { url, status: res.status, body: text } });
		throw new Error(text || `Request failed: ${res.status}`);
	}
	const contentType = res.headers.get("content-type") || "";
	if (contentType.includes("application/json")) return (await res.json()) as T;
	return undefined as unknown as T;
}

export const authApi = {
	signUp: (data: { name: string; email: string; password: string }) =>
		apiRequest<{ token: string; user: { id: string; name: string; email: string } }>(
			"/api/auth/signup",
			{ method: "POST", body: data }
		),
	signIn: (data: { email: string; password: string }) =>
		apiRequest<{ token: string; user: { id: string; name: string; email: string } }>(
			"/api/auth/signin",
			{ method: "POST", body: data }
		),
};


