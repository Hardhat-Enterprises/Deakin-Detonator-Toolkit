import React, { useState } from "react";
import { Modal, Button, Text, Stack, Loader, Center } from "@mantine/core";
import { installDependencies } from "../../utils/InstallHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

/**
 * Props for the InstallationModal component.
 */
type InstallationModalProps = {
    isOpen: boolean;
    setOpened: (value: boolean) => void;
    feature_description: string;
    dependencies: string[];
};

/**
 * Handles the installation of dependencies.
 *
 * @param dependencies - An array of dependencies to install.
 * @param setOutput - A function to update the output state.
 * @param setLoading - A function to update the loading state.
 */
const handleInstall = async (
    dependencies: string[],
    setOutput: React.Dispatch<React.SetStateAction<string>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
    // Set the loading state to true. This will display the console output.
    setLoading(true);

    // Install the dependencies
    installDependencies(dependencies, setOutput);
};

/**
 * Represents the InstallationModal component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Indicates whether the modal is open or not.
 * @param {function} props.setOpened - Callback function to set the modal open state.
 * @param {string} props.feature_description - The description of the feature.
 * @param {string[]} props.dependencies - The list of dependencies required for the feature.
 * @returns {JSX.Element} The rendered InstallationModal component.
 */
const InstallationModal: React.FC<InstallationModalProps> = ({
    isOpen,
    setOpened,
    feature_description,
    dependencies,
}) => {
    // Define state variables for loading and output. hooks.
    let [loading, setLoading] = useState<boolean>(false);
    let [output, setOutput] = useState<string>("");

    // Sets the loading screen progress value
    let stageOfDownload = "Initialising...";
    if (loading !== false) {
        stageOfDownload = "in progress...";
    } else {
        stageOfDownload = "Complete.";
    }
    // Display for the loading icon
    function loadingIcon() {
        return (
            <Center inline>
                <Loader size="md" />
                <Text ml={10}>Download is currently {stageOfDownload}</Text>
            </Center>
        );
    }
    return (
        <Modal
            opened={isOpen}
            onClose={() => setOpened(false)}
            title={<strong>Component Installation Menu</strong>}
            size={"auto"}
            style={{ maxWidth: "50%", margin: "auto" }}
        >
            <div>
                {loading ? (
                    <Stack>
                        <text>
                            <hr></hr> <br></br>
                            The required dependency is currently installing.<br></br>
                            <br></br>
                            {loadingIcon()}
                            <br></br> <br></br>
                            Download may appear to freeze. Please do NOT close the window.
                        </text>
                        <ConsoleWrapper output={output} hideClearButton={true} title={""} />
                    </Stack>
                ) : (
                    <Stack>
                        <Text>
                            <hr></hr> <br></br>
                            Not all of the features which Deakin Detonator Toolkit has to offer are available
                            immediately upon installation. Some features require the installation of additional
                            components on your system. Please read the below description carefully to decide if you
                            would like to install the component and its dependencies.
                        </Text>
                        <Text>
                            <strong>Feature Description:</strong>
                            <br></br>
                            {feature_description}
                        </Text>
                        <Text>
                            <strong>Dependencies:</strong>
                            <br></br>
                            {dependencies.map((dependency, index) => (
                                <Text key={index}>{dependency}</Text>
                            ))}
                        </Text>

                        <Button onClick={() => handleInstall(dependencies, setOutput, setLoading)}>
                            Install Component
                        </Button>
                        <Button color="red" onClick={() => setOpened(false)}>
                            Close
                        </Button>
                    </Stack>
                )}
            </div>
        </Modal>
    );
};

export default InstallationModal;
