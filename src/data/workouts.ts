import { db } from "@/db";
import { workouts, exercises } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export async function getWorkoutsForDate(userId: string, date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      id: workouts.id,
      name: workouts.name,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      exerciseOrder: exercises.order,
    })
    .from(workouts)
    .leftJoin(exercises, eq(exercises.workoutId, workouts.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, start),
        lt(workouts.startedAt, end),
      ),
    );

  const workoutMap = new Map<
    number,
    {
      id: number;
      name: string | null;
      startedAt: Date;
      completedAt: Date | null;
      exercises: { id: number; name: string; order: number }[];
    }
  >();

  for (const row of rows) {
    if (!workoutMap.has(row.id)) {
      workoutMap.set(row.id, {
        id: row.id,
        name: row.name,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        exercises: [],
      });
    }
    if (row.exerciseId !== null && row.exerciseName !== null && row.exerciseOrder !== null) {
      workoutMap.get(row.id)!.exercises.push({
        id: row.exerciseId,
        name: row.exerciseName,
        order: row.exerciseOrder,
      });
    }
  }

  return Array.from(workoutMap.values()).map((w) => ({
    ...w,
    exercises: w.exercises.sort((a, b) => a.order - b.order),
  }));
}
