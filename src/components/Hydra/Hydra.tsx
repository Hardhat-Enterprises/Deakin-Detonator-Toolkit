import {
    Button,
    LoadingOverlay,
    NativeSelect,
    NumberInput,
    Stack,
    TextInput,
    Title,
    HoverCard,
    Text,
    Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValuesType {
    user: string;
    threads: string;
    server: string;
    passwordInputType: string;
    serviceInputType: string;
    passwordArgs: string;
}

const passwordInputTypes = ["-p", "-P", "-x", "-e"];
const loginInputTypes = ["-l", "-L"];

const Hydra = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedPasswordInput, setSelectedPasswordInput] = useState("");
    const [setselectedLoginInput, setsetselectedLoginInput] = useState("");

    let form = useForm({
        initialValues: {
            passwordInputType: "",
            serviceInputType: "",
            user: "",
            threads: "6",
            server: "",
            passwordArgs: "",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);

        try {
            const args = [
                "-l",
                `${values.user}`,
                `${values.passwordInputType}`,
                `${values.passwordArgs}`,
                "-t",
                `${values.threads}`,
                `${values.server}`,
            ];
            const output = await CommandHelper.runCommand("hydra", args);

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
        <form
            onSubmit={form.onSubmit((values) =>
                onSubmit({
                    ...values,
                    passwordInputType: selectedPasswordInput,
                    serviceInputType: setselectedLoginInput,
                })
            )}
        >
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title>Hydra</Title>
                <NativeSelect
                    value={setselectedLoginInput}
                    onChange={(e) => setsetselectedLoginInput(e.target.value)}
                    label={"Login settings"}
                    description={"-l [login]; -L [/path/to/logins.txt]"}
                    data={loginInputTypes}
                    placeholder={"Select logins"}
                />
                <TextInput {...form.getInputProps("user")} />
                <NativeSelect
                    value={selectedPasswordInput}
                    onChange={(e) => setSelectedPasswordInput(e.target.value)}
                    label={"Password settings"}
                    description={"-p [password]; -P [/path/to/dictionary.txt]; -x [min:max:charset]; -e [nsr]"}
                    data={passwordInputTypes}
                    placeholder={"Select a tool to crack with"}
                />
                <TextInput {...form.getInputProps("passwordArgs")} />
                <NumberInput
                    label={"Number of threads"}
                    {...form.getInputProps("threads")}
                    defaultValue={6}
                    placeholder={"Choose how many"}
                    required
                />
                <TextInput label={"Services"} {...form.getInputProps("server")} />
                <Group position="left">
                    <HoverCard width={280} shadow="md">
                        <HoverCard.Target>
                            <Button>Hover to see tips on Services</Button>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                            <Text size="sm">
                                Form: service://serverip:port/opt Services: [ssh://], [smtp://], [nfs://] Examples:
                                [ssh://192.168.1.1/22] Check for open ports with nmap!
                            </Text>
                        </HoverCard.Dropdown>
                    </HoverCard>
                </Group>
                <Button type={"submit"}>Crack It</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Hydra;
