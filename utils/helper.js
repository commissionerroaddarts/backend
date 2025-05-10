import jwt from "jsonwebtoken";

export function cleanFields(fieldsString = '') {
  return fieldsString.replace(/\s+/g, '').replace(/,/g, ' ');
}

export function validateURL(v) {
  if (!v) return true; 
  try {
      new URL(v);
      return true;
  } catch (err) {
      return false;
  }
}

export const generateAccessToken = (user, ex = "1d") => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: ex,
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
};
