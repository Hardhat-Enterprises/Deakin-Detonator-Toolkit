import { Button, Stack, TextInput, Modal, Text, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { Command } from "@tauri-apps/plugin-shell";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";

/**
 * Represents the form values for the FTP component.
 */
interface FormValuesType {
    ipAddress: string;
    port: string;
}

/**
 * FTP component for opening remote FTP locations using
 * the operating system's default file manager.
 */
function FTPconnect() {
    // Component state variables.
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    // Dependency installation states.
    const [dependenciesReady, setDependenciesReady] = useState(false);
    const [checkingDependencies, setCheckingDependencies] = useState(true);
    const [dependencyModalOpened, setDependencyModalOpened] = useState(false);
    const [installingDependencies, setInstallingDependencies] = useState(false);
    const [dependencyOutput, setDependencyOutput] = useState("");

    // Component constants.
    const title = "FTP";
    const description = "FTP tool";

    const steps =
        "Step 1: Enter the FTP server's IP address.\n" +
        "Step 2: Enter the FTP server port (default is 21).\n" +
        "Step 3: Click Open FTP Location and enter your login details when prompted.\n" +
        "Step 4: The FTP location will open in your system's default file manager.";

    const sourceLink = "https://www.kali.org/tools/tnftp/";
    const tutorial = "https://docs.google.com/document/d/1wBfZvzU9aC-9FqqiblAWjfkRxNxa1rNIQrQMnWKY8sA/edit?usp=sharing";

    // xdg-utils provides the xdg-open command used to open FTP locations.
    const dependencies = ["xdg-utils"];

    // Form hook for FTP server address and port.
    const form = useForm({
        initialValues: {
            ipAddress: "",
            port: "21",
        },

        validate: {
            ipAddress: (value) => {
                const host = value.trim();

                if (!host) {
                    return "IP address or hostname is required.";
                }

                if (/\s|[/@?#]/.test(host)) {
                    return "Enter a valid IP address or hostname.";
                }

                return null;
            },

            port: (value) => {
                const port = Number(value);

                if (!/^\d+$/.test(value)) {
                    return "Port must be a valid number.";
                }

                if (!Number.isInteger(port) || port < 1 || port > 65535) {
                    return "Port must be between 1 and 65535.";
                }

                return null;
            },
        },
    });

    /**
     * Check whether xdg-open is available.
     *
     * Uses Bash's built-in command -v instead of checking
     * Debian package status with dpkg-query and grep.
     */
    const checkFtpDependencies = useCallback(async (): Promise<boolean> => {
        const command = Command.create("bash", ["-c", "command -v xdg-open"]);

        const result = await command.execute();

        return result.code === 0 && result.stdout.trim().length > 0;
    }, []);

    // Check whether FTP dependencies are available when the component loads.
    useEffect(() => {
        let isMounted = true;

        const verifyDependencies = async () => {
            try {
                const available = await checkFtpDependencies();

                if (!isMounted) return;

                setDependenciesReady(available);

                // Show the installation modal if xdg-open is missing.
                if (!available) {
                    setDependencyModalOpened(true);
                }
            } catch (error) {
                if (!isMounted) return;

                setDependencyOutput(`Failed to check dependencies: ${String(error)}`);

                setDependencyModalOpened(true);
            } finally {
                if (isMounted) {
                    setCheckingDependencies(false);
                }
            }
        };

        void verifyDependencies();

        return () => {
            isMounted = false;
        };
    }, [checkFtpDependencies]);

    /**
     * Install the required FTP URL-opening dependency.
     */
    const installFtpDependencies = async () => {
        if (installingDependencies) return;

        setInstallingDependencies(true);
        setDependencyOutput("Starting dependency installation...\n");

        try {
            // Install xdg-utils using administrator privileges.
            const installScript =
                "apt-get update && " +
                "DEBIAN_FRONTEND=noninteractive " +
                "apt-get install --no-install-recommends -y " +
                dependencies.join(" ");

            const command = Command.create("pkexec", ["bash", "-c", installScript]);

            const result = await command.execute();

            // Display installation output.
            const installationLog = [result.stdout, result.stderr].filter(Boolean).join("\n");

            setDependencyOutput(installationLog || "Installation process completed.");

            if (result.code !== 0) {
                throw new Error(`Installation failed with exit code ${result.code}.`);
            }

            // Verify that xdg-open is available after installation.
            const available = await checkFtpDependencies();

            setDependenciesReady(available);

            if (available) {
                setDependencyModalOpened(false);

                setDependencyOutput((prevOutput) => prevOutput + "\nFTP dependency installed successfully.");
            } else {
                setDependencyOutput((prevOutput) => prevOutput + "\nxdg-open is still unavailable.");
            }
        } catch (error) {
            setDependencyOutput((prevOutput) => prevOutput + `\nInstallation error: ${String(error)}`);
        } finally {
            setInstallingDependencies(false);
        }
    };

    /**
     * Open the FTP server location using the operating system's
     * default application.
     *
     * @param values - FTP server IP address and port.
     */
    const onSubmit = async (values: FormValuesType) => {
        if (loading) return;

        // Do not continue if the required dependency is missing.
        if (!dependenciesReady) {
            setDependencyModalOpened(true);
            return;
        }

        const host = values.ipAddress.trim();
        const port = values.port;

        // Handle IPv6 addresses by adding brackets when required.
        const formattedHost = host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;

        const urlHost = formattedHost.includes(":") ? `[${formattedHost}]` : formattedHost;

        // Construct and validate the FTP URL.
        let ftpUrl: string;

        try {
            const url = new URL(`ftp://${urlHost}:${port}/`);

            if (!url.hostname) {
                throw new Error("Invalid FTP server address.");
            }

            ftpUrl = url.toString();
        } catch {
            form.setFieldError("ipAddress", "Enter a valid IP address or hostname.");
            return;
        }

        setLoading(true);
        setAllowSave(false);
        setHasSaved(false);

        setOutput(`Opening FTP location: ${ftpUrl}\n`);

        try {
            // Pass the URL as a separate argument to avoid shell injection.
            const command = Command.create("bash", ["-c", 'exec xdg-open "$1"', "ddt-ftp-open", ftpUrl]);

            const result = await command.execute();

            if (result.code !== 0) {
                throw new Error(result.stderr.trim() || `xdg-open exited with code ${result.code}.`);
            }

            setOutput((prevOutput) => prevOutput + "FTP location opened successfully.\n");
        } catch (error) {
            setOutput((prevOutput) => prevOutput + `Failed to open FTP location: ${String(error)}\n`);
        } finally {
            setLoading(false);
            setAllowSave(true);
        }
    };

    // Handle successful output saving.
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    // Clear console output.
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, []);

    return (
        <RenderComponent
            title={title}
            description={description}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            {/* Dependency installation modal. */}
            <Modal
                opened={dependencyModalOpened}
                onClose={() => {
                    if (!installingDependencies) {
                        setDependencyModalOpened(false);
                    }
                }}
                title="FTP File Manager Support"
                centered
                closeOnClickOutside={!installingDependencies}
                closeOnEscape={!installingDependencies}
            >
                <Stack>
                    <Text>The FTP tool requires the following dependency:</Text>

                    <Text weight={500}>xdg-utils</Text>

                    <Text size="sm" color="dimmed">
                        This package provides xdg-open, which opens FTP locations using your Linux desktop's default
                        application.
                    </Text>

                    {/* Display dependency installation output. */}
                    {dependencyOutput && (
                        <pre
                            style={{
                                maxHeight: "200px",
                                overflowY: "auto",
                                whiteSpace: "pre-wrap",
                                fontSize: "12px",
                            }}
                        >
                            {dependencyOutput}
                        </pre>
                    )}

                    <Button onClick={installFtpDependencies} disabled={installingDependencies}>
                        {installingDependencies ? "Installing Dependencies..." : "Install Dependencies"}
                    </Button>
                </Stack>
            </Modal>

            {/* Show a warning if dependencies are missing and the modal is closed. */}
            {!dependenciesReady && !checkingDependencies && !dependencyModalOpened && (
                <Alert title="FTP dependency missing" color="yellow">
                    xdg-open is unavailable.
                    <Button mt="sm" size="xs" onClick={() => setDependencyModalOpened(true)}>
                        Install Dependencies
                    </Button>
                </Alert>
            )}

            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    <TextInput
                        label="IP Address"
                        placeholder="Enter FTP server IP address."
                        required
                        disabled={loading}
                        {...form.getInputProps("ipAddress")}
                    />

                    <TextInput
                        label="Port"
                        placeholder="21"
                        type="number"
                        min={1}
                        max={65535}
                        required
                        disabled={loading}
                        {...form.getInputProps("port")}
                    />

                    <Button type="submit" disabled={loading || checkingDependencies || !dependenciesReady}>
                        {loading ? "Opening FTP..." : "Open FTP Location"}
                    </Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}

export default FTPconnect;
