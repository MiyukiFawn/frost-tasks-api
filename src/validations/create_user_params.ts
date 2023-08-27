import z from "zod";

const create_user_params_schema = z
  .object({
    username: z
      .string({
        required_error: "username is required",
      })
      .min(5, { message: "username must be at least 5 characters" }),

    email: z
      .string({
        required_error: "email is required",
      })
      .email("invalid email address"),

    password: z
      .string({
        required_error: "password is required",
      })
      .min(5, { message: "password must be at least 5 characters" }),

    confirm_password: z
      .string({
        required_error: "confirm_password is required",
      })
      .min(5, { message: "confirm_password must be at least 5 characters" }),

    reCaptcha_token: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "password does not match",
    path: ["confirm_password"],
  });

type create_user_params_type = z.infer<typeof create_user_params_schema>;

export { create_user_params_schema, create_user_params_type };
