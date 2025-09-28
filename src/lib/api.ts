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
		let errorMessage = `Request failed: ${res.status}`;
		try {
			const errorData = await res.json();
			errorMessage = errorData.error || errorData.message || errorMessage;
		} catch {
			const text = await res.text().catch(() => "");
			errorMessage = text || errorMessage;
		}
		logEvent({ level: "warn", message: "API error", context: { url, status: res.status, body: errorMessage } });
		throw new Error(errorMessage);
	}
	const contentType = res.headers.get("content-type") || "";
	if (contentType.includes("application/json")) return (await res.json()) as T;
	return undefined as unknown as T;
}

// Type definitions
export interface User {
	id: string;
	name: string;
	email: string;
	role: 'user' | 'artisan' | 'admin';
	avatar?: string;
	phone?: string;
	address?: {
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
}

export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	originalPrice?: number;
	images: string[];
	category: string;
	subcategory?: string;
	materials: string[];
	dimensions?: {
		length: number;
		width: number;
		height: number;
		unit: string;
	};
	weight?: number;
	colors: string[];
	tags: string[];
	stock: number;
	isHandmade: boolean;
	shippingTime: string;
	rating: number;
	reviewCount: number;
	artisanId: string;
	isFeatured: boolean;
	isActive: boolean;
}

export interface CartItem {
	productId: Product;
	quantity: number;
	addedAt: string;
}

export interface Cart {
	items: CartItem[];
	total: number;
	itemCount: number;
	updatedAt: string;
}

export interface Order {
	id: string;
	orderNumber: string;
	items: Array<{
		productId: string;
		name: string;
		price: number;
		quantity: number;
		artisanId: string;
		image: string;
	}>;
	subtotal: number;
	shippingCost: number;
	tax: number;
	total: number;
	shippingAddress: {
		fullName: string;
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
		phone: string;
	};
	paymentMethod: 'cod' | 'razorpay' | 'upi';
	paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
	status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
	statusHistory: Array<{
		status: string;
		timestamp: string;
		note?: string;
	}>;
	createdAt: string;
}

export interface Review {
	id: string;
	userId: string;
	productId: string;
	orderId: string;
	rating: number;
	title?: string;
	comment: string;
	images?: string[];
	isVerified: boolean;
	response?: {
		message: string;
		respondedBy: string;
		respondedAt: string;
	};
	createdAt: string;
}

// API Functions
export const authApi = {
	signUp: (data: { name: string; email: string; password: string }) =>
		apiRequest<{ token: string; user: User }>(
			"/api/auth/signup",
			{ method: "POST", body: data }
		),
	signIn: (data: { email: string; password: string }) =>
		apiRequest<{ token: string; user: User }>(
			"/api/auth/signin",
			{ method: "POST", body: data }
		),
};

export const productsApi = {
	getAll: (params?: { 
		page?: number; 
		limit?: number; 
		category?: string; 
		q?: string;
		minPrice?: number;
		maxPrice?: number;
		artisanId?: string;
	}) => {
		const searchParams = new URLSearchParams();
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined) {
					searchParams.append(key, value.toString());
				}
			});
		}
		const queryString = searchParams.toString();
		return apiRequest<{ products: Product[]; pagination: any }>(`/api/products${queryString ? `?${queryString}` : ''}`);
	},
	
	getById: (id: string) =>
		apiRequest<Product>(`/api/products/${id}`),
	
	create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
		apiRequest<Product>("/api/products", { 
			method: "POST", 
			body: data, 
			auth: true 
		}),
	
	update: (id: string, data: Partial<Product>) =>
		apiRequest<Product>(`/api/products/${id}`, { 
			method: "PUT", 
			body: data, 
			auth: true 
		}),
	
	delete: (id: string) =>
		apiRequest<void>(`/api/products/${id}`, { 
			method: "DELETE", 
			auth: true 
		}),
};

export const cartApi = {
	get: () =>
		apiRequest<Cart>("/api/cart", { auth: true }),
	
	add: (productId: string, quantity: number = 1) =>
		apiRequest<{ message: string; cart: Cart }>("/api/cart/add", {
			method: "POST",
			body: { productId, quantity },
			auth: true
		}),
	
	updateItem: (productId: string, quantity: number) =>
		apiRequest<{ message: string; cart: Cart }>(`/api/cart/item/${productId}`, {
			method: "PATCH",
			body: { quantity },
			auth: true
		}),
	
	removeItem: (productId: string) =>
		apiRequest<{ message: string }>(`/api/cart/item/${productId}`, {
			method: "DELETE",
			auth: true
		}),
	
	clear: () =>
		apiRequest<{ message: string }>("/api/cart/clear", {
			method: "DELETE",
			auth: true
		}),
};

export const ordersApi = {
	getMyOrders: (params?: { page?: number; limit?: number }) => {
		const searchParams = new URLSearchParams();
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined) {
					searchParams.append(key, value.toString());
				}
			});
		}
		const queryString = searchParams.toString();
		return apiRequest<{ orders: Order[]; pagination: any }>(`/api/orders/my-orders${queryString ? `?${queryString}` : ''}`, { auth: true });
	},
	
	getById: (id: string) =>
		apiRequest<Order>(`/api/orders/${id}`, { auth: true }),
	
	create: (data: {
		items: Array<{ productId: string; quantity: number }>;
		shippingAddress: Order['shippingAddress'];
		paymentMethod: Order['paymentMethod'];
		paymentId?: string;
		notes?: string;
		isGift?: boolean;
		giftMessage?: string;
	}) =>
		apiRequest<Order>("/api/orders", {
			method: "POST",
			body: data,
			auth: true
		}),
	
	cancel: (id: string) =>
		apiRequest<{ message: string; order: Order }>(`/api/orders/${id}/cancel`, {
			method: "PATCH",
			auth: true
		}),
};

export const reviewsApi = {
	getForProduct: (productId: string, params?: { page?: number; limit?: number }) => {
		const searchParams = new URLSearchParams();
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined) {
					searchParams.append(key, value.toString());
				}
			});
		}
		const queryString = searchParams.toString();
		return apiRequest<{ 
			reviews: Review[]; 
			pagination: any; 
			statistics: { 
				averageRating: number; 
				totalReviews: number; 
				ratingDistribution: Array<{ _id: number; count: number }>;
			};
		}>(`/api/reviews/product/${productId}${queryString ? `?${queryString}` : ''}`);
	},
	
	getMyReviews: (params?: { page?: number; limit?: number }) => {
		const searchParams = new URLSearchParams();
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined) {
					searchParams.append(key, value.toString());
				}
			});
		}
		const queryString = searchParams.toString();
		return apiRequest<{ reviews: Review[]; pagination: any }>(`/api/reviews/my-reviews${queryString ? `?${queryString}` : ''}`, { auth: true });
	},
	
	create: (data: {
		productId: string;
		orderId: string;
		rating: number;
		title?: string;
		comment: string;
		images?: string[];
	}) =>
		apiRequest<{ message: string; review: Review }>("/api/reviews", {
			method: "POST",
			body: data,
			auth: true
		}),
	
	update: (id: string, data: Partial<Review>) =>
		apiRequest<{ message: string; review: Review }>(`/api/reviews/${id}`, {
			method: "PATCH",
			body: data,
			auth: true
		}),
	
	delete: (id: string) =>
		apiRequest<{ message: string }>(`/api/reviews/${id}`, {
			method: "DELETE",
			auth: true
		}),
	
	respond: (id: string, message: string) =>
		apiRequest<{ message: string; review: Review }>(`/api/reviews/${id}/respond`, {
			method: "POST",
			body: { message },
			auth: true
		}),
};

// Unified API export
export const api = {
	// Auth
	signIn: authApi.signIn,
	signUp: authApi.signUp,
	
	// Products
	getProducts: productsApi.getAll,
	getProduct: productsApi.getById,
	createProduct: productsApi.create,
	updateProduct: productsApi.update,
	deleteProduct: productsApi.delete,
	
	// Cart
	getCart: cartApi.get,
	addToCart: cartApi.add,
	updateCartItem: cartApi.updateItem,
	removeFromCart: cartApi.removeItem,
	clearCart: cartApi.clear,
	
	// Orders
	getUserOrders: ordersApi.getMyOrders,
	getOrder: ordersApi.getById,
	createOrder: ordersApi.create,
	cancelOrder: ordersApi.cancel,
	
	// Reviews
	getProductReviews: reviewsApi.getForProduct,
	createReview: reviewsApi.create,
	updateReview: reviewsApi.update,
	deleteReview: reviewsApi.delete,
	
	// Wishlist
	getWishlist: () => apiRequest<any[]>('/api/wishlist', { auth: true }),
	addToWishlist: (productId: string) => 
		apiRequest<{ message: string }>('/api/wishlist/add', {
			method: 'POST',
			body: { productId },
			auth: true
		}),
};