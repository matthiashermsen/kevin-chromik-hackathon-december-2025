import type { z } from "zod";
import type { structuredNotesSchema } from "./structuredNotesSchema";

type StructuredNotes = z.infer<typeof structuredNotesSchema>;

export type { StructuredNotes };
