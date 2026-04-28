"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().min(1, "Name is required"),
  startedAt: z.string().datetime(),
});

type UpdateWorkoutParams = z.infer<typeof updateWorkoutSchema>;

export async function editWorkout(params: UpdateWorkoutParams) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = updateWorkoutSchema.parse(params);
  const workout = await updateWorkout(validated.workoutId, userId, {
    name: validated.name,
    startedAt: new Date(validated.startedAt),
  });
  if (!workout) throw new Error("Workout not found");
  return workout;
}
