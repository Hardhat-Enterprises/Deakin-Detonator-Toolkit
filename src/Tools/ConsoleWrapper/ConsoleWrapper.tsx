import { useEffect, useRef } from "react";
import { Button, Title } from "@mantine/core";
import { Prism } from "@mantine/prism";

interface ConsoleWrapperProps {
    output: string;
    clearOutputCallback?: () => void;
    hideClearButton?: boolean;
    title?: string;
}

const ConsoleWrapper = ({ output, clearOutputCallback, hideClearButton, title = "Output" }: ConsoleWrapperProps) => {
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
                <Title>{title}</Title>
                <div ref={outputContainerRef} style={{ maxHeight: "250px", overflowY: "auto" }}>
                    <Prism language={"bash"}>{output}</Prism>
                </div>
                {!hideClearButton && (
                    <Button color={"red"} onClick={clearOutputCallback}>
                        Clear output
                    </Button>
                )}
            </>
        );
    } else {
        return null;
    }
};

export default ConsoleWrapper;
