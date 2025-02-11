"use client";

import { createId } from "@paralleldrive/cuid2";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CircleArrowRightIcon,
  CirclePlusIcon,
  TrashIcon,
  Undo2Icon,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";

import { type CourseContent, type CourseSection } from "~/server/db/schema";
import { useEffect, useState } from "react";

type CourseContentStoreState = {
  sections: CourseSection[];
  elements: CourseContent[];
};

type CourseContentStoreActions = {
  createSection: () => void;
  deleteSection: (id: string) => void;
};

type CourseContentStore = CourseContentStoreState & CourseContentStoreActions;

export const useCourseContent = create<CourseContentStore>()(
  persist(
    (set) => ({
      sections: [] as CourseSection[],
      elements: [] as CourseContent[],

      createSection: () =>
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
      deleteSection: (id) =>
        set((state) => ({
          sections: state.sections.filter((s) => s.id !== id),
        })),
    }),
    {
      name: "course-content",
    },
  ),
);

const CourseEditor: React.FC = () => {
  const courseContent = useCourseContent();
  const [tab, setTab] = useState("sections");

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-3">
      <TabsList disableDefaultStyles>
        {tab === "sections" ? (
          <Button
            variant="outline"
            className="px-3 py-1.5 hover:bg-slate-200/50"
            onClick={() => {
              courseContent.createSection();
            }}
          >
            <span className="sr-only">Create new section</span>
            <CirclePlusIcon />
          </Button>
        ) : (
          <TabsTrigger
            asChild
            disableDefaultStyles
            value="sections"
            className="cursor-pointer"
          >
            <Button
              variant="outline"
              className="px-3 py-1.5 hover:bg-slate-200/50"
            >
              <span className="sr-only">Return to the list of sections</span>
              <Undo2Icon />
            </Button>
          </TabsTrigger>
        )}
      </TabsList>
      <TabsList disableDefaultStyles className="flex flex-col gap-y-2">
        {courseContent.sections.map((section, idx) => (
          <div
            key={section.id}
            className="flex items-center justify-between gap-3 rounded border px-3 py-2.5 font-medium"
          >
            <Input
              maxLength={140}
              placeholder={`Section ${idx + 1}`}
              className="placeholder:italic"
            />
            <button
              onClick={() => courseContent.deleteSection(section.id)}
              className="cursor-pointer rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-100"
            >
              <span className="sr-only">Delete section {section.title}</span>

              <TrashIcon />
            </button>
            <TabsTrigger
              asChild
              disableDefaultStyles
              value={section.id}
              className="cursor-pointer"
            >
              <button className="rounded-md p-1.5 transition-colors hover:bg-slate-200/50">
                <span className="sr-only">Edit section {section.title}</span>
                <CircleArrowRightIcon />
              </button>
            </TabsTrigger>
          </div>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default CourseEditor;
