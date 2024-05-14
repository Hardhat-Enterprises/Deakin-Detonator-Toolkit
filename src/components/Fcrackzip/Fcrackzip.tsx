import { Button, Stack, TextInput, NativeSelect, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import InstallationModal from "../InstallationModal/InstallationModal";

// Define the form values interface
interface FormValuesType {
    dictionary: string;
    zip: string;
    minLength?: number;
    maxLength?: number;
    charSet: string;
}

/**
 * Fcrackzip component for cracking password-protected zip files.
 * @returns {JSX.Element} The Fcrackzip component.
 */
const Fcrackzip = () => {
    // Component state variables
    const [loading, setLoading] = useState(false); // Indicates loading state
    const [output, setOutput] = useState(""); // Stores the output of command execution
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [attackMethod, setAttackmethod] = useState(""); // Stores the selected attack method
    const [checkedUnzip, setCheckedUnzip] = useState(true); // Indicates if unzip option is checked
    const [pid, setPid] = useState(""); // Stores the process ID
    const [useCharsetUppercase, setCharsetUppercase] = useState(false); // Indicates if uppercase character set is selected
    const [useCharsetLowercase, setCharsetLowercase] = useState(false); // Indicates if lowercase character set is selected
    const [useCharsetNumeric, setCharsetNumeric] = useState(false); // Indicates if numeric character set is selected
    const [checkedVerbose, setCheckedVerbose] = useState(false); // Indicates if verbose mode is checked
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    
    // Define the attack methods
    const methods = ["Dictionary", "BruteForce"];

    // Component title
    const title = "Fcrackzip";
    // Description of the component
    const description_guide = "Fcrackzip is a tool for cracking the password of a protected zip file.";
    // Additional props for the RenderComponent
    const steps =
        "Step 1: Input path of the zip file.\n" +
        "Step 2: Select an Attack Mode (Dictionary or Brute Force)\n" +
        "Step 3: You can save output by checking 'Save Output to File'\n" +
        "Step 4: Click start cracking!";
    // Link to the tutorial
    const tutorial = "";
    // Link to the source code
    const sourceLink = "";

    // Determine if attack method is Dictionary
    const isDictionary = attackMethod === "Dictionary";
    // Determine if attack method is Brute Force
    const isBruteForce = attackMethod === "BruteForce";
    // Dependencies required by the component
    const dependencies = ["fcrackzip"];

    // Initialize form hook
    const form = useForm({
        initialValues: {
            dictionary: "",
            zip: "",
            minLength: 1,
            maxLength: 3,
            charSet: "",
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
     * Callback function to handle process data.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    /**
     * Callback function to handle process termination.
     * @param {object} param - An object containing information about the process termination.
     * @param {number} param.code - The exit code of the terminated process.
     * @param {number} param.signal - The signal code indicating how the process was terminated.
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
            setPid("");
            setLoading(false);
        },
        [handleProcessData]
    );
    
    // Actions taken after saving the output
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * Function to handle form submission.
     * @param {FormValuesType} values - The form values.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [];

        if (attackMethod === "Dictionary") {
            args.push("-D", "-p", `${values.dictionary}`, "-u");
        } else if (attackMethod === "BruteForce") {
            args.push("-b");

            if (checkedVerbose) args.push("-v");

            let charSet = "";

            if (useCharsetLowercase) charSet += "a";
            if (useCharsetUppercase) charSet += "A";
            if (useCharsetNumeric) charSet += "1";

            if (charSet) args.push("-c", charSet);

            if (values.maxLength && values.minLength) args.push("-l", `${values.minLength}-${values.maxLength}`);

            if (checkedUnzip) args.push("-u");
        }

        if (values.zip) {
            args.push(values.zip);
        }

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "fcrackzip",
                args,
                handleProcessData,
                handleProcessTermination
            );

            setPid(result.pid);          

           // Set output without checking for cracked password match
            setOutput(result.output);
            } catch (e: any) {
            setOutput(e.message);
            } finally {
            setLoading(false);
            }
    };

    /**
     * Function to clear output.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
    }, []);

    return (
        <RenderComponent
            title={title}
            description={description_guide}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description_guide}
                    dependencies={dependencies}
                ></InstallationModal>
            )}
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <TextInput
                        label={"Zip file"}
                        placeholder="Specify the zip file."
                        required
                        {...form.getInputProps("zip")}
                    />
                    <NativeSelect
                        value={attackMethod}
                        onChange={(e) => setAttackmethod(e.target.value)}
                        label={"Attack Method"}
                        data={methods}
                        required
                        placeholder={"Select attack method"}
                    />

                    {isDictionary && (
                        <TextInput
                            label={"Dictionary"}
                            placeholder="Path file of the dictionary."
                            required
                            {...form.getInputProps("dictionary")}
                        />
                    )}
                    {isBruteForce && (
                        <>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <span style={{ marginRight: "10px" }}>Charset List:</span>
                                <Checkbox
                                    label="Use Lowercase Character"
                                    checked={useCharsetLowercase}
                                    onChange={(e) => setCharsetLowercase(e.currentTarget.checked)}
                                />
                                <span style={{ margin: "0 10px" }}></span>
                                <Checkbox
                                    label="Use Uppercase Character"
                                    checked={useCharsetUppercase}
                                    onChange={(e) => setCharsetUppercase(e.currentTarget.checked)}
                                />
                                <span style={{ margin: "0 10px" }}></span>
                                <Checkbox
                                    label="Use Numeric Character"
                                    typeof="number"
                                    checked={useCharsetNumeric}
                                    onChange={(e) => setCharsetNumeric(e.currentTarget.checked)}
                                />
                            </div>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <TextInput
                                    label={"Min Length"}
                                    type="number"
                                    required
                                    {...form.getInputProps("minLength")}
                                />
                                <span style={{ margin: "0 10px" }}></span>
                                <TextInput
                                    label={"Max Length"}
                                    type="number"
                                    required
                                    {...form.getInputProps("maxLength")}
                                />
                            </div>
                            <Checkbox
                                label={
                                    "Verbose Mode: Generates extended information of files inside zip. (eg. name, size, etc.)"
                                }
                                checked={checkedVerbose}
                                onChange={(e) => setCheckedVerbose(e.currentTarget.checked)}
                            />
                            <Checkbox
                                label={"Show cracked password."}
                                checked={checkedUnzip}
                                onChange={(e) => setCheckedUnzip(e.currentTarget.checked)}
                            />
                        </>
                    )}
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type={"submit"}>Start Cracking!</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />                    
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Fcrackzip;
