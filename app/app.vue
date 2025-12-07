<script setup lang="ts">
import "primeicons/primeicons.css";
</script>

<template>
    <div class="px-2 md:px-4 lg:px-6 xl:px-8 py-2 md:py-4 lg:py-6 xl:py-8">
        <NuxtRouteAnnouncer />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<style>
@import "tailwindcss";
</style>
