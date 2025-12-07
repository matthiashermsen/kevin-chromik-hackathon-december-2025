import PrimeVueAuraTheme from "@primeuix/themes/aura";
import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	modules: ["@primevue/nuxt-module", "@vueuse/nuxt"],
	vite: {
		plugins: [tailwindcss()],
	},
	primevue: {
		options: {
			theme: {
				preset: PrimeVueAuraTheme,
			},
		},
	},
	runtimeConfig: {
		geminiAPIKey: process.env.NUXT_GEMINI_API_KEY,
	},
});
