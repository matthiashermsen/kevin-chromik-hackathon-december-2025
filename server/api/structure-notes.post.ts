import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { structuredNotesSchema } from "../../shared/structuredNotesSchema";

const runtimeConfig = useRuntimeConfig();

export default defineEventHandler(async (event) => {
	try {
		const { geminiAPIKey } = runtimeConfig;

		if (!geminiAPIKey) {
			sendError(
				event,
				createError({
					statusCode: 500,
					statusMessage: "Missing API key.",
				}),
			);

			return;
		}

		const notes = await readBody<string[]>(event);

		const ai = new GoogleGenAI({
			apiKey: geminiAPIKey,
		});

		const response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: [
				{
					role: "user",
					parts: [
						{
							text: `Hier sind die Notizen, die du strukturieren sollst: ${notes.join()}`,
						},
					],
				},
			],
			config: {
				systemInstruction: `
          Du bist ein hilfreicher Assistent, der vom User eine Liste von Notizen bekommt.
          Diese Notizen sollen insgesamt eine Einkaufsliste darstellen.
          Du sollst versuchen, diese Einkaufsliste nach Effizienz zu strukturieren.

          In dieser Einkaufsliste gruppierst du die einzelnen Sorten, beispielsweise packst du Gemüse zu Gemüse, Süßigkeiten zu Süßigkeiten etc.
          Für die jeweilige Gruppe wählst du ein passendes Emoji.

          Dinge, die du nicht einordnen konntest, packst du in eine separate Gruppe und denkst dir auch hierfür ein Emoji aus, um auszudrücken, dass du damit nichts anfangen konntest.

          Die Gruppierung soll dafür sorgen, dass man beim Einkaufen einen effizienten Weg hat und nicht erst Gemüse kauft, dann zu den Süßgkeiten geht und dann wieder zum Gemüse zurück muss.
          Da sich beispielsweise Gemüse meist am Anfang befindet und Süßigkeiten eher weiter hinten, solltest du auch das berücksichtigen.

          Erstelle für dein Ergebnis eine JSON Struktur, genauer gesagt ein Objekt.
          Der Key ist immer das jeweilige Emoji der Gruppe.
          Der Value ist ein Array von Strings.
          Jeder String ist ein Eintrag für die jeweilige Gruppe, also beispielsweise '3 Tomaten'.
          Du kannst als Eintrag verschiedene Informationen reinschreiben, also Name, Anzahl, etc., beispielsweise 'Sprudelwasser, 3x 1l Flaschen'.

          Dein Ergebnis sollte also diese Struktur haben

          {
						"emoji": [
							"name, quantity,..."
						]
					}

					also beispielsweise

					{
						"💧": [
							"Sprudelwasser, 3x 1l Flaschen"
						],
						"🍞": [
							"Toastbrot, 1 Packung",
							"Vollkornbrot, 1 Packung"
						]
					}

					Sobald du das Ergebnis hast, antworte exakt NUR mit diesem Ergebnis als JSON.
					Das Ergebnis soll per JSON Parse direkt programmatisch weiterverarbeitet werden, schicke deswegen ausschließlich das JSON Objekt und keinem weiteren Text!
        `,
			},
		});

		// this model might wrap the answer inside a JSON codeblock so we have to remove the backticks first
		const responseTextWithoutCodeblock = (response.text ?? "")
			.replace(/^\s*```(json)?\s*/i, "")
			.replace(/\s*```\s*$/, "");

		const rawResponse = JSON.parse(responseTextWithoutCodeblock);

		const result = z.parse(structuredNotesSchema, rawResponse);

		return result;
	} catch (error) {
		console.error(error);

		sendError(
			event,
			createError({
				statusCode: 500,
				statusMessage: "Something failed.",
			}),
		);
	}
});
