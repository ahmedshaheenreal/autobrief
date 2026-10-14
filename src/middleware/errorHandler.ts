import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/HttpError";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
};

// Express needs all four parameters to recognise this as an error handler.
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  // body-parser errors (e.g. malformed JSON) carry a 4xx status
  const status = (err as { status?: number })?.status;
  if (typeof status === "number" && status >= 400 && status < 500) {
    res.status(status).json({ message: "Invalid request body" });
    return;
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
};
