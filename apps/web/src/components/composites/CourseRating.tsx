import { StarIcon } from "lucide-react";

const EmptyStar = () => <StarIcon />;
const FilledStar = () => <StarIcon className="fill-amber-300" />;

const CourseRating: React.FC = () => {
  return (
    <div role="progressbar" className="flex w-fit gap-1">
      <FilledStar />
      <FilledStar />
      <EmptyStar />
      <EmptyStar />
      <EmptyStar />
    </div>
  );
};

export default CourseRating;
