import type { Request, Response, NextFunction } from "express";

type AuthedRequest = Request & { user: { id: string; role: string } };

export const TEST_USER_ID = "65f1a2b3c4d5e6f7a8b9c0d1";

export const protector = (req: Request, _res: Response, next: NextFunction) => {
  (req as AuthedRequest).user = {
    id: TEST_USER_ID,
    role: process.env.TEST_USER_ROLE ?? "customer",
  };
  next();
};
