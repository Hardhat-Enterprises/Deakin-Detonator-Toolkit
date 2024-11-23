export const ChatGPTHelper = {
    /**
     * Helper method to send a prompt and additional data to ChatGPT and return the response.
     * @param prompt The prompt/question for ChatGPT.
     * @param data Additional context or data to send to ChatGPT.
     * @returns The response from ChatGPT as a string.
     */
    async sendToChatGPT(prompt: string, data: string): Promise<string> {
        const apiKey = process.env.OPENAI_API_KEY;
        const apiUrl = "https://api.openai.com/v1/chat/completions";

        if (!apiKey) {
            throw new Error("OPENAI_API_KEY is missing. Please set OPENAI_API_KEY in the environment.");
        }

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are a cyber security assistant for analyzing output from penetration testing tools",
                        },
                        {
                            role: "user",
                            content: `${prompt}\n\nData:\n${data}`,
                        },
                    ],
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || "Failed to connect to ChatGPT.");
            }

            const result = await response.json();
            return result.choices[0]?.message?.content || "No response from ChatGPT.";
        } catch (error: any) {
            console.error("Error communicating with ChatGPT:", error);
            return `Error: ${error.message}`;
        }
    },
};
