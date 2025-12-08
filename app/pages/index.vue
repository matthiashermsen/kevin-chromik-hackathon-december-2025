<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { StructuredNotes } from "../../shared/StructuredNotes";

interface NoteOption {
	noteID: string;
	noteText: string;
}

const newNote = ref("");
const notes = ref<Map<string, string>>(new Map());
const selectedNotes = ref<NoteOption[]>([]);
const structuredNotes = ref<StructuredNotes>({});
const isStructuringNotes = ref(false);
const hasStructuringNotesFailed = ref(false);

const iterableNotes = computed<NoteOption[]>(() =>
	Array.from(notes.value.entries()).map(([noteID, noteText]) => ({
		noteID,
		noteText,
	})),
);

watch(
	notes,
	() => {
		structuredNotes.value = {};
		isStructuringNotes.value = false;
		hasStructuringNotesFailed.value = false;
	},
	{ deep: true },
);

function addNote() {
	if (!newNote.value) {
		return;
	}

	notes.value.set(crypto.randomUUID(), newNote.value);

	newNote.value = "";
}

function removeSelectedNotes() {
	for (const selectedNote of selectedNotes.value) {
		notes.value.delete(selectedNote.noteID);
	}

	selectedNotes.value = [];
}

async function structureNotes() {
	isStructuringNotes.value = true;

	try {
		const response = await $fetch("/api/structure-notes", {
			method: "POST",
			body: Array.from(notes.value.values()),
		});

		structuredNotes.value = response ?? {};
		hasStructuringNotesFailed.value = false;
	} catch {
		hasStructuringNotesFailed.value = true;
		structuredNotes.value = {};
	} finally {
		isStructuringNotes.value = false;
	}
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <Listbox
            v-model="selectedNotes"
            :options="iterableNotes"
            multiple
            optionLabel="noteText"
            checkmark
            fluid
            emptyMessage="Hier landen deine Notizen"
            :disabled="isStructuringNotes"
        >
            <template #header>
                <div class="flex flex-col gap-2">
                    <div class="flex justify-end">
                        <Button
                            label="Notizen verwerfen"
                            icon="pi pi-trash"
                            severity="danger"
                            :disabled="
                                selectedNotes.length === 0 || isStructuringNotes
                            "
                            @click="removeSelectedNotes"
                        />
                    </div>
                    <div class="flex gap-2 items-center">
                        <FloatLabel>
                            <InputText
                                id="new-note-input-label"
                                v-model="newNote"
                                fluid
                                :disabled="isStructuringNotes"
                                enterkeyhint="enter"
                                @keyup.enter="addNote"
                            />
                            <label for="new-note-input-label">Notiz</label>
                        </FloatLabel>
                        <Button
                            label="Notieren"
                            icon="pi pi-plus"
                            :disabled="!newNote || isStructuringNotes"
                            @click="addNote"
                        />
                    </div>
                </div>
            </template>
        </Listbox>
        <div class="flex justify-end">
            <Button
                label="Einkaufsliste strukturieren"
                icon="pi pi-cog"
                :disabled="iterableNotes.length === 0 || isStructuringNotes"
                :loading="isStructuringNotes"
                @click="structureNotes"
            />
        </div>
        <Card v-if="Object.keys(structuredNotes).length > 0">
            <template #title>
                <span>Deine strukturierte Einkaufsliste</span>
            </template>
            <template #content>
                <div class="flex flex-col gap-4">
                    <div v-for="(groupEntries, groupName) in structuredNotes" class="flex flex-col gap-4">
                        <div :key="groupName">{{ groupName }}</div>
                        <div v-for="groupEntry in groupEntries ?? []" :key="`${groupName}-${groupEntry}`" class="ml-4">- {{ groupEntry }}</div>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="flex flex-col lg:flex-row justify-between items-center gap-2">
                    <CopyStructuredNotesToClipboardButton :structured-notes="structuredNotes" />
                    <ShareStructuredNotesButton :structured-notes="structuredNotes" />
                </div>
            </template>
        </Card>
    </div>
</template>
