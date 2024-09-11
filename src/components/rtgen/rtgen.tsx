import { Button, Stack, TextInput, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

interface FormValuesType {
  hashAlgorithm: string;
  charset: string;
  plaintextLength: string;
  tableFile: string;
}

const Rtgen = () => {
  // State variables for managing component state
  const [loading, setLoading] = useState(false), [output, setOutput] = useState(""), [pid, setPid] = useState("");
  const [isCommandAvailable, setIsCommandAvailable] = useState(false), [opened, setOpened] = useState(!isCommandAvailable);
  const [loadingModal, setLoadingModal] = useState(true), [allowSave, setAllowSave] = useState(false), [hasSaved, setHasSaved] = useState(false);

  // Form hook for handling input values
  const form = useForm({
    initialValues: { hashAlgorithm: "md5", charset: "numeric", plaintextLength: "1-7", tableFile: "table.rt" },
  });

  // Check for rtgen command availability
  useEffect(() => {
    checkAllCommandsAvailability(["rtgen"])
      .then(isAvailable => { setIsCommandAvailable(isAvailable); setOpened(!isAvailable); setLoadingModal(false); })
      .catch(() => setLoadingModal(false));
  }, []);

  // Callback to handle process data output
  const handleProcessData = useCallback((data: string) => setOutput(prev => prev + "\n" + data), []);

  // Callback to handle process termination
  const handleProcessTermination = useCallback(({ code, signal }: { code: number; signal: number }) => {
    handleProcessData(code === 0 ? "\nProcess completed successfully." : signal === 15 ? "\nProcess was manually terminated." : `\nProcess terminated with exit code: ${code} and signal: ${signal}`);
    setPid(""); setLoading(false);
  }, [handleProcessData]);

  // Handle form submission to run rtgen command
  const onSubmit = async (values: FormValuesType) => {
    setLoading(true);
    const args = [values.hashAlgorithm, values.charset, values.plaintextLength, values.tableFile];
    CommandHelper.runCommandGetPidAndOutput("rtgen", args, handleProcessData, handleProcessTermination)
      .then(({ output, pid }) => { setOutput(output); setPid(pid); })
      .catch(error => { setOutput(error.message); setLoading(false); });
  };

  return (
    <RenderComponent title="Rtgen" description="Rtgen generates rainbow tables for password cracking." steps="Step 1: Select hash algorithm... Step 3: Click Generate to create rainbow tables.">
      {!loadingModal && <InstallationModal isOpen={opened} setOpened={setOpened} feature_description="Rtgen" dependencies={["rtgen"]} />}
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          {LoadingOverlayAndCancelButton(loading, pid)}
          <TextInput label="Hash Algorithm" required {...form.getInputProps("hashAlgorithm")} />
          <TextInput label="Charset" required {...form.getInputProps("charset")} />
          <TextInput label="Plaintext Length (e.g. 1-7)" required {...form.getInputProps("plaintextLength")} />
          <TextInput label="Table File" required {...form.getInputProps("tableFile")} />
          {SaveOutputToTextFile_v2(output, allowSave, hasSaved, () => setHasSaved(true))}
          <Button type="submit">Generate</Button>
          <ConsoleWrapper output={output} clearOutputCallback={() => setOutput("")} />
        </Stack>
      </form>
    </RenderComponent>
  );
};

export default Rtgen;
