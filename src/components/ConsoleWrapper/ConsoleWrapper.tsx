import { Button, Title } from "@mantine/core";
import { Prism } from "@mantine/prism";

interface ConsoleWrapperProps {
    output: string;
    clearOutputCallback: () => void;
}

const ConsoleWrapper = ({ output, clearOutputCallback }: ConsoleWrapperProps) => {
    if (output) {
        return (
            <>
                <Title>Output</Title>
                <Prism language={"bash"}>{output}</Prism>
                <Button color={"red"} onClick={clearOutputCallback}>
                    Clear output
                </Button>
            </>
        );
    } else {
        return null;
    }
};

export default ConsoleWrapper;
