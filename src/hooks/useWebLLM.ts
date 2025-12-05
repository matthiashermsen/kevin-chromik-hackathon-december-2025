import {
	type ChatCompletionMessageParam,
	CreateMLCEngine,
	type MLCEngine,
} from "@mlc-ai/web-llm";
import { useState } from "react";

export function useWebLLM() {
	const [engine, setEngine] = useState<MLCEngine>();
	const [isCreatingEngine, setIsCreatingEngine] = useState(false);
	const [hasInitialisationFailed, setHasInitialisationFailed] = useState(false);

	const hasEngineBeenCreated = !!engine;

	async function initialize() {
		if (engine) {
			return;
		}

		setIsCreatingEngine(true);

		try {
			const engine = await CreateMLCEngine("Llama-3.1-8B-Instruct-q4f32_1-MLC");

			setEngine(engine);
			setHasInitialisationFailed(false);
		} catch (err) {
			// TODO
			console.error(err);
			setHasInitialisationFailed(true);
		} finally {
			setIsCreatingEngine(false);
		}
	}

	async function chat(messages: ChatCompletionMessageParam[]) {
		if (!engine) {
			throw new Error("Engine has not been created yet");
		}

		const reply = await engine.chat.completions.create({
			messages,
		});

		return reply;
	}

	return {
		isCreatingEngine,
		hasInitialisationFailed,
		hasEngineBeenCreated,
		initialize,
		chat,
	};
}
