import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

/** Validates req.body against the schema and replaces it with the sanitized value. */
export const validateBody =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { value, error } = schema.validate(req.body ?? {});
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }
    req.body = value;
    next();
  };
