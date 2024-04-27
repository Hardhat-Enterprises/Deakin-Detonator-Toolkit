/*
This DigTool component is a DNS lookup tool implemented in React.js. 
It allows users to enter a domain name, performs a DNS lookup using the Google 
Public DNS resolver, and displays the result or any errors that occur during 
the process.

The component maintains state for the domain name, DNS lookup result, and error 
messages. When the user clicks the "Perform Lookup" button, it triggers the 
handleLookup function, which retrieves DNS information similar to a terminal with 
the "Dig" command
*/

import React, { useState } from "react";

const DigTool: React.FC = () => {
    // State variables to store domain, result, and error
    const [domain, setDomain] = useState("");
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Function to handle DNS lookup
    const handleLookup = async () => {
        // Clear previous results and errors
        setResult(null);
        setError(null);

        try {
            // Fetch DNS records using Google Public DNS resolver
            const response = await fetch(`https://dns.google/resolve?name=${domain}`);

            if (!response.ok) {
                throw new Error("Failed to fetch DNS records");
            }

            // Parse the JSON response
            const data = await response.json();

            // Update the result state with the formatted DNS records
            setResult(JSON.stringify(data, null, 2));
        } catch (err: any) {
            // Handle errors
            setError(`Error: ${(err as Error).message}`);
        }
    };

    // Render the component
    return (
        <div>
            <h1><u>Dig Tool.</u></h1>
            <label>Domain:</label>
            <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} />

            <button onClick={handleLookup}>Perform Lookup!</button>

            {error && <div>Error: {error}</div>}
            {result && (
                <div>
                    <h2>Result:</h2>
                    <pre>{result}</pre>
                </div>
            )}
        </div>
    );
};

export default DigTool;
