import { Request, Response } from "express";
import Debuger from "../debuger";

import { User, PrismaClient, Task } from "@prisma/client";
import ApiErrors from "../errors/ApiError";
import { user_jwt_params_type } from "validations/user_jwt_params";
import { create_task_params_schema, create_task_params_type } from "validations/create_task_params";
import { validate_post } from "helpers/main_helpers";
import { update_task_params_schema, update_task_params_type } from "validations/update_task_params";

const Debug = Debuger("Task Controller");
const prisma = new PrismaClient();

export async function get_tasks(req: Request, res: Response) {
  const user: user_jwt_params_type = res.locals.jwt_data;

  const tasks = await prisma.task.findMany({
    where: {
      AND: [
        {
          userId: user.id,
        },
        {
          status: {
            not: "DELETED",
          },
        },
      ],
    },
    orderBy: {
      creation_date: "desc",
    },
  });

  return res.status(200).json(tasks);
}

export async function create_task(req: Request, res: Response) {
  const user: user_jwt_params_type = res.locals.jwt_data;
  const { title, description }: create_task_params_type = validate_post(req.body, create_task_params_schema);

  const created_task = await prisma.task.create({
    data: {
      title: title,
      description: description,
      userId: user.id,
    },
  });

  return res.status(201).json(created_task);
}

export async function update_task(req: Request, res: Response) {
  const user: user_jwt_params_type = res.locals.jwt_data;
  const { id, title, description, status }: update_task_params_type = validate_post(
    req.body,
    update_task_params_schema
  );

  const task: Task | null = await prisma.task.findFirst({
    where: {
      AND: [
        {
          id: id,
        },
        {
          userId: user.id,
        },
        {
          status: {
            not: "DELETED",
          },
        },
      ],
    },
  });

  if (task === null) throw ApiErrors.notFound("no task found with given id");

  if (title) task.title = title;
  if (description) task.description = description;
  if (status) task.status = status;

  const updated_task = await prisma.task.update({
    where: {
      id: id,
      userId: user.id,
    },
    data: task,
  });

  return res.status(200).json(updated_task);
}
