export const TEST_USER_ID = "65f1a2b3c4d5e6f7a8b9c0d1";

export const protector = (req: any, _res: any, next: any) => {
  req.user = { id: TEST_USER_ID, role: "customer" };
  next();
};
