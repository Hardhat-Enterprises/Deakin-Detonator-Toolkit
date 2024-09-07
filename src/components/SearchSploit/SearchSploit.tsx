import { Button, NativeSelect, Stack, TextInput, Text, List, Accordion } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

// Define form values type
interface FormValues {
  searchTerm: string;
  searchOption: string;
  outputType: string;
  nonSearch: string;
  ebdId: string;
}

// Component Constants
const title = "SearchSploit";
const description = "SearchSploit is a command-line tool used for searching through Exploit-DB.";
const steps = `Step 1: Enter a Search Term followed by selecting a Search Option.
Step 2: Select an Output type.
Step 3: Select a Non-Searching option.
Step 4: Enter an Exploit Database ID.
Step 5: Click Scan to commence SearchSploit's operation.
Step 6: View the Output block below to view the results of the tool's execution.`;
const sourceLink = "https://www.exploit-db.com/documentation/Offsec-SearchSploit.pdf";
const tutorial = "";
const dependencies = ["searchsploit"];
const searchOptions = ["Case", "Exact", "Strict", "Title"];
const outputTypes = ["json", "Overflow", "Path", "Verbose", "www"];
const nonSearchOptions = ["Mirror", "Examine"];

const SearchSploit = () => {
  // Component State Variables
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [allowSave, setAllowSave] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [pid, setPid] = useState("");
  const [isCommandAvailable, setIsCommandAvailable] = useState(false);
  const [opened, setOpened] = useState(!isCommandAvailable);
  const [loadingModal, setLoadingModal] = useState(true);

  const form = useForm<FormValues>({
    initialValues: {
      searchTerm: "",
      searchOption: "",
      outputType: "",
      nonSearch: "",
      ebdId: "",
    },
  });

  // Check if the command is available and set the state variables accordingly
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

  // Handle process data
  const handleProcessData = useCallback((data: string) => {
    setOutput((prevOutput) => prevOutput + "\n" + data);
  }, []);

  // Handle process termination
  const handleProcessTermination = useCallback(
    ({ code, signal }: { code: number; signal: number }) => {
      const message =
        code === 0
          ? "\nProcess completed successfully."
          : `\nProcess terminated with exit code: ${code} and signal code: ${signal}`;
      handleProcessData(message);
      setPid("");
      setLoading(false);
      setAllowSave(true);
      setHasSaved(false);
    },
    [handleProcessData]
  );

  // Handle process cancellation
  const handleCancel = () => {
    if (pid) {
      CommandHelper.runCommand("kill", ["-15", pid]);
    }
  };

  // Handle save completion
  const handleSaveComplete = useCallback(() => {
    setHasSaved(true);
    setAllowSave(false);
  }, []);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const args = [
      ...getSearchOptionArgs(values.searchOption),
      ...getOutputTypeArgs(values.outputType),
      ...getNonSearchArgs(values.nonSearch),
      values.searchTerm,
      values.ebdId,
    ];

    try {
      const result = await CommandHelper.runCommandGetPidAndOutput(
        "searchsploit",
        args,
        handleProcessData,
        handleProcessTermination
      );
      setPid(result.pid);
      setOutput(result.output);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setOutput(e.message);
      } else {
        setOutput("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Get search option arguments
  const getSearchOptionArgs = (searchOption: string): string[] => {
    const optionMap: Record<string, string> = {
      Case: "-c",
      Exact: "-e",
      Strict: "-s",
      Title: "-t",
    };
    return [optionMap[searchOption]].filter(Boolean);
  };

  // Get output type arguments
  const getOutputTypeArgs = (outputType: string): string[] => {
    const typeMap: Record<string, string> = {
      json: "-j",
      Overflow: "-o",
      Path: "-p",
      Verbose: "-v",
      www: "-w",
    };
    return [typeMap[outputType]].filter(Boolean);
  };

  // Get non-search arguments
  const getNonSearchArgs = (nonSearch: string): string[] => {
    const nonSearchMap: Record<string, string> = {
      Mirror: "-m",
      Examine: "-x",
    };
    return [nonSearchMap[nonSearch]].filter(Boolean);
  };

  // Clear output
  const clearOutput = useCallback(() => {
    setOutput("");
    setAllowSave(false);
    setHasSaved(false);
  }, []);

  return (
    <>
      <InstallationModal
        isOpen={opened}
        setOpened={setOpened}
        feature_description={description}
        dependencies={dependencies}
      />
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleCancel, handleProcessTermination)}
          <TextInput label={"Search Term"} {...form.getInputProps("searchTerm")} />
          <NativeSelect
            {...form.getInputProps("searchOption")}
            label={"Search Option"}
            data={searchOptions}
            placeholder={"Pick a Search option"}
          />
          <NativeSelect
            {...form.getInputProps("outputType")}
            label={"Output"}
            data={outputTypes}
            placeholder={"Select an Output"}
          />
          <NativeSelect
            {...form.getInputProps("nonSearch")}
            label={"Non-Searching"}
            data={nonSearchOptions}
            placeholder={"Select an option"}
          />
          <TextInput
            label={"EBD-ID"}
            description="Exploit Database ID: Required when using the 'Path' output or Non-Search options."
            {...form.getInputProps("ebdId")}
          />
          <Button type={"submit"}>Scan</Button>
          <Accordion>
            <Accordion.Item value="item-1">
              <Accordion.Control>Help:</Accordion.Control>
              <Accordion.Panel>
                <List>
                  <Text weight={700}>Search Options:</Text>
                  {searchOptions.map((option) => (
                    <List.Item key={option}>{option}</List.Item>
                  ))}
                </List>
                <List>
                  <Text weight={700}>Output:</Text>
                  {outputTypes.map((type) => (
                    <List.Item key={type}>{type}</List.Item>
                  ))}
                </List>
                <List>
                  <Text weight={700}>Non-Searching:</Text>
                  {nonSearchOptions.map((option) => (
                    <List.Item key={option}>{option}</List.Item>
                  ))}
                </List>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
          {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
          <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
        </Stack>
      </form>
    </>
  );
};

export default SearchSploit;
// updated code
