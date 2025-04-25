"use client";

import { type PropsWithChildren, useEffect, useMemo, useState } from "react";
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
  Loader2Icon,
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
import { api } from "~/trpc/react";
import { type CourseContent, type CourseSection } from "~/server/db/schema";
import RichEditor from "~/components/composites/RichEditor";
import ConfirmationModal from "~/components/modals/ConfirmationModal";
import ChangeImageElement from "~/components/media-uploaders/ChangeImageElement";
import ChangeFileElement from "~/components/media-uploaders/ChangeFileElement";

type PendingUpload = {
  id: string;
  execute: () => Promise<void> | void;
};

type CourseContentStoreState = {
  courseId: string;
  sections: CourseSection[];
  elements: CourseContent[];
};

type CourseContentStoreActions = {
  loadState: (state: CourseContentStoreState) => void;
  clearState: () => void;

  pendingUploads: PendingUpload[];
  createPendingUpload: (
    id: string,
    uploadFunction: () => Promise<void> | void,
  ) => void;
  deletePendingUpload: (id: string) => void;
  clearPendingUploads: () => void;

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
  deleteElement: (id: string) => void;
  updateElement: (
    id: CourseContent["id"],
    content: CourseContent["content"],
  ) => void;
  moveElement: <T extends number>(
    id: string,
    oldIdx: `${T}` extends `-${string}` ? never : T,
    newIdx: `${T}` extends `-${string}` ? never : T,
  ) => void;
};

type CourseContentStore = CourseContentStoreState & CourseContentStoreActions;

export const useCourseContent = create<CourseContentStore>()(
  persist(
    (set) => ({
      courseId: "",
      sections: [] as CourseSection[],
      elements: [] as CourseContent[],

      pendingUploads: [] as PendingUpload[],
      createPendingUpload(id, uploadFunction) {
        return set((state) => {
          const uploadIdx = state.pendingUploads.findIndex((u) => u.id === id);

          if (uploadIdx >= 0) {
            state.pendingUploads[uploadIdx]!.execute = uploadFunction;
          } else {
            state.pendingUploads.push({ id, execute: uploadFunction });
          }

          return {
            pendingUploads: state.pendingUploads,
          };
        });
      },
      deletePendingUpload(id) {
        return set((state) => {
          const uploadIdx = state.pendingUploads.findIndex((u) => u.id === id);

          if (uploadIdx < 0) return {};

          state.pendingUploads.splice(uploadIdx, 1);

          return {
            pendingUploads: state.pendingUploads,
          };
        });
      },
      clearPendingUploads() {
        return set({ pendingUploads: [] });
      },

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
      deleteElement(id: string) {
        return set((state) => {
          const elementIdx = state.elements.findIndex((e) => e.id === id);
          const sectionIdx = state.sections.findIndex((s) =>
            s.children.some((c) => c === id),
          );
          const elementIdxInSection =
            state.sections[sectionIdx]!.children.indexOf(id);

          state.elements.splice(elementIdx, 1);
          state.sections[sectionIdx]!.children.splice(elementIdxInSection, 1);

          this.deletePendingUpload(id);

          return {
            sections: state.sections,
            elements: state.elements,
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
      moveElement(id, oldIdx, newIdx) {
        return set((state) => {
          const sectionIdx = state.sections.findIndex((s) =>
            s.children.some((c) => c === id),
          );
          state.sections.at(sectionIdx)!.children.splice(oldIdx, 1);
          state.sections.at(sectionIdx)!.children.splice(newIdx, 0, id);

          return {
            sections: state.sections,
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
  resetTab: () => void;
};

export const useCourseContentTab = create<CourseContentTabStore>()(
  persist(
    (set) => ({
      tab: "sections",
      setTab: (tab) => set({ tab }),
      resetTab: () => set({ tab: "sections" }),
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
                "mx-auto rounded-full transition-all group-data-[state=open]:bg-slate-100 hover:bg-slate-100",
                buttonHidden
                  ? "opacity-0 group-hover:opacity-100 group-data-[state=open]:opacity-100"
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
            <span>Image</span>
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

type CourseElementProps = {
  section: CourseSection;
  element: CourseContent;
  index: number;
} & PropsWithChildren;

const CourseElement: React.FC<CourseElementProps> = ({
  section,
  element,
  index: idx,
  children,
}) => {
  const courseContent = useCourseContent();

  return (
    <div>
      <div className="flex items-center gap-x-2">
        {children}
        <div className="flex shrink flex-col gap-y-1.5">
          <button
            disabled={idx === 0}
            onClick={() => courseContent.moveElement(element.id, idx, idx - 1)}
            className="rounded-md border px-[1.375rem] py-1.5 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="sr-only">Move up text element</span>
            <ArrowUpIcon size={20} />
          </button>

          {element.content.length > 10 ? (
            <ConfirmationModal
              question="Are you sure you want to delete this element?"
              onConfirm={courseContent.deleteElement.bind(null, element.id)}
            >
              <button className="rounded-md border border-red-100 px-[1.375rem] py-1.5 text-red-400 transition-colors hover:bg-red-100 disabled:pointer-events-none disabled:opacity-50">
                <span className="sr-only">Remove text element</span>
                <TrashIcon size={20} />
              </button>
            </ConfirmationModal>
          ) : (
            <button
              onClick={() => courseContent.deleteElement(element.id)}
              className="rounded-md border border-red-100 px-[1.375rem] py-1.5 text-red-400 transition-colors hover:bg-red-100 disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="sr-only">Remove text element</span>
              <TrashIcon size={20} />
            </button>
          )}

          <button
            disabled={idx === section.children.length - 1}
            onClick={() => courseContent.moveElement(element.id, idx, idx + 1)}
            className="rounded-md border px-[1.375rem] py-1.5 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="sr-only">Move down text element</span>
            <ArrowDownIcon size={20} />
          </button>
        </div>
      </div>
      <CreateElementMenu
        buttonHidden={idx + 1 !== section.children.length}
        insertIndex={idx + 1}
        sectionId={section.id}
      />
    </div>
  );
};

type CourseEditorProps = {
  course: CourseContentStoreState;
};

const CourseEditor: React.FC<CourseEditorProps> = ({
  course: defaultCourse,
}) => {
  const [course, setCourse] = useState(defaultCourse);

  const courseContent = useCourseContent();
  const { tab, setTab, resetTab } = useCourseContentTab();
  const updateContentMutation = api.courses.updateContent.useMutation({
    onSuccess() {
      courseContent.clearPendingUploads();
    },
  });

  const RichEditorMemo = useMemo(() => RichEditor, []);

  let timer: NodeJS.Timeout;

  useEffect(() => {
    resetTab();
    courseContent.loadState(course);
  }, []);

  async function saveCourseContent() {
    for (const upload of courseContent.pendingUploads) {
      await upload.execute();
    }

    courseContent.clearPendingUploads();

    await updateContentMutation.mutateAsync(courseContent);

    setCourse((state) => ({
      ...state,
      sections: courseContent.sections,
      elements: courseContent.elements,
    }));
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="min-h-fit space-y-3">
      <TabsList
        disableDefaultStyles
        className="flex items-center justify-between gap-2"
      >
        {tab === "sections" ? (
          <Button
            variant="outline"
            className="px-3 py-1.5 hover:bg-slate-100"
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
              className="px-3 py-1.5 hover:bg-slate-100"
            >
              <span className="sr-only">Return to the list of sections</span>
              <Undo2Icon />
            </Button>
          </TabsTrigger>
        )}
        <div className="space-x-2">
          <Button
            variant="outline"
            className="inline hover:bg-slate-100"
            onClick={() => courseContent.loadState(course)}
          >
            Reset
          </Button>
          <Button
            disabled={updateContentMutation.isPending}
            className={updateContentMutation.isPending ? "px-[2.5ch]" : ""}
            onClick={saveCourseContent}
          >
            {updateContentMutation.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
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
                  className="rounded-md border px-[1.375rem] py-1.5 transition-colors hover:bg-slate-100"
                >
                  <span className="sr-only">
                    Move down section {section.title}
                  </span>
                  <ArrowDownIcon size={20} />
                </button>
              ) : idx === courseContent.sections.length - 1 ? (
                <button
                  onClick={() => courseContent.moveSection(idx, idx - 1)}
                  className="rounded-md border px-[1.375rem] py-1.5 transition-colors hover:bg-slate-100"
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
                    className="p-1.5 transition-colors hover:bg-slate-100"
                  >
                    <span className="sr-only">
                      Move up section {section.title}
                    </span>
                    <ArrowUpIcon size={20} />
                  </button>
                  <button
                    onClick={() => courseContent.moveSection(idx, idx + 1)}
                    className="p-1.5 transition-colors hover:bg-slate-100"
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
              {section.children.length ? (
                <ConfirmationModal
                  question={
                    <>
                      Are you sure you wish to delete section
                      <br />
                      &quot;{section.title}&quot;?
                    </>
                  }
                  onConfirm={courseContent.deleteSection.bind(null, section.id)}
                >
                  <button className="cursor-pointer rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-100">
                    <span className="sr-only">
                      Delete section {section.title}
                    </span>

                    <TrashIcon size={20} />
                  </button>
                </ConfirmationModal>
              ) : (
                <button
                  onClick={() => courseContent.deleteSection(section.id)}
                  className="cursor-pointer rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-100"
                >
                  <span className="sr-only">
                    Delete section {section.title}
                  </span>

                  <TrashIcon size={20} />
                </button>
              )}
              <TabsTrigger
                asChild
                disableDefaultStyles
                value={section.id}
                className="cursor-pointer"
              >
                <button className="rounded-md p-1.5 transition-colors hover:bg-slate-100">
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
                  const element = courseContent.elements.find(
                    (e) => e.id === id,
                  );

                  if (!element) return null;

                  switch (element.type) {
                    case "text":
                      return (
                        <CourseElement
                          key={id}
                          section={section}
                          element={element}
                          index={idx}
                        >
                          <RichEditorMemo
                            className="min-h-[7rem]"
                            containerClassName="grow"
                            placeholder="What is this section about?"
                            defaultContent={element.content}
                            onUpdate={courseContent.updateElement.bind(
                              null,
                              element.id,
                            )}
                          />
                        </CourseElement>
                      );
                    case "image":
                      return (
                        <CourseElement
                          key={id}
                          section={section}
                          element={element}
                          index={idx}
                        >
                          <ChangeImageElement element={element} />
                        </CourseElement>
                      );
                    case "attachment":
                      return (
                        <CourseElement
                          key={id}
                          section={section}
                          element={element}
                          index={idx}
                        >
                          <ChangeFileElement element={element} />
                        </CourseElement>
                      );
                    default:
                      courseContent.deleteElement(id);
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
