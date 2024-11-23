import { useEffect, useRef } from "react";
import { Prism } from "@mantine/prism";

interface ChatGPTOutputProps {
    output: string;
    clearOutputCallback?: () => void;
    hideClearButton?: boolean;
    title?: string;
}

// format ChatGPT response using Prism
const ChatGPTOutput = ({ output, clearOutputCallback, hideClearButton, title = "Output" }: ChatGPTOutputProps) => {
    // Use ref to refer to the output container
    const outputContainerRef = useRef<HTMLDivElement>(null);

    // Scroll to the bottom of the output container whenever the output updates
    useEffect(() => {
        if (outputContainerRef.current) {
            const element = outputContainerRef.current;
            element.scrollTop = element.scrollHeight;
        }
    }, [output]);

    if (output) {
        return (
            <>
                <div ref={outputContainerRef} style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <Prism language={"markdown"}>{output}</Prism>
                </div>
            </>
        );
    } else {
        return null;
    }
};

export default ChatGPTOutput;
