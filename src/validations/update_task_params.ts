import { Task_Status } from "@prisma/client";
import z from "zod";

const update_task_params_schema = z
  .object({
    id: z.string({ required_error: "task id must be provided" }).uuid("make sure the provided id is a valid UUID"),
    title: z.string().min(5, { message: "task title must be at least 5 characters" }).optional(),
    description: z.string().max(255, "description cannot exceed 255 characters").optional(),
    status: z.nativeEnum(Task_Status).optional(),
  })
  .refine((data) => data.title !== undefined || data.description !== undefined || data.status !== undefined, {
    message: "you must provide a title, description or status field to be updated",
  });

type update_task_params_type = z.infer<typeof update_task_params_schema>;

export { update_task_params_schema, update_task_params_type };
