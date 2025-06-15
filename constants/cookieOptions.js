const isProduction = process.env.NODE_ENV === "production";

export const cookieOptions = {
  httpOnly: true,
  secure: isProduction, // ❗ false in dev
  sameSite: isProduction ? "None" : "Lax", // ❗ Lax in dev
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  ...(isProduction ? { domain: ".roaddarts.com" } : {}),
};
