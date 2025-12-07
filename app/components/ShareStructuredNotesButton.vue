<script setup lang="ts">
import { ref } from "vue";
import type { StructuredNotes } from "../../shared/StructuredNotes";

const props = defineProps<{
	structuredNotes: StructuredNotes;
}>();

const toast = useToast();

const isSharing = ref(false);

const { share, isSupported } = useShare();

async function shareStructuredNotes() {
	isSharing.value = true;

	const stringifiedStructuredNotes = Object.entries(props.structuredNotes)
		.map(
			([group, entries]) =>
				`${group}:\n${entries.map((entry) => `  - ${entry}`).join("\n")}`,
		)
		.join("\n\n");

	try {
		await share({
			title: "Die Einkaufsliste",
			text: stringifiedStructuredNotes,
		});
		toast.add({
			severity: "success",
			summary: "Erfolgreich geteilt!",
			detail: "Die strukturierten Notizen wurden geteilt.",
			life: 3000,
		});
	} catch (error) {
		console.error(error);
		toast.add({
			severity: "error",
			summary: "Da ging etwas schief!",
			detail: "Die strukturierten Notizen konnten leider nicht geteilt werden.",
			life: 3000,
		});
	} finally {
		isSharing.value = false;
	}
}
</script>

<template>
    <Toast />
    <Button
        label="Teilen"
        icon="pi pi-share-alt"
        @click="shareStructuredNotes"
        :disabled="!isSupported"
        :badge="isSupported ? '' : 'Nicht unterstützt'"
        badgeSeverity="danger"
        :loading="isSharing"
    />
</template>
