import z from "zod";

const login_user_params_schema = z.object({
  username: z
    .string({
      required_error: "username is required",
    })
    .min(5, { message: "username must be at least 5 characters" }),

  password: z
    .string({
      required_error: "password is required",
    })
    .min(5, { message: "password must be at least 5 characters" }),
});

type login_user_params_type = z.infer<typeof login_user_params_schema>;

export { login_user_params_schema, login_user_params_type };
