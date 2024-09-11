import { LoadingOverlay, Button, Modal } from "@mantine/core";
import { useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";

/**
 * Overlay to successfully terminate processes for tools not requiring pkexec
 * @param loading - An object containing information about the process termination.
 * @param pid - The exit code of the terminated process.
 * @returns A Loading Overlay with cancel button in a Modal
 */
export function LoadingOverlayAndCancelButton(loading: boolean, pid: string) {
    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
    };

    return (
        <>
            {/* Overlay will now cover the entire screen */}
            <LoadingOverlay
                visible={loading}
                overlayBlur={3}
                style={{ zIndex: 1000 }}
                fixed // Ensure the overlay covers the full screen
            />

            {loading && (
                <Modal
                    opened={loading}
                    onClose={() => {}}
                    title="Process Running"
                    centered
                    withCloseButton={false}
                    overlayOpacity={0.5}
                    overlayBlur={3}
                    zIndex={2000} // Ensure the modal is above the overlay
                    size="lg" // Increase the size of the modal
                >
                    <p style={{ fontSize: "18px", textAlign: "center" }}>
                        The process is running and requires elevated permissions to cancel.
                    </p>
                    <Button
                        variant="outline"
                        color="red"
                        onClick={handleCancel}
                        size="xl" // Make the button larger
                        fullWidth // Make the button take full width of modal
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
 * @param onData - Callback function to handle data generated during the termination process.
 * @param onTermination - Callback function to provide termination details.
 * @returns A Loading Overlay with cancel button in a Modal
 */
export function LoadingOverlayAndCancelButtonPkexec(
    loading: boolean,
    pid: string,
    onData: (data: string) => void,
    onTermination: ({ code, signal }: { code: number; signal: number }) => void
) {
    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-2`, pid];
            CommandHelper.runCommandWithPkexec("kill", args, onData, onTermination);
        }
    };

    return (
        <>
            {/* Overlay will now cover the entire screen */}
            <LoadingOverlay
                visible={loading}
                overlayBlur={3}
                style={{ zIndex: 1000 }}
                fixed // Ensure the overlay covers the full screen
            />

            {loading && (
                <Modal
                    opened={loading}
                    onClose={() => {}}
                    title="Process Running"
                    centered
                    withCloseButton={false}
                    overlayOpacity={0.5}
                    overlayBlur={3}
                    zIndex={2000} // Ensure the modal is above the overlay
                    size="lg" // Increase the size of the modal
                >
                    <p style={{ fontSize: "18px", textAlign: "center" }}>
                        The process is running and requires elevated permissions to cancel.
                    </p>
                    <Button
                        variant="outline"
                        color="red"
                        onClick={handleCancel}
                        size="xl" // Make the button larger
                        fullWidth // Make the button take full width of modal
                        style={{ marginTop: "20px" }}
                    >
                        Cancel Process
                    </Button>
                </Modal>
            )}
        </>
    );
}
