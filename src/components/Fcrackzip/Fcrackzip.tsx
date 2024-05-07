import { Button, Stack, TextInput, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import InstallationModal from "../InstallationModal/InstallationModal";

// Constants
const title = "Fcrackzip";
const description =
  "Fcrackzip is a tool for cracking the password of a protected zip file.";
const steps =
  "Step 1: Input the path of the zip file.\n" +
  "Step 2: Select an Attack Mode (Dictionary or Brute Force)\n" +
  "Step 3: You can save the output by checking 'Save Output to File'\n" +
  "Step 4: Click START CRACKING!\n";
const sourceLink = ""; // Link to the source code (or Kali Tools).
const tutorial = ""; // Link to the official documentation/tutorial.
const dependencies = ["fcrackzip"]; // Contains the dependencies required by the component.

// Interface for form values
interface FormValuesType {
  dictionary: string;
  zip: string;
  minLength?: number;
  maxLength?: number;
  charSet: string;
}

// Component
const Fcrackzip = () => {
  // State variables
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [attackMethod, setAttackMethod] = useState("");
  const [checkedUnzip, setCheckedUnzip] = useState(true);
  const [pid, setPid] = useState("");
  const [useCharsetUppercase, setUseCharsetUppercase] = useState(false);
  const [useCharsetLowercase, setUseCharsetLowercase] = useState(false);
  const [useCharsetNumeric, setUseCharsetNumeric] = useState(false);
  const [checkedVerbose, setCheckedVerbose] = useState(false);
  const [opened, setOpened] = useState(true); // Modal state

  // Form hook
  const form = useForm<FormValuesType>({
    initialValues: {
      dictionary: "",
      zip: "",
      minLength: 1,
      maxLength: 3,
      charSet: "",
    },
  });

  // Check command availability and manage installation modal
  useEffect(() => {
    checkAllCommandsAvailability(dependencies)
      .then((isAvailable) => {
        setOpened(!isAvailable);
      })
      .catch((error) => {
        console.error("An error occurred:", error);
      });
  }, []);

  // Callbacks
  const handleProcessData = useCallback((data: string) => {
    setOutput((prevOutput) => prevOutput + "\n" + data);
  }, []);

  const handleProcessTermination = useCallback(() => {
    setPid("");
    setLoading(false);
  }, []);

  const handleCancel = () => {
    if (pid !== null) {
      const args = [`-15`, pid];
      CommandHelper.runCommand("kill", args);
    }
  };

  const onSubmit = async (values: FormValuesType) => {
    setLoading(true);
    const args = [];

    if (attackMethod === "Dictionary") {
      args.push("-D", "-p", `${values.dictionary}`, "-u");
    } else if (attackMethod === "BruteForce") {
      args.push("-b");

      if (checkedVerbose) args.push("-v");

      let charSet = "";

      if (useCharsetLowercase) charSet += "a";
      if (useCharsetUppercase) charSet += "A";
      if (useCharsetNumeric) charSet += "1";

      if (charSet) args.push("-c", charSet);

      if (values.maxLength && values.minLength)
        args.push("-l", `${values.minLength}-${values.maxLength}`);

      if (checkedUnzip) args.push("-u");
    }

    if (values.zip) {
      args.push(values.zip);
    }

    try {
      const result = await CommandHelper.runCommandGetPidAndOutput(
        "fcrackzip",
        args,
        handleProcessData,
        handleProcessTermination
      );

      setPid(result.pid);

      const crackedPasswordRegex = /PASSWORD FOUND\! : (.+)/;
      const crackedPasswordMatch = result.output.match(crackedPasswordRegex);

      if (crackedPasswordMatch) {
        const crackedPassword = crackedPasswordMatch[1];
        setOutput(result.output + `\nCracked Password: ${crackedPassword}`);
        if (checkedUnzip) {
          SaveOutputToTextFile(crackedPassword);
        }
      } else {
        setOutput(result.output);
      }
    } catch (e: any) {
      setOutput(e.message);
    } finally {
      setLoading(false);
    }
  };

  const clearOutput = useCallback(() => {
    setOutput("");
  }, []);

  return (
    <div>
      <InstallationModal
        isOpen={opened}
        setOpened={setOpened}
        feature_description={description}
        dependencies={dependencies}
      />
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <h1>{title}</h1>
          <p>{description}</p>
          <p>{steps}</p>
          <TextInput label={"Zip file"} required {...form.getInputProps("zip")} />
          <NativeSelect
            value={attackMethod}
            onChange={(e) => setAttackMethod(e.target.value)}
            label={"Attack Method"}
            data={methods}
            required
            placeholder={"Select attack method"}
          />
          {attackMethod === "Dictionary" && (
            <TextInput
              label={"Dictionary"}
              placeholder="Path file of the dictionary."
              required
              {...form.getInputProps("dictionary")}
            />
          )}
          {attackMethod === "BruteForce" && (
            <>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  label="Use Lowercase Character"
                  checked={useCharsetLowercase}
                  onChange={(e) => setUseCharsetLowercase(e.currentTarget.checked)}
                />
                <Checkbox
                  label="Use Uppercase Character"
                  checked={useCharsetUppercase}
                  onChange={(e) => setUseCharsetUppercase(e.currentTarget.checked)}
                />
                <Checkbox
                  label="Use Numeric Character"
                  checked={useCharsetNumeric}
                  onChange={(e) => setUseCharsetNumeric(e.currentTarget.checked)}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <TextInput
                  label={"Min Length"}
                  type="number"
                  required
                  {...form.getInputProps("minLength")}
                />
                <TextInput
                  label={"Max Length"}
                  type="number"
                  required
                  {...form.getInputProps("maxLength")}
                />
              </div>
              <Checkbox
                label={"Verbose Mode"}
                checked={checkedVerbose}
                onChange={(e) => setCheckedVerbose(e.currentTarget.checked)}
              />
              <Checkbox
                label={"Show cracked password"}
                checked={checkedUnzip}
                onChange={(e) => setCheckedUnzip(e.currentTarget.checked)}
              />
            </>
          )}
          {SaveOutputToTextFile(output)}
          <Button type={"submit"}>Start Cracking!</Button>
          <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
          <Button onClick={clearOutput}>Clear Output</Button>
        </Stack>
      </form>
    </div>
  );
};

export default Fcrackzip;
