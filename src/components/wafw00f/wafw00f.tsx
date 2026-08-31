import { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Switch, Stack } from "@mantine/core";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import InstallationModal from "../InstallationModal/InstallationModal";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { RenderComponent } from "../UserGuide/UserGuide";
import { useForm } from "@mantine/form";
import AskChatGPT from "../AskChatGPT/AskChatGPT";
import ChatGPTOutput from "../AskChatGPT/ChatGPTOutput";
import AskCohere from "../AskCohere/AskCohere";
import CohereOutput from "../AskCohere/CohereOutput";

const Wafw00f = () => {
    const title = "WafW00f";
    const description = "A tool to identify and fingerprint Web Application Firewalls (WAFs).";
    const steps =
        "Step 1: Enter the target URL.\n" +
        "Step 2: Toggle 'Find All WAFs' if required.\n" +
        "Step 3: Click 'Run WafW00f' to execute.\n" +
        "Step 4: View the results in the output section.";
    const sourceLink = "https://github.com/EnableSecurity/wafw00f";
    const tutorial = "https://docs.google.com/document/d/1oC6Z4M3i5bLAh3vRs5B28DFA4rOqahVjF9g2HznTCvs/edit?usp=sharing"
    const dependencies = ["wafw00f"];

    // State variables to manage tool behavior
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(false);
    const [loadingModal, setLoadingModal] = useState(true);
    const [findAllWAFs, setFindAllWAFs] = useState(false); // State for '-a' flag
    const [chatGPTResponse, setChatGPTResponse] = useState(""); // ChatGPT response
    const [cohereResponse, setCohereResponse] = useState(""); // Cohere response

    // Form hook to manage input fields
    const form = useForm({
        initialValues: {
            targetUrl: "",
        },
    });

    // Check if the command 'wafw00f' is available when the component mounts
    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable);
                setLoadingModal(false);
            })
            .catch((error) => {
                console.error("Error checking command availability:", error);
                setLoadingModal(false);
            });
    }, []);

    // Function to validate URL input
    const isValidURL = (url: string): boolean => {
        const regex = /^(https?:\/\/)?((\d{1,3}\.){3}\d{1,3}|([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))(\/.*)?$/;
        return regex.test(url);
    };

    // Clean and format tool output for better readability
    const cleanAndFormatOutput = (rawOutput: string): string => {
        const lines = rawOutput.split("\n");

        const formattedLines = lines.map((line) => {
            if (line.includes("[*] Checking")) {
                const target = line.match(/Checking (.+)/)?.[1]?.trim() || "Unknown Target";
                return `[+] Target: ${target}`;
            }
            
	    if (line.includes("is behind") && line.includes("WAF")) {
		  const wafName =
		    line.match(/is behind (.+?) WAF/)?.[1]?.trim() || "Detected WAF";

		  return `[+] WAF Status: Detected
		[+] WAF Name: ${wafName}
		[i] Detection Method: Signature-based detection matched a known WAF signature.`;
		}
	    if (line.includes("Generic Detection results")) {
		    return "[i] Generic Detection: Behaviour-based detection based on the website response.";
		}
            if (line.includes("Reason:")) {
                return `[~] Reason: ${line.split("Reason:")[1].trim()}`;
            }
            if (line.includes("Number of requests")) {
                return `[~] Number of Requests: ${line.split(":")[1].trim()}`;
            }
            if (
 		 line.includes("NameResolutionError") ||
 		 line.includes("Failed to resolve")
		) {
 		 return "[!] Domain could not be resolved. Please check the URL.";
		}

		if (
		  line.includes("SSLError") ||
		  line.includes("certificate verify failed")
		) {
		  return "[!] SSL/TLS connection failed.";
		}

		if (
		  line.includes("ConnectTimeout") ||
		  line.includes("ReadTimeout") ||
		  line.includes("timed out")
		) {
		  return "[!] Connection timed out. Please try again.";
		}

		if (
		  line.includes("HTTPConnectionPool") ||
		  line.includes("HTTPSConnectionPool")
		) {
		  return "[!] Unable to connect to the website.";
		}
		if (line.includes("appears to be down")) {
  		  return "";
		}
		if (line.includes("ERROR:wafw00f")) {
                return `[!] Error: ${line.split("ERROR:wafw00f:")[1].trim()}`;
                }
                
                if (
		  line.includes("WAFW00F") ||
		  line.includes("Sniffing Web Application Firewalls") ||
		  line.includes("Web Application Firewall Fingerprinting Toolkit")
		) {
		  return "";
		}
            
            return "";
        });

        return formattedLines.filter((line) => line.trim() !== "").join("\n");
    };

    // Process data returned from the tool and update output
    const handleProcessData = useCallback((data: string) => {
	  const formattedData = cleanAndFormatOutput(data);

		  if (formattedData.trim()) {
		    setOutput((prevOutput) =>
		      prevOutput ? `${prevOutput}\n${formattedData}` : formattedData
		    );
		  }
		}, []);

    // Handle process termination
    const handleProcessTermination = useCallback(
  ({ code, signal }: { code: number; signal: number }) => {
    setOutput((prevOutput) => {
      if (signal === 15) {
        return `${prevOutput}\nScanning stopped.\nProcess was manually terminated.`;
      }

      if (code === 0 && !prevOutput.includes("[!]")) {
        return `${prevOutput}\nScanning complete!\nProcess completed successfully.`;
      }

      if (prevOutput.includes("[!]")) {
        return `${prevOutput}\nScanning failed due to an error.\nCheck the error details above.`;
      }

      return `${prevOutput}\nScanning failed.\nProcess terminated with exit code: ${code} and signal code: ${signal}`;
    });

    setPid("");
    setLoading(false);
    setAllowSave(true);
	  },
	  []
	);

    // Handle form submission and run 'wafw00f' command
    const onSubmit = async (values: { targetUrl: string }) => {
        if (!values.targetUrl || !isValidURL(values.targetUrl)) {
            setOutput("Error: Please enter a valid URL (e.g., https://example.com).");
            return;
        }

        setAllowSave(false);
        setLoading(true);
        setOutput(""); // Clear output at the start

        const args = findAllWAFs ? [values.targetUrl, "-a"] : [values.targetUrl];
        const timeout = 20000; // 20 seconds timeout

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("The operation timed out after 20 seconds.")), timeout)
        );

        try {
            const executionPromise = CommandHelper.runCommandGetPidAndOutput(
                "wafw00f",
                args,
                handleProcessData,
                handleProcessTermination
            );
            await Promise.race([executionPromise, timeoutPromise]);
        } catch (error: any) {
            setOutput(error.message || "An unknown error occurred.");
            setLoading(false);
        }
    };

    // Clear output when "Clear" is triggered
    const clearOutput = useCallback(() => {
        setOutput("");
        setAllowSave(false);
        setHasSaved(false);
    }, []);

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    return (
        <RenderComponent title={title} description={description} steps={steps} tutorial={tutorial} sourceLink={sourceLink}>
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description}
                    dependencies={dependencies}
                />
            )}
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <TextInput
                        label="Target URL"
                        placeholder="Enter target URL (e.g., https://example.com)"
                        required
                        {...form.getInputProps("targetUrl")}
                    />
                    <div style={{ fontSize: "13px", color: "gray" }}>
			  Example: https://example.com. Results may vary for domains, subdomains, and IP addresses.
		    </div>
                    <Switch
                        label="Find All WAFs"
                        checked={findAllWAFs}
                        onChange={(event) => setFindAllWAFs(event.currentTarget.checked)}
                    />
                    <Button type="submit">Run {title}</Button>
                    {loading && (
                        <div style={{ fontWeight: "bold", marginTop: "10px", color: "blue" }}>
                            Scanning in progress... Please wait.
                        </div>
                    )}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <AskChatGPT toolName={title} output={output} setChatGPTResponse={setChatGPTResponse} />
                    {chatGPTResponse && (
                        <div style={{ marginTop: "20px" }}>
                            <h3>ChatGPT Response:</h3>
                            <ChatGPTOutput output={chatGPTResponse} />
                        </div>
                    )}
                    <AskCohere toolName={title} output={output} setCohereResponse={setCohereResponse} />
                    {cohereResponse && (
                        <div style={{ marginTop: "20px" }}>
                            <h3>Cohere Response:</h3>
                            <CohereOutput output={cohereResponse} />
                        </div>
                    )}
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Wafw00f;
