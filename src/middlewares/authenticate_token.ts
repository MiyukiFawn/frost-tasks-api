import ApiErrors from "../errors/ApiError";
import { Request, Response, NextFunction } from "express";
import Debugger from "../debuger";
import jwt from "jsonwebtoken";
import { validate_jwt, validate_post } from "../helpers/main_helpers";
import { user_jwt_params_schema, user_jwt_params_type } from "../validations/user_jwt_params";

const Debug = Debugger("JWT validation middleware");

export default async (req: Request, res: Response, next: NextFunction) => {
  const authHeader: string | undefined = req.headers["authorization"];
  if (authHeader === undefined) throw ApiErrors.badRequest("please provide an authorization header");

  const header = authHeader.split(" ");
  if (header.length !== 2) throw ApiErrors.badRequest("please provide a valid authorization token. Ex: Bearer <token>");
  if (header[0] !== "Bearer" || header[1] === null || header[1] === undefined)
    throw ApiErrors.badRequest("please provide a valid authorization token. Ex: Bearer <token>");

  const data = user_jwt_params_schema.safeParse(validate_jwt(header[1]));
  if (!data.success) throw ApiErrors.badRequest("please provide a valid authorization token. Ex: Bearer <token>");

  res.locals.jwt_data = data.data;
  next();
};
