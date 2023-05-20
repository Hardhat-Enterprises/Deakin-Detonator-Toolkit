import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValues {
    url: string;
    options: string;
    param: string;
}

const GoldenEye = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            url: "",
            options: "",
            param: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        // goldeneye url options
        let tmp = "-" + values.options;
        const args = [values.url, tmp, values.param];

        try {
            const output = await fulfillWithTimeLimit(1, CommandHelper.runCommand("goldeneye", args), null);
            setOutput(output);
        } catch (e: any) {
            setOutput(e);
        }
        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title>GoldenEye</Title>
                <TextInput
                    label={"Url of the target"}
                    placeholder={"Example: https://www.google.com"}
                    required
                    {...form.getInputProps("url")}
                />
                <TextInput label={"Options"} placeholder={"Example: U"} {...form.getInputProps("options")} />
                <TextInput label={"Parameters"} placeholder={""} {...form.getInputProps("param")} />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

async function fulfillWithTimeLimit(timeLimit, task, failureValue) {
    let timeout;
    const timeoutPromise = new Promise((resolve, reject) => {
        timeout = setTimeout(() => {
            resolve(failureValue);
        }, timeLimit);
    });
    const response = await Promise.race([task, timeoutPromise]);
    if (timeout) {
        //the code works without this but let's be safe and clean up the timeout
        clearTimeout(timeout);
    }
    return response;
}

export default GoldenEye;
