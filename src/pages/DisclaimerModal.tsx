import { Modal, Text, Button, Image } from "@mantine/core";
import { useEffect, useState } from "react";

interface DisclaimerModalProps {
    opened: boolean;
    onClose: () => void;
}

// Function to clear disclaimer acceptance (useful for testing or reset)
// To reset the disclaimer during development, open browser console and run:
// sessionStorage.removeItem("disclaimerAccepted"); then refresh the page
export const clearDisclaimerAcceptance = () => {
    sessionStorage.removeItem("disclaimerAccepted");
};

// Function to check if disclaimer has been accepted in current session
export const isDisclaimerAccepted = () => {
    return sessionStorage.getItem("disclaimerAccepted") === "true";
};

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ opened, onClose }) => {
    const [logoSrc, setLogoSrc] = useState<string>("");

    // Keep the modal in dark mode
    const colorScheme: "dark" = "dark";

    useEffect(() => {
        // Always use dark logo for dark theme
        setLogoSrc("src/logo/logo-dark.png");
    }, []);

    const handleAccept = () => {
        // Store in sessionStorage that the disclaimer has been accepted for this session
        sessionStorage.setItem("disclaimerAccepted", "true");
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={handleAccept}
            title="Welcome to the Deakin Detonator Toolkit"
            centered
            closeOnEscape={false}
            withCloseButton={false}
            closeOnClickOutside={false}
            overlayOpacity={0.7}
            overlayBlur={3}
            size="xl"
            styles={(theme) => ({
                title: {
                    fontSize: "2rem",
                    fontWeight: "bold",
                    textAlign: "center",
                    width: "100%",
                    color: theme.white,
                },
                modal: {
                    backgroundColor: theme.colors.dark[7],
                },
                header: {
                    backgroundColor: theme.colors.dark[7],
                },
                body: {
                    backgroundColor: theme.colors.dark[7],
                },
            })}
        >
            <Image src={logoSrc} alt="logo" width={300} style={{ display: "block", margin: "0 auto" }} />
            <Text
                align="center"
                style={{
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                    color: "white",
                }}
            >
                Hacking is a crime. This application is for <strong>Educational Purposes Only!</strong>
                <br />
                <br />
                Misuse of this application can lead to violation of Australian and/or International Law.
                <br />
                <br />
                By using this application, you confirm that you have obtained proper authorization from all relevant
                parties before conducting any penetration testing with this software.
                <br />
                <br />
                <strong>
                    <u>You</u>
                </strong>{" "}
                are solely responsible for managing this authorization.
            </Text>
            <Button fullWidth onClick={handleAccept} mt="lg">
                I Understand
            </Button>
        </Modal>
    );
};

export default DisclaimerModal;
