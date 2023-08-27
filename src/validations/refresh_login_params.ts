import z from "zod";

const refresh_login_params_schema = z.object({
  refresh_token: z.string({
    required_error: "username is required",
  }),
});

type refresh_login_params_type = z.infer<typeof refresh_login_params_schema>;

export { refresh_login_params_schema, refresh_login_params_type };
