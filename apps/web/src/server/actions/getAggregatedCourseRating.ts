"use server";

import { api } from "~/trpc/server";

// export const revalidate = 86400;

const possibleValues = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export default async function getAggregatedCourseRating(courseId: string) {
  const deviation: number[] = [];
  const rawRating = Number(
    (await api.courses.getAggregatedRating(courseId)).at(0)!.rating,
  );

  if (rawRating < 1) return 0;

  for (const value of possibleValues) {
    deviation.push(Math.abs(rawRating - value));
  }

  const minDeviationIdx = deviation.findIndex(
    (v) => v === Math.min(...deviation),
  );

  return possibleValues[minDeviationIdx];
}
