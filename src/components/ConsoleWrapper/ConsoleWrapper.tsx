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
    const outputContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (outputContainerRef.current) {
            const element = outputContainerRef.current;
            element.scrollTop = 0;
        }
    }, [output]);

    if (output) {
        return (
            <>
                <Title>{title}</Title>
                <div
                    ref={outputContainerRef}
                    style={{
                        maxHeight: "500px",
                        minHeight: "350px",
                        overflowY: "auto",
                        resize: "vertical",
                        border: "1px solid #333",
                        borderRadius: "6px",
                    }}
                >
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
