import { Button, LoadingOverlay, Stack, TextInput, Group, Switch, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

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
    "Switch to Advanced Mode for further options.";

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

    let form = useForm({
        initialValues: {
            url: "",
            optionBlank: "",
            verbose: false,
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = [`--url`, values.url];

        if (verboseChecked) {
            args.push(`-v`);
        }
        if (outputChecked) {
            args.push(`-o`);
        }
        if (formatChecked) {
            args.push(`-f`);
        }
        if (detectionModeChecked) {
            args.push(`--detection-mode`);
        }
        if (userAgentChecked) {
            args.push(`--ua`);
        }
        if (httpAuthChecked) {
            args.push(`--http-auth`);
        }
        if (maxThreadsChecked) {
            args.push(`--max-threads`);
        }
        if (throttleChecked) {
            args.push(`--throttle`);
        }
        if (requestTimeoutChecked) {
            args.push(`--request-timeout`);
        }
        if (connectTimeoutChecked) {
            args.push(`--connect-timeout`);
        }
        if (disableTLSChecksChecked) {
            args.push(`--disable-tls-checks`);
        }
        if (proxyChecked) {
            args.push(`--proxy`);
        }
        if (proxyAuthChecked) {
            args.push(`--proxy-auth`);
        }
        if (cookieStringChecked) {
            args.push(`--cookie-string`);
        }
        if (cookieJarChecked) {
            args.push(`--cookie-jar`);
        }
        if (forceChecked) {
            args.push(`--force`);
        }
        if (noUpdateChecked) {
            args.push(`--[no-]update `);
        }
        if (apiTokenChecked) {
            args.push(`--api-token`);
        }
        if (wpcontentChecked) {
            args.push(`--wp-content-dir`);
        }
        if (wppluginsChecked) {
            args.push(`--wp-plugins-dir`);
        }
        if (vpluginsChecked) {
            args.push(`-e -vp`);
        }
        if (apluginsChecked) {
            args.push(`-e -ap`);
        }
        if (ppluginsChecked) {
            args.push(`-e -p`);
        }
        if (vthemesChecked) {
            args.push(`-e -vt`);
        }
        if (athemesChecked) {
            args.push(`-e -at`);
        }
        if (tthemesChecked) {
            args.push(`-e -t`);
        }
        if (tthumbsChecked) {
            args.push(`-e -tt`);
        }
        if (cbackupsChecked) {
            args.push(`-e -cb`);
        }
        if (dbexportsChecked) {
            args.push(`-e -dbe`);
        }
        if (uidChecked) {
            args.push(`-e -u`);
        }
        if (midChecked) {
            args.push(`-e -m`);
        }
        if (excludeRegexpChecked) {
            args.push(`--exclude-content-based`);
        }
        if (pdetectionModeChecked) {
            args.push(`--plugins-detection`);
        }
        if (pvdetectionModeChecked) {
            args.push(`--plugins-version-detection`);
        }
        if (excludeUsernamesChecked) {
            args.push(`--exclude-usernames`);
        }
        if (passwordsChecked) {
            args.push(`--passwords`);
        }
        if (usernamesChecked) {
            args.push(`--usernames`);
        }
        if (maxPasswordsChecked) {
            args.push(`--multicall-max-passwords`);
        }
        if (passwordAttackChecked) {
            args.push(`--password-attack`);
        }
        if (loginUriChecked) {
            args.push(`--login-uri`);
        }
        if (stealthyChecked) {
            args.push(`--stealthy`);
        }

        try {
            const output = await CommandHelper.runCommand("wpscan", args);
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
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput
                    label={"URL of target wordpress site"}
                    placeholder={"Example: http://www.wordpress.com/sample"}
                    required
                    {...form.getInputProps("url")}
                />
                <Switch
                    size="md"
                    label="Advanced Mode"
                    checked={checkedAdvanced}
                    onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                />
                {checkedAdvanced && (
                    <>
                        <Switch
                            size="md"
                            label="Verbose"
                            checked={verboseChecked}
                            onChange={(e) => setVerboseChecked(e.currentTarget.checked)}
                        />
                        <Switch
                            size="md"
                            label="Output to File"
                            checked={outputChecked}
                            onChange={(e) => setOutputChecked(e.currentTarget.checked)}
                        />
                        {outputChecked && (
                            <>
                                <TextInput
                                    label={"Ouput to file"}
                                    placeholder={"File Name"}
                                    {...form.getInputProps("output")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Format"
                            checked={formatChecked}
                            onChange={(e) => setFormatChecked(e.currentTarget.checked)}
                        />
                        {formatChecked && (
                            <>
                                <TextInput
                                    label={"Format"}
                                    placeholder={"cli-no-colour, cli-no-color, json, cli"}
                                    {...form.getInputProps("format")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Detection Mode"
                            checked={detectionModeChecked}
                            onChange={(e) => setDetectionModeChecked(e.currentTarget.checked)}
                        />
                        {detectionModeChecked && (
                            <>
                                <TextInput
                                    label={"Detection Mode"}
                                    placeholder={"mixed, passive, aggressive"}
                                    {...form.getInputProps("detectionMode")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="User Agent"
                            checked={userAgentChecked}
                            onChange={(e) => setUserAgentChecked(e.currentTarget.checked)}
                        />
                        {userAgentChecked && (
                            <>
                                <TextInput
                                    label={"User Agent"}
                                    placeholder={"Input random for random user agent each scan"}
                                    {...form.getInputProps("userAgent")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Http Auth"
                            checked={httpAuthChecked}
                            onChange={(e) => setHttpAuthChecked(e.currentTarget.checked)}
                        />
                        {httpAuthChecked && (
                            <>
                                <TextInput
                                    label={"HTTP Auth"}
                                    placeholder={"Password"}
                                    {...form.getInputProps("httpAuth")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Max Threads"
                            checked={maxThreadsChecked}
                            onChange={(e) => setMaxThreadsChecked(e.currentTarget.checked)}
                        />
                        {maxThreadsChecked && (
                            <>
                                <TextInput
                                    label={"Max Threads"}
                                    placeholder={"Defualt = 5"}
                                    {...form.getInputProps("maxThreads")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Throttle"
                            checked={throttleChecked}
                            onChange={(e) => setThrottleChecked(e.currentTarget.checked)}
                        />
                        {throttleChecked && (
                            <>
                                <TextInput
                                    label={
                                        "Milliseconds to wait before doing another web request. If used, the max threads will be set to 1."
                                    }
                                    placeholder={"Defualt = 60"}
                                    {...form.getInputProps("throttle")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Request Timeout"
                            checked={requestTimeoutChecked}
                            onChange={(e) => setRequestTimeoutChecked(e.currentTarget.checked)}
                        />
                        {requestTimeoutChecked && (
                            <>
                                <TextInput
                                    label={"The request timeout in seconds"}
                                    placeholder={"Defualt = 60"}
                                    {...form.getInputProps("requestTimeout")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Connect Timeout"
                            checked={connectTimeoutChecked}
                            onChange={(e) => setConnectTimeoutChecked(e.currentTarget.checked)}
                        />
                        {connectTimeoutChecked && (
                            <>
                                <TextInput
                                    label={"The connection timeout in seconds"}
                                    placeholder={"Defualt = 60"}
                                    {...form.getInputProps("connectTimeout")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Disable TLS Checks"
                            checked={disableTLSChecksChecked}
                            onChange={(e) => setDisableTLSChecksChecked(e.currentTarget.checked)}
                        />
                        <Switch
                            size="md"
                            label="Proxy"
                            checked={proxyChecked}
                            onChange={(e) => setProxyChecked(e.currentTarget.checked)}
                        />
                        {proxyChecked && (
                            <>
                                <TextInput
                                    label={"Proxy"}
                                    placeholder={"protocol://IP:port"}
                                    {...form.getInputProps("proxy")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Proxy Auth"
                            checked={proxyAuthChecked}
                            onChange={(e) => setProxyAuthChecked(e.currentTarget.checked)}
                        />
                        {proxyAuthChecked && (
                            <>
                                <TextInput
                                    label={"Proxy Password"}
                                    placeholder={""}
                                    {...form.getInputProps("proxyAuth")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Cookie String"
                            checked={cookieStringChecked}
                            onChange={(e) => setCookieStringChecked(e.currentTarget.checked)}
                        />
                        {cookieStringChecked && (
                            <>
                                <TextInput
                                    label={"Cookie string to use in requests"}
                                    placeholder={"format: cookie1=value1[; cookie2=value2]"}
                                    {...form.getInputProps("cookieString")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Cookie Jar"
                            checked={cookieJarChecked}
                            onChange={(e) => setCookieJarChecked(e.currentTarget.checked)}
                        />
                        {cookieJarChecked && (
                            <>
                                <TextInput
                                    label={"File to read and write cookies"}
                                    placeholder={"Default: /tmp/wpscan/cookie_jar.txt"}
                                    {...form.getInputProps("cookieJar")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Force"
                            checked={forceChecked}
                            onChange={(e) => setForceChecked(e.currentTarget.checked)}
                        />
                        <Switch
                            size="md"
                            label="No Update"
                            checked={noUpdateChecked}
                            onChange={(e) => setNoUpdateChecked(e.currentTarget.checked)}
                        />
                        <Switch
                            size="md"
                            label="API Token"
                            checked={apiTokenChecked}
                            onChange={(e) => setApiTokenChecked(e.currentTarget.checked)}
                        />
                        {apiTokenChecked && (
                            <>
                                <TextInput
                                    label={"The WPScan API Token to display vulnerability data"}
                                    placeholder={"available at https://wpscan.com/profile"}
                                    {...form.getInputProps("apiToken")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="WP Content"
                            checked={wpcontentChecked}
                            onChange={(e) => setWpcontentChecked(e.currentTarget.checked)}
                        />
                        {wpcontentChecked && (
                            <>
                                <TextInput
                                    label={"The wp-content directory if custom or not detected"}
                                    placeholder={"Example: wp-content"}
                                    {...form.getInputProps("wpcontent")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="WP Plugins"
                            checked={wppluginsChecked}
                            onChange={(e) => setWppluginsChecked(e.currentTarget.checked)}
                        />
                        {wppluginsChecked && (
                            <>
                                <TextInput
                                    label={"The plugins directory if custom or not detected"}
                                    placeholder={"Example: wp-content/plugins"}
                                    {...form.getInputProps("wpplugings")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Vulnerable Plugins"
                            checked={vpluginsChecked}
                            onChange={(e) => setVpluginsChecked(e.currentTarget.checked)}
                        />
                        <Switch
                            size="md"
                            label="All Plugins"
                            checked={apluginsChecked}
                            onChange={(e) => setApluginsChecked(e.currentTarget.checked)}
                        />
                        <Switch
                            size="md"
                            label="Popular Plugins"
                            checked={ppluginsChecked}
                            onChange={(e) => setPpluginsChecked(e.currentTarget.checked)}
                        />
                        <Switch
                            size="md"
                            label="Vulnerable Themes"
                            checked={vthemesChecked}
                            onChange={(e) => setVthemesChecked(e.currentTarget.checked)}
                        />
                        <Switch
                            size="md"
                            label="All Themes"
                            checked={athemesChecked}
                            onChange={(e) => setAthemesChecked(e.currentTarget.checked)}
                        />
                        <Switch
                            size="md"
                            label="Popular Themes"
                            checked={tthemesChecked}
                            onChange={(e) => setTthemesChecked(e.currentTarget.checked)}
                        />
                        <Switch
                            size="md"
                            label="Timthumbs"
                            checked={tthumbsChecked}
                            onChange={(e) => setTthumbsChecked(e.currentTarget.checked)}
                        />
                        <Switch
                            size="md"
                            label="Config Backups"
                            checked={cbackupsChecked}
                            onChange={(e) => setCbackupsChecked(e.currentTarget.checked)}
                        />
                        <Switch
                            size="md"
                            label="Db Exports"
                            checked={dbexportsChecked}
                            onChange={(e) => setDbexportsChecked(e.currentTarget.checked)}
                        />
                        <Switch
                            size="md"
                            label="User IDs Range"
                            checked={uidChecked}
                            onChange={(e) => setUidChecked(e.currentTarget.checked)}
                        />
                        {uidChecked && (
                            <>
                                <TextInput
                                    label={"User IDs range. "}
                                    placeholder={"Example: u1-5"}
                                    {...form.getInputProps("uid")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Media IDs Range"
                            checked={midChecked}
                            onChange={(e) => setMidChecked(e.currentTarget.checked)}
                        />
                        {midChecked && (
                            <>
                                <TextInput
                                    label={"Media IDs range."}
                                    placeholder={"Example: m1-15"}
                                    {...form.getInputProps("mid")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Exclude Content Based Regexp"
                            checked={excludeRegexpChecked}
                            onChange={(e) => setExcludeRegexpChecked(e.currentTarget.checked)}
                        />
                        <Switch
                            size="md"
                            label="Plugins Detection Mode"
                            checked={pdetectionModeChecked}
                            onChange={(e) => setPdetectionModeChecked(e.currentTarget.checked)}
                        />
                        {pdetectionModeChecked && (
                            <>
                                <TextInput
                                    label={
                                        "Exclude all responses matching the Regexp (case insensitive) during parts of the enumeration."
                                    }
                                    placeholder={""}
                                    {...form.getInputProps("pdetectionMode")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Plugins Version Detection Mode"
                            checked={pvdetectionModeChecked}
                            onChange={(e) => setPvdetectionModeChecked(e.currentTarget.checked)}
                        />
                        {pvdetectionModeChecked && (
                            <>
                                <TextInput
                                    label={"Use the supplied mode to check plugins' versions."}
                                    placeholder={""}
                                    {...form.getInputProps("pvdetectionMode")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Exclude Usernames"
                            checked={excludeUsernamesChecked}
                            onChange={(e) => setExcludeUsernamesChecked(e.currentTarget.checked)}
                        />
                        {excludeUsernamesChecked && (
                            <>
                                <TextInput
                                    label={
                                        "Exclude usernames matching the Regexp/string (case insensitive). Regexp delimiters are not required."
                                    }
                                    placeholder={""}
                                    {...form.getInputProps("excludeUsernames")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Passwords"
                            checked={passwordsChecked}
                            onChange={(e) => setPasswordsChecked(e.currentTarget.checked)}
                        />
                        {passwordsChecked && (
                            <>
                                <TextInput
                                    label={" List of passwords to use during the password attack."}
                                    placeholder={""}
                                    {...form.getInputProps("passwords")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Usernames"
                            checked={usernamesChecked}
                            onChange={(e) => setUsernamesChecked(e.currentTarget.checked)}
                        />
                        {usernamesChecked && (
                            <>
                                <TextInput
                                    label={"List of usernames to use during the password attack."}
                                    placeholder={""}
                                    {...form.getInputProps("usernames")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Multicall Max Passwords"
                            checked={maxPasswordsChecked}
                            onChange={(e) => setMaxPasswordsChecked(e.currentTarget.checked)}
                        />
                        {maxPasswordsChecked && (
                            <>
                                <TextInput
                                    label={"Maximum number of passwords to send by request with XMLRPC multicall"}
                                    placeholder={""}
                                    {...form.getInputProps("maxPasswords")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Password Attack"
                            checked={passwordAttackChecked}
                            onChange={(e) => setPasswordAttackChecked(e.currentTarget.checked)}
                        />
                        <Switch
                            size="md"
                            label="Login URI"
                            checked={loginUriChecked}
                            onChange={(e) => setLoginUriChecked(e.currentTarget.checked)}
                        />
                        {loginUriChecked && (
                            <>
                                <TextInput
                                    label={"The URI of the login page if different from /wp-login.php"}
                                    placeholder={""}
                                    {...form.getInputProps("loginUri")}
                                />
                            </>
                        )}
                        <Switch
                            size="md"
                            label="Stealthy"
                            checked={stealthyChecked}
                            onChange={(e) => setStealthyChecked(e.currentTarget.checked)}
                        />
                    </>
                )}
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default WPScan;
