import { useState, useEffect, useCallback } from "react";
import { Button, Stack, TextInput, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";

/**
 * Represents the form values for the RDPassSpray component.
 */
interface FormValuesType {
  targetIP: string;
  usernameFile: string;
  passwordFile: string;
  domain: string;
  rate: string;
}

/**
 * The RDPassSpray component.
 * @returns The RDPassSpray component.
 */
const RDPassSpray = () => {
  // Component state variables
  const [loading, setLoading] = useState(false); // State variable to indicate loading state
  const [output, setOutput] = useState(""); // State variable to store the output of the command execution
  const [allowSave, setAllowSave] = useState(false); // State variable to allow saving of output
  const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if output has been saved
  const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
  const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
  const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
  const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
  const [verboseMode, setVerboseMode] = useState(false); // State variable for verbose mode

  // Component Constants
  const title = "RDPassSpray";
  const description =
    "RDPassSpray is a tool for brute-forcing RDP services using username and password lists. It's used for password spraying attacks against remote desktop services.";
  const steps =
    "=== Required ===\n" +
    "Step 1: Input the target IP address or range.\n" +
    "Step 2: Provide a file containing usernames to test.\n" +
    "Step 3: Provide a file containing passwords to test.\n" +
    "=== Optional ===\n" +
    "Step 4: Input a domain if necessary.\n" +
    "Step 5: Specify a spray rate to avoid detection (number of attempts per second).\n" +
    "Step 6: Enable verbose mode for more detailed output.\n";
  const sourceLink = ""; // Link to the source code
  const tutorial = ""; // Link to the official documentation/tutorial
  const dependencies = ["rdpspray"]; // Contains the dependencies required by the component.

  // Form hook to handle form input
  let form = useForm({
    initialValues: {
      targetIP: "",
      usernameFile: "",
      passwordFile: "",
      domain: "",
      rate: "",
    },
  });

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

  /**
   * handleProcessData: Callback to handle and append new data from the child process to the output.
   * It updates the state by appending the new data received to the existing output.
   * @param {string} data - The data received from the child process.
   */
  const handleProcessData = useCallback((data: string) => {
    setOutput((prevOutput) => prevOutput + "\n" + data); // Append new data to the previous output.
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
      if (code === 0) {
        handleProcessData("\nProcess completed successfully.");
      } else if (signal === 15) {
        handleProcessData("\nProcess was manually terminated.");
      } else {
        handleProcessData(
          `\nProcess terminated with exit code: ${code} and signal code: ${signal}`,
        );
      }

      setPid("");
      setLoading(false);
    },
    [handleProcessData],
  );

  /**
   * Handles form submission for the RDPassSpray component.
   * @param {FormValuesType} values - The form values containing the target domain.
   */
  const onSubmit = async (values: FormValuesType) => {
    setLoading(true);

    // Construct arguments for the RDPassSpray command based on form input
    let args = [
      values.targetIP,
      "-U",
      values.usernameFile,
      "-P",
      values.passwordFile,
    ];

    if (values.domain) {
      args.push("-d", values.domain);
    }

    if (values.rate) {
      args.push("--rate", values.rate);
    }

    if (verboseMode) {
      args.push("-v");
    }

    CommandHelper.runCommandWithPkexec(
      "rdpspray",
      args,
      handleProcessData,
      handleProcessTermination,
    )
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        setOutput(`Error: ${error.message}`);
        setLoading(false);
      });
    setAllowSave(true);
  };

  /**
   * Handles the completion of output saving by updating state variables.
   */
  const handleSaveComplete = () => {
    setHasSaved(true); // Set hasSaved state to true
    setAllowSave(false); // Disallow further output saving
  };

  /**
   * Clears the command output and resets state variables related to output saving.
   */
  const clearOutput = () => {
    setOutput(""); // Clear the command output
    setHasSaved(false); // Reset hasSaved state
    setAllowSave(false); // Disallow further output saving
  };

  // Render component
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
        />
      )}
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          {LoadingOverlayAndCancelButton(loading, pid)}
          <TextInput
            label="Target IP Address/Range"
            required
            {...form.getInputProps("targetIP")}
            placeholder="e.g. 192.168.1.0"
          />
          <TextInput
            label="Username File"
            required
            {...form.getInputProps("usernameFile")}
            placeholder="e.g. /path/to/usernames.txt"
          />
          <TextInput
            label="Password File"
            required
            {...form.getInputProps("passwordFile")}
            placeholder="e.g. /path/to/passwords.txt"
          />
          <TextInput
            label="Domain (Optional)"
            {...form.getInputProps("domain")}
            placeholder="e.g. mydomain.local"
          />
          <TextInput
            label="Spray Rate (Optional)"
            {...form.getInputProps("rate")}
            placeholder="e.g. 10"
          />
          <Checkbox
            label="Verbose Mode"
            checked={verboseMode}
            onChange={(event) => setVerboseMode(event.currentTarget.checked)}
          />
          <Button type={"submit"}>Start {title}</Button>
          {SaveOutputToTextFile_v2(
            output,
            allowSave,
            hasSaved,
            handleSaveComplete,
          )}
          <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
        </Stack>
      </form>
    </RenderComponent>
  );
};

export default RDPassSpray;
