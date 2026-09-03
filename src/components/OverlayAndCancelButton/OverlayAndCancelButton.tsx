import { LoadingOverlay, Button, Modal } from "@mantine/core";
import { CommandHelper } from "../../utils/CommandHelper";
import { Command } from "@tauri-apps/plugin-shell";

/**
 * Overlay to successfully terminate processes for tools not requiring pkexec
 * @param loading - An object containing information about the process termination.
 * @param pid - The exit code of the terminated process.
 * @returns A Loading Overlay with cancel button
 */
export function LoadingOverlayAndCancelButton(loading: boolean, pid: string) {
    // Sends a SIGTERM signal to gracefully terminate the active process passed as an argument
    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
    };

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
    onTermination: ({ code, signal }: { code: number; signal: number }) => void
) {
    // Sends a SIGINT signal to gracefully terminate the active process passed as an argument
    const handleCancel = () => {
        try {
            //Run termination command with elevated privileges since the target process runs as root via pkexec
            if (pid) {
                const args = ["kill", "-2", pid];
                CommandHelper.runCommand("pkexec", args);
            } else {
                throw new Error("Error: Failed to get process ID ");
            }
            if (pid2) {
                const args2 = ["kill", "-2", pid2];
                CommandHelper.runCommand("pkexec", args2);
            }
        } catch (e) {
            //Throws an error if exception happens in the cancel process
            throw e;
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
                        The process is running.You can cancel it below:
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
