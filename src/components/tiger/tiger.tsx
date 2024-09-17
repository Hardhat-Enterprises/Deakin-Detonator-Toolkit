import { useState, useEffect, useCallback } from "react";
import { Button, Stack, TextInput, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";

/**
 * Represents the form values for the Tiger component.
 */
interface FormValuesType {
  targetIP: string;
  auditLevel: string;
  reportFile: string;
  enableModules: string;
  excludeModules: string;
}

const Tiger = () => {
  // Component state variables
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [allowSave, setAllowSave] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isCommandAvailable, setIsCommandAvailable] = useState(false);
  const [opened, setOpened] = useState(!isCommandAvailable);
  const [loadingModal, setLoadingModal] = useState(true);
  const [pid, setPid] = useState("");
  const [verboseMode, setVerboseMode] = useState(false);

  // Component Constants
  const title = "Tiger";
  const description =
    "Tiger is a security audit and intrusion detection tool designed to audit Unix-based systems for security issues.";
  const steps =
    "=== Required ===\n" +
    "Step 1: Input a target IP or hostname to audit.\n" +
    "Step 2: Input the desired audit level (e.g., 1 for basic, 5 for deep).\n" +
    " \n" +
    "=== Optional ===\n" +
    "Step 3: Specify a file to save the audit report.\n" +
    "Step 4: Enable specific modules for the audit by entering module names.\n" +
    "Step 5: Exclude specific modules from the audit by entering module names.\n" +
    "Step 6: Check the verbose mode box for detailed output.\n";
  const sourceLink = "https://www.kali.org/tools/tiger/";
  const tutorial = "";
  const dependencies = ["tiger"];

  // Form hook to handle form input
  let form = useForm({
    initialValues: {
      targetIP: "",
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

  /**
   * handleProcessData: Callback to handle and append new data from the child process to the output.
   * @param {string} data - The data received from the child process.
   */
  const handleProcessData = useCallback((data: string) => {
    setOutput((prevOutput) => prevOutput + "\n" + data);
  }, []);

  /**
   * Handles form submission for the Tiger component.
   * @param {FormValuesType} values - The form values containing the target domain.
   */
  const onSubmit = async (values: FormValuesType) => {
    setLoading(true);

    let args = [values.targetIP, "-l", values.auditLevel];

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

    CommandHelper.runCommandWithPkexec("tiger", args)
      .then(({ output, pid }) => {
        setOutput(output);
        setAllowSave(true);
        setPid(pid);
      })
      .catch((error) => {
        setOutput(`Error: ${error.message}`);
        setLoading(false);
      });
    setAllowSave(true);
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
          {LoadingOverlayAndCancelButtonPkexec(loading, pid)}
          <TextInput
            label="Target IP/Hostname"
            required
            {...form.getInputProps("targetIP")}
            placeholder="e.g. 192.168.1.1"
          />
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
          {/* Removed Button as per your request */}
          {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
          <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
        </Stack>
      </form>
    </RenderComponent>
  );
};

export default Tiger;
