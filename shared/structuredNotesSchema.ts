import { z } from "zod";

const structuredNotesSchema = z.record(
	z.string().nonempty(),
	z.array(z.string().nonempty()),
);

export { structuredNotesSchema };
