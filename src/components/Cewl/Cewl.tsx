import { Button, LoadingOverlay, Stack, TextInput, Checkbox, Switch, NativeSelect } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

/**
 * Represents the form values for the Cewl component.
 */
interface FormValuesType {
    depth: string;
    minLength?: string;
    maxLength?: string;
    url: string;
    authType?: string;
    username: string;
    password: string;
    wordList: string;
}

/**
 * The Cewl component.
 * @returns The Cewl component.
 */
const Cewl = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); //  State variable to store the process ID of the command execution.
    const [allowSave, setAllowSave] = useState(false); //   State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [authType, setAuthType] = useState(""); // State variable that indicates authentication.
    const [checkedAdvanced, setCheckedAdvanced] = useState(false); // State variable to toggle advanced mode.
    const [checkedNumber, setCheckedNumber] = useState(false); // State variable to include words with numbers.
    const [checkedCount, setCheckedCount] = useState(false); // State variable to show the count for each word found.
    const [checkedEmail, setCheckedEmail] = useState(false); // State variable to include and show email addresses.
    const [checkedLowercase, setCheckedLowercase] = useState(false); // State variable to show only lowercase words.

    // Component Constants.
    const methods = ["No authentication", "Basic", "Digest"]; // Variable to store authentication methods.
    const title = "Cewl"; // Title of the component.
    const description =
        "The tool Cewl, renown for being a custom word list generator, is a ruby app which spiders given URLs to " +
        "a specified depth to return a list of words that are able to be used within password crackers including " +
        " JohnTheRipper (which can be found within DDT). This tool is particularly useful for security testing and " +
        "forensic investigation.\nOptions for the tool can be found at:  https://www.kali.org/tools/cewl/#:~:text=CeWL"; // Description of the component.
    const steps =
        "Step 1: Enter the maximum depth to spider to. Eg: 2\n" +
        "Step 2: Enter a minimum word length. Eg: 3\n" +
        "Step 3: Enter a target URL. Eg: google.com\n" +
        "Step 4: Click 'Scan' to commence Cewl's operation.\n" +
        "Step 5: View the output block below to view the results of the tools execution.";
    const sourceLink = "https://salsa.debian.org/pkg-security-team/cewl"; // Link to the source code (or Kali Tools).
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["ruby"]; // Contains the dependencies required by the component.

    // Form hook to handle form input.
    let form = useForm({
        initialValues: {
            depth: "",
            minLength: "",
            maxLength: "",
            url: "",
            username: "",
            password: "",
            wordList: "",
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

    /** *
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     *  It updates the state by appending the new data received to the existing output.
     *  @param {string} data - The data received from the child process.
     * */
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

            // Clear the child process pid reference
            setPid("");

            // Cancel the Loading Overlay
            setLoading(false);
            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    // Actions taken after saving the output
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the cewl tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the depth, minLength, maxLength, url, authType, username, password and wordList.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        // Construct arguments for the cewl command based on form input
        const args = [];
        if (values.depth) {
            args.push("-d", `${values.depth}`);
        }
        if (values.minLength) {
            args.push("-m", `${values.minLength}`);
        }
        if (values.maxLength) {
            args.push("-x", `${values.maxLength}`);
        }
        if (checkedNumber) args.push("--with-numbers");
        if (checkedCount) args.push("-c");
        if (checkedLowercase) args.push("--lowercase");
        if (checkedEmail) args.push("-e");
        if (values.url) {
            args.push(values.url);
        }
        if (authType === "Basic") {
            args.push("--auth_type", "basic");
            if (values.username) {
                args.push("--auth_user", `${values.username}`);
            }
            if (values.password) {
                args.push("--auth_pass", `${values.password}`);
            }
        } else if (authType === "Digest") {
            args.push("--auth_type", "digest");
            if (values.username) {
                args.push("--auth_user", `${values.username}`);
            }
            if (values.password) {
                args.push("--auth_pass", `${values.password}`);
            }
        }
        if (values.wordList) {
            args.push("-w", `${values.wordList}`);
        }

        // Execute the cewl command via helper method and handle its output or potential errors
        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "cewl",
                args,
                handleProcessData,
                handleProcessTermination
            );
            // Update the UI with the results from the executed command
            setPid(result.pid);
            setOutput(result.output);
            // Enable setAllowSave to generate output file
            setAllowSave(true);
        } catch (e: any) {
            setOutput(e.message);
            // Disallow save after the output
            setAllowSave(false);
        }
    };

    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    const isBasicAuth = authType === "Basic";
    const isDigestAuth = authType === "Digest";

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
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack>
                    <Switch
                        size="md"
                        label="Advanced Mode"
                        checked={checkedAdvanced}
                        onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                    />
                    <TextInput
                        label={"Target URL"}
                        placeholder={"https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit"}
                        required
                        {...form.getInputProps("url")}
                    />
                    <TextInput
                        label={"Save wordList"}
                        placeholder={"/home/kali/Desktop/WordList.txt"}
                        {...form.getInputProps("wordList")}
                    />
                    {checkedAdvanced && (
                        <>
                            <TextInput
                                label={"Max depth"}
                                type="number"
                                placeholder={"Deafult is set to 2"}
                                {...form.getInputProps("depth")}
                            />
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <TextInput
                                    label={"Min Length"}
                                    placeholder={"0"}
                                    type="number"
                                    style={{ flex: 1 }}
                                    {...form.getInputProps("minLength")}
                                />
                                <span style={{ margin: "0 10px" }}></span>
                                <TextInput
                                    label={"Max Length"}
                                    placeholder={"0"}
                                    type="number"
                                    style={{ flex: 1 }}
                                    {...form.getInputProps("maxLength")}
                                />
                            </div>
                            {setAuthType && (
                                <NativeSelect
                                    value={authType}
                                    onChange={(e) => setAuthType(e.target.value)}
                                    label={"Authentication Type"}
                                    data={methods}
                                    placeholder={"Select authentication type"}
                                />
                            )}
                            {isBasicAuth && (
                                <>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <TextInput
                                            label={"Username"}
                                            required
                                            style={{ flex: 1 }}
                                            {...form.getInputProps("username")}
                                        />
                                        <span style={{ margin: "0 10px" }}></span>
                                        <TextInput
                                            label={"Password"}
                                            required
                                            style={{ flex: 1 }}
                                            {...form.getInputProps("password")}
                                        />
                                    </div>
                                </>
                            )}
                            {isDigestAuth && (
                                <>
                                    <TextInput label={"Username"} required {...form.getInputProps("username")} />
                                    <TextInput label={"Password"} required {...form.getInputProps("password")} />
                                </>
                            )}
                            <Checkbox
                                label={"Include words with numbers"}
                                checked={checkedNumber}
                                onChange={(e) => setCheckedNumber(e.currentTarget.checked)}
                            />
                            <Checkbox
                                label={"Show only lowercase words"}
                                checked={checkedLowercase}
                                onChange={(e) => setCheckedLowercase(e.currentTarget.checked)}
                            />
                            <Checkbox
                                label={"Show the count for earch word found"}
                                checked={checkedCount}
                                onChange={(e) => setCheckedCount(e.currentTarget.checked)}
                            />
                            <Checkbox
                                label={"Include and show email addresses"}
                                checked={checkedEmail}
                                onChange={(e) => setCheckedEmail(e.currentTarget.checked)}
                            />
                        </>
                    )}
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type={"submit"}>Scan</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};
export default Cewl;
