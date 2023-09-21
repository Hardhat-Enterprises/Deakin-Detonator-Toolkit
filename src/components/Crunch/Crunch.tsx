import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";

const title = "Crunch Password Generator";
const description_userguide =
    "Crunch is a wordlist generator where you can specify a standard character set or a custom one based on the " +
    "needs of your project. Crunch can create a wordlist based on criteria you specify. The wordlist can be " +
    "used for various purposes such as dictionary attacks or password cracking.\n\nYou can find more information " +
    "about the tool, including usage instructions and examples, in its official documentation: https://tools.kali." +
    "org/password-attacks/crunch\n\n" +
    "Using Crunch:\n" +
    "Step 1: Enter a Minimum password length.\n" +
    "       Eg: 8\n\n" +
    "Step 2: Enter a Maximum password length.\n" +
    "       Eg: 8\n\n" +
    "Step 3: Enter a Character set for the password generation.\n" +
    "       Eg: abcdefghijklmnopqrstuvwxyz123456789\n\n" +
    "Step 4: (Optional) Enter the directory for an Output file.\n\n" +
    "Step 5: Click Generate Password List to commence Crunch's operation.\n\n" +
    "Step 6: View the Output block below to view the results of the tools execution.";

//list of input values collected by the form
interface FormValuesType {
    minLength: number;
    maxLength: number;
    charset: string;
    outputFile: string;
}

const Crunch = () => {
    //sets the state of the tool; loading or not, what the output is
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    //initial form values
    let form = useForm({
        initialValues: {
            minLength: 8,
            maxLength: 8,
            charset: "abcdefghijklmnopqrstuvwxyz0123456789",
            outputFile: "",
        },
    });

    //sets the loading state to True, provides arguments for the tool
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);

        const args = [`${values.minLength}`, `${values.maxLength}`, `${values.charset}`];

        //pushes the output file argument if one is provided by user
        if (values.outputFile) {
            args.push(`-o ${values.outputFile}`);
        }

        //try the crunch command with provided arguments, show output if successful or error message if not.
        try {
            const output = await CommandHelper.runCommand("crunch", args);
            setOutput(output);
        } catch (e: any) {
            setOutput(e);
        }

        setLoading(false);
    };

    //clears output without completely refreshing the tool
    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        //define user interface of the tool
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput
                    label={"Minimum password length"}
                    type="number"
                    min={1}
                    required
                    {...form.getInputProps("minLength")}
                />
                <TextInput
                    label={"Maximum password length"}
                    type="number"
                    min={1}
                    required
                    {...form.getInputProps("maxLength")}
                />
                <TextInput
                    label={"Character set (e.g. abcdefghijklmnopqrstuvwxyz0123456789)"}
                    required
                    {...form.getInputProps("charset")}
                />
                <TextInput label={"Output file (optional)"} {...form.getInputProps("outputFile")} />
                <Button type={"submit"}>Generate Password List</Button>
                {SaveOutputToTextFile(output)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Crunch;
