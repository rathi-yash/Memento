export const NAV_HEIGHT = 88;
export const SIDEBAR_WIDTH = 240;

// Use NEXT_PUBLIC_API_URL from .env.local for local dev, fallback to production URL
export const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 
    (process.env.NODE_ENV === "production"
        ? "https://recall-backend-5rw5.onrender.com"
        : "http://localhost:8000");

console.log("API_URL:", API_URL);
