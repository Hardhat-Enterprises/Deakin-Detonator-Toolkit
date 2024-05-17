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