import React, { useState } from "react";
import { Modal, Button, Text, Stack } from "@mantine/core";
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

    return (
        <Modal
            opened={isOpen}
            onClose={() => setOpened(false)}
            title="Component Installation"
            size={"auto"}
            style={{ maxWidth: "30%", margin: "auto" }}
        >
            <div>
                {loading ? (
                    <Stack>
                        <ConsoleWrapper output={output} hideClearButton={true} title="Installation Progress" />
                    </Stack>
                ) : (
                    <Stack>
                        <Text>
                            Not all features that the Deakin Detonator Toolkit has available to you are immediately
                            available on installation. Some features require additional components to be installed on
                            your system. Please read the below description carefully to decide if you would like to
                            install the component and its dependencies.
                        </Text>
                        <Text>Feature Description:</Text>
                        <Text>{feature_description}</Text>
                        <Text>Dependencies:</Text>

                        {dependencies.map((dependency, index) => (
                            <Text key={index}>{dependency}</Text>
                        ))}

                        <Button onClick={() => setOpened(false)}>Close</Button>
                        <Button onClick={() => handleInstall(dependencies, setOutput, setLoading)}>
                            Install Component
                        </Button>
                    </Stack>
                )}
            </div>
        </Modal>
    );
};

export default InstallationModal;
