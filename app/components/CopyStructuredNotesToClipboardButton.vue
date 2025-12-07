<script setup lang="ts">
import { computed, ref } from "vue";
import type { StructuredNotes } from "../../shared/StructuredNotes";

const props = defineProps<{
	structuredNotes: StructuredNotes;
}>();

const toast = useToast();

const isCopyingToClipboard = ref(false);

const stringifiedStructuredNotes = computed(() =>
	Object.entries(props.structuredNotes)
		.map(
			([group, entries]) =>
				`${group}:\n${entries.map((entry) => `  - ${entry}`).join("\n")}`,
		)
		.join("\n\n"),
);

const { copy, isSupported } = useClipboard({
	source: stringifiedStructuredNotes.value,
});

async function copyToClipboard() {
	isCopyingToClipboard.value = true;

	try {
		await copy(stringifiedStructuredNotes.value);
		toast.add({
			severity: "success",
			summary: "Erfolgreich kopiert!",
			detail:
				"Die strukturierten Notizen befinden sich jetzt in deinem Clipboard.",
			life: 3000,
		});
	} catch (error) {
		console.error(error);
		toast.add({
			severity: "error",
			summary: "Da ging etwas schief!",
			detail: "Die strukturierten Notizen konnten leider nicht kopiert werden.",
			life: 3000,
		});
	} finally {
		isCopyingToClipboard.value = false;
	}
}
</script>

<template>
    <Toast />
    <Button
        label="Kopieren"
        icon="pi pi-copy"
        @click="copyToClipboard"
        :disabled="!isSupported"
        :badge="isSupported ? '' : 'Nicht unterstützt'"
        badgeSeverity="danger"
        :loading="isCopyingToClipboard"
    />
</template>
