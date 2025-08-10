import { useState, useCallback, useEffect, useRef } from "react";
import { Button, Stack, TextInput, Alert, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";

/** Form values */
interface FormValuesType {
  targetIP: string;
}

function ARPFingerprinting() {
  // State
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [allowSave, setAllowSave] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isCommandAvailable, setIsCommandAvailable] = useState(false);
  const [opened, setOpened] = useState(!isCommandAvailable);
  const [loadingModal, setLoadingModal] = useState(true);
  const [pid, setPid] = useState("");
  const [showAlert, setShowAlert] = useState(true);
  const alertTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // UI copy
  const title = "ARP fingerprint Tool";
  const description =
    "ARP fingerprinting is a network reconnaissance technique used to detect the operating systems and devices in a network.";
  const steps =
    "Step 1: Enter the IP address of the target device.\n" +
    "Step 2: Click Scan to start ARP fingerprinting.\n" +
    "Step 3: View the Output block below to see the fingerprinting results.";
  const sourceLink = "https://www.kali.org/tools/arp-scan/#arp-fingerprint";
  const tutorial =
    "https://docs.google.com/document/d/1PLMdKlXsbzYI9rF25Fo_Gv8aDJvtai0s09hPjM7NA6w/edit?usp=sharing";

  // Check for the exact binary we call
  const dependencies = ["arp-fingerprint"];

  // IPv4-only regex (blocks hostnames, text, CIDR)
  const ipv4Regex =
    /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

  // Form
  const form = useForm<FormValuesType>({
    initialValues: { targetIP: "" },
    validate: {
      targetIP: (value) =>
        ipv4Regex.test(value.trim())
          ? null
          : "Enter a valid IPv4 address, e.g., 192.168.1.1",
    },
  });

  // Dependency check + disclaimer auto-hide
  useEffect(() => {
    checkAllCommandsAvailability(dependencies)
      .then((isAvailable) => {
        setIsCommandAvailable(isAvailable);
        setOpened(!isAvailable);
        setLoadingModal(false);
      })
      .catch((err) => {
        console.error("Command availability check failed:", err);
        setLoadingModal(false);
      });

    alertTimeout.current = setTimeout(() => setShowAlert(false), 5000);
    return () => {
      if (alertTimeout.current) clearTimeout(alertTimeout.current);
    };
  }, []);

  const handleShowAlert = () => {
    setShowAlert(true);
    if (alertTimeout.current) clearTimeout(alertTimeout.current);
    alertTimeout.current = setTimeout(() => setShowAlert(false), 5000);
  };

  // Append process output
  const handleProcessData = useCallback((data: string) => {
    setOutput((prev) => (prev ? prev + "\n" + data : data));
  }, []);

  // Process termination
  const handleProcessTermination = useCallback(
    ({ code, signal }: { code: number; signal: number | null }) => {
      if (code === 0) {
        handleProcessData("\nARP fingerprinting completed successfully.");
      } else if (signal === 15) {
        handleProcessData("\nARP fingerprinting was manually terminated.");
      } else {
        handleProcessData(
          `\nARP fingerprinting terminated with exit code: ${code} and signal code: ${signal}`
        );
      }
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

  // Submit handler — single-host run (correct argv order)
  const onSubmit = async (values: FormValuesType) => {
    const { hasErrors } = form.validate();
    if (hasErrors) return;

    setLoading(true);
    setAllowSave(false);
    setOutput(""); // clear console (optional)

    const args = [values.targetIP.trim()];

    CommandHelper.runCommandWithPkexec(
      "arp-fingerprint",
      args,
      handleProcessData,
      handleProcessTermination
    )
      .then(({ output, pid }) => {
        setOutput(output);
        setPid(pid);
      })
      .catch((error) => {
        setOutput(`Error: ${error.message}`);
        setLoading(false);
      });
  };

  const clearOutput = useCallback(() => {
    setOutput("");
    setHasSaved(false);
    setAllowSave(false);
  }, []);

  return (
    <>
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
          <Group position="right">
            {!showAlert && (
              <Button onClick={handleShowAlert} size="xs" variant="outline" color="gray">
                Show Disclaimer
              </Button>
            )}
          </Group>

          {LoadingOverlayAndCancelButton(loading, pid)}

          {showAlert && (
            <Alert title="Warning: Potential Risks" color="red">
              Use this tool only on networks you own or have explicit permission to test.
            </Alert>
          )}

          <Stack>
            <TextInput
              label="Target IP address"
              placeholder="e.g., 192.168.1.1"
              required
              {...form.getInputProps("targetIP")}
            />

            {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

            <Button type="submit" disabled={loading}>
              Start {title}
            </Button>

            <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
          </Stack>
        </form>
      </RenderComponent>
    </>
  );
}

export default ARPFingerprinting;
