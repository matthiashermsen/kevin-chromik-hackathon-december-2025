import { Button, Description, ListBox } from "@heroui/react";
import { Trash } from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
	notes: Map<string, string>;
	removeNotes: (noteIDs: string[]) => void;
	isLoading: boolean;
}

export function NotesList({ notes, removeNotes, isLoading }: Props) {
	const [selectedIDs, setSelectedIDs] = useState<Set<string>>(new Set());

	const noteList = useMemo(() => {
		return Array.from(notes, ([id, content]) => ({
			id,
			content,
		})).reverse();
	}, [notes]);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex justify-end">
				<Button
					onPress={() => {
						removeNotes(Array.from(selectedIDs));
						setSelectedIDs(new Set());
					}}
					isDisabled={selectedIDs.size === 0 || isLoading}
					variant={selectedIDs.size === 0 ? "danger-soft" : "danger"}
				>
					<Trash />
					Entfernen
				</Button>
			</div>
			<ListBox
				selectionMode="multiple"
				onSelectionChange={(selectedKeys) =>
					setSelectedIDs(selectedKeys as Set<string>)
				}
			>
				{noteList.map((note) => (
					<ListBox.Item id={note.id} key={note.id} isDisabled={isLoading}>
						<Description className="whitespace-pre-wrap">
							{note.content}
						</Description>
						<ListBox.ItemIndicator />
					</ListBox.Item>
				))}
			</ListBox>
		</div>
	);
}
