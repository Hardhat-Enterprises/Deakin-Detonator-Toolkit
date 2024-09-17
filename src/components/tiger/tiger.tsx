const Tiger = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [pid, setPid] = useState("");
    const [verboseMode, setVerboseMode] = useState(false);

    const title = "Tiger";
    const description = "Tiger is a security audit tool for Unix-based systems.";
    const steps = 
        "Step 1: Input the desired audit level.\n" +
        "Step 2: Specify a file to save the audit report.\n" +
        "Step 3: Enable or exclude specific modules (optional).\n" +
        "Step 4: Check verbose mode for detailed output.";
    const sourceLink = "https://www.kali.org/tools/tiger/";
    const dependencies = ["tiger"];

    let form = useForm({
        initialValues: {
            auditLevel: "",
            reportFile: "",
            enableModules: "",
            excludeModules: "",
        },
    });

    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable);
                setLoadingModal(false);
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false);
            });
    }, []);

    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    const handleProcessTermination = useCallback(
        ({ code, signal }) => {
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

    const onSubmit = async (values) => {
        setLoading(true);

        let args = ["-l", values.auditLevel];

        if (values.reportFile) {
            args.push("-R", values.reportFile);
        }

        if (values.enableModules) {
            args.push("-E", values.enableModules);
        }

        if (values.excludeModules) {
            args.push("-X", values.excludeModules);
        }

        if (verboseMode) {
            args.push("-v");
        }

        CommandHelper.runCommandWithPkexec("tiger", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                setLoading(false);
                setOutput(output);
                setAllowSave(true);
                setPid(pid);
            })
            .catch((error) => {
                setOutput(`Error: ${error.message}`);
                setLoading(false);
            });
    };

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    const clearOutput = () => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    };

    return (
        <RenderComponent
            title={title}
            description={description}
            steps={steps}
            sourceLink={sourceLink}
        >
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description}
                    dependencies={dependencies}
                />
            )}
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleProcessData, handleProcessTermination)}
                    <TextInput
                        label="Audit Level"
                        required
                        {...form.getInputProps("auditLevel")}
                        placeholder="e.g. 5"
                    />
                    <TextInput
                        label="Report File"
                        {...form.getInputProps("reportFile")}
                        placeholder="e.g. /path/to/report.txt"
                    />
                    <TextInput
                        label="Enable Modules"
                        {...form.getInputProps("enableModules")}
                        placeholder="e.g. passwd, fs"
                    />
                    <TextInput
                        label="Exclude Modules"
                        {...form.getInputProps("excludeModules")}
                        placeholder="e.g. account, cron"
                    />
                    <Checkbox
                        label="Verbose Mode"
                        checked={verboseMode}
                        onChange={(event) => setVerboseMode(event.currentTarget.checked)}
                    />
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type="submit">Start {title}</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Tiger;
