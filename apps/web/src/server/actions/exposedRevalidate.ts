"use server";

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Exposes revalidatePath to the client via a server action.
 * @param originalPath The path to be revalidated.
 * @param type "layout" | "page"
 */
export async function exposedRevalidatePath(
  originalPath: string,
  type?: "layout" | "page",
) {
  revalidatePath(originalPath, type);
}

/**
 * Exposes revalidateTag to the client via a server action.
 * @param tag The tag to be revalidated.
 */
export async function exposedRevalidateTag(tag: string) {
  revalidateTag(tag);
}
