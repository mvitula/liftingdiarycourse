import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutById } from "@/data/workouts";
import EditWorkoutForm from "./_components/EditWorkoutForm";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) return notFound();

  const { workoutId } = await params;
  const id = Number(workoutId);
  if (isNaN(id)) return notFound();

  const workout = await getWorkoutById(id, userId);
  if (!workout) return notFound();

  return <EditWorkoutForm workout={workout} />;
}
