import {
	type ChatCompletionMessageParam,
	CreateMLCEngine,
	type MLCEngine,
} from "@mlc-ai/web-llm";
import { useState } from "react";

export function useWebLLM() {
	const [engine, setEngine] = useState<MLCEngine>();
	const [isCreatingEngine, setIsCreatingEngine] = useState(false);
	const [hasInitializationFailed, setHasInitializationFailed] = useState(false);

	const hasEngineBeenCreated = !!engine;

	async function initialize() {
		if (engine) {
			return;
		}

		setIsCreatingEngine(true);

		try {
			const engine = await CreateMLCEngine("gemma-2-2b-it-q4f16_1-MLC");

			setEngine(engine);
			setHasInitializationFailed(false);
		} catch (err) {
			// TODO
			console.error(err);
			setHasInitializationFailed(true);
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
		hasInitializationFailed,
		hasEngineBeenCreated,
		initialize,
		chat,
	};
}
