"use client";

import { createId } from "@paralleldrive/cuid2";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CircleArrowRightIcon,
  CirclePlusIcon,
  TrashIcon,
  Undo2Icon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
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
  updateSection: (data: CourseSection) => void;
  moveSection: <T extends number>(
    oldIdx: `${T}` extends `-${string}` ? never : T,
    newIdx: `${T}` extends `-${string}` ? never : T,
  ) => void;
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
              title: "",
              children: [],
            },
          ],
        })),
      deleteSection: (id) =>
        set((state) => ({
          sections: state.sections.filter((s) => s.id !== id),
        })),
      updateSection: (data) =>
        set((state) => {
          const idx = state.sections.findIndex((s) => s.id === data.id);
          const newSections = [...state.sections];

          newSections[idx] = data;

          return {
            sections: newSections,
          };
        }),
      moveSection: (oldIdx, newIdx) =>
        set((state) => {
          const section = state.sections.at(oldIdx)!;
          state.sections.splice(oldIdx, 1);
          state.sections.splice(newIdx, 0, section);

          return {
            sections: state.sections,
          };
        }),
    }),
    {
      name: "course-content",
    },
  ),
);

const CourseEditor: React.FC = () => {
  const courseContent = useCourseContent();
  const [tab, setTab] = useState("sections");

  let timer: NodeJS.Timeout;

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-3">
      <TabsList disableDefaultStyles>
        {tab === "sections" ? (
          <Button
            variant="outline"
            className="px-3 py-1.5 hover:bg-slate-200/50"
            onClick={courseContent.createSection}
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
      <TabsContent value="sections">
        <TabsList disableDefaultStyles className="flex flex-col gap-y-2">
          {courseContent.sections.map((section, idx) => (
            <div
              key={section.id}
              className="flex items-center justify-between gap-3 py-2.5 font-medium"
            >
              {idx === 0 ? (
                <button
                  onClick={() => courseContent.moveSection(idx, idx + 1)}
                  className="rounded-md border px-[1.375rem] py-1.5 transition-colors hover:bg-slate-200/50"
                >
                  <span className="sr-only">
                    Move down section {section.title}
                  </span>
                  <ArrowDownIcon size={20} />
                </button>
              ) : idx === courseContent.sections.length - 1 ? (
                <button
                  onClick={() => courseContent.moveSection(idx, idx - 1)}
                  className="rounded-md border px-[1.375rem] py-1.5 transition-colors hover:bg-slate-200/50"
                >
                  <span className="sr-only">
                    Move up section {section.title}
                  </span>
                  <ArrowUpIcon size={20} />
                </button>
              ) : (
                <span className="flex rounded-md border">
                  <button
                    onClick={() => courseContent.moveSection(idx, idx - 1)}
                    className="p-1.5 transition-colors hover:bg-slate-200/50"
                  >
                    <span className="sr-only">
                      Move up section {section.title}
                    </span>
                    <ArrowUpIcon size={20} />
                  </button>
                  <button
                    onClick={() => courseContent.moveSection(idx, idx + 1)}
                    className="p-1.5 transition-colors hover:bg-slate-200/50"
                  >
                    <span className="sr-only">
                      Move down section {section.title}
                    </span>
                    <ArrowDownIcon size={20} />
                  </button>
                </span>
              )}
              <Input
                maxLength={140}
                placeholder={`Section ${idx + 1}`}
                defaultValue={section.title}
                className="placeholder:italic"
                onChange={(e) => {
                  if (timer) clearTimeout(timer);

                  timer = setTimeout(
                    () =>
                      courseContent.updateSection({
                        ...section,
                        title: e.target.value ?? "",
                      }),
                    750,
                  );
                }}
              />
              <button
                onClick={() => courseContent.deleteSection(section.id)}
                className="cursor-pointer rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-100"
              >
                <span className="sr-only">Delete section {section.title}</span>

                <TrashIcon size={20} />
              </button>
              <TabsTrigger
                asChild
                disableDefaultStyles
                value={section.id}
                className="cursor-pointer"
              >
                <button className="rounded-md p-1.5 transition-colors hover:bg-slate-200/50">
                  <span className="sr-only">Edit section {section.title}</span>
                  <CircleArrowRightIcon size={20} />
                </button>
              </TabsTrigger>
            </div>
          ))}
        </TabsList>
      </TabsContent>
      {courseContent.sections.map((section) => (
        <TabsContent value={section.id} key={section.id}>
          <h2>{section.title}</h2>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CourseEditor;
