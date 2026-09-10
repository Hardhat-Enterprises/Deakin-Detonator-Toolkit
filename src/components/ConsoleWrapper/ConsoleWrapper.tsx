import { useEffect, useRef, useState } from "react";
import { Button, Group, Modal, Title } from "@mantine/core";
import { Prism } from "@mantine/prism";

interface ConsoleWrapperProps {
    output: string;
    clearOutputCallback?: () => void;
    hideClearButton?: boolean;
    title?: string;
}

const ConsoleWrapper = ({ output, clearOutputCallback, hideClearButton, title = "Output" }: ConsoleWrapperProps) => {
    const outputContainerRef = useRef<HTMLDivElement>(null);
    const [fullscreen, setFullscreen] = useState(false);

    // NEW: scroll to TOP (first line) on output change
    useEffect(() => {
        const el = outputContainerRef.current;
        if (el) el.scrollTop = 0;
    }, [output]);

    if (!output) return null;

    const ConsoleBox = (
        <div
            ref={outputContainerRef}
            style={{
                // NEW: bigger by default + user-resizable
                height: "55vh",
                minHeight: 240,
                overflowY: "auto",
                resize: "vertical",
                border: "1px solid var(--mantine-color-default-border)",
                borderRadius: 8,
                padding: 12,
                background: "var(--mantine-color-body)",
            }}
        >
            <Prism language="bash">{output}</Prism>
        </div>
    );

    return (
        <>
            <Group justify="space-between" mb="xs">
                <Title order={5} style={{ margin: 0 }}>
                    {title}
                </Title>
                <Button variant="light" onClick={() => setFullscreen(true)}>
                    Fullscreen
                </Button>
            </Group>

            {ConsoleBox}

            {!hideClearButton && (
                <Button color="red" onClick={clearOutputCallback} mt="md">
                    Clear output
                </Button>
            )}

            <Modal
                opened={fullscreen}
                onClose={() => setFullscreen(false)}
                fullScreen
                withCloseButton
                size="100%"
                title={title}
            >
                <div style={{ height: "80vh", overflow: "auto" }}>
                    <Prism language="bash">{output}</Prism>
                </div>
            </Modal>
        </>
    );
};

export default ConsoleWrapper;
