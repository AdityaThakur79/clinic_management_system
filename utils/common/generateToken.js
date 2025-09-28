import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.SECRETKEY,
    {
      expiresIn: "1d",
    }
  );

  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      sameSite: 'lax', // Use 'lax' for better compatibility
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production' // Use secure cookies in production
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};
