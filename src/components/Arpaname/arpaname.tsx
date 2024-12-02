import { useState, useEffect, useCallback } from "react";
import { Button, Stack, TextInput, Radio } from "@mantine/core";
import { useForm } from "@mantine/form";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { CommandHelper } from "../../utils/CommandHelper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";

/**
 * Represents the form values for the Arpaname component.
 */
interface FormValuesType {
    ipAddress: string;
    ipType: "IPv4" | "IPv6"; // New field to store the IP type
}

/**
 * ArpanameTool component for performing reverse DNS lookups on IP addresses.
 * This component provides a user interface for entering an IP address and
 * displaying the results of the arpaname command.
 * @returns JSX.Element The rendered ArpanameTool component
 */
const ArpanameTool = () => {
    const title = "Arpaname";
    const description = "Perform reverse DNS lookups for IP addresses.";
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pidTarget, setPidTarget] = useState("");
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    // Component Constants
    const steps =
        "Step 1: Type in the target IP address\n" +
        "Step 2: Click lookup to run Arpaname.\n" +
        "Step 3: View the output block to see the results.";
    const sourceLink = "https://www.kali.org/tools/bind9/#arpaname";
    const tutorial = "";
    const dependencies = ["arpaname"];

    // Check for command availability on component mount
    useEffect(() => {
        // Check if the command is available and set the state variables accordingly.
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable); // Set the command availability state
                setOpened(!isAvailable); // Set the modal state to opened if the command is not available
                setLoadingModal(false); // Set loading to false after the check is done
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false);
            });
    }, []);

    const form = useForm<FormValuesType>({
        initialValues: {
            ipAddress: "",
            ipType: "IPv4", // Default type is IPv4
        },
    });

    /**
    handleProcessData: Callback to handle and append new data from the child process to the output.
    It updates the state by appending the new data received to the existing output.*/
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    /**
    handleProcessTermination: Callback to handle the termination of the child process.
    Once the process termination is handled, it clears the process PID reference and
    deactivates the loading overlay.*/
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }
            setLoading(false); // Indicate that the process is no longer running
            // Allow the user to save the output to a file.
            setAllowSave(true); // Enable the save option now that the process has completed
            setHasSaved(false); // Reset the saved state for the new output
        },
        [handleProcessData]
    );

    /**
     * Handles the completion of the save operation.
     * Updates state to reflect that the output has been saved and disables further saving.
     */
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true); // Update state to indicate the output has been saved
        setAllowSave(false); // Disable the save option after successful save
    };

    // Validates if the given input string is a valid IPv4 or IPv6 address.
    const validateIPAddress = (ip: string, type: "IPv4" | "IPv6") => {
        const ipv4Pattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Pattern =
            /^(([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){0,6}:([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})|::)$/;
        return type === "IPv4" ? ipv4Pattern.test(ip) : ipv6Pattern.test(ip);
    };

    const onSubmit = async (values: FormValuesType) => {
        if (!validateIPAddress(values.ipAddress, values.ipType)) {
            setErrorMessage(`Please enter a valid ${values.ipType} address.`);
            return;
        }
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);
        // Reset the error message state when validation succeeds
        setErrorMessage("");
        // Activate loading state to indicate ongoing process
        setLoading(true);

        const argsIP = [values.ipAddress]; // Prepare arguments for the arpaname command
        // Execute arpaname command for the target
        const result_target = await CommandHelper.runCommandGetPidAndOutput(
            "arpaname",
            argsIP,
            handleProcessData, // Pass handleProcessData as callback for handling process data
            handleProcessTermination
        );
        setPidTarget(result_target.pid); // Store the process ID for potential termination

        setLoading(false); // Hide loading indicator after command completion
    };

    /**
     * Callback function to clear the output state.
     * This function is memoized using the `useCallback` hook to prevent unnecessary re-renders.
     */
    const clearOutput = useCallback(() => {
        setOutput(""); // Clear the command output text
        setHasSaved(false); // Reset the saved state as there's no output to save
        setAllowSave(false); // Disable the save option as there's no output to save
    }, [setOutput]);

    return (
        <RenderComponent
            title={title}
            description={description}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description}
                    dependencies={dependencies}
                ></InstallationModal>
            )}
            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pidTarget)}
                    <TextInput label={"IP address"} required {...form.getInputProps("ipAddress")}></TextInput>
                    <Radio.Group
                        value={form.values.ipType}
                        onChange={(value) => form.setFieldValue("ipType", value as "IPv4" | "IPv6")}
                        label="Select IP Type"
                        required
                    >
                        <Radio value="IPv4" label="IPv4" />
                        <Radio value="IPv6" label="IPv6" />
                    </Radio.Group>
                    {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
                    {/* Render error message if present */}
                    <Button type={"submit"}>Lookup</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default ArpanameTool;
