import { Button, LoadingOverlay, NativeSelect, NumberInput, Stack, TextInput, Switch, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Network port scanner (NMAP)";
const description_userguide =
    "Nmap is a network scanning tool that allows a user to discover everything connected to " +
    "a network and receive a wide variety of information about what is connected. The tool utilises several " +
    "scanning techniques that include but are not limited toUDP, TCP connect(), TCP SYN (half-open)and FTP. " +
    "Nmap offers several advanced features including an Operating System (OS) detection and Firewall status " +
    "check and provides a number of scan types.\n\nNmap Reference Guide: https://nmap.org/book/man.html\n\n" +
    "How to use Nmap:\n\n" +
    "Step 1: Enter an IP or Hostname.\n" +
    "       E.g. 127.0.0.1\n\n" +
    "Step 2: Enter a Port number.\n       E.g. 5173\n\nStep 3: Pick a scan speed - Note; " +
    "Higher sppeds require a faster host network.\nT0 - Paranoid / T1 - Sneaky / T2 - Polite / T3 - Normal / " +
    " T4 - Aggressive /\nT5 - Insane\n       Eg: T2\n\nStep 4: Select the type of scan to perform.\n        " +
    "Eg: Operating System\n\nStep 5: Click Scan to commence the Nmap operation.\n\n" +
    "Step 6: View the Output block below to view the results of the Scan.";

interface FormValuesType {
    ip: string;
    port: string;
    speed: string;
    scanOption: string;
    numTopPorts: number;
    exclusion: string;
    verbose: boolean;
}

const speeds = ["T0", "T1", "T2", "T3", "T4", "T5"];

const scanOptions = [
    "All",
    "Operating System",
    "Firewall Status",
    "Services",
    "Stealth",
    "Device Discovery",
    "Top ports",
];

const NmapTool = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    //const [checkedAdvanced, setCheckedAdvanced] = useState(false);
    const [selectedScanOption, setSelectedScanOption] = useState("");
    const [selectedSpeedOption, setSelectedSpeedOption] = useState("");
    const [verbose, setVerbose] = useState(false);

    let form = useForm({
        initialValues: {
            ip: "",
            port: "",
            speed: "T3",
            scanOption: "All",
            numTopPorts: 100,
            exclusion: "",
            verbose: false,
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [`-${values.speed}`];

        if (values.port) {
            args.push(`-p ${values.port}`);
        }

        if (values.verbose) {
            args.push("-v");
        }

        if (values.scanOption === "All") {
            args.push("-A");
        } else if (values.scanOption === "Operating System") {
            args.push("-O");
        } else if (values.scanOption === "Firewall Status") {
            args.push("-sA");
        } else if (values.scanOption === "Services") {
            args.push("-sV");
        } else if (values.scanOption === "Stealth") {
            args.push("-sN");
        } else if (values.scanOption === "Device Discovery") {
            args.push("-sn");
        } else if (values.scanOption == "Aggressive") {
            args.push("-A");
        } else if (values.scanOption === "Top ports") {
            args.push("--top-ports", `${values.numTopPorts}`);
        }

        args.push(...values.ip.split(" "));

        if (values.exclusion) {
            args.push(`-exclude ${values.exclusion.split(" ")}`);
        }

        try {
            const output = await CommandHelper.runCommand("nmap", args);
            setOutput(output);
        } catch (e: any) {
            setOutput(e);
        }

        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    // Determine if the current scan options are for the top ports.
    const isTopPortScan = selectedScanOption === "Top ports";

    return (
        <form
            onSubmit={form.onSubmit((values) =>
                onSubmit({ ...values, scanOption: selectedScanOption, speed: selectedSpeedOption })
            )}
        >
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}

                {/* <Switch size="md"label="Advanced Mode" checked={checkedAdvanced}
                    onChange={ (e) => setCheckedAdvanced(e.currentTarget.checked)}
                    /> */}
                <TextInput label={"IP or Hostname"} required {...form.getInputProps("ip")} />
                {/* {checkedAdvanced && (
<>
<TextInput label={"Exclusions to range"} placeholder={"Form of xxx.xxx.xxx.xxx"}
                    {...form.getInputProps("exclusion" )}/>            

                )} */}
                <Checkbox label={"Verbose"} {...form.getInputProps("verbose" as keyof FormValuesType)} />

                {!isTopPortScan && <TextInput label={"Port"} {...form.getInputProps("port")} />}
                {isTopPortScan && <NumberInput label={"Number of top ports"} {...form.getInputProps("numTopPorts")} />}
                <NativeSelect
                    value={selectedSpeedOption}
                    onChange={(e) => setSelectedSpeedOption(e.target.value)}
                    title={"Scan speed"}
                    data={speeds}
                    required
                    placeholder={"Pick a scan speed"}
                    description={"Speed of the scan, refer: https://nmap.org/book/performance-timing-templates.html"}
                />
                <NativeSelect
                    value={selectedScanOption}
                    onChange={(e) => setSelectedScanOption(e.target.value)}
                    title={"Scan option"}
                    data={scanOptions}
                    required
                    placeholder={"Pick a scan option"}
                    description={"Type of scan to perform"}
                />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default NmapTool;
