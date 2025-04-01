import { type HTMLAttributes } from "react";
import { StarIcon, StarHalfIcon } from "lucide-react";

import { cn } from "~/lib/utils";

const EmptyStar = () => (
  <span>
    <StarIcon className="stroke-[1.25]" />
  </span>
);
const HalfStar = () => (
  <span className="relative w-fit">
    <StarHalfIcon className="absolute fill-amber-300 stroke-0" />
    <StarIcon className="absolute stroke-[1.25]" />
    <StarIcon className="stroke-0" />
  </span>
);
const FilledStar = () => (
  <span>
    <StarIcon className="fill-amber-300 stroke-[1.25]" />
  </span>
);

type CourseRatingProps = { rating?: number } & HTMLAttributes<HTMLDivElement>;

const CourseRating: React.FC<CourseRatingProps> = ({
  rating = 0,
  className,
  ...props
}) => {
  if (rating % 0.5 !== 0 || rating < 0 || rating > 5)
    throw new Error(
      "Ratings may only be numbers in the range [0; 5] that are divisible with 0.5",
    );

  const filled = Math.floor(rating);
  const half = Math.ceil(rating - filled);
  const empty = 5 - (filled + half);

  return (
    <div
      role="progressbar"
      className={cn("flex w-fit gap-1", className)}
      {...props}
    >
      {new Array(filled).fill(0).map((_, idx) => (
        <FilledStar key={idx} />
      ))}
      {new Array(half).fill(0).map((_, idx) => (
        <HalfStar key={idx} />
      ))}
      {new Array(empty).fill(0).map((_, idx) => (
        <EmptyStar key={idx} />
      ))}
    </div>
  );
};

export default CourseRating;
