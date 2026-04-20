import type { Request, Response, NextFunction } from "express";

type AuthedRequest = Request & { user: { id: string; role: string } };

export const protect = (req: Request, _res: Response, next: NextFunction) => {
  (req as AuthedRequest).user = { id: "test-user-id", role: "customer" };
  next();
};
