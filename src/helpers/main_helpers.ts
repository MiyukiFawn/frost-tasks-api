import { User } from "@prisma/client";
import ApiErrors from "../errors/ApiError";
import Debuger from "../debuger";
import Jwt from "jsonwebtoken";

const Debug = Debuger("Main Helpers");

import z from "zod";

export function objectsAreEqual(obj1: object, obj2: object): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export function validate_post(data: object, schema: z.Schema) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw ApiErrors.badRequest(parsed);
  return parsed.data;
}

export function generate_user_jwt(user: User) {
  const ssh_private: string | undefined = process.env.JWT_PRIVATE_KEY;

  if (ssh_private === undefined) {
    Debug.error(
      "Please make sure that JWT_PRIVATE_KEY is provided in the environment variables and that it's a valid SSH private key"
    );
    throw ApiErrors.internalServerError();
  }

  const access_token = Jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    ssh_private,
    {
      algorithm: "RS256",
      expiresIn: "15m",
    }
  );

  const refresh_token = Jwt.sign({ data: `${user.username}` }, ssh_private, {
    algorithm: "RS256",
    expiresIn: "1h",
  });

  return { access_token, refresh_token };
}

export function validate_jwt(token: string) {
  const ssh_public: string | undefined = process.env.JWT_PUBLIC_KEY;
  if (ssh_public === undefined) {
    Debug.warn(
      "Please make sure that JWT_PUBLIC_KEY is provided in the environment variables and that it's a valid SSH public key"
    );
    throw ApiErrors.internalServerError();
  }

  let data: any;
  try {
    data = Jwt.verify(token, ssh_public, { algorithms: ["RS256"] });
  } catch (error) {
    throw ApiErrors.unauthorized("please make sure that you provided a valid JWT");
  }

  return data;
}
