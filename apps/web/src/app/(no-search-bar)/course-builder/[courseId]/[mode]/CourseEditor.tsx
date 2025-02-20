"use client";

import { Fragment } from "react";
import { createId } from "@paralleldrive/cuid2";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CircleArrowRightIcon,
  CirclePlusIcon,
  FileUpIcon,
  ImageUpIcon,
  PlusIcon,
  TrashIcon,
  TypeIcon,
  Undo2Icon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@repo/ui/menubar";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";

import { cn } from "~/lib/utils";
import { type CourseContent, type CourseSection } from "~/server/db/schema";
import RichEditor from "~/components/composites/RichEditor";

type CourseContentStoreState = {
  sections: CourseSection[];
  elements: CourseContent[];
};

type CourseContentStoreActions = {
  loadState: (state: CourseContentStoreState) => void;
  clearState: () => void;

  createSection: () => void;
  deleteSection: (id: string) => void;
  updateSection: (data: CourseSection) => void;
  moveSection: <T extends number>(
    oldIdx: `${T}` extends `-${string}` ? never : T,
    newIdx: `${T}` extends `-${string}` ? never : T,
  ) => void;

  createElement: <T extends number>(
    type: CourseContent["type"],
    sectionId: string,
    insertIndex: `${T}` extends `-${string}` ? never : T,
  ) => void;
  updateElement: (
    id: CourseContent["id"],
    content: CourseContent["content"],
  ) => void;
};

type CourseContentStore = CourseContentStoreState & CourseContentStoreActions;

export const useCourseContent = create<CourseContentStore>()(
  persist(
    (set) => ({
      sections: [] as CourseSection[],
      elements: [] as CourseContent[],

      loadState(state) {
        return set(state);
      },
      clearState() {
        return set({
          sections: [],
          elements: [],
        });
      },

      createSection() {
        return set((state) => ({
          sections: [
            ...state.sections,
            {
              id: createId(),
              title: "",
              children: [],
            },
          ],
        }));
      },
      deleteSection(id) {
        return set((state) => ({
          sections: state.sections.filter((s) => s.id !== id),
        }));
      },
      updateSection(data) {
        return set((state) => {
          const idx = state.sections.findIndex((s) => s.id === data.id);

          if (idx < 0)
            throw new Error(
              "Could not update course section as it does not exist.",
            );

          const newSections = [...state.sections];

          newSections[idx] = data;

          return {
            sections: newSections,
          };
        });
      },
      moveSection(oldIdx, newIdx) {
        return set((state) => {
          const section = state.sections.at(oldIdx)!;
          state.sections.splice(oldIdx, 1);
          state.sections.splice(newIdx, 0, section);

          return {
            sections: state.sections,
          };
        });
      },
      createElement(type, sectionId, insertIndex) {
        return set((state) => {
          const id = (type + "-" + createId()) as CourseContent["id"];
          const section = state.sections.find((s) => s.id === sectionId);

          if (!section)
            throw new Error(
              "Could not create element as its parent section does not exist.",
            );

          section.children.splice(insertIndex, 0, id);

          this.updateSection({
            ...section,
            children: section.children,
          });

          return {
            elements: [
              ...state.elements,
              {
                id,
                type,
                content: "",
              },
            ],
          };
        });
      },
      updateElement(id, content) {
        return set((state) => {
          const idx = state.elements.findIndex((e) => e.id === id);

          if (idx < 0 || !state.elements[idx])
            throw new Error("Cannot update element that does not exist.");

          state.elements[idx].content = content;

          return {
            elements: state.elements,
          };
        });
      },
    }),
    {
      name: "course-content",
    },
  ),
);

type CourseContentTabStore = {
  tab: string;
  setTab: (tab: string) => void;
};

export const useCourseContentTab = create<CourseContentTabStore>()(
  persist(
    (set) => ({
      tab: "sections",
      setTab: (tab: string) => set({ tab }),
    }),
    {
      name: "course-content-tab",
    },
  ),
);

type CreateElementMenuProps<T extends number> = {
  sectionId: string;
  insertIndex?: `${T}` extends `-${string}` ? never : T;
  buttonHidden?: boolean;
};

const CreateElementMenu: React.FC<CreateElementMenuProps<number>> = ({
  sectionId,
  insertIndex = 0,
  buttonHidden,
}) => {
  const courseContent = useCourseContent();

  return (
    <Menubar disableDefaultStyles className="w-full">
      <MenubarMenu>
        <MenubarTrigger disableDefaultStyles asChild>
          <div className="group relative mx-auto flex w-full items-center py-4 select-none">
            <div className="bg-border absolute -z-10 h-0.5 w-full"></div>
            <Button
              variant="outline"
              className={cn(
                "mx-auto rounded-full hover:bg-slate-100 data-[state=open]:bg-slate-100",
                buttonHidden
                  ? "opacity-0 transition-opacity group-hover:opacity-100"
                  : "",
              )}
            >
              <span>Add Element</span>
              <PlusIcon />
            </Button>
          </div>
        </MenubarTrigger>
        <MenubarContent align="center">
          <MenubarItem
            onSelect={() =>
              courseContent.createElement("text", sectionId, insertIndex)
            }
            className="focus:bg-muted flex justify-between transition-colors"
          >
            <span>Text</span>
            <TypeIcon className="opacity-50" size={20} />
          </MenubarItem>
          <MenubarItem
            onSelect={() =>
              courseContent.createElement("image", sectionId, insertIndex)
            }
            className="focus:bg-muted flex justify-between transition-colors"
          >
            <span>Media</span>
            <ImageUpIcon className="opacity-50" size={20} />
          </MenubarItem>
          <MenubarItem
            onSelect={() =>
              courseContent.createElement("attachment", sectionId, insertIndex)
            }
            className="focus:bg-muted flex justify-between transition-colors"
          >
            <span>File</span>
            <FileUpIcon className="opacity-50" size={20} />
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

const CourseEditor: React.FC = () => {
  const courseContent = useCourseContent();
  const { tab, setTab } = useCourseContentTab();

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
                    500,
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
          <h2 className="text-center text-xl font-semibold">{section.title}</h2>
          <div className="pt-2">
            {section.children.length ? (
              <>
                <CreateElementMenu buttonHidden sectionId={section.id} />

                {section.children.map((id, idx) => {
                  const child = courseContent.elements.find((e) => e.id === id);

                  if (!child) return null;

                  switch (child.type) {
                    case "text":
                      return (
                        <div key={id}>
                          <RichEditor
                            defaultContent={child.content}
                            onUpdate={courseContent.updateElement.bind(
                              null,
                              id as CourseContent["id"],
                            )}
                          />
                          <CreateElementMenu
                            buttonHidden={idx + 1 !== section.children.length}
                            insertIndex={idx + 1}
                            sectionId={section.id}
                          />
                        </div>
                      );
                    case "attachment":
                      return null;
                    case "image":
                      return null;
                    default:
                      return null;
                  }
                })}
              </>
            ) : (
              <CreateElementMenu sectionId={section.id} />
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CourseEditor;
