"use client";

import { useState } from "react";
import { StarIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

type CourseRatingSelectorProps = {
  courseId: string;
  userId: string;
  defaultRating?: number;
};

const CourseRatingSelector: React.FC<CourseRatingSelectorProps> = ({
  courseId,
  userId,
  defaultRating = 0,
}) => {
  if (defaultRating % 1 !== 0 || defaultRating < 0 || defaultRating > 5)
    throw new Error(
      "Ratings may only be numbers in the range [0; 5] that are divisible with 0.5",
    );

  const [displayRating, setDisplayRating] = useState(defaultRating);

  const ratingMutation = api.courses.updateEnrolment.useMutation();
  const rateCourse = (rating: number) => {
    ratingMutation.mutate({ courseId, userId, rating });
    setDisplayRating(rating);
  };

  return (
    <div className="flex flex-row-reverse rounded-md px-2 py-1 *:px-0.75 hover:bg-slate-100 [&>button>*]:fill-transparent [&>button>*]:stroke-[1.25] [&>button>*]:transition-colors [&>button>*]:hover:fill-amber-300">
      <button
        className={cn(
          "peer/5",
          displayRating === 5 && "*:not-hover:fill-amber-300!",
        )}
        onClick={() => rateCourse(5)}
      >
        <StarIcon />
      </button>
      <button
        className={cn(
          "peer/4 peer-hover/5:*:fill-amber-300",
          displayRating >= 4 && "*:not-hover:fill-amber-300!",
        )}
        onClick={() => rateCourse(4)}
      >
        <StarIcon />
      </button>
      <button
        className={cn(
          "peer/3 peer-hover/4:*:fill-amber-300 peer-hover/5:*:fill-amber-300",
          displayRating >= 3 && "*:not-hover:fill-amber-300!",
        )}
        onClick={() => rateCourse(3)}
      >
        <StarIcon />
      </button>
      <button
        className={cn(
          "peer/2 peer-hover/3:*:fill-amber-300 peer-hover/4:*:fill-amber-300 peer-hover/5:*:fill-amber-300",
          displayRating >= 2 && "*:not-hover:fill-amber-300!",
        )}
        onClick={() => rateCourse(2)}
      >
        <StarIcon />
      </button>
      <button
        className={cn(
          "peer/1 peer-hover/2:*:fill-amber-300 peer-hover/3:*:fill-amber-300 peer-hover/4:*:fill-amber-300 peer-hover/5:*:fill-amber-300",
          displayRating >= 1 && "*:not-hover:fill-amber-300!",
        )}
        onClick={() => rateCourse(1)}
      >
        <StarIcon />
      </button>
    </div>
  );
};

export default CourseRatingSelector;
