import React, { useState } from "react";
import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";


const title = "Crunch Tool";
const description_guide =
  "Crunch is a tool used for creating custom wordlists for password cracking. \n\n" +
  "Steps to use Crunch: \n" +
  "Step 1: Input the pattern for your wordlist in the Pattern input box.\n" +
  "Step 2: Input the minimum length of the words in the wordlist in the Min Length input box.\n" +
  "Step 3: Input the maximum length of the words in the wordlist in the Max Length input box.\n" +
  "Step 4: Click the Generate Wordlist button.\n" +
  "Step 5: View your wordlist in the Output block below.";

const CrunchGUI = () => {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const pattern = (event.currentTarget.elements.namedItem("pattern") as HTMLInputElement).value;
    const minLength = (event.currentTarget.elements.namedItem("minLength") as HTMLInputElement).value;
    const maxLength = (event.currentTarget.elements.namedItem("maxLength") as HTMLInputElement).value;
    const args = `${pattern} -t ${minLength}:${maxLength}`;

    try {
      const output = crunch(args);
      setOutput(output);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setOutput(e.toString());
      }
    }

    setLoading(false);
  };

  const handleClear = () => {
    setOutput("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <LoadingOverlay visible={loading} />
      <Stack>
        <h2>{title}</h2>
        <p>{description_guide}</p>
        <TextInput label="Pattern" name="pattern" required />
        <TextInput label="Min Length" name="minLength" type="number" required />
        <TextInput label="Max Length" name="maxLength" type="number" required />
        <Button type="submit">Generate Wordlist</Button>
        <Button onClick={handleClear}>Clear Output</Button>
        <pre>{output}</pre>
      </Stack>
    </form>
  );
};

export default CrunchGUI;
