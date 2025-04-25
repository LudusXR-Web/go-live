"use client";

import { useEffect } from "react";

import type { usersToCourses } from "~/server/db/schema";
import { api } from "~/trpc/react";

type ViewCheckerProps = typeof usersToCourses.$inferSelect & {
  sectionId: string;
};

const ViewChecker: React.FC<ViewCheckerProps> = ({
  sectionId,
  sectionsViewed,
  ...key
}) => {
  const viewMutation = api.courses.updateEnrolment.useMutation();

  useEffect(() => {
    const updatedSectionsViewed = new Set(sectionsViewed);
    updatedSectionsViewed.add(sectionId);

    return () =>
      viewMutation.mutate({
        ...key,
        sectionsViewed: [...updatedSectionsViewed],
      });
  }, []);

  return null;
};

export default ViewChecker;
