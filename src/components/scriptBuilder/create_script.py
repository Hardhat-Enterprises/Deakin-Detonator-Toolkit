

import json
import os
import config
import argparse

def get_add_dec(values):

	add_dec = ''

	list_preset = []

	for val in values:
		if val['have_preset']:
			list_preset.append(val['name'])
			add_dec += 'const [selected{name_title}, setSelected{name_title}] = useState("");\n'.format(name_title=val['name'].title())

	return add_dec, list_preset


def get_args_vals(values):

	args_vals = ''

	print("values ", values)
	for val in values:
		temp_val = ''
		print("val ",val)
		print(val['name'])

		if not val['require_val']:

			temp_val += '''\t\t\tif (values.{name} == "True") {{
		\t\targs.push(`-{flag_val}`);\n\t\t\t}}'''.format(name=val['name'], flag_val=val['flag_val'])

		if  not val['req_flag']:
			temp_val += '\t\t\targs.push(values.{name});'.format(name=val['name'])

		else:
			temp_val += '\t\t\targs.push(`-{flag_val} ${{values.{name}}}`);'.format(flag_val=val['flag_val'], name=val['name'])


		if not val['is_required']:
			temp_val = '\t\t\tif (values.{name}) {{\n\t{temp_val}\n\t\t}}'.format(name=val['name'], temp_val=temp_val)

		args_vals += temp_val+'\n'
	return args_vals


def get_form_arg(list_preset):

	form_arg = '...values'

	for name in list_preset:
		form_arg += ', {name}: selected{name_title}'

	return form_arg


def get_form_vals(values):

	form_vals = ''

	for val in values:
		isrequired = '\n\t\t\t\t\trequired' if val['is_required'] else ''

		if not val['require_val'] or val['have_preset']:

			form_vals ='''                <NativeSelect
					value=selected{name_title}
					onChange={{(e) => setSelected{name_title}(e.target.value)}}
					title={{"{label}"}}
					data={{{name}}}{isrequired}
					placeholder={{"Pick any option"}}
				/>'''.format(label=val['label'],isrequired=isrequired, name=val['name'], name_title=val['name'].title())

		else:

			form_vals += '''
					<TextInput
						label={{"{label}"}}{isrequired}
						{{...form.getInputProps("{name}")}}
					/>'''.format(label=val['label'],isrequired=isrequired, name=val['name'])


	return form_vals


def get_declare_block(values):

	names = [val['name'] for val in values]

	var_declare = '\n'
	for name in names:
		temp_block = '\t\t\t\t{name}: string;\n'
		var_declare += temp_block.format(name=name)


	declare_block = '''\n
import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValuesType {'''+var_declare+ '\n}'

	return declare_block


def get_init_block(tool_name, add_dec, values):

	names = [val['name'] for val in values]
	state_var = '\n'
	preset_block = '\n'

	var_init = '\n'
	for val in values:
		name = val['name']
		# if val['have_preset'] or not val['require_val']:
		# 	print("adding states for ", name)
		# 	state_var += '\tconst [selected{name_title}, setSelected{name_title}] = useState("");'.format(name_title=name.title())


		if val['have_preset']:
			preset_block += '''\nconst {name} = {preset_val};'''.format(name=val['name'], preset_val=val['preset_vals'])

		if not val['require_val']:
			preset_block += '''\nconst {name} = ["True", "False"];'''.format(name=val['name'])

		temp_block = '\t\t\t{name}: "",\n'
		var_init += temp_block.format(name=name)

	init_block ='''
	{preset_block}
	const {toolname_title} = () => {{
		const [loading, setLoading] = useState(false);
		const [output, setOutput] = useState("");
		{add_dec}


		let form = useForm({{
			initialValues: {{
				{var_init}

			}},
		}});

		const onSubmit = async (values: FormValues) => {{
			setLoading(true);

			const args = [];
{args_vals}

			const output = await CommandHelper.runCommand("cewl", args);
			setOutput(output);

			setLoading(false);
		}};

		const clearOutput = useCallback(() => {{
			setOutput("");
		}}, [setOutput]);\n\t\t'''.format(state_var=state_var, toolname_title=tool_name.title(),add_dec=add_dec, var_init=var_init, args_vals=get_args_vals(values), preset_block=preset_block)


	return init_block


def get_form_block(tool_name, values, list_preset):
	form_block = '''return (
		<form onSubmit={{form.onSubmit((values) => onSubmit({form_arg}))}}>
			<LoadingOverlay visible={{loading}} />
			<Stack>
				<Title>{name}</Title>
				{form_vals}
				<Button type={{"submit"}}>Scan</Button>
				<ConsoleWrapper output={{output}} clearOutputCallback={{clearOutput}} />
			</Stack>
		</form>
	);
}};

export default Cewl;'''.format(form_arg=get_form_arg(list_preset), name=tool_name, form_vals=get_form_vals(values))

	return form_block


def insert_conf(filename, tool_name):
	# Read the file contents into memory
	with open(filename, 'r') as f:
		lines = f.readlines()

	for i, line in enumerate(lines):
		if "scope" in line and "shell" in lines[i-4]:
			line_number = i
			break

	add_block = '\n \t\t {\n\t\t\t "name": "'+tool_name+'",\n\t\t\t"cmd": "'+tool_name+'",\n\t\t\t"args": true\n\t\t },\n'

	# Insert the new line at the desired position
	lines.insert(line_number + 1, add_block)

	# Write the modified list of lines back to the file
	with open(filename, 'w') as f:
		f.writelines(lines)


def insert_route(route_file, tool_name_camelcase, description):

	with open(route_file, 'r') as f:
		lines = f.readlines()

	for i, line in enumerate(lines):
		if "ROUTES: RouteProperties" in line:
			line_number = i
			break


	route_block = '''\n\t{{
		name: "{tool_name_camelcase}",
		path: "/tools/{tool_name_camelcase}",
		element: <{tool_name_camelcase} />,
		description: "{description}",
	}},\n'''

	lines.insert(line_number + 1, route_block.format(tool_name_camelcase=tool_name_camelcase, description=description))
	import_block = 'import {tool_name_camelcase} from "./{tool_name_camelcase}/{tool_name_camelcase}";\n'
	lines.insert(1, import_block.format(tool_name_camelcase=tool_name_camelcase))

	with open(route_file, 'w') as f:
		f.writelines(lines)



def create_script_for_tool(tool_name, json_file, filename):

	with open(json_file, 'r') as f:
		data = json.load(f)

	# print("data is ",data)

	values = data.values()

	add_dec, list_preset = get_add_dec(values)

	declare_block = get_declare_block(values)

	init_block = get_init_block(tool_name, add_dec, values)

	form_block = get_form_block(tool_name, values, list_preset)

	lines = declare_block + init_block+ form_block

	with open(filename, 'w') as f:
		f.writelines(lines)


def create_files_for_tool(tool_name, json_file, description):

	conf_file = config.conf_file
	route_file = config.route_file


	path_folder = '../'+tool_name.title()
	print("path_folder is ", path_folder)
	script_path = os.path.join(path_folder, tool_name.title()+".tsx")
	if not os.path.exists(path_folder):
		os.mkdir(path_folder)
	print(script_path)

	insert_conf(conf_file, tool_name)
	insert_route(route_file, tool_name.title(), description)

	create_script_for_tool(tool_name, json_file, script_path)


def get_arguments():

	parser = argparse.ArgumentParser(description='integrate tool using json file')
	parser.add_argument('-t', '--tool', help='Name of the tool', required=True)
	parser.add_argument('-j', '--json', type=str, help='path of the json file', required=True)
	parser.add_argument('-d', '--desc', type=str, help='description of the tool', default=" ")

	args = parser.parse_args()

	return args.tool, args.json, args.desc



def main():

	# description = "test for creating cewl command"
	# tool_name = "cewl"
	# json_file = "test/template_json.json"

	tool_name, json_file, description = get_arguments()
	create_files_for_tool(tool_name, json_file, description)


if __name__ == '__main__':
	main()

