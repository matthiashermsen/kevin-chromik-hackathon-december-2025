import { Button, TextArea } from "@heroui/react";
import { Send } from "lucide-react";
import { useState } from "react";

interface Props {
	addNote: (note: string) => void;
	isLoading: boolean;
}

export function NewNoteContainer({ addNote, isLoading }: Props) {
	const [note, setNote] = useState("");

	function clearInput() {
		setNote("");
	}

	function submit() {
		if (note.trim() === "") {
			return;
		}

		addNote(note);
		clearInput();
	}

	return (
		<div className="flex flex-col gap-2">
			<TextArea
				className="h-32 w-full"
				placeholder="Deine Notizen..."
				value={note}
				onChange={(e) => setNote(e.target.value)}
				disabled={isLoading}
			/>
			<div className="flex justify-end">
				<Button onPress={submit} isDisabled={!note.trim() || isLoading}>
					<Send />
					Hinzufügen
				</Button>
			</div>
		</div>
	);
}
