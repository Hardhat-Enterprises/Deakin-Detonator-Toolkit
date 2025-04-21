import { Button } from "@mantine/core";
import { useState } from "react";

interface AskChatGPT {
    toolName: string;
    output: string;
    setChatGPTResponse: (response: string) => void;
}

const AskChatGPT = ({ toolName, output, setChatGPTResponse }: AskChatGPT) => {
    const [loading, setLoading] = useState(false);

    /**
     * Method to send a prompt and additional data to ChatGPT and return the response.
     * @param prompt The prompt/question for ChatGPT.
     * @param data Additional context or data to send to ChatGPT (likely the output from a tool).
     * @returns The response from ChatGPT as a string.
     */
    const sendToChatGPT = async (prompt: string, data: string): Promise<string> => {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
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
                                "You are a cyber security assistant analyzing output from penetration testing tools",
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
    };

    /**
     * Method to handle selecting 'send to ChatGPT button'.
     */
    const handleAskChatGPT = async () => {
        setLoading(true);
        try {
            const response = await sendToChatGPT(
                `The following ouput is from the use of the ${toolName}. Provide a concise explanation of the tool and what the output shows for someone new to the cybersecurity world:`, //TODO: find most effective prompt starter
                output
            );
            setChatGPTResponse(response);
        } catch (error) {
            setChatGPTResponse(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleAskChatGPT} disabled={!output || loading}>
            {loading ? `Analyzing ${toolName} output...` : `Ask ChatGPT`}
        </Button>
    );
};

export default AskChatGPT;
