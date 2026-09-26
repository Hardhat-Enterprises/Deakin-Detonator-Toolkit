import { Alert, Button, Stack, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

interface AskChatGPTProps {
    toolName: string;
    output: string;
    setChatGPTResponse: (response: string) => void;
}

/** Maximum time a single request may run before it is aborted. */
const REQUEST_TIMEOUT_MS = 60_000;

interface ActiveRequest {
    controller: AbortController;
    timedOut: boolean;
}

const AskChatGPT = ({ toolName, output, setChatGPTResponse }: AskChatGPTProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Tracks the request currently in flight, so it can be aborted and so a
    // superseded response can be discarded rather than displayed.
    const activeRequest = useRef<ActiveRequest | null>(null);

    // If the tool output changes while a request is running, any response that
    // arrives afterwards describes output the user is no longer looking at.
    useEffect(() => {
        if (activeRequest.current) {
            activeRequest.current.controller.abort();
            activeRequest.current = null;
            setLoading(false);
            setError("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [output]);

    // Abort any request still running when the component unmounts.
    useEffect(() => {
        return () => {
            activeRequest.current?.controller.abort();
            activeRequest.current = null;
        };
    }, []);

    /**
     * Sends a prompt and tool output to the OpenAI API and returns the response.
     * Errors are thrown so the caller can present them to the user.
     */
    const sendToChatGPT = async (prompt: string, data: string, signal: AbortSignal): Promise<string> => {
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
            signal,
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
        // A previous request, if any, is no longer relevant.
        activeRequest.current?.controller.abort();

        const request: ActiveRequest = { controller: new AbortController(), timedOut: false };
        activeRequest.current = request;

        const timeoutId = window.setTimeout(() => {
            request.timedOut = true;
            request.controller.abort();
        }, REQUEST_TIMEOUT_MS);

        setLoading(true);
        setError("");
        setChatGPTResponse("");

        try {
            const response = await sendToChatGPT(
                `The following output is from the use of the ${toolName}. Provide a concise explanation of the tool and what the output shows for someone new to the cybersecurity world:`,
                output,
                request.controller.signal
            );

            // Discard the response if this request has since been superseded.
            if (activeRequest.current !== request) return;
            setChatGPTResponse(response);
        } catch (e) {
            if (activeRequest.current !== request) return;

            if (request.timedOut) {
                setError(
                    `The request to ChatGPT did not complete within ${
                        REQUEST_TIMEOUT_MS / 1000
                    } seconds and was cancelled. ` + "Please check your network connection and try again."
                );
            } else {
                const message = e instanceof Error ? e.message : "An unexpected error occurred.";
                console.error("Error communicating with ChatGPT:", e);
                setError(message);
            }
        } finally {
            window.clearTimeout(timeoutId);
            if (activeRequest.current === request) {
                activeRequest.current = null;
                setLoading(false);
            }
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
