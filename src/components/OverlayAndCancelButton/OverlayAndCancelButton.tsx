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
            {/* Adjust z-index and pointerEvents to ensure interaction with Modal */}
            <LoadingOverlay visible={loading} overlayBlur={2} style={{ zIndex: 1000, pointerEvents: "none" }} />

            {loading && (
                <Modal
                    opened={loading}
                    onClose={() => {}}
                    title="Process Running"
                    centered
                    withCloseButton={false}
                    overlayOpacity={0.3}
                    overlayBlur={2}
                    zIndex={2000} // Ensures the modal is above the overlay
                >
                    <p>The process is running. You can cancel it below:</p>
                    <Button variant="outline" color="red" onClick={handleCancel}>
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
            {/* Adjust z-index and pointerEvents to ensure interaction with Modal */}
            <LoadingOverlay visible={loading} overlayBlur={2} style={{ zIndex: 1000, pointerEvents: "none" }} />

            {loading && (
                <Modal
                    opened={loading}
                    onClose={() => {}}
                    title="Process Running"
                    centered
                    withCloseButton={false}
                    overlayOpacity={0.3}
                    overlayBlur={2}
                    zIndex={2000} // Ensures the modal is above the overlay
                >
                    <p>The process is running and requires elevated permissions to cancel.</p>
                    <Button variant="outline" color="red" onClick={handleCancel}>
                        Cancel Process
                    </Button>
                </Modal>
            )}
        </>
    );
}
