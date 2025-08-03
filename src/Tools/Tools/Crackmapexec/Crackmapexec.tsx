import { Button, LoadingOverlay, Stack, TextInput, Switch, Alert, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useRef, useEffect } from "react";
import { CommandHelper } from "../../../utils/CommandHelper";
import ConsoleWrapper from "../../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent, UserGuide } from "../../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../../SaveOutputToFile/SaveOutputToTextFile";

/**
 * Interface representing the values in the Crackmapexec form.
 *
 * @property {string} ip - The target IP address.
 * @property {string} username - The username for authentication.
 * @property {string} password - The password for authentication.
 * @property {number} timeout - The time (in seconds) to wait for a response. Default is 60.
 */
interface FormValuesType {
    ip: string;
    username: string;
    password: string;
    timeout: number;
}

// Section: Constants

/** Tool name as per its source documentation. */
const title = "Crackmapexec";

/**
 * Description text used in the user guide of the component.
 * The Crackmapexec tool helps in penetration testing for Windows/Active Directory environments.
 *
 * Steps:
 * 1. Enter the target IP address.
 * 2. Enter the username.
 * 3. Enter the password.
 * 4. Click "Start Searching" to execute the Crackmapexec tool.
 * 5. Review the output results in the Output block.
 *
 * Further information can be found at: https://www.kali.org/tools/crackmapexec/
 */
const descriptionUserGuide =
    "Crackmapexec is a post-exploitation tool that helps in penetration testing for Windows/Active Directory environments. " +
    "It is capable of enumerating users, shares, and computers, executing commands, and dumping credentials from NTDS.dit. " +
    "It automates various tasks to aid in testing the security of a network.\n\n" +
    "Steps:\n" +
    "1. Enter the target IP address.\n" +
    "2. Enter the username.\n" +
    "3. Enter the password.\n" +
    "4. Click 'Start Searching' to execute the Crackmapexec tool.\n" +
    "5. Review the output results in the Output block.\n\n" +
    "Further information can be found at: https://www.kali.org/tools/crackmapexec/";

/** Tutorial section left intentionally empty. */
const tutorial = "https://docs.google.com/document/d/1w1ODdQGZA8EVSH0GgzgYIzSCFdFDHefgwa4RA95sG04/edit?usp=sharing";
const steps = "";
const sourceLink = "";

/**
 * Crackmapexec component used to run penetration testing on Windows/Active Directory environments.
 * Users can input credentials and execute the command via the form.
 */
const Crackmapexec = () => {
    // Section: State Variables

    /** State to manage the loading overlay visibility. */
    const [isLoading, setIsLoading] = useState(false);

    /** State to store the output of the command execution. */
    const [output, setOutput] = useState("");

    /** State to track whether the advanced mode switch is checked. */
    const [isAdvancedChecked, setIsAdvancedChecked] = useState(false);

    /** State to store the process ID of the running command. */
    const [processId, setProcessId] = useState("");

    /** State to manage whether the output can be saved to a file. */
    const [isSaveAllowed, setIsSaveAllowed] = useState(false);

    /** State to track if the output has already been saved. */
    const [hasBeenSaved, setHasBeenSaved] = useState(false);

    const [showAlert, setShowAlert] = useState(true);
    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    // Section: Form Initialization

    /** Initializes the form with default values for each input field. */
    let form = useForm({
        initialValues: {
            ip: "",
            username: "",
            password: "",
            timeout: 60,
        },
    });

    /**
     * Handles the process data by appending the new data to the existing output.
     *
     * @param {string} data - The data output from the process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    /**
     * Handles the termination of the process, updating the output and state accordingly.
     *
     * @param {Object} param - The object containing the process termination details.
     * @param {number} param.code - The exit code of the process.
     * @param {number} param.signal - The signal that terminated the process.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }
            setProcessId(""); // Clear the child process pid reference
            setIsLoading(false); // Cancel the Loading Overlay
            setIsSaveAllowed(true); // Allow Saving as the output is finalised
            setHasBeenSaved(false); // Reset save status
        },
        [handleProcessData]
    );

    /**
     * Sends a SIGTERM signal to gracefully terminate the running process.
     */
    const handleCancel = () => {
        if (processId !== null) {
            const args = [`-15`, processId];
            CommandHelper.runCommand("kill", args);
        }
    };

    /**
     * Actions to be taken after the output has been successfully saved to a file.
     */
    const handleSaveComplete = () => {
        setHasBeenSaved(true); // Indicating that the file has been saved
        setIsSaveAllowed(false); // Disabling the save option until new output is available
    };

    /**
     * Submits the form data, executing the Crackmapexec command with the provided values.
     *
     * @param {FormValuesType} values - The form values entered by the user.
     */
    const onSubmit = async (values: FormValuesType) => {
        setIsSaveAllowed(false); // Disallow saving until the tool's execution is complete
        setIsLoading(true); // Display the loading overlay
        const args = [];

        args.push("--timeout");
        args.push(`${values.timeout}`);
        args.push("smb");
        args.push(`${values.ip}`);
        args.push("-u", values.username);
        args.push("-p", values.password);

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "crackmapexec",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setProcessId(result.pid); // Store the process ID of the running command
            setOutput(result.output); // Display the initial output of the command
        } catch (e: any) {
            setOutput(e.message); // Display error message in case of failure
        }
    };

    /**
     * Clears the output console and resets save-related state variables.
     */
    const clearOutput = useCallback(() => {
        setOutput(""); // Clear the output
        setHasBeenSaved(false); // Reset save status
        setIsSaveAllowed(false); // Disable save option
    }, [setOutput]);

    useEffect(() => {
        // Set timeout to remove alert after 5 seconds on load.
        alertTimeout.current = setTimeout(() => {
            setShowAlert(false);
        }, 5000);

        return () => {
            if (alertTimeout.current) {
                clearTimeout(alertTimeout.current);
            }
        };
    }, []);

    const handleShowAlert = () => {
        setShowAlert(true);
        if (alertTimeout.current) {
            clearTimeout(alertTimeout.current);
        }
        alertTimeout.current = setTimeout(() => {
            setShowAlert(false);
        }, 5000);
    };

    return (
        <RenderComponent
            title={title}
            tutorial={tutorial}
            description={descriptionUserGuide}
            steps={steps}
            sourceLink={sourceLink}
        >
            <form onSubmit={form.onSubmit(onSubmit)}>
                <LoadingOverlay visible={isLoading} />
                {isLoading && (
                    <div>
                        <Button variant="outline" color="red" style={{ zIndex: 1001 }} onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>
                )}
                <Stack>
                    <Group position="right">
                        {!showAlert && (
                            <Button onClick={handleShowAlert} size="xs" variant="outline" color="gray">
                                Show Disclaimer
                            </Button>
                        )}
                    </Group>
                    {UserGuide(title, descriptionUserGuide)}
                    {showAlert && (
                        <Alert title="Warning: Potential Risks" color="red">
                            This tool is used to perform penetration testing on Windows/Active Directory environments,
                            use with caution and only on networks you own or have explicit permission to test.
                        </Alert>
                    )}

                    <Switch
                        size="md"
                        label="Advanced Mode"
                        checked={isAdvancedChecked}
                        onChange={(e) => setIsAdvancedChecked(e.currentTarget.checked)}
                    />

                    <TextInput label={"IP"} required {...form.getInputProps("ip")} />
                    <TextInput label={"Username"} required {...form.getInputProps("username")} />
                    <TextInput label={"Password"} required {...form.getInputProps("password")} />
                    {isAdvancedChecked && (
                        <>
                            <TextInput
                                label={"Timeout"}
                                placeholder={"Time (in seconds) to wait for response to requests. Default is 60"}
                                required
                                {...form.getInputProps("timeout")}
                            />
                        </>
                    )}
                    <Button type={"submit"}>Start Searching!</Button>
                    {SaveOutputToTextFile_v2(output, isSaveAllowed, hasBeenSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

// Default export of the component
export default Crackmapexec;
