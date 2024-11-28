import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri'; // Import Tauri's invoke function

const IPInsight = () => {
    const [ipAddress, setIpAddress] = useState('');
    const [traceResults, setTraceResults] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Function to trigger backend command
    const handleTraceIP = async () => {
        if (!ipAddress.trim()) {
            setError('Please enter a valid IP address.');
            return;
        }

        setError(null); // Clear previous errors
        setTraceResults(null); // Clear previous results

        try {
            const response = await invoke<string>('trace_ip_full', { ip: ipAddress });
            setTraceResults(response);
        } catch (err) {
            console.error('Error tracing IP:', err);
            setError('Failed to trace IP. Ensure the backend is configured correctly.');
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>IP Insight Tool</h1>
            <p>Enter an IP address to retrieve its trace, ownership, and geolocation information.</p>

            <input
                type="text"
                placeholder="Enter IP address"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                style={{
                    padding: '10px',
                    fontSize: '16px',
                    width: '300px',
                    marginBottom: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                }}
            />
            <br />

            <button
                onClick={handleTraceIP}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: '#007BFF',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Trace IP
            </button>

            {error && (
                <p style={{ color: 'red', marginTop: '10px' }}>
                    {error}
                </p>
            )}

            {traceResults && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                    <h2>Trace Results:</h2>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {traceResults}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default IPInsight;
