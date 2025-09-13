import { Button, NativeSelect, NumberInput, Stack, TextInput, Grid, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { RenderComponent } from "../UserGuide/UserGuide";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { FilePicker } from "../FileHandler/FilePicker";

/**
 * Represents the form values for the Hydra component.
 */
interface FormValuesType {
    loginInputType: string;
    loginArgs: string;
    passwordInputType: string;
    passwordArgs: string;
    threads: string;
    service: string;
    serviceArgs: string;
    nsr: string;
    config: string;
    optionalConfig: string;
}

//Deals with the generatedfilepath unique identifier that is added at the end of a file
const cleanFileName = (filePath: string): string => {
    const parts = filePath.split("_");
    const baseFileName = parts[0];
    return baseFileName;
};

const Hydra = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [selectedService, setSelectedService] = useState("");
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [loadingModal, setLoadingModal] = useState(true);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [fileNames, setFileNames] = useState<string[]>([]);

    // Component Constants.
    const title = "Hydra";
    const description =
        "Hydra is a parallelized login cracker which supports numerous protocols to attack. It is very fast and flexible, and new modules are easy to add.";
    const steps =
        "Step 1: Select the Login settings\n" +
        "Step 2: Specify the Username for the Login\n" +
        "Step 3: Select the Password setting\n" +
        "Step 4: Input password for the Login\n" +
        "Step 5: Select the number of Threads and Service Type\n" +
        "Step 6: Enter an IP address and Port number.\n" +
        "Step 7: Click Crack to commence Hydra's operation.\n" +
        "Step 8: View the Output block below to view the results";
    const sourceLink = "https://www.kali.org/tools/hydra/";
    const tutorial = "https://docs.google.com/document/d/14h62IT7RE86O0-15vUZekNV5IaIWcFy6deNageIJ9J0/edit?usp=sharing";
    const dependencies = ["hydra"];
    const passwordInputTypes = ["Single Password", "File", "Character Set", "Basic"];
    const loginInputTypes = ["Single Login", "File"];
    const serviceType = [
        "FTP",
        "FTPS",
        "HTTP-Get",
        "HTTP-Get-Form",
        "HTTP-Head",
        "HTTP-Post-Form",
        "HTTPS-Get",
        "HTTPS-Get-Form",
        "HTTPS-Head",
        "HTTPS-Post-Form",
        "RDP",
        "RSH",
        "SMB",
        "SMTP",
        "SNMP",
        "SOCKS5",
        "SSH",
        "Telnet",
    ];
    const serviceTypeRequiringConfig = [
        "HTTP-Head",
        "HTTP-Get",
        "HTTP-Get-Form",
        "HTTP-Post-Form",
        "HTTP-Head",
        "HTTPS-Get",
        "HTTPS-Get-Form",
        "HTTPS-Post-Form",
        "Telnet",
    ];

    // Form hook to handle form input. Use form as the single source of truth for selects.
    let form = useForm({
        initialValues: {
            loginInputType: "Single Login",
            loginArgs: "",
            passwordInputType: "Single Password",
            passwordArgs: "",
            threads: "6",
            service: "",
            serviceArgs: "",
            nsr: "nsr",
            config: "",
            optionalConfig: "",
        },
    });

    // Defensive trimmed comparisons based on form values
    const currentLoginType = (form.values.loginInputType || "").trim();
    const currentPasswordType = (form.values.passwordInputType || "").trim();

    const isLoginSingle = currentLoginType === "Single Login";
    const isLoginFile = currentLoginType === "File";
    const isPasswordSingle = currentPasswordType === "Single Password";
    const isPasswordFile = currentPasswordType === "File";
    const isPasswordSet = currentPasswordType === "Character Set";
    const isPasswordBasic = currentPasswordType === "Basic";

    // Combined mount-time behavior: check availability + basic sanity
    useEffect(() => {
        // 1) Check command availability
        const checkCommands = async () => {
            try {
                const isAvailable = await checkAllCommandsAvailability(dependencies);
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable);
            } catch (error) {
                console.error("An error occurred:", error);
            } finally {
                setLoadingModal(false);
            }
        };
        checkCommands();

        // 2) Mount-time sanity check: ensure there will be a username and password source
        const trim = (s?: string) => (s || "").trim();

        const hasLoginSource =
            (form.values.loginInputType === "Single Login" && trim(form.values.loginArgs) !== "") ||
            (form.values.loginInputType === "File" && fileNames.length > 0);

        const hasPasswordSource =
            (form.values.passwordInputType === "Single Password" && trim(form.values.passwordArgs) !== "") ||
            (form.values.passwordInputType === "File" && fileNames.length > 0) ||
            (form.values.passwordInputType === "Character Set" && trim(form.values.passwordArgs) !== "") ||
            form.values.passwordInputType === "Basic";

        if (!hasLoginSource) {
            setOutput(
                (prev) =>
                    prev +
                    "\nNote: Hydra requires at least one username (-l or -L). Please provide a username (Single Login) or select a login file."
            );
            form.setErrors({ loginArgs: "Provide username or select a login file." });
        }

        if (!hasPasswordSource) {
            setOutput(
                (prev) =>
                    prev +
                    "\nNote: Hydra requires at least one password (-p, -P, or -e). Please provide a password (Single Password), select a password file, use Character Set, or choose Basic."
            );
            form.setErrors({
                passwordArgs: "Provide password, select a password file, or choose Basic/Character Set.",
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Helper: authoritative validation used by button and onSubmit
    const validateSubmission = (values: FormValuesType) => {
        const trim = (s?: string) => (s || "").trim();

        const loginType = (values.loginInputType || "").trim();
        const passwordType = (values.passwordInputType || "").trim();

        // login checks
        if (loginType === "") {
            return { valid: false, message: "Select a login input type (Single Login or File)." };
        }
        if (loginType === "Single Login" && trim(values.loginArgs) === "") {
            return { valid: false, message: "Specify a username for 'Single Login'." };
        }
        if (loginType === "File" && (!fileNames || fileNames.length === 0)) {
            return { valid: false, message: "Select a login file when 'File' is chosen." };
        }

        // password checks
        if (passwordType === "") {
            return { valid: false, message: "Select a password input type." };
        }
        if (passwordType === "Single Password" && trim(values.passwordArgs) === "") {
            return { valid: false, message: "Specify a password for 'Single Password'." };
        }
        if (passwordType === "File" && (!fileNames || fileNames.length === 0)) {
            return { valid: false, message: "Select a password file when 'File' is chosen." };
        }
        if (passwordType === "Character Set" && trim(values.passwordArgs) === "") {
            return { valid: false, message: "Provide character set options for 'Character Set'." };
        }

        // service config check
        if (
            serviceTypeRequiringConfig.includes((selectedService || "").trim()) &&
            (!values.config || trim(values.config) === "")
        ) {
            return {
                valid: false,
                message: "This service requires a custom configuration in the 'Custom Configuration' field.",
            };
        }

        return { valid: true, message: "" };
    };

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
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    const onSubmit = async (values: FormValuesType) => {
        // run authoritative validation
        const validation = validateSubmission(values);
        if (!validation.valid) {
            // show friendly text near form + in console output
            form.setErrors({
                loginArgs:
                    values.loginInputType === "Single Login" && values.loginArgs.trim() === ""
                        ? "Provide username."
                        : undefined,
                passwordArgs:
                    values.passwordInputType === "Single Password" && values.passwordArgs.trim() === ""
                        ? "Provide password."
                        : undefined,
            } as any);
            setOutput((prev) => prev + `\nError: ${validation.message}`);
            setAllowSave(true);
            return;
        }

        setLoading(true);
        setAllowSave(false);

        const baseFilePath = "/home/kali";
        const args: string[] = [];

        // login args
        if (values.loginInputType === "Single Login") {
            args.push("-l", `${values.loginArgs}`);
        } else if (values.loginInputType === "File") {
            const fileToSend = fileNames[0];
            const cleanName = cleanFileName(fileToSend);
            const dataUploadPath = `${baseFilePath}/${cleanName}`;
            args.push("-L", dataUploadPath); // -L for username list file
        }

        // password args
        if (values.passwordInputType === "Single Password") {
            args.push("-p", `${values.passwordArgs}`);
        } else if (values.passwordInputType === "File") {
            const fileToSend = fileNames[0];
            const cleanName = cleanFileName(fileToSend);
            const dataUploadPath = `${baseFilePath}/${cleanName}`;
            args.push("-P", dataUploadPath);
        } else if (values.passwordInputType === "Character Set") {
            args.push("-x", `${values.passwordArgs}`);
        } else if (values.passwordInputType === "Basic") {
            args.push("-e", `${values.nsr}`);
        }

        // threads
        if (values.threads) {
            args.push("-t", `${values.threads}`);
        }

        // service / service args
        if (serviceTypeRequiringConfig.includes((selectedService || "").trim())) {
            args.push(`${values.serviceArgs}`, `${(selectedService || "").toLowerCase()}`, `${values.config}`);
        } else {
            args.push(`${(selectedService || "").toLowerCase()}://${values.serviceArgs}`);
        }

        if (values.optionalConfig && values.optionalConfig.length !== 0) {
            args.push(`${values.optionalConfig}`);
        }

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "hydra",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            setOutput((e && e.message) || String(e));
            setLoading(false);
            setAllowSave(true);
        }
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    // lightweight derived disabled state for the submit button
    const isSubmitDisabled =
        loading ||
        !validateSubmission({
            loginInputType: form.values.loginInputType,
            loginArgs: form.values.loginArgs,
            passwordInputType: form.values.passwordInputType,
            passwordArgs: form.values.passwordArgs,
            threads: form.values.threads,
            service: form.values.service,
            serviceArgs: form.values.serviceArgs,
            nsr: form.values.nsr,
            config: form.values.config,
            optionalConfig: form.values.optionalConfig,
        } as FormValuesType).valid;

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
            <form
                onSubmit={form.onSubmit((values) =>
                    onSubmit({
                        ...values,
                    })
                )}
            >
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <Grid>
                        <Grid.Col span={12}>
                            <NativeSelect
                                {...form.getInputProps("loginInputType")}
                                label={"Login settings"}
                                data={loginInputTypes}
                                required
                                placeholder={"Select a setting"}
                            />

                            <Text size="sm" color="dimmed">
                                Hydra requires at least one username and password source. If you need to try an empty
                                username/password, create a list file containing an empty line or use a placeholder such
                                as <code>anonymous</code>.
                            </Text>
                        </Grid.Col>
                        <Grid.Col span={12}>
                            {isLoginSingle && (
                                <TextInput
                                    {...form.getInputProps("loginArgs")}
                                    label={"Specify username"}
                                    placeholder={"eg: kali"}
                                    required
                                />
                            )}
                            {isLoginFile && (
                                <FilePicker
                                    fileNames={fileNames}
                                    setFileNames={setFileNames}
                                    multiple={false}
                                    componentName="Hydra"
                                    labelText="Login File (Can only select files in /home/kali)"
                                    placeholderText="Click to select file(s)"
                                />
                            )}
                        </Grid.Col>
                    </Grid>

                    <Grid>
                        <Grid.Col span={12}>
                            <NativeSelect
                                {...form.getInputProps("passwordInputType")}
                                label={"Password settings"}
                                data={passwordInputTypes}
                                placeholder={"Select a setting"}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            {isPasswordSingle && (
                                <TextInput
                                    {...form.getInputProps("passwordArgs")}
                                    label={"Password"}
                                    placeholder={"eg: root"}
                                    required
                                />
                            )}
                            {isPasswordFile && (
                                <FilePicker
                                    fileNames={fileNames}
                                    setFileNames={setFileNames}
                                    multiple={false}
                                    componentName="Hydra"
                                    labelText="Password File (Can only select files in /home/kali)"
                                    placeholderText="Click to select file(s)"
                                />
                            )}
                            {isPasswordBasic && (
                                <TextInput label={"Null, username, reverse username"} disabled placeholder={"nsr"} />
                            )}
                        </Grid.Col>
                    </Grid>

                    <Grid>
                        <Grid.Col span={6}>
                            <NumberInput
                                label={"Threads"}
                                {...form.getInputProps("threads")}
                                defaultValue={6}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NativeSelect
                                value={selectedService}
                                onChange={(e) => {
                                    const v = (e.target as HTMLSelectElement).value;
                                    setSelectedService(v);
                                }}
                                label={"Service Type"}
                                data={serviceType}
                                required
                                placeholder={"Select a service"}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            {serviceTypeRequiringConfig.includes((selectedService || "").trim()) && (
                                <>
                                    <TextInput
                                        label={"Custom Configuration"}
                                        required
                                        {...form.getInputProps("config")}
                                    />
                                </>
                            )}
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <TextInput
                                {...form.getInputProps("serviceArgs")}
                                label={"IP address"}
                                placeholder={"eg: 192.168.1.1"}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <TextInput
                                {...form.getInputProps("optionalConfig")}
                                label={"Optional Configuration"}
                                placeholder={"Please input your optional parameters"}
                            />
                        </Grid.Col>
                    </Grid>

                    <Button type={"submit"} color="cyan" disabled={isSubmitDisabled}>
                        Crack
                    </Button>

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Hydra;
