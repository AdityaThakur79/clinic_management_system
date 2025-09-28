import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.SECRETKEY,
    {
      expiresIn: "1d",
    }
  );

  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax', // Temporarily use 'lax' for testing
    maxAge: 24 * 60 * 60 * 1000,
    secure: false, // Temporarily disable secure for testing
    path: '/' // Explicitly set path
  };
  
  console.log('🍪 Cookie options:', cookieOptions);
  console.log('🔑 Token length:', token.length);
  
  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      message,
      user,
      token,
    });
};
