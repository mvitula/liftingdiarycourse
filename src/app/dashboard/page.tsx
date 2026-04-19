"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const mockWorkouts = [
  {
    id: 1,
    name: "Morning Push Day",
    exercises: [
      { name: "Bench Press", sets: 4 },
      { name: "Overhead Press", sets: 3 },
      { name: "Tricep Dips", sets: 3 },
    ],
  },
  {
    id: 2,
    name: "Evening Cardio",
    exercises: [{ name: "Treadmill Run", sets: 1 }],
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-8">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2 sm:w-auto">
              <CalendarIcon className="h-4 w-4" />
              {format(date, "do MMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d);
                  setOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Workouts for {format(date, "do MMM yyyy")}
        </h2>

        {mockWorkouts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <Dumbbell className="h-8 w-8" />
              <p>No workouts logged for this date.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {mockWorkouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <CardTitle>{workout.name}</CardTitle>
                  <CardDescription>
                    {workout.exercises.length} exercise
                    {workout.exercises.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {workout.exercises.map((exercise) => (
                      <li key={exercise.name} className="flex justify-between">
                        <span>{exercise.name}</span>
                        <span>
                          {exercise.sets} set{exercise.sets !== 1 ? "s" : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
