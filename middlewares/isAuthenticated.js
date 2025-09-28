import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    // Authentication middleware - checking cookies and headers
    
    // Debug: Log what we're receiving
    console.log('=== AUTH DEBUG ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Cookies:', req.cookies);
    console.log('Authorization header:', req.headers.authorization);
    console.log('All headers:', Object.keys(req.headers));
    console.log('==================');
    
    let token = req.cookies.token;
    if (!token && req.headers && req.headers.authorization) {
      const [scheme, value] = req.headers.authorization.split(' ');
      if (scheme && scheme.toLowerCase() === 'bearer' && value) token = value;
    }

    // Token found

    if (!token) {
      console.log('❌ No token found in request');
      return res.status(401).json({
        message: "No token provided",
        success: false,
      });
    }
    
    console.log('✅ Token found:', token.substring(0, 20) + '...');

    if (!process.env.SECRETKEY) {
      return res.status(500).json({
        message: "Server misconfiguration: SECRETKEY not set",
        success: false,
      });
    }

    const decode = jwt.verify(token, process.env.SECRETKEY);
    // Token decoded successfully
    req.id = decode.userId;
    req.user = decode;
    next();
  } catch (error) {
    // JWT verification error
    return res.status(401).json({
      message: "Authentication failed",
      success: false,
      error: error.message,
    });
  }
};

const isEmployeeAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.employeeToken;

    if (!token) {
      return res.status(401).json({
        message: "No employee token provided",
        success: false,
      });
    }

    if (!process.env.SECRETKEY) {
      return res.status(500).json({
        message: "Server misconfiguration: SECRETKEY not set",
        success: false,
      });
    }

    const decode = jwt.verify(token, process.env.SECRETKEY);
    req.employeeId = decode.employeeId;
    req.employee = decode;
    next();
  } catch (error) {
    // Employee JWT verification error
    return res.status(401).json({
      message: "Employee authentication failed",
      success: false,
      error: error.message,
    });
  }
};

export { isAuthenticated, isEmployeeAuthenticated };
export default isAuthenticated;
