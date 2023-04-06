

import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValuesType {
				depth: string;
				minLength: string;
				url: string;

}
	

const url = ['all', 'jpeg'];
const url = ["True", "False"];
	const Cewl = () => {
		const [loading, setLoading] = useState(false);
		const [output, setOutput] = useState("");
		const [selectedUrl, setSelectedUrl] = useState("");



		let form = useForm({
			initialValues: {
				
			depth: "",
			minLength: "",
			url: "",


			},
		});

		const onSubmit = async (values: FormValues) => {
			setLoading(true);

			const args = [];
			args.push(`-d ${values.depth}`);
			if (values.minLength) {
				args.push(`-m ${values.minLength}`);
		}
			if (values.url == "True") {
				args.push(`-`);
			}			args.push(values.url);


			const output = await CommandHelper.runCommand("cewl", args);
			setOutput(output);

			setLoading(false);
		};

		const clearOutput = useCallback(() => {
			setOutput("");
		}, [setOutput]);
		return (
		<form onSubmit={form.onSubmit((values) => onSubmit(...values, {name}: selected{name_title}))}>
			<LoadingOverlay visible={loading} />
			<Stack>
				<Title>cewl</Title>
				                <NativeSelect
					value=selectedUrl
					onChange={(e) => setSelectedUrl(e.target.value)}
					title={"Target URL"}
					data={url}
					required
					placeholder={"Pick any option"}
				/>
				<Button type={"submit"}>Scan</Button>
				<ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
			</Stack>
		</form>
	);
};

export default Cewl;