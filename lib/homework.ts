import type { Homework, PublicHomework } from "./types";

export function toPublic(item: Homework): PublicHomework {
  return {
    ...item,
    photoUrl: item.photoFilename ? `/api/photos/${item.id}` : null,
  };
}

export const STATUS_LABEL: Record<Homework["status"], string> = {
  todo: "À faire",
  submitted: "En attente parent",
  approved: "Validé",
  rejected: "À reprendre",
};
