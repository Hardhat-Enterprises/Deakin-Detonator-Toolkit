import { useEffect, useRef, useState } from "react";
import { Button, Center, Loader, Modal, Stack, Text } from "@mantine/core";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import {
    ARPANAME_PACKAGE,
    ArpanameProcessError,
    checkArpanameAvailability,
    RunningArpanameProcess,
    startBind9Installation,
} from "./arpanameProcess";

type InstallationPhase = "idle" | "installing" | "error";

type ArpanameInstallationModalProps = {
    isOpen: boolean;
    setOpened: (value: boolean) => void;
    onAvailabilityChange: (isAvailable: boolean) => void;
};

const processErrorMessage = (error: unknown) => {
    if (error instanceof ArpanameProcessError && error.kind === "timeout") {
        return "Installation timed out and was terminated. Please check your package manager and try again.";
    }
    if (error instanceof Error) return error.message;
    return String(error);
};

/** Tool-local dependency installer for Arpaname. */
const ArpanameInstallationModal = ({ isOpen, setOpened, onAvailabilityChange }: ArpanameInstallationModalProps) => {
    const [phase, setPhase] = useState<InstallationPhase>("idle");
    const [output, setOutput] = useState("");
    const [installError, setInstallError] = useState("");
    const activeProcess = useRef<RunningArpanameProcess | null>(null);
    const operationId = useRef(0);
    const activeInstallToken = useRef<symbol | null>(null);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            operationId.current += 1;
            activeInstallToken.current = null;
            const process = activeProcess.current;
            activeProcess.current = null;
            process?.dispose();
        };
    }, []);

    const appendOutput = (data: string) => {
        if (mounted.current) setOutput((current) => `${current}\n${data}`);
    };

    const handleInstall = async () => {
        if (activeInstallToken.current) return;
        const installToken = Symbol("arpaname-install");
        activeInstallToken.current = installToken;

        const currentOperation = ++operationId.current;
        setPhase("installing");
        setInstallError("");
        setOutput("");
        onAvailabilityChange(false);

        let process: RunningArpanameProcess | null = null;
        try {
            process = startBind9Installation(appendOutput);
            activeProcess.current = process;

            if (!mounted.current || currentOperation !== operationId.current) {
                process.dispose();
                return;
            }

            const result = await process.completion;
            if (activeProcess.current === process) activeProcess.current = null;
            process.dispose();

            if (result.cancelled || result.code === 126) {
                throw new Error("Installation authorization was cancelled.");
            }
            if (result.code === 127) {
                throw new Error("Installation authorization could not be obtained.");
            }
            if (result.code !== 0) {
                throw new Error(`Installing ${ARPANAME_PACKAGE} failed with exit code ${String(result.code)}.`);
            }

            const isAvailable = await checkArpanameAvailability((availabilityProcess) => {
                process = availabilityProcess;
                if (!mounted.current || currentOperation !== operationId.current) {
                    availabilityProcess.dispose();
                    return;
                }
                activeProcess.current = availabilityProcess;
            });
            if (activeProcess.current === process) activeProcess.current = null;
            if (!isAvailable) {
                throw new Error(
                    `${ARPANAME_PACKAGE} finished installing, but the arpaname executable could not be found.`
                );
            }

            if (mounted.current && currentOperation === operationId.current) {
                setPhase("idle");
                onAvailabilityChange(true);
                setOpened(false);
            }
        } catch (error) {
            if (mounted.current && currentOperation === operationId.current) {
                setInstallError(processErrorMessage(error));
                setPhase("error");
                onAvailabilityChange(false);
            }
        } finally {
            if (activeProcess.current === process) activeProcess.current = null;
            process?.dispose();
            if (activeInstallToken.current === installToken) {
                activeInstallToken.current = null;
                if (mounted.current && currentOperation !== operationId.current) setPhase("idle");
            }
        }
    };

    const handleClose = () => {
        operationId.current += 1;
        const process = activeProcess.current;
        activeProcess.current = null;
        process?.dispose();
        if (!activeInstallToken.current) setPhase("idle");
        setInstallError("");
        setOutput("");
        setOpened(false);
    };

    return (
        <Modal
            opened={isOpen}
            onClose={handleClose}
            title={<strong>Component Installation Menu</strong>}
            size="auto"
            style={{ maxWidth: "50%", margin: "auto" }}
        >
            {phase === "installing" ? (
                <Stack>
                    <Text>The required dependency is currently installing.</Text>
                    <Center inline>
                        <Loader size="md" />
                        <Text ml={10}>Installing {ARPANAME_PACKAGE}...</Text>
                    </Center>
                    <ConsoleWrapper output={output} hideClearButton title="" />
                </Stack>
            ) : (
                <Stack>
                    <Text>
                        Arpaname requires the <strong>{ARPANAME_PACKAGE}</strong> package. Install it to enable IP
                        lookups.
                    </Text>
                    {installError && (
                        <Text color="red" role="alert">
                            {installError}
                        </Text>
                    )}
                    <Button onClick={handleInstall}>
                        {phase === "error" ? "Retry Installation" : "Install Component"}
                    </Button>
                    <Button color="red" onClick={handleClose}>
                        Close
                    </Button>
                </Stack>
            )}
        </Modal>
    );
};

export default ArpanameInstallationModal;
