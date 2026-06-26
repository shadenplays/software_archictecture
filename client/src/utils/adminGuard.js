export const isAdmin = (user) => {
  if (!user) return false;

  const adminEmail = "yourlocalshopadmin@gmail.com";
  const adminPassword = "admin123"; // demo only

  return user.email === adminEmail;
};