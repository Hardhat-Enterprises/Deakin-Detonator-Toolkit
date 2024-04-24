import { Button, LoadingOverlay, Stack, TextInput, NativeSelect, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";

const title = "Fcrackzip Tool";
const description_guide =
    "Fcrackzip is a tool for cracking password of a protected zip file.\n\n" +
    "Step 1: Input path of the zip file.\n\n" +
    "Step 2: Select an Attack Mode (Dictionary or Brute Force)\n\n" +
    "Step 3: You can save output by checking 'Save Output to File'\n\n" +
    "Step 4: Click START CRACKING!\n\n";

interface FormValuesType {
    dictionary: string;
    zip: string;
    minLength?: number;
    maxLength?: number;
    charSet: string;
}

const methods = ["Dictionary", "BruteForce"];

const Fcrackzip = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [attackMethod, setAttackmethod] = useState("");
    const [checkedUnzip, setCheckedUnzip] = useState(true);
    const [pid, setPid] = useState("");
    const [useCharsetUppercase, setCharsetUppercase] = useState(false);
    const [useCharsetLowercase, setCharsetLowercase] = useState(false);
    const [useCharsetNumeric, setCharsetNumeric] = useState(false);
    const [checkedVerbose, setCheckedVerbose] = useState(false);

    const isDictionary = attackMethod === "Dictionary";
    const isBruteForce = attackMethod === "BruteForce";

    let form = useForm({
        initialValues: {
            dictionary: "",
            zip: "",
            minLength: 1,
            maxLength: 3,
            charSet: "",
        },
    });

    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

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

    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
    };

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
            setOutput(result.output);
        } catch (e: any) {
            setOutput(e.message);
        }
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, []);

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            {loading && (
                <div>
                    <Button variant="outline" color="red" style={{ zIndex: 1001 }} onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            )}

            <Stack>
                {UserGuide(title, description_guide)}
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
                {SaveOutputToTextFile(output)}
                <Button type={"submit"}>Start Cracking!</Button>

                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                <Button onClick={clearOutput}>Clear Output</Button>
            </Stack>
        </form>
    );
};

export default Fcrackzip;
