import { LoadingOverlay, Button } from "@mantine/core";
import { CommandHelper } from "../../utils/CommandHelper";

export function LoadingOverlayAndCancelButton(loading: boolean, pid: string) {
    // Sends a SIGTERM signal to gracefully terminate the active process passed as an argument
    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
    };

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none", // This allows users to interact with the scrollbar
            }}
        >
            <LoadingOverlay visible={loading} overlayOpacity={0.6} overlayColor="#000" />
            {loading && (
                <Button
                    variant="outline"
                    color="red"
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        zIndex: 1001,
                        pointerEvents: "all", // This ensures the button is clickable
                    }}
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
            )}
        </div>
    );
}
