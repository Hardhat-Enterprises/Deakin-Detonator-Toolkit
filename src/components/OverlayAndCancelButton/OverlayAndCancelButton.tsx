import { LoadingOverlay, Button, Modal, Affix, Alert } from "@mantine/core";
import { CommandHelper } from "../../utils/CommandHelper";
import { Command } from "@tauri-apps/plugin-shell";
import { useState } from "react";

/**
 * Overlay to successfully terminate processes for tools not requiring pkexec
 * @param loading - An object containing information about the process termination.
 * @param pid - The exit code of the terminated process.
 * @returns A Loading Overlay with cancel button
 */
export function LoadingOverlayAndCancelButton(
    loading: boolean,
    pid: string,
    minimized: boolean = false,
    setMinimized: (minimized: boolean) => void = () => {},
) {
    // Sends a SIGTERM signal to gracefully terminate the active process passed as an argument
    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
    };

    if (minimized) {
        return (
            <Affix position={{ bottom: 20, right: 20 }} zIndex={1500}>
                <Button color="blue" radius="xl" onClick={() => setMinimized(false)}>
                    Process running - click to view
                </Button>
            </Affix>
        );
    }

    return (
        <>
            <LoadingOverlay visible={false} overlayBlur={3} style={{ zIndex: 1000, position: "fixed" }} />
            {loading && (
                <Modal
                    opened={loading}
                    onClose={() => {
                        setMinimized(true);
                    }}
                    title=""
                    centered
                    withCloseButton={false}
                    overlayOpacity={0.5}
                    overlayBlur={3}
                    zIndex={2000}
                    size="lg"
                >
                    <p style={{ fontSize: "18px", textAlign: "center" }}>
                        The process is running. You can cancel it below:
                    </p>
                    <Button
                        variant="outline"
                        color="red"
                        onClick={handleCancel}
                        size="xl"
                        fullWidth
                        style={{ marginTop: "20px" }}
                    >
                        Cancel Process
                    </Button>
                </Modal>
            )}
        </>
    );
}

/**
 * Overlay to successfully terminate processes for tools using pkexec
 * @param loading - An object containing information about the process termination.
 * @param pid - The exit code of the terminated process.
 * @param onData- Callback function to handle data generated during the termination process.
 * @param onTermination - Callback function to provide termination details.
 * @throws If there is an error during cancel process or process ID fails to be acquired
 * @returns A Loading Overlay with cancel button
 */

export function LoadingOverlayAndCancelButtonPkexec(
    loading: boolean,
    pid: string,
    pid2: string = "", //This argument is optional when calling this function as a default value is defined here. Pid2 is used to allow tools
    // that create multiple instances such as ArpSpoof to be sucessfully canceled. If you do not include an argument for pid2 when you call this
    // function, you will get a warning, but the function will still work. To avoid getting a warning, simply include emtpy quotation marks in pid2's place. Example:
    // {LoadingOverlayAndCancelButtonPkexec(loading, pid, "", handleProcessData, handleProcessTermination)}
    onData: (data: string) => void,
    onTermination: ({ code, signal }: { code: number; signal: number }) => void,
    killSignal: string = "-2",
) {
    return (
        <>
            {loading && (
                <PkexecCancellationOverlay
                    key={`${pid}:${pid2}`}
                    loading={loading}
                    pid={pid}
                    pid2={pid2}
                    killSignal={killSignal}
                />
            )}
        </>
    );
}

type PkexecCancellationOverlayProps = {
    loading: boolean;
    pid: string;
    pid2: string;
    killSignal: string;
};

function PkexecCancellationOverlay({ loading, pid, pid2, killSignal }: PkexecCancellationOverlayProps) {
    const [cancelError, setCancelError] = useState("");
    const [cancelling, setCancelling] = useState(false);

    // Sends a privileged SIGINT signal to gracefully terminate the active root-owned process.
    // arpspoof is spawned via pkexec, so it is owned by root - an unprivileged `kill` here
    // silently fails and leaves the process running, so `kill` itself must also go through pkexec.
    const isValidPid = (value: string) => value !== null && value !== undefined && value.trim() !== "";

    const handleCancel = async () => {
        setCancelError("");
        setCancelling(true);

        try {
            const pids = [pid, pid2].filter(isValidPid);

            if (pids.length === 0) {
                setCancelError("No valid process ID is available for cancellation.");
                return;
            }

            let cancellationFailed = false;

            for (const processId of pids) {
                const result = await new Command("pkexec", ["kill", killSignal, processId]).execute();

                if (result.code === 126) {
                    setCancelError("Authentication was cancelled. The process may still be running. Please try again.");
                    return;
                }

                if (result.code === 127) {
                    setCancelError("Authorisation or cancellation failed. The process may still be running.");
                    return;
                }

                if (result.code !== 0) {
                    cancellationFailed = true;
                }
            }

            if (cancellationFailed) {
                setCancelError("Unable to cancel one or more processes. Please try again.");
            }
        } catch (error) {
            console.error("Failed to terminate process:", error);
            setCancelError("An error occurred while attempting to cancel the process.");
        } finally {
            setCancelling(false);
        }
    };

    //Returns a loadingoverlay function to handle process termination for pkexec
    return (
        <>
            <LoadingOverlay visible={false} overlayBlur={3} style={{ zIndex: 1000, position: "fixed" }} />
            {loading && (
                <Modal
                    opened={loading}
                    onClose={() => {}}
                    title=""
                    centered
                    withCloseButton={false}
                    overlayOpacity={0.5}
                    overlayBlur={3}
                    zIndex={2000}
                    size="lg"
                >
                    <p style={{ fontSize: "18px", textAlign: "center" }}>
                        The process is running. You can cancel it below:
                    </p>

                    {cancelError && (
                        <Alert color="orange" title="Cancellation unsuccessful" role="alert">
                            {cancelError}
                        </Alert>
                    )}
                    <Button
                        variant="outline"
                        color="red"
                        onClick={handleCancel}
                        loading={cancelling}
                        size="xl"
                        fullWidth
                        style={{ marginTop: "20px" }}
                    >
                        Cancel Process
                    </Button>
                </Modal>
            )}
        </>
    );
}
