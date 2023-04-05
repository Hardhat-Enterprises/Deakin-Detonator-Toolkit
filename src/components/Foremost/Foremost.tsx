import { Button, LoadingOverlay, NativeSelect, NumberInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValuesType {
    i: string;
    o: string;
    t: string;
    
}


console.log("************")

const fileTypes = ["jpg", "gif", "png", "bmp", "avi", "exe", "a"];


const Foremost = () => {
    try{
	    const [loading, setLoading] = useState(false);
	    const [output, setOutput] = useState("");
	    const [selectedFileType, setSelectedFileType] = useState("");

	    let form = useForm({
		initialValues: {
		    i: "",
		    o: "",
		    t: "a",
		    
		},
	    });

	    const onSubmit = async (values: FormValuesType) => {
			setLoading(true);
			const args = [`-i $${values.i}`];


			args.push(`-o $${values.o}`);
			args.push(`-${values.t}`);
		//        console.log("************", args)

			try {
			    const output = await CommandHelper.runCommand("foremost", args);
			    console.log("???????????????",output)
			    setOutput(output);
			} catch (e: any) {
			    setOutput(e);
			}
		
		setLoading(false);
	    };

	    const clearOutput = useCallback(() => {
		setOutput("");
	    }, [setOutput]);


	    return (
		<form
		    onSubmit={form.onSubmit((values) =>
		        onSubmit({ ...values, t: selectedFileType })
		    )}
		>
		    <LoadingOverlay visible={loading} />
		    <Stack>
		        <Title>Foremost</Title>
		        <TextInput label={"Input File"} required {...form.getInputProps("i")} />
		        <TextInput label={"Output File"} required {...form.getInputProps("o")} />
	{/*                {!isTopPortScan && <TextInput label={"Port"} {...form.getInputProps("port")} />}
		        {isTopPortScan && <NumberInput label={"Number of top ports"} {...form.getInputProps("numTopPorts")} />}
	*/}                <NativeSelect
		            value={selectedFileType}
		            onChange={(e) => setSelectedFileType(e.target.value)}
		            title={"Type of files to be recovered"}
		            data={fileTypes}
		            required
		            placeholder={"Pick a type of file "}
		            description={"Types of file to be recovered, refer: https://linux.die.net/man/1/foremost"}
		        />
		        <Button type={"submit"}>Scan</Button>
		        <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
		    </Stack>
		</form>
	    );
    } catch (e: any) {
	setOutput(e);
	}
};

export default Foremost;
