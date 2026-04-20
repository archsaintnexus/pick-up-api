export const protect = (req: any, res: any, next: any) => {
  req.user = {
    id: "test-user-id",
    role: "customer",
  };
  next();
};