import { Button, Checkbox, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

/**
 * Represents the form values for the Dmitry component.
 */
interface FormValuesType {
    domain: string;
}

/**
 * The Dmitry component.
 * @returns The Dmitry component.
 */
const dmitry = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [checkedAdvanced, setCheckedAdvanced] = useState(false); // State variable to check advanced option.
    const [checkedIPAddress, setCheckedIPaddress] = useState(false); // State variable to check IP address option.
    const [checkedDomainname, setCheckedDomainname] = useState(false); // State variable to check domain name option.
    const [checkedNetcraft, setCheckedNetcraft] = useState(false); // State variable to check Netcraft option.
    const [checkedSubdomains, setCheckedSubdomains] = useState(false); // State variable to check subdomains option.
    const [checkedEmailaddress, setCheckedEmailaddress] = useState(false); // State variable to check email address option.
    const [checkedPortscan, setCheckedPortscan] = useState(false); // State variable to indicate if the port scan option is checked.
    const [checkedFiltered, setCheckedFiltered] = useState(false); // State variable to indicate if the filtered option is checked.
    const [checkedBanner, setCheckedBanner] = useState(false); // State variable to indicate if the banner option is checked.
    const [delay, setDelay] = useState(2); // State variable to indicate delaying state in seconds.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.

    // Component Constants.
    const title = "Deepmagic Information Gathering Tool"; // Title of the component.
    const description =
        "Dmitry is a UNIX/(GNU) Linux command line application written in C. Dmitry will scan to try and find " +
        "possible subdomains, email addresses and uptime information, and further perform tcp port scans, and " +
        "whois lookups."; // Description of the component.
    const steps =
        "Step 1: Enter a valid domain or IP address to be scanned.\n" +
        "       Eg: 192.168.0.1\n\n" +
        "Step 3: Click Start Scanning to commence Dmitry's operation.\n\n" +
        "Step 4: View the Output block below to view the results of the tool's execution.\n" +
        "Note: For more advanced options, enable the Advanced Mode switch to access additional features.\n" +
        "Note 2: If you perform TCP port scanning, you can specify a delay between requests. Default is 2 (milliseconds).\n"; 
    const sourceLink = "https://www.kali.org/tools/dmitry/"; // Link to the source code (or Kali Tools).
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["dmitry"]; // Contains the dependencies required by the component.

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

    //Handles the change event for the port scan checkbox.
    const handlePortscanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.currentTarget.checked;
        setCheckedPortscan(isChecked);

        if (!isChecked) {
            setCheckedFiltered(false);
            setCheckedBanner(false);
            setDelay(2);
        }
    };

    // Form hook to handle form input.
    let form = useForm({
        initialValues: {
            domain: "",
        },
    });

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
    }, []);

    /**
     * handleProcessTermination: Callback to handle the termination of the child process.
     * Once the process termination is handled, it clears the process PID reference and
     * deactivates the loading overlay.
     * @param {object} param - An object containing information about the process termination.
     * @param {number} param.code - The exit code of the terminated process.
     * @param {number} param.signal - The signal code indicating how the process was terminated.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            // If the process was successful, display a success message.
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");

                // If the process was terminated manually, display a termination message.
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");

                // If the process was terminated with an error, display the exit and signal codes.
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
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    // Actions taken after saving the output
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    // Sends a SIGTERM signal to gracefully terminate the process
    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
    };

    /**
     * Handles the form submission by constructing and executing the dmitry command with the provided form values.
     *
     * @param {FormValuesType} values - The values from the form input.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the dmitry command based on form input
        const args = [];

        // Split the domain input into individual arguments
        args.push(...values.domain.split(" "));

        // Add the -i flag if IP address checking is enabled
        if (checkedIPAddress) {
            args.push("-i");
        }

        // Add the -w flag if domain name checking is enabled
        if (checkedDomainname) {
            args.push("-w");
        }

        // Add the -n flag if Netcraft information is requested
        if (checkedNetcraft) {
            args.push("-n");
        }

        // Add the -s flag if subdomain enumeration is enabled
        if (checkedSubdomains) {
            args.push("-s");
        }

        // Add the -e flag if email address enumeration is enabled
        if (checkedEmailaddress) {
            args.push("-e");
        }

        // Add the -p flag if port scanning is enabled
        if (checkedPortscan) {
            args.push("-p");

            // Add the -f flag if filtered port scanning is enabled
            if (checkedFiltered) {
                args.push("-f");
            }

            // Add the -b flag if banner grabbing is enabled
            if (checkedBanner) {
                args.push("-b");
            }

            // Add the -t flag with the specified delay if delay
            if (delay) {
                args.push("-t", delay.toString());
            }
        }

        try {
            // Execute the dmitry command and handle the result
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "dmitry",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            // Handle any errors that occur during command execution
            setOutput(e.message);
        }
    };

    /**
     * clearOutput: Callback function to clear the console output.
     * It resets the state variable holding the output, thereby clearing the display.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

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
            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack>
                    <Switch
                        size="md"
                        label="Advanced Mode"
                        checked={checkedAdvanced}
                        onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                    />
                    <TextInput label={"Domain or IP"} required {...form.getInputProps("domain")} />

                    {checkedAdvanced && (
                        <>
                            <Checkbox
                                label={"Perform a whois lookup on the IP address of a host."}
                                checked={checkedIPAddress}
                                onChange={(e) => setCheckedIPaddress(e.currentTarget.checked)}
                            />
                            <Checkbox
                                label={"Perform a whois lookup on the domain name of a host."}
                                checked={checkedDomainname}
                                onChange={(e) => setCheckedDomainname(e.currentTarget.checked)}
                            />
                            <Checkbox
                                label={"Retrieve Netcraft.com information on a host."}
                                checked={checkedNetcraft}
                                onChange={(e) => setCheckedNetcraft(e.currentTarget.checked)}
                            />
                            <Checkbox
                                label={"Search for possible subdomains."}
                                checked={checkedSubdomains}
                                onChange={(e) => setCheckedSubdomains(e.currentTarget.checked)}
                            />
                            <Checkbox
                                label={"Perform a search for possible email addresses."}
                                checked={checkedEmailaddress}
                                onChange={(e) => setCheckedEmailaddress(e.currentTarget.checked)}
                            />
                            <Checkbox
                                label={"Perform a TCP port scan"}
                                checked={checkedPortscan}
                                onChange={(e) => setCheckedPortscan(e.currentTarget.checked)}
                            />
                            {checkedPortscan && (
                                <div style={{ marginLeft: "20px" }}>
                                    <Checkbox
                                        label={"Perform a TCP port scan showing output reporting filtered ports"}
                                        checked={checkedFiltered}
                                        onChange={(e) => setCheckedFiltered(e.currentTarget.checked)}
                                    />
                                    <Checkbox
                                        label={"Read in the Banner received from the scanned port"}
                                        checked={checkedBanner}
                                        onChange={(e) => setCheckedBanner(e.currentTarget.checked)}
                                    />
                                    <TextInput
                                        label={"Delay (in seconds)"}
                                        placeholder={"Set the TTL in seconds when scanning a TCP port (Default 2)"}
                                        type="number"
                                        value={delay}
                                        onChange={(e) => setDelay(parseInt(e.target.value))}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <Button type={"submit"}>Start {title}</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default dmitry;
