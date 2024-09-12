import { Button, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the Goldeneye component.
 */
interface FormValuesType {
    url: string;
    userAgent: string;
    worker: number;
    sockets: number;
    method: string;
    sslCheck: string;
}

/**
 * The Goldeneye component.
 * @returns The Goldeneye component.
 */
const Goldeneye = () => {
    //Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable to indicate if saving is allowed
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved
    const [selectedMethod, setSelectedMethod] = useState(""); //State variable to store the method selected
    const [selectedSslCheck, setSelectedSslCheck] = useState(""); //State variable to store selected ssl check
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [loadingModal, setLoadingModal] = useState(true); // State variable that indicates if the modal is opened.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable to indicate loading state of the modal.

    // Component Constants.
    const title = "Goldeneye"; // Title of the component.
    const description =
        "Goldeneye is a HTTP DoS Test Tool. This tool can be used to test if a site is susceptible to Denial of Service (DoS) attacks. Is possible to open several parallel connections against a URL to check if the web server can be compromised"; // Description of the component.
    const steps =
        "Step 1: Enter a valid URL of the target.\n" +
        "Step 2: Enter any additional options for the scan.\n" +
        "Step 3: Enter any additional parameters for the scan.\n" +
        "Step 4: Click Launch DoS Attack to commence GoldenEye's operation.\n" +
        "Step 5: View the Output block below to view the results of the tool's execution.";
    const sourceLink = "https://www.kali.org/tools/goldeneye/"; // Link to the source code (or Kali Tools).
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["python3"]; // Contains the dependencies required by the component.
    const dosHttpMethod = ["get", "post", "random"]; //Contains types of dosHttpMethod available
    const sslCheckStatus = ["Yes", "No"]; //Contains selection for form value sslCheckStatus

    // Form hook to handle form input.
    let form = useForm({
        initialValues: {
            url: "",
            userAgent: "",
            worker: 0,
            sockets: 0,
            method: "",
            sslCheck: "",
        },
    });

    // Check if the command is available and set the state variables accordingly.
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
                setLoadingModal(false); // Also set loading to false in case of error
            });
    }, []);

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Append new data to the previous output.
    }, []);

    /**
     * handleProcessTermination: Callback to handle the termination of the child process.
     * Once the process termination is handled, it clears the process PID reference and
     * deactivates the loading overlay.
     * @param {object} param - An object containing information about the process termination.
     * @param {number} param.code - The exit code of the terminated process.
     * @param {number} param.signal - The signal code indicating how the process was terminated.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            // If the process was successful, display a success message.
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");

                // If the process was terminated manually, display a termination message.
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");

                // If the process was terminated with an error, display the exit and signal codes.
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }

            // Clear the child process pid reference. There is no longer a valid process running.
            setPid("");

            // Cancel the loading overlay. The process has completed.
            setLoading(false);

            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData],
    );

    /**
     * handleSaveComplete: handle state changes when saves are completed
     * Once the output is saved, prevent duplicate saves
     */
    const handleSaveComplete = () => {
        //Disallow saving once the output is saved
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the goldeneye tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the url, userAgent, worker, sockets, method, sslCheck
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the goldeneye command based on form input
        const args = [`/home/kali/Deakin-Detonator-Toolkit/src-tauri/exploits/Goldeneye/goldeneye.py`, `${values.url}`];
        values.userAgent ? args.push(`-u`, `${values.userAgent}`) : undefined;
        values.worker ? args.push(`-w`, `${values.worker}`) : undefined;
        values.sockets ? args.push(`-s`, `${values.sockets}`) : undefined;
        selectedMethod ? args.push(`-m`, selectedMethod) : undefined;
        selectedSslCheck === "No" ? args.push(`-n`) : undefined;

        try {
            // Execute the goldeneye command via helper method and handle its output or potential errors
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "python3",
                args,
                handleProcessData,
                handleProcessTermination,
            );

            // Update the UI with the results from the executed command
            setPid(result.pid);
            setOutput(result.output);
            console.log(pid);
        } catch (e: any) {
            // Display any errors encountered during command execution
            setOutput(e.message);
            // Deactivate loading state
            setLoading(false);
        }
    };

    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");

        //Disallow saving when output is cleared
        setHasSaved(false);
        setAllowSave(false);
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
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleProcessData, handleProcessTermination)}
                    <TextInput
                        label={"URL of the target"}
                        placeholder={"Example: https://www.google.com"}
                        required
                        {...form.getInputProps("url")}
                    />
                    <TextInput
                        label={"List of user agents"}
                        placeholder={"Please enter filepath for the list of user agents"}
                        {...form.getInputProps("userAgent")}
                    />
                    <TextInput
                        label={"Number of concurrent workers"}
                        placeholder={"Please specify a number (Default = 10)"}
                        {...form.getInputProps("worker")}
                    />
                    <TextInput
                        label={"Number of concurrent sockets"}
                        placeholder={"Please specify a number (Default = 500)"}
                        {...form.getInputProps("sockets")}
                    />
                    <NativeSelect
                        value={selectedMethod}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        title={"HTTP Method"}
                        data={dosHttpMethod}
                        placeholder={"HTTP Method"}
                        description={"Please select type of HTTP request to flood server with"}
                    />
                    <NativeSelect
                        value={selectedSslCheck}
                        onChange={(e) => setSelectedSslCheck(e.target.value)}
                        title={"SSL Check"}
                        data={sslCheckStatus}
                        placeholder={"ssl Check"}
                        description={"Do you want to verify the ssl certificate"}
                    />
                    <Button type={"submit"}>Launch DoS Attack</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Goldeneye;
