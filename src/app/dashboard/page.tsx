import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Dumbbell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWorkoutsForDate } from "@/data/workouts";
import { DatePicker } from "./_components/DatePicker";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { date: dateParam } = await searchParams;
  const date = dateParam ? parseISO(dateParam) : new Date();

  const workouts = await getWorkoutsForDate(userId, date);

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-8">
        <DatePicker selected={date} />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Workouts for {format(date, "do MMM yyyy")}
        </h2>

        {workouts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <Dumbbell className="h-8 w-8" />
              <p>No workouts logged for this date.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {workouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <CardTitle>{workout.name ?? "Untitled Workout"}</CardTitle>
                  <CardDescription>
                    Started: {format(workout.startedAt, "do MMM yyyy")}
                    {workout.completedAt && (
                      <> · Completed: {format(workout.completedAt, "do MMM yyyy")}</>
                    )}
                  </CardDescription>
                </CardHeader>
                {workout.exercises.length > 0 && (
                  <CardContent>
                    <ul className="flex flex-col gap-1">
                      {workout.exercises.map((exercise) => (
                        <li key={exercise.id} className="text-sm">
                          {exercise.order}. {exercise.name}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
