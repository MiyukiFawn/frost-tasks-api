import z from "zod";

const user_jwt_params_schema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
});

type user_jwt_params_type = z.infer<typeof user_jwt_params_schema>;

export { user_jwt_params_schema, user_jwt_params_type };
