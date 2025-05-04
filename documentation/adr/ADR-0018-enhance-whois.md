## Title

Enhancing the Whois Tool in PT-GUI

## Proposal Status

-   Proposed

## Implementation Status

-   Not Implemented

## Context

The current Whois tool in the Deakin Detonator Toolkit (PT-GUI) provides only basic raw output of Whois information, lacking clarity, structure, and additional key insights often required during reconnaissance phases. Users currently receive unstructured data with no clear visual formatting, no parsing of important fields like domain registrar or expiry date, and no export or reporting functionality. This limits its usefulness, especially in educational and professional penetration testing workflows.

The enhancement of the Whois tool aims to improve user experience, efficiency, and usefulness of the output, aligning PT-GUI’s tools with modern standards and user expectations.

## Decision

We propose the following enhancements to the Whois tool in PT-GUI:

-   **Registrar Information Display**: Extract and display the domain registrar name from Whois output.
-   **Creation & Expiry Date Parsing**: Present key dates (creation, update, expiry) in a clear, human-readable format.
-   **Structured Output Formatting**: Organize the Whois result into logical sections such as Registrar Info, Domain Status, Contact Info, and Important Dates.
-   **Dark/Light Theme Styling**: Apply theme-aware formatting for readability across different modes.
-   **Export Functionality**: Allow users to download the parsed output in JSON or CSV format.

These updates will be implemented in the existing Whois React component (`Whois.tsx`) and styled in accordance with the current PT-GUI interface guidelines.

## Consequences

-   **Positive:**

    -   Improved usability and interface experience for end-users.
    -   Modernized presentation of Whois data useful for analysis and reporting.
    -   Streamlined output supports learning and operational use-cases.
    -   Lays the groundwork for integrating Whois into more advanced unified tools (see ADR-0012).

-   **Negative:**
    -   Added complexity to the Whois component may require more testing.
    -   Requires parsing logic that must adapt to varying Whois response formats.
    -   Maintenance burden for keeping up with domain registrar format changes.

Overall, this enhancement aligns PT-GUI with modern expectations for reconnaissance tools, increasing value to both student and professional users.
