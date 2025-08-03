import { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import InstallationModal from "../InstallationModal/InstallationModal";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { RenderComponent } from "../UserGuide/UserGuide";

// Form type definition
interface FormValuesType {
    target: string;
}

// Component
function Nuclei() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);

    const title = "Nuclei";
    const description = "Nuclei is a fast and customizable vulnerability scanner based on simple YAML-based templates.";
    const tutorial = "https://nuclei.projectdiscovery.io/";
    const sourceLink = "https://github.com/projectdiscovery/nuclei";
    const dependencies = ["nuclei"];

    const form = useForm<FormValuesType>({
        initialValues: {
            target: "",
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
                console.error("Error checking dependencies:", error);
                setLoadingModal(false);
            });
    }, []);

    const handleProcessData = useCallback((data: string) => {
        setOutput((prev) => prev + "\n" + data);
    }, []);

    const handleProcessTermination = useCallback(() => {
        setLoading(false);
    }, []);

    const onSubmit = async () => {
        setLoading(true);
        const args = ["-u", form.values.target];

        try {
            const { pid, output } = await CommandHelper.runCommandGetPidAndOutput(
                "nuclei",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(pid);
            setOutput(output);
        } catch (error: any) {
            setOutput(`Error: ${error.message}`);
            setLoading(false);
        }
    };

    return (
        <RenderComponent
            title={title}
            description={description}
            steps={"1. Enter target URL.\n2. Run scan."}
            tutorial={tutorial}
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
            {LoadingOverlayAndCancelButton(loading, pid)}
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    <TextInput
                        label="Target URL"
                        placeholder="https://example.com"
                        required
                        {...form.getInputProps("target")}
                    />
                    <Button type="submit" disabled={loading}>
                        Run Nuclei
                    </Button>
                </Stack>
            </form>
            <ConsoleWrapper output={output} />
        </RenderComponent>
    );
}

export default Nuclei;
