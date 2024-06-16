import { Ai } from '@cloudflare/ai'

export interface Env {
	AI: any;
	URL_PREFIX: string;
}

export default {

	async fetch(request: Request, env: Env) {
		if (request.method !== 'POST') {
			return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
		}

		if (!request.headers.get('Content-Type')?.includes('application/json')) {
			return new Response(JSON.stringify({ message: 'Unsupported Media Type' }), { status: 415 });
		}

		// Extract the URL path
		const urlPath = new URL(request.url).pathname;

		// Check if the URL path starts with URL_PREFIX

		if (env.URL_PREFIX && !urlPath.startsWith(env.URL_PREFIX)) {
			return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
		}

		try {
			const ai = new Ai(env.AI);

			const { input_text, max_length } = await request.json() as any;
			if (!input_text.length || typeof input_text !== 'string' ) {
				return new Response(JSON.stringify({ message: 'Invalid input_text' }), { status: 400 });
			}
			const translations = await this.getResult(ai, input_text, max_length)
	
			return new Response(JSON.stringify({ translations, message: 'ok' }));
		} catch (error) {
			return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
		}
	},

	async getResult(ai: Ai, input_text: string, max_length: number) {
		const aiParams: any = {
			input_text,
			max_length
		};
		const response = await ai.run("@cf/facebook/bart-large-cnn" as any, aiParams);
		return {
			summarized_length: response.result.summary.length,
			text: response.result.summary
		};
	}
}