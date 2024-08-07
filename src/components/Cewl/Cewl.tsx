import { Button, LoadingOverlay, Stack, TextInput, Checkbox, Switch, NativeSelect } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
//import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";

/**
 * Represents the form values for the Cewl component.
 */
interface FormValuesType {
    depth: string;
    minLength?: string;
    maxLength?: string;
    url: string;
    authType?: string;
    userName: string;
    password: string;
    wordList: string;

}
// Component Constants.
const title = "Cewl";
const description_userguide =
    "The tool Cewl, renown for being a Custom Word List Generator, is a ruby app which spiders given URLs to " +
    "a specified depth to return a list of words that are able to be used within password crackers including " +
    " JohnTheRipper (which can be found within the DDT). This tool is particularly useful for security testing and " +
    "forensic investigation.\n\nOptions for the tool can be found at:  https://www.kali.org/tools/cewl/#:~:text=CeWL" +
    "%20(Custom%20Word%20List%20generator,\nCeWL%20can%20follow%20external%20links.\n\n" +
    "Using Cewl\n" +
    "Step 1: Enter the Maximum depth to spider to.\n" +
    "       Eg: 2\n\n" +
    "Step 2: Enter a Minimum word length.\n" +
    "       Eg: 3\n\n" +
    "Step 3: Enter a Target URL.\n" +
    "       Eg: google.com\n\n" +
    "Step 4: Click Scan to commence Cewl's operation.\n\n" +
    "Step 5: View the Output block below to view the results of the tools execution.";

const methods = ["No authentication", "Basic", "Digest"];

const Cewl = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [checkedAdvanced, setCheckedAdvanced] = useState(false);
    const [pid, setPid] = useState("");
    const [checkedNumber, setCheckedNumber] = useState(false);
    const [checkedCount, setCheckedCount] = useState(false);
    const [checkedEmail, setCheckedEmail] = useState(false);
    const [checkedLowercase, setCheckedLowercase] = useState(false);
    const [authType, setAuthType] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    let form = useForm({
        initialValues: {
            depth: "",
            minLength: "",
            maxLength: "",
            url: "",
            userName: "",
            password: "",
            wordList: "",
        },
    });
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
    }, []);
    // Uses the onTermination callback function of runCommandGetPidAndOutput to handle
    // the termination of that process, resetting state variables, handling the output data,
    // and informing the user.
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
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
        [handleProcessData]
    );
    // Sends a SIGTERM signal to gracefully terminate the process
    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
    };

    // Actions taken after saving the output
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    const onSubmit = async (values: FormValuesType) => {
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        setLoading(true);
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
            if (values.userName) {
                args.push("--auth_user", `${values.userName}`);
            }
            if (values.password) {
                args.push("--auth_pass", `${values.password}`);
            }
        } else if (authType === "Digest") {
            args.push("--auth_type", "digest");
            if (values.userName) {
                args.push("--auth_user", `${values.userName}`);
            }
            if (values.password) {
                args.push("--auth_pass", `${values.password}`);
            }
        }
        if (values.wordList) {
            args.push("-w", `${values.wordList}`);
        }

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "cewl",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            setOutput(e.message);
        }
    };
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    const isBasicAuth = authType === "Basic";
    const isDigestAuth = authType === "Digest";
    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <LoadingOverlay visible={loading} />
            {loading && (
                <div>
                    <Button variant="outline" color="red" style={{ zIndex: 1001 }} onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            )}
            <Stack>
                {UserGuide(title, description_userguide)}
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
                                        label={"UserName"}
                                        required
                                        style={{ flex: 1 }}
                                        {...form.getInputProps("userName")}
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
                                <TextInput label={"UserName"} required {...form.getInputProps("userName")} />
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
    );
};
export default Cewl;
