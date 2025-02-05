import { type PropsWithChildren } from "react";
import { type Session } from "next-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";

import CourseDetailsForm from "~/components/forms/CourseDetailsForm";

type NewCourseModalProps = {
  session: Session;
} & PropsWithChildren;

const NewCourseModal: React.FC<NewCourseModalProps> = ({
  session,
  children,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create your new course!</DialogTitle>
          <DialogDescription>
            The fields below will impact the way your course shows up in search
            results and the way it is promoted on the platform. Your teaching
            journey starts here!
          </DialogDescription>
        </DialogHeader>
        <CourseDetailsForm serverSession={session} />
      </DialogContent>
    </Dialog>
  );
};

export default NewCourseModal;
