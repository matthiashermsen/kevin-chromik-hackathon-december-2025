<template>
    <div class="flex flex-col gap-8">
        <Menubar>
            <template #start>
                <span>Strukturiere deine Einkaufsliste!</span>
            </template>
            <template #end>
                <Button
                    as="a"
                    label="Repository"
                    icon="pi pi-github"
                    href="https://github.com/matthiashermsen/kevin-chromik-hackathon-december-2025"
                    target="_blank"
                    rel="noopener"
                    class="no-underline"
                />
            </template>
        </Menubar>
        <slot />
    </div>
</template>
