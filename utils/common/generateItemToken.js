export const generateItemToken = () => {
  return `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
};

export const generateTokenNumber = () => {
  const timestamp = Date.now().toString().slice(-6);  
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${rand}`;
};