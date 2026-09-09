import { Child, Command } from "@tauri-apps/plugin-shell";

export const ARPANAME_EXECUTABLE = "arpaname";
export const ARPANAME_PACKAGE = "bind9";
export const AVAILABILITY_TIMEOUT_MS = 10_000;
export const INSTALL_TIMEOUT_MS = 5 * 60_000;
export const LOOKUP_TIMEOUT_MS = 30_000;

const TERMINATION_GRACE_PERIOD_MS = 2_000;

export type ProcessCloseDetails = {
    code: number | null;
    signal: number | null;
};

export type ArpanameProcessErrorKind = "spawn" | "runtime" | "timeout" | "cancel" | "disposed";

export class ArpanameProcessError extends Error {
    readonly kind: ArpanameProcessErrorKind;

    constructor(kind: ArpanameProcessErrorKind, message: string) {
        super(message);
        this.name = "ArpanameProcessError";
        this.kind = kind;
    }
}

export type ArpanameProcessResult = ProcessCloseDetails & {
    stdout: string;
    stderr: string;
    cancelled: boolean;
};

export type RunningArpanameProcess = {
    readonly child: Child | null;
    completion: Promise<ArpanameProcessResult>;
    cancel: () => Promise<void>;
    dispose: () => void;
};

type TerminationRequest = {
    kind: "runtime" | "timeout" | "cancel" | "disposed";
    message: string;
};

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

/**
 * Start a Tauri process operation immediately. The returned handle owns the
 * spawn attempt as well as the eventual Child, so timeout/cancel/dispose also
 * cover a spawn Promise that has not settled yet.
 */
export const spawnArpanameProcess = (
    program: string,
    args: string[],
    onData: (data: string) => void = () => {},
    timeoutMs: number
): RunningArpanameProcess => {
    const command = Command.create(program, args);
    let child: Child | null = null;
    let stdout = "";
    let stderr = "";
    let settled = false;
    let killRequested = false;
    let terminationRequest: TerminationRequest | null = null;
    let operationTimeout: ReturnType<typeof setTimeout> | null = null;
    let terminationFallback: ReturnType<typeof setTimeout> | null = null;
    let resolveCompletion!: (result: ArpanameProcessResult) => void;
    let rejectCompletion!: (error: ArpanameProcessError) => void;

    const completion = new Promise<ArpanameProcessResult>((resolve, reject) => {
        resolveCompletion = resolve;
        rejectCompletion = reject;
    });
    // The operation can fail before its caller starts awaiting `completion`.
    void completion.catch(() => undefined);

    const clearTimers = () => {
        if (operationTimeout) {
            clearTimeout(operationTimeout);
            operationTimeout = null;
        }
        if (terminationFallback) {
            clearTimeout(terminationFallback);
            terminationFallback = null;
        }
    };

    const removeListeners = () => {
        command.removeAllListeners("close");
        command.removeAllListeners("error");
        command.stdout.removeAllListeners("data");
        command.stderr.removeAllListeners("data");
    };

    const cleanUp = () => {
        clearTimers();
        removeListeners();
        child = null;
    };

    const resolveOnce = (result: ArpanameProcessResult) => {
        if (settled) return;
        settled = true;
        cleanUp();
        resolveCompletion(result);
    };

    const rejectOnce = (kind: ArpanameProcessErrorKind, message: string) => {
        if (settled) return;
        settled = true;
        cleanUp();
        rejectCompletion(new ArpanameProcessError(kind, message));
    };

    const killOnce = (target: Child) => {
        if (killRequested) return;
        killRequested = true;

        const handleKillFailure = (error: unknown) => {
            const message = `${
                terminationRequest?.message ?? `${program} termination failed.`
            } Unable to terminate ${program}: ${errorMessage(error)}`;
            if (!settled && terminationRequest) {
                rejectOnce(terminationRequest.kind, message);
            } else {
                console.error(message);
            }
        };

        try {
            void target.kill().catch(handleKillFailure);
        } catch (error) {
            handleKillFailure(error);
        }
    };

    const requestTermination = (request: TerminationRequest) => {
        if (settled || terminationRequest) return;
        terminationRequest = request;

        if (operationTimeout) {
            clearTimeout(operationTimeout);
            operationTimeout = null;
        }

        if (!child) {
            // There is no PID to wait for. Settle the UI operation now; the
            // spawn continuation below will kill any Child returned later.
            rejectOnce(request.kind, request.message);
            return;
        }

        terminationFallback = setTimeout(
            () => rejectOnce(request.kind, `${request.message} ${program} did not close after termination.`),
            TERMINATION_GRACE_PERIOD_MS
        );
        killOnce(child);
    };

    command.stdout.on("data", (data) => {
        if (settled) return;
        const text = data.toString();
        stdout += `${text}\n`;
        onData(text);
    });
    command.stderr.on("data", (data) => {
        if (settled) return;
        const text = data.toString();
        stderr += `${text}\n`;
        onData(text);
    });
    command.on("error", (error) => {
        requestTermination({ kind: "runtime", message: `Process error: ${errorMessage(error)}` });
    });
    command.on("close", ({ code, signal }: ProcessCloseDetails) => {
        if (settled) return;

        if (terminationRequest) {
            if (terminationRequest.kind === "cancel") {
                resolveOnce({ code, signal, stdout, stderr, cancelled: true });
            } else {
                rejectOnce(terminationRequest.kind, terminationRequest.message);
            }
            return;
        }

        resolveOnce({ code, signal, stdout, stderr, cancelled: false });
    });

    // This timer starts before spawn, so it limits the complete operation.
    operationTimeout = setTimeout(
        () => requestTermination({ kind: "timeout", message: `${program} timed out after ${timeoutMs} ms.` }),
        timeoutMs
    );

    try {
        void command
            .spawn()
            .then((spawnedChild) => {
                if (terminationRequest) {
                    // Timeout, cancel, runtime error, or unmount won before
                    // spawn resolved. Never allow the late Child to survive.
                    killOnce(spawnedChild);
                    return;
                }
                if (settled) return;
                child = spawnedChild;
            })
            .catch((error) => {
                if (!settled) rejectOnce("spawn", `Unable to start ${program}: ${errorMessage(error)}`);
            });
    } catch (error) {
        rejectOnce("spawn", `Unable to start ${program}: ${errorMessage(error)}`);
    }

    return {
        get child() {
            return child;
        },
        completion,
        cancel: () => {
            requestTermination({ kind: "cancel", message: `${program} was cancelled.` });
            return Promise.resolve();
        },
        dispose: () => {
            requestTermination({ kind: "disposed", message: `${program} was disposed before it closed.` });
        },
    };
};

export const checkArpanameAvailability = async (
    onStarted: (process: RunningArpanameProcess) => void = () => {},
    timeoutMs: number = AVAILABILITY_TIMEOUT_MS
): Promise<boolean> => {
    const process = spawnArpanameProcess("which", [ARPANAME_EXECUTABLE], () => {}, timeoutMs);
    try {
        onStarted(process);
        const result = await process.completion;
        return result.code === 0 && result.stdout.trim().length > 0;
    } finally {
        process.dispose();
    }
};

export const startBind9Installation = (onData: (data: string) => void, timeoutMs: number = INSTALL_TIMEOUT_MS) =>
    spawnArpanameProcess(
        "pkexec",
        ["apt-get", "install", "--no-install-recommends", "-y", ARPANAME_PACKAGE],
        onData,
        timeoutMs
    );

export const startArpanameLookup = (
    ipAddress: string,
    onData: (data: string) => void,
    timeoutMs: number = LOOKUP_TIMEOUT_MS
) => spawnArpanameProcess(ARPANAME_EXECUTABLE, [ipAddress], onData, timeoutMs);
