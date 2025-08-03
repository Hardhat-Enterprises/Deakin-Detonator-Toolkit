import { Button } from "@mantine/core";
import { useState } from "react";

interface AskCohereProps {
    toolName: string;
    output: string;
    setCohereResponse: (response: string) => void;
}

const AskCohere = ({ toolName, output, setCohereResponse }: AskCohereProps) => {
    const [loading, setLoading] = useState(false);

    const apiKey = import.meta.env.VITE_COHERE_API_KEY; // Cohere API key
    const apiUrl = "https://api.cohere.ai/generate"; // Cohere Generate Endpoint

    /**
     * Sends the tool output and a detailed prompt to the Cohere API.
     * @param prompt The prompt for the model.
     * @returns The model's response as a string.
     */
    const sendToCohere = async (prompt: string): Promise<string> => {
        if (!apiKey) {
            throw new Error("COHERE_API_KEY is missing. Please set COHERE_API_KEY in the environment.");
        }

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "Cohere-Version": "2022-12-06",
                },
                body: JSON.stringify({
                    model: "command-xlarge-nightly",
                    prompt: prompt,
                    max_tokens: 750, // Increased for more detailed responses
                    temperature: 0.5, // Balanced for consistent responses
                    truncate: "NONE", // Ensure no truncation
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch response from Cohere.");
            }

            const result = await response.json();

            if (!result.generations || result.generations.length === 0) {
                throw new Error("Unexpected API response format: 'generations' array is missing.");
            }

            return result.generations[0].text.trim();
        } catch (error: any) {
            console.error("Cohere API Error:", error.message);
            return `Error: ${error.message}`;
        }
    };

    /**
     * Handles the "Ask Cohere" button click.
     */
    const handleAskCohere = async () => {
        if (!output) {
            setCohereResponse("Error: No input provided to analyze.");
            return;
        }

        setLoading(true);
        try {
            const response = await sendToCohere(`
                You are a cybersecurity assistant specializing in penetration testing tools.
                Analyze the output below and provide a detailed, structured response. Your response should include:
                1. **Tool Summary**: Provide a concise summary of the tool "${toolName}" and its purpose.
                2. **Detailed Output Analysis**: Explain the findings in the output, highlighting vulnerabilities, detected security measures, and other significant details. Avoid repetition and ensure clarity.
                3. **Significance for Cybersecurity Learning**: Discuss the importance of the findings for beginners or students in cybersecurity, emphasizing practical insights and how they can be applied in penetration testing or security assessments.
                Format your response in markdown for clarity and readability.

                Ensure the response is non-repetitive, complete, and avoids cutting off important details.

                Output:
                ${output}
            `);
            setCohereResponse(response);
        } catch (error) {
            setCohereResponse(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleAskCohere} disabled={!output || loading}>
            {loading ? `Analyzing ${toolName} output...` : `Ask Cohere`}
        </Button>
    );
};

export default AskCohere;
