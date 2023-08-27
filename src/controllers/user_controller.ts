import { Request, Response } from "express";
import axios, { isCancel, AxiosError } from "axios";
import Debuger from "../debuger";
import { hash, compare } from "bcrypt";
import Jwt from "jsonwebtoken";

import { User, PrismaClient } from "@prisma/client";
import ApiErrors from "../errors/ApiError";
import { create_user_params_schema, create_user_params_type } from "validations/create_user_params";
import { generate_user_jwt, validate_jwt, validate_post } from "helpers/main_helpers";
import { login_user_params_schema, login_user_params_type } from "validations/login_user_params";
import { refresh_login_params_schema, refresh_login_params_type } from "validations/refresh_login_params";
import { update_user_params_schema, update_user_params_type } from "validations/update_user_params";
import { user_jwt_params_type } from "validations/user_jwt_params";

const Debug = Debuger("User Controller");
const prisma = new PrismaClient();

export async function create_user(req: Request, res: Response) {
  const { username, email, password, reCaptcha_token }: create_user_params_type = validate_post(
    req.body,
    create_user_params_schema
  );

  const existingUsers = await prisma.user.findMany({
    where: {
      OR: [
        {
          username: { equals: username },
        },
        {
          email: { equals: email },
        },
      ],
    },
  });

  if (existingUsers.length > 0) throw ApiErrors.conflict("Username or email already registered");

  const reCaptchaApi = process.env.RE_CAPTCHA_API;
  const reCaptchaSecret = process.env.RE_CAPTCHA_SECRET;
  if (reCaptchaApi === undefined || reCaptchaSecret === undefined) {
    Debug.error("reCaptcha API url and/or secret not defined D:");
    throw ApiErrors.internalServerError();
  }

  const r = await axios({
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    url: reCaptchaApi,
    data: `secret=${reCaptchaSecret}&response=${reCaptcha_token}`,
  });

  if (!r.data.success) {
    Debug.info("reCaptcha failed. \nErrors: " + r.data["error-codes"]);
    throw ApiErrors.unauthorized("Failed to authenticate reCaptcha token");
  }

  const hashPassword: string = await hash(password, 10);

  await prisma.user.create({
    data: {
      username: username,
      email: email,
      password: hashPassword,
    },
  });

  return res.status(201).json("user created successfully");
}

export async function update_user(req: Request, res: Response) {
  const { username, email, password }: update_user_params_type = validate_post(req.body, update_user_params_schema);
  const data: user_jwt_params_type = res.locals.jwt_data;

  if (username !== undefined && username === data.username) throw ApiErrors.conflict("username already in use");
  if (email !== undefined && email === data.email) throw ApiErrors.conflict("email already in use");

  const user: User | null = await prisma.user.findFirst({ where: { id: data.id } });
  if (user === null) throw ApiErrors.notFound("user not found");

  if (username !== undefined) {
    const existingUsers = await prisma.user.findMany({ where: { username: username } });
    if (existingUsers.length > 0) throw ApiErrors.conflict("username already registered");
  }

  if (email !== undefined) {
    const existingUsers = await prisma.user.findMany({ where: { email: email } });
    if (existingUsers.length > 0) throw ApiErrors.conflict("email already registered");
  }

  let hashPassword: string | undefined = undefined;
  if (password !== undefined) hashPassword = await hash(password, 10);

  const updatedUser = await prisma.user.update({
    data: {
      username: username ?? user.username,
      email: email ?? user.email,
      password: hashPassword ?? user.password,
    },
    where: {
      id: user.id,
    },
  });

  const r = generate_user_jwt(updatedUser);
  res.status(200).json(r);
}

export async function delete_user(req: Request, res: Response) {
  const data: user_jwt_params_type = res.locals.jwt_data;

  const user: User | null = await prisma.user.findFirst({ where: { id: data.id } });
  if (user === null) throw ApiErrors.notFound("user not found");

  await prisma.task.deleteMany({
    where: { userId: data.id },
  });

  await prisma.user.delete({
    where: { id: data.id },
  });

  return res.status(202).json("user deleted successfully");
}

export async function login(req: Request, res: Response) {
  const { username, password }: login_user_params_type = validate_post(req.body, login_user_params_schema);

  const user: User | null = await prisma.user.findFirst({
    where: { username: { equals: username } },
  });

  if (user === null) throw ApiErrors.notFound("username not found");

  const matchPassword: boolean = await compare(password, user.password);
  if (!matchPassword) throw ApiErrors.unauthorized("incorrect password");

  const r = generate_user_jwt(user);

  res.status(200).json(r);
}

export async function refresh_login(req: Request, res: Response) {
  const { refresh_token }: refresh_login_params_type = validate_post(req.body, refresh_login_params_schema);
  const payload = validate_jwt(refresh_token);
  const { data } = payload;

  if (data === undefined) throw ApiErrors.unauthorized("invalid token provided");

  const user: User | null = await prisma.user.findFirst({
    where: { username: { equals: data } },
  });

  if (user === null) throw ApiErrors.notFound("username not found");

  const r = generate_user_jwt(user);
  res.status(200).json(r);
}
