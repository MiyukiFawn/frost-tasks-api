import z from "zod";

const update_user_params_schema = z
  .object({
    username: z.string().min(5, { message: "username must be at least 5 characters" }).optional(),
    email: z.string().email("invalid email address").optional(),
    password: z.string().min(5, { message: "password must be at least 5 characters" }).optional(),
    confirm_password: z.string().min(5, { message: "confirm_password must be at least 5 characters" }).optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "password does not match",
    path: ["confirm_password"],
  })
  .refine((data) => data.username !== undefined || (data.email !== undefined || data.password !== undefined), {
    message: "you must provide a username, email or password field to be updated",
  });

type update_user_params_type = z.infer<typeof update_user_params_schema>;

export { update_user_params_schema, update_user_params_type };
