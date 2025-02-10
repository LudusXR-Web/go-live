"use client";

import { createId } from "@paralleldrive/cuid2";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";

import { type CourseContent, type CourseSection } from "~/server/db/schema";
import { Button } from "@repo/ui/button";
import { CircleArrowRight, CirclePlusIcon, PlusIcon } from "lucide-react";

type CourseContentStoreState = {
  sections: CourseSection[];
  elements: CourseContent[];
};

type CourseContentStoreActions = {
  addSection: () => void;
};

type CourseContentStore = CourseContentStoreState & CourseContentStoreActions;

export const useCourseContent = create<CourseContentStore>()(
  persist(
    (set) => ({
      sections: [],
      elements: [],

      addSection: () =>
        set((state) => ({
          sections: [
            ...state.sections,
            {
              id: createId(),
              title: `Section ${state.sections.length + 1}`,
              children: [],
            },
          ],
        })),
    }),
    {
      name: "course-content",
    },
  ),
);

const CourseEditor: React.FC = () => {
  const courseContent = useCourseContent();

  return (
    <Tabs className="space-y-3">
      <div>
        <Button
          variant="outline"
          className="px-3 py-1.5 hover:bg-slate-200/50"
          onClick={() => {
            courseContent.addSection();
          }}
        >
          <CirclePlusIcon />
        </Button>
      </div>
      <TabsList disableDefaultStyles className="flex flex-col gap-y-2">
        {courseContent.sections.map((section) => (
          <div
            key={section.id}
            className="flex items-center justify-between rounded border px-3 py-2.5 font-medium"
          >
            {section.title}
            <TabsTrigger
              disableDefaultStyles
              value={section.id}
              className="cursor-pointer"
            >
              <CircleArrowRight />
            </TabsTrigger>
          </div>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default CourseEditor;
