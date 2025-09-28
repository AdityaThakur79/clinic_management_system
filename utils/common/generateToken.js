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
    sameSite: 'none', // Required for cross-origin cookies
    maxAge: 24 * 60 * 60 * 1000,
    secure: true, // Required when sameSite is 'none'
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
