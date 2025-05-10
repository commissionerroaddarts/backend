const isProduction = process.env.NODE_ENV === 'production';

export const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // Use secure cookies only in production (HTTPS)
    sameSite: isProduction ? 'None' : 'Lax', // 'None' for cross-origin in production, 'Lax' for local dev
    path: '/',
};