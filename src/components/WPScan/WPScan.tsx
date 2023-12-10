import { Button, LoadingOverlay, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";

const title = "WPScan";
const description_userguide =
    "WPScan is a tool used for targeting WordPress URL's to allow for the enumeration of any plugins that are installed. " +
    "The tool will further scans these WordPress installations to search for and identify any security issues.\n\nFurther " +
    "information can be found at: https://www.kali.org/tools/wpscan/\n\n" +
    "Using WPScan:\n" +
    "Step 1: Enter a WordPress URL.\n" +
    "       Eg: http://www.wordpress.com/sample\n\n" +
    "Step 2: Click Scan to commence WPScan's operation.\n\n" +
    "Step 3: View the Output block below to view the results of the tools execution.\n\n" +
    "For further options, add flags to the 'Customs Flags' field (Example syntax: --stealthy, -U) ";

interface FormValues {
    url: string;
    optionBlank: string;
    verbose: boolean;
    output: string;
    format: string;
    detectionMode: string;
    userAgent: string; //add random to options to use it
    httpAuth: string;
    maxThreads: string;
    throttle: string;
    requestTimeout: string;
    connectTimeout: string;
    disableTLSChecks: boolean;
    proxy: string;
    proxyAuth: string;
    cookieString: string;
    cookieJar: string;
    force: boolean;
    noUpdate: boolean;
    apiToken: string;
    wpcontent: string;
    wpplugings: string;

    vplugins: boolean;
    aplugins: boolean;
    pplugins: boolean;

    vthemes: boolean;
    athemes: boolean;
    tthemes: boolean;

    tthumbs: boolean;
    cbackups: boolean;
    dbexports: boolean;
    uid: string;
    mid: string;
    excludeRegexp: boolean;
    pdetectionMode: string;
    pvdetectionMode: string;
    excludeUsernames: string;
    passwords: string;
    usernames: string;
    maxPasswords: string;
    passwordAttack: boolean;
    loginUri: string;
    stealthy: boolean;
    customFlags: string; // New customFlags field
}

const WPScan = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [checkedAdvanced, setCheckedAdvanced] = useState(false);
    const [verboseChecked, setVerboseChecked] = useState(false);
    const [outputChecked, setOutputChecked] = useState(false);
    const [formatChecked, setFormatChecked] = useState(false);
    const [detectionModeChecked, setDetectionModeChecked] = useState(false);
    const [userAgentChecked, setUserAgentChecked] = useState(false);
    const [httpAuthChecked, setHttpAuthChecked] = useState(false);
    const [maxThreadsChecked, setMaxThreadsChecked] = useState(false);
    const [throttleChecked, setThrottleChecked] = useState(false);
    const [requestTimeoutChecked, setRequestTimeoutChecked] = useState(false);
    const [connectTimeoutChecked, setConnectTimeoutChecked] = useState(false);
    const [disableTLSChecksChecked, setDisableTLSChecksChecked] = useState(false);
    const [proxyChecked, setProxyChecked] = useState(false);
    const [proxyAuthChecked, setProxyAuthChecked] = useState(false);
    const [cookieStringChecked, setCookieStringChecked] = useState(false);
    const [cookieJarChecked, setCookieJarChecked] = useState(false);
    const [forceChecked, setForceChecked] = useState(false);
    const [noUpdateChecked, setNoUpdateChecked] = useState(false);
    const [apiTokenChecked, setApiTokenChecked] = useState(false);
    const [wpcontentChecked, setWpcontentChecked] = useState(false);
    const [wppluginsChecked, setWppluginsChecked] = useState(false);
    const [vpluginsChecked, setVpluginsChecked] = useState(false);
    const [apluginsChecked, setApluginsChecked] = useState(false);
    const [ppluginsChecked, setPpluginsChecked] = useState(false);
    const [vthemesChecked, setVthemesChecked] = useState(false);
    const [athemesChecked, setAthemesChecked] = useState(false);
    const [tthemesChecked, setTthemesChecked] = useState(false);
    const [tthumbsChecked, setTthumbsChecked] = useState(false);
    const [cbackupsChecked, setCbackupsChecked] = useState(false);
    const [dbexportsChecked, setDbexportsChecked] = useState(false);
    const [uidChecked, setUidChecked] = useState(false);
    const [midChecked, setMidChecked] = useState(false);
    const [excludeRegexpChecked, setExcludeRegexpChecked] = useState(false);
    const [pdetectionModeChecked, setPdetectionModeChecked] = useState(false);
    const [pvdetectionModeChecked, setPvdetectionModeChecked] = useState(false);
    const [excludeUsernamesChecked, setExcludeUsernamesChecked] = useState(false);
    const [passwordsChecked, setPasswordsChecked] = useState(false);
    const [usernamesChecked, setUsernamesChecked] = useState(false);
    const [maxPasswordsChecked, setMaxPasswordsChecked] = useState(false);
    const [passwordAttackChecked, setPasswordAttackChecked] = useState(false);
    const [loginUriChecked, setLoginUriChecked] = useState(false);
    const [stealthyChecked, setStealthyChecked] = useState(false);
    const [pid, setPid] = useState("");

    let form = useForm({
        initialValues: {
            url: "",
            optionBlank: "",

            verbose: false,
            output: "",
            format: "",
            detectionMode: "",
            userAgent: "", //add random to options to use it
            httpAuth: "",
            maxThreads: "",
            throttle: "",
            requestTimeout: "",
            connectTimeout: "",
            disableTLSChecks: false,
            proxy: "",
            proxyAuth: "",
            cookieString: "",
            cookieJar: "",
            force: false,
            noUpdate: false,
            apiToken: "",
            wpcontent: "",
            wpplugings: "",

            vplugins: false,
            aplugins: false,
            pplugins: false,

            vthemes: false,
            athemes: false,
            tthemes: false,

            tthumbs: false,
            cbackups: false,
            dbexports: false,
            uid: "",
            mid: "",
            excludeRegexp: false,
            pdetectionMode: "",
            pvdetectionMode: "",
            excludeUsernames: "",
            passwords: "",
            usernames: "",
            maxPasswords: "",
            passwordAttack: false,
            loginUri: "",
            stealthy: false,
            customFlags: "", // Initialize customFlags with an empty string
        },
    });

    // Uses the callback function of runCommandGetPidAndOutput to handle and save data
    // generated by the executing process into the output state variable.
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
    }, []);

    // Uses the onTermination callback function of runCommandGetPidAndOutput to handle
    // the termination of that process, resetting state variables, handling the output data,
    // and informing the user.
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }
            // Clear the child process pid reference
            setPid("");
            // Cancel the Loading Overlay
            setLoading(false);
        },
        [handleProcessData]
    );

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = [`--url`, values.url, values.customFlags]; // Include customFlags in the args

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "wpscan",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            setOutput(e.message);
        }
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput
                    label={"URL of target WordPress site"}
                    placeholder={"Example: http://www.wordpress.com/sample"}
                    required
                    {...form.getInputProps("url")}
                />
                <TextInput //new custom flag field input for the user to add whatever flags they desire
                    label={"Custom Flags"}
                    placeholder={"Enter custom flags for WPScan"}
                    {...form.getInputProps("customFlags")}
                />
                <Button type={"submit"}>Scan</Button>
                {SaveOutputToTextFile(output)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};
export default WPScan;
