export type Role = "child" | "parent";

export type HomeworkStatus = "todo" | "submitted" | "approved" | "rejected";

export const SUBJECTS = [
  "Maths",
  "Français",
  "Anglais",
  "Histoire-Géo",
  "SVT",
  "Physique-Chimie",
  "Technologie",
  "Arts plastiques",
  "Musique",
  "EPS",
  "Autre",
] as const;

export interface Family {
  name: string;
  childName: string;
  parentPinHash: string;
  childPinHash: string;
  createdAt: string;
}

export interface Homework {
  id: string;
  title: string;
  subject: string;
  statement: string;
  notes: string;
  dueDate: string;
  requestedScreenMinutes: number;
  status: HomeworkStatus;
  photoFilename: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewComment: string;
  grantedScreenMinutes: number | null;
  grantedAt: string | null;
  createdAt: string;
}

export interface StoreData {
  family: Family | null;
  homework: Homework[];
}

export interface SessionPayload {
  role: Role;
  exp: number;
}

export interface PublicHomework extends Omit<Homework, never> {
  photoUrl: string | null;
}

export const FAMILY_SAFETY_URL = "https://account.microsoft.com/family";
