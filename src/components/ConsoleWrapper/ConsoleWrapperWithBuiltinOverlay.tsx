import { useEffect, useRef } from "react";
import { Button, Title } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButtonForConsoleWrapper";

interface ConsoleWrapperProps {
    output: string;
    clearOutputCallback?: () => void;
    hideClearButton?: boolean;
    pid: string;
    loading: boolean;
}

const ConsoleWrapper = ({ output, clearOutputCallback, hideClearButton, pid, loading }: ConsoleWrapperProps) => {
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
            <div style={{ position: "relative", marginTop: "1em" }}>
                <Title order={2}>Output</Title>
                <div
                    style={{
                        position: "relative",
                        maxHeight: "250px",
                    }}
                >
                    <div
                        ref={outputContainerRef}
                        style={{
                            minHeight: "250px",
                            maxHeight: "250px",
                            overflowY: "auto",
                        }}
                    >
                        {loading && LoadingOverlayAndCancelButton(loading, pid)}
                        <Prism language={"bash"}>{output}</Prism>
                    </div>
                </div>
                {!hideClearButton && (
                    <Button
                        color={"red"}
                        onClick={clearOutputCallback}
                        style={{
                            marginTop: "1em",
                        }}
                    >
                        Clear output
                    </Button>
                )}
            </div>
        );
    } else {
        return null;
    }
};

export default ConsoleWrapper;
