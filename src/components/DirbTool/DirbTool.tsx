// Import necessary hooks and components from React and other libraries
import { useState, useCallback, useEffect } from "react";
import { Stepper, Button, TextInput, NumberInput, Select, Switch, Stack, Grid } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";

/**
 * Represents the form values for the Dirb component.
 */
interface FormValuesType {
    // Define the properties for the form values
    url: string;
    wordlistPath: string;
    wordlistSize: string;
    caseInsensitive: boolean;
    printLocation: boolean;
    ignoreHttpCode: number;
    outputFile: string;
    nonRecursive: boolean;
    silentMode: boolean;
    userAgent: string | null;
    squashSequences: boolean;
    cookie: string;
    certificatePath: string;
    customHeader: string;
    proxy: string | null;
    proxyAuth: string;
    interactiveRecursion: boolean;
    username: string;
    password: string;
    showNonExistent: boolean;
    stopOnWarning: boolean;
    extensionsFile: string;
    extensions: string;
    delay: number;
}

/**
 * The Dirb component.
 * @returns The Dirb component.
 */
function Dirb() {
    // Declare state variables for component
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [active, setActive] = useState(0);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);

    // Additional state variables for section visibility
    const [basicOpened, setBasicOpened] = useState(true);
    const [advancedOpened, setAdvancedOpened] = useState(false);
    const [authOpened, setAuthOpened] = useState(false);
    const [additionalOpened, setAdditionalOpened] = useState(false);

    // Declare constants for the component
    const title = "Dirb";
    const description =
        "Dirb is a Web Content Scanner. It looks for existing (and/or hidden) Web Objects. It basically works by launching a dictionary-based attack against a web server and analyzing the response.";
    const steps =
        "Step 1: Enter the base URL.\n" +
        "Step 2: Select the desired parameters for the Dirb command, including the wordlist size.\n" +
        "Step 3: Click the 'Run Dirb' button to initiate the scanning process.\n" +
        "Step 4: Review the output in the console to identify any detected web objects or hidden content.\n";
    const sourceLink = "";
    const tutorial = "";
    const dependencies = ["dirb"];

    // Initialize the form hook with initial values
    const form = useForm<FormValuesType>({
        initialValues: {
            url: "",
            wordlistPath: "",
            wordlistSize: "default", // Set the default wordlist size
            caseInsensitive: false,
            printLocation: false,
            ignoreHttpCode: 0,
            outputFile: "",
            nonRecursive: false,
            silentMode: false,
            userAgent: null,
            squashSequences: false,
            cookie: "",
            certificatePath: "",
            customHeader: "",
            proxy: null,
            proxyAuth: "",
            interactiveRecursion: false,
            username: "",
            password: "",
            showNonExistent: false,
            stopOnWarning: false,
            extensionsFile: "",
            extensions: "",
            delay: 0,
        },
    });

    // ... (rest of the code)
}

export default Dirb;