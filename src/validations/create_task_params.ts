import z from "zod";

const create_task_params_schema = z.object({
  title: z
    .string({
      required_error: "task title is required",
    })
    .min(5, { message: "task title must be at least 5 characters" }),

  description: z.string().max(255, "description cannot exceed 255 characters").default(""),
});

type create_task_params_type = z.infer<typeof create_task_params_schema>;

export { create_task_params_schema, create_task_params_type };
