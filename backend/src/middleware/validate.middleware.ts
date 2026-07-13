import type { Request, Response, NextFunction } from "express";

export function validate(schema: any) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    next();
  };
}
