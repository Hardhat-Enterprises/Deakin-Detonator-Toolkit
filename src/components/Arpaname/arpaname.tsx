import React, { useState, useEffect, useCallback } from "react";
import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { CommandHelper } from "../../utils/CommandHelper";

/**
 * Represents the form values for the Arpaname component.
 */
interface FormValuesType {
    ipAddress: string;
}

/**
 * The Arpaname component.
 * @returns The Arpaname component.
 */
const ArpanameTool = () => {
    const title = "Arpaname";
    const description =
        "Arpaname translates IP addresses (IPv4 and IPv6) to their corresponding IN-ADDR.ARPA or IP6.ARPA names.";
    const userguide = "";
    const [loading, setLoading] = useState(false); // State variable to track if the process is currently loading
    const [output, setOutput] = useState(""); // State variable to store the output of the process
    const [pidTarget, setPidTarget] = useState(""); // State variable to store the PID of the target process.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.

    // Component Constants.
    const dependencies = ["bind9"];

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
                setLoadingModal(false);
            });
    }, []);

    const form = useForm<FormValuesType>({
        initialValues: {
            ipAddress: "",
        },
    });

    /**
    handleProcessData: Callback to handle and append new data from the child process to the output.
    It updates the state by appending the new data received to the existing output.
    @param {string} data - The data received from the child process.
    */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    /**
    handleProcessTermination: Callback to handle the termination of the child process.
    Once the process termination is handled, it clears the process PID reference and
    deactivates the loading overlay.
    @param {object} param - An object containing information about the process termination.
    @param {number} param.code - The exit code of the terminated process.
    @param {number} param.signal - The signal code indicating how the process was terminated.
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
            setLoading(false);
        },
        [handleProcessData]
    );

    /**
     * Validates if the given input string is a valid IPv4 or IPv6 address.
     * @param {string} ip - The IP address string to be validated.
     * @returns {boolean} True if the input is a valid IP address, false otherwise.
     */
    const validateIPAddress = (ip: string) => {
        const ipv4Pattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)$/;
        return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
    };

/**
 * Async function to handle form submission and execute the arpaname command.
 * @param {FormValuesType} values - The form values containing the IP address.
 */
 const onSubmit = async (values: FormValuesType) => {
    if (!validateIPAddress(values.ipAddress)) {
        return;
    }

    // Activate loading state to indicate ongoing process
    setLoading(true);

    const argsIP = [values.ipAddress];

    // Execute arpaname command for the target
    const result_target = await CommandHelper.runCommandWithPkexec(
        "arpaname",
        argsIP,
        handleProcessData, // Pass handleProcessData as callback for handling process data
        handleProcessTermination
    );
    setPidTarget(result_target.pid);

    setLoading(false);
};


    /**
     * Callback function to clear the output state.
     * This function is memoized using the `useCallback` hook to prevent unnecessary re-renders.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <RenderComponent
            title={title}
            description={description} steps={""} tutorial={""} sourceLink={""}
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
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pidTarget)}
                    <TextInput label={"IP address"} required {...form.getInputProps("ipAddress")}></TextInput>
                    <Button type={"submit"}>Lookup</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default ArpanameTool;
