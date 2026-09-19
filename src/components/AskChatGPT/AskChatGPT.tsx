import { Alert, Button, Stack, Text } from "@mantine/core";
import { useState } from "react";

interface AskChatGPTProps {
    toolName: string;
    output: string;
    setChatGPTResponse: (response: string) => void;
}

const AskChatGPT = ({ toolName, output, setChatGPTResponse }: AskChatGPTProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /**
     * Sends a prompt and tool output to the OpenAI API and returns the response.
     * Errors are thrown so the caller can present them to the user.
     */
    const sendToChatGPT = async (prompt: string, data: string): Promise<string> => {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        const apiUrl = "https://api.openai.com/v1/chat/completions";

        if (!apiKey) {
            throw new Error(
                "The AI feature is not configured. An OpenAI API key must be set as VITE_OPENAI_API_KEY " +
                    "in a .env file at the project root. See .env.example for the expected format."
            );
        }

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
                        content: "You are a cyber security assistant analyzing output from penetration testing tools",
                    },
                    {
                        role: "user",
                        content: `${prompt}\n\nData:\n${data}`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            let detail = "";
            try {
                const body = await response.json();
                detail = body.error?.message ?? "";
            } catch {
                detail = "";
            }

            if (response.status === 401) {
                throw new Error("The OpenAI API rejected the request. The configured API key is invalid or expired.");
            }
            if (response.status === 429) {
                throw new Error("The OpenAI API rate limit or quota has been reached. Please try again later.");
            }
            throw new Error(detail || `The OpenAI API returned an error (HTTP ${response.status}).`);
        }

        const result = await response.json();
        return result.choices[0]?.message?.content || "No response was returned by ChatGPT.";
    };

    /**
     * Handles the 'Ask ChatGPT' button click.
     */
    const handleAskChatGPT = async () => {
        setLoading(true);
        setError("");
        setChatGPTResponse("");

        try {
            const response = await sendToChatGPT(
                `The following output is from the use of the ${toolName}. Provide a concise explanation of the tool and what the output shows for someone new to the cybersecurity world:`,
                output
            );
            setChatGPTResponse(response);
        } catch (e) {
            const message = e instanceof Error ? e.message : "An unexpected error occurred.";
            console.error("Error communicating with ChatGPT:", e);
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack spacing="xs">
            <Button onClick={handleAskChatGPT} disabled={!output || loading} loading={loading}>
                {loading ? `Analyzing ${toolName} output...` : `Ask ChatGPT`}
            </Button>

            {!output && (
                <Text size="xs" color="dimmed" align="center">
                    Run {toolName} first — the AI explanation is generated from the tool output.
                </Text>
            )}

            {error && (
                <Alert color="red" title="AI explanation unavailable" withCloseButton onClose={() => setError("")}>
                    {error}
                </Alert>
            )}
        </Stack>
    );
};

export default AskChatGPT;
