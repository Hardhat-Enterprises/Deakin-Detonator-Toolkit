import { LoadingOverlay, Button } from "@mantine/core";
import { CommandHelper } from "../../utils/CommandHelper";
import { useCallback, useState } from "react";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

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
            <LoadingOverlay visible={loading} />
            {loading && (
                <div>
                    <Button variant="outline" color="red" style={{ zIndex: 1001 }} onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            )}
        </>
    );
}

//Overlay to successfully terminate processes for tools using pkexec
export function LoadingOverlayAndCancelButtonPkexec(
    loading: boolean,
    pid: string,
    onData: (data: string) => void,
    onTermination: ({ code, signal }: { code: number; signal: number }) => void
) {
    // Sends a SIGTERM signal to gracefully terminate the active process passed as an argument
    const handleCancel = () => {
        try {
            if (pid !== null) {
                const args = [`-2`, pid];
                CommandHelper.runCommandWithPkexec("kill", args, onData, onTermination);
            } else {
                throw new Error("Error: Failed to get process ID ");
            }
        } catch (e) {
            throw e;
        }
    };

    return (
        <>
            <LoadingOverlay visible={loading} />
            {loading && (
                <div>
                    <Button variant="outline" color="red" style={{ zIndex: 1001 }} onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            )}
        </>
    );
}
