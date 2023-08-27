import ApiErrors from "error/ApiError";
import { Request, Response, NextFunction } from "express";

const NAMESPACE = "ID VALIDATION MIDDLEWARE";

export async function validate_int_id(req: Request, res: Response, next: NextFunction) {
  /** CHECK IF HEADER CONTAINS THE PARAM ID */
  if (isNaN(parseInt(req.params.id))) throw ApiErrors.badRequest("Make sure the ID is an integer");

  next();
}
