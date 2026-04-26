"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { insertWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startedAt: z.string().datetime(),
});

type CreateWorkoutParams = z.infer<typeof createWorkoutSchema>;

export async function createWorkout(params: CreateWorkoutParams) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = createWorkoutSchema.parse(params);
  return insertWorkout(validated.name, new Date(validated.startedAt), userId);
}
