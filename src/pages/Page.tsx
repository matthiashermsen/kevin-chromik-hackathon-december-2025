import { Alert, Button, Card, Modal, Spinner } from "@heroui/react";
import { Shuffle, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { NewNoteContainer } from "../components/NewNoteContainer";
import { NotesList } from "../components/NotesList";
import { useWebLLM } from "../hooks/useWebLLM";

export function Page() {
	const [notes, setNotes] = useState<Map<string, string>>(new Map());
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isStructuringNotes, setIsStructuringNotes] = useState(false);
	const {
		isCreatingEngine,
		hasEngineBeenCreated,
		initialize,
		chat,
		hasInitialisationFailed,
	} = useWebLLM();
	const [hasStructuringFailed, setHasStructuringFailed] = useState(false);
	const [structuredNotes, setStructuredNotes] = useState<
		Record<string, string[]>
	>({});

	function addNote(note: string) {
		const noteID = crypto.randomUUID();

		setNotes((currentNotes) => {
			const newNotes = new Map(currentNotes);
			newNotes.set(noteID, note);

			return newNotes;
		});

		setStructuredNotes({});
	}

	function removeNotes(noteIDs: string[]) {
		setNotes((currentNotes) => {
			const newNotes = new Map(currentNotes);

			for (const noteID of noteIDs) {
				newNotes.delete(noteID);
			}

			return newNotes;
		});

		setStructuredNotes({});
	}

	async function initializeModel() {
		setIsModalOpen(false);
		await initialize();

		setStructuredNotes({});
	}

	async function structureNotes() {
		setIsModalOpen(false);
		setIsStructuringNotes(true);

		try {
			const reply = await chat([
				{
					role: "system",
					content: `
					Du bist ein hilfreicher Assistent, du bekommst vom User eine Liste an Notizen und versuchst diese in eine effiziente Struktur zu bringen.
					Dabei schaust du dir alle Notizen an und erstellst eine logische Einkaufsliste.
					In dieser Einkaufsliste gruppierst du die einzelnen Sorten, beispielsweise Gemüse zu Gemüse, Süßigkeiten zu Süßigkeiten etc.
					Für eine jeweilige Gruppe denkst du dir noch ein passendes Emoji aus.
					Dinge, die du nicht einordnen konntest, packst du in eine separate Gruppe und denkst dir auch dafür ein Emoji aus, um auszudrücken, dass du damit nichts anfangen konntest.
					
					Erstelle für ein Ergebnis einen Record<string, string[]>
					Der Key ist das Gruppen Emoji
					Der Value ist eine Liste von Gruppeneinträgen
					Pro Eintrag schreibst du sowas rein wie Name, Anzahl, ... also Beispielsweise 'Sprudelwasser, 3x 1l Flaschen'

					Im Supermarkt befindet sich beispielsweise das Gemüse meist vorne, die Süßigkeiten sind weiter hinten.
					Anhand der Notizen wäre es ungünstig, erst einen Blumenkohl zu holen, dann Schokolade und dann eine Gurke.
					Ebenso wäre es bei deinem Ergebnis ungünstig, wenn man erst die Schokolade und dann das Gemüse holt. 
					Dein Ergebnis sollte das berücksichtigen, damit man keine unnötigen Laufwege hat.

					Das Ergebnis sollte also grob dieses Schema haben

					{
						"emoji": [
							"name, quantity,..."
						]
					}

					Sobald du das hast, antworte exakt mit diesem Ergebnis als JSON, also beispielsweise

					{
						"💧": [
							"Sprudelwasser, 3x 1l Flaschen"
						],
						"🍞": [
							"Toastbrot, 1 Packung",
							"Vollkornbrot, 1 Packung"
						]
					}
					`,
				},
				{ role: "user", content: JSON.stringify(Array.from(notes.values())) },
			]);

			const newStructuredNotes = JSON.parse(
				reply.choices[0]?.message.content ?? "",
			);

			// Debug
			console.info(newStructuredNotes);

			setStructuredNotes(newStructuredNotes);

			setHasStructuringFailed(false);
		} catch (error) {
			console.error(error);
			setHasStructuringFailed(true);
			setStructuredNotes({});
		} finally {
			setIsStructuringNotes(false);
		}
	}

	return (
		<div className="flex justify-center">
			<Card className="w-md md:w-lg lg:w-xl xl:w-2xl" variant="transparent">
				<Card.Header>
					<Card.Title className="text-center">
						Strukturiere deine Einkaufsliste!
					</Card.Title>
				</Card.Header>
				<Card.Content className="flex flex-col gap-32">
					<NewNoteContainer
						addNote={addNote}
						isLoading={isStructuringNotes || isCreatingEngine}
					/>
					<NotesList
						notes={notes}
						removeNotes={removeNotes}
						isLoading={isStructuringNotes || isCreatingEngine}
					/>
				</Card.Content>
				<Card.Footer className="flex flex-col gap-2">
					<Modal>
						<Button
							onPress={() =>
								hasEngineBeenCreated ? structureNotes() : setIsModalOpen(true)
							}
							isDisabled={
								notes.size === 0 || isStructuringNotes || isCreatingEngine
							}
							className="w-full"
							isPending={isStructuringNotes || isCreatingEngine}
						>
							{({ isPending }) => (
								<>
									{isPending ? (
										<Spinner color="current" size="sm" />
									) : (
										<Shuffle />
									)}
									{isPending
										? hasEngineBeenCreated
											? "Strukturiere..."
											: "Initialisiere Model"
										: "Strukturieren"}
								</>
							)}
						</Button>
						<Modal.Container isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
							<Modal.Dialog>
								<Modal.CloseTrigger />
								<Modal.Header>
									<Modal.Icon>
										<TriangleAlert />
									</Modal.Icon>
									<Modal.Heading>
										Diese App verwendet eine lokale AI mithilfe von WebLLM
									</Modal.Heading>
								</Modal.Header>
								<Modal.Body>
									Dabei wird ein lokal ausführbares Sprachmodell geladen. Deine
									Daten bleiben also auf dem Gerät, es gibt keine externen API
									Calls. Dennoch kann das initiale Laden einige hundert MB
									betragen!
								</Modal.Body>
								<Modal.Footer>
									<Button onPress={initializeModel} className="w-full">
										Model laden
									</Button>
								</Modal.Footer>
							</Modal.Dialog>
						</Modal.Container>
					</Modal>
					{hasInitialisationFailed && (
						<Alert status="danger">
							<Alert.Indicator />
							<Alert.Content>
								<Alert.Title>
									Beim Laden des Models ging etwas schief
								</Alert.Title>
								<Alert.Description>
									Möglicherweise wird WebGPU in deiner aktuellen Umgebung nicht
									unterstützt.
								</Alert.Description>
							</Alert.Content>
						</Alert>
					)}
					{hasStructuringFailed && (
						<Alert status="danger">
							<Alert.Indicator />
							<Alert.Content>
								<Alert.Title>Beim Strukturieren ging etwas schief</Alert.Title>
							</Alert.Content>
						</Alert>
					)}
					{Object.entries(structuredNotes).map(([groupName, items]) => (
						<div key={groupName}>
							<div>{groupName}</div>
							{items.map((item) => (
								<div key={`${groupName}-${item}`}>{item}</div>
							))}
						</div>
					))}
				</Card.Footer>
			</Card>
		</div>
	);
}
