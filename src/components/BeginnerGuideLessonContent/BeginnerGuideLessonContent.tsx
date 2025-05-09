import GoBusterTool from "../GobusterTool/Gobuster";
import NmapTool from "../NmapTool/NmapTool";
import SQLmap from "../SQLmap/SQLmap";
// This file contains a js object array containing all the beginners guide lesson data
// Currently BeginnerInformationContent should be manually modified to add, edit or delete lessons
// Lesson hierachy is based off the position of lesson object in the array

export interface BeginnerGuideLessonContentFormat {
    lessonName: string;
    lessonDifficulty: string;
    lessonDescription: string;
    lessonCompletionStatus?: boolean;
    lessonContent: {
        isContentPractical: boolean;
        pageContent: {
            name: string;
            content: string;
            contentAttackToolClass?: React.ReactNode;
            completionStatus: boolean;
        }[];
    }[];
}
[];

// The attack tools are added into objects for readability (easier to track when multiple tools are present in the same lesson)
const lesson1PracticalTools = {
    Nmap: <NmapTool />,
};

const lesson2PracticalTools = {
    Gobuster: <GoBusterTool />,
};

const lesson3PracticalTools = {
    SQLmap: <SQLmap />,
};

export const BeginnerInformationContent: BeginnerGuideLessonContentFormat[] = [
    {
        lessonName: "Lesson 1: Introduction to Penetration Testing",
        lessonDifficulty: "Easy",
        lessonDescription:
            "Learn the fundamentals of penetration testing, why it's important, and the basic methodology used by security professionals.",
        lessonContent: [
            {
                isContentPractical: false,
                pageContent: [
                    {
                        name: "Introduction: What is Pen testing?",
                        content: `Penetration testing, or "pen testing" for short, is a simulated cyber attack against your computer systems to check for exploitable vulnerabilities. Think of it as hiring professional "good guy" hackers to break into your systems before the "bad guys" do.

In a pen test, security experts use the same tools, techniques, and processes as malicious hackers, but in a controlled way and with permission. Their goal is to discover and safely demonstrate security weaknesses that could potentially:

- Allow unauthorized access to systems
- Expose sensitive data
- Compromise user accounts
- Disrupt business operations

Unlike random real-world attacks, pen testing follows a structured approach where testers document everything they find and provide detailed reports to help fix security issues. This process helps organizations strengthen their digital defenses based on actual proven vulnerabilities rather than theoretical risks.

Pen testing is both an art and a science—it combines technical expertise with creative problem-solving to find security holes that automated tools might miss. For organizations, it's an essential component of a robust security program and often a requirement for regulatory compliance.`,
                        completionStatus: false,
                    },

                    {
                        name: "Keywords and Methodologies",
                        content: `To understand penetration testing, you'll need to familiarize yourself with these key terms and methodologies:

Essential Terms:
- Vulnerability: A weakness that can be exploited by attackers
- Exploit: Code or technique that takes advantage of a vulnerability
- Payload: Code delivered to a target system during an attack
- Zero-day: A previously unknown vulnerability with no available patch
- Attack vector: Path or method used to gain access to a target
- Attack surface: All possible points where an attacker could enter a system

Common Methodologies:

1. OWASP Testing Guide
The Open Web Application Security Project provides a comprehensive framework specifically for testing web applications, covering authentication, authorization, and common web vulnerabilities.

2. PTES (Penetration Testing Execution Standard)
A complete methodology covering pre-engagement, intelligence gathering, threat modeling, vulnerability analysis, exploitation, post-exploitation, and reporting.

3. NIST SP 800-115
The National Institute of Standards and Technology's approach to security testing, with a focus on planning, execution, and post-test analysis.

4. OSSTMM (Open Source Security Testing Methodology Manual)
A comprehensive methodology for testing operational security from both technical and process perspectives.

These methodologies provide structured approaches to ensure pen tests are thorough, consistent, and effective at identifying security weaknesses.`,
                        completionStatus: false,
                    },
                    {
                        name: "Why Pen testing is important",
                        content: `Penetration testing is a vital security practice for several compelling reasons:

1. Find Vulnerabilities Before Attackers Do
By proactively discovering security weaknesses, organizations can patch them before malicious hackers exploit them. This proactive approach turns unknown risks into manageable issues.

2. Test Your Security Team's Response
Pen tests provide a realistic drill for security teams, helping them practice detecting and responding to attacks in a controlled environment rather than during an actual breach.

3. Meet Compliance Requirements
Many regulations and standards (PCI DSS, HIPAA, ISO 27001) require regular security testing. Pen testing helps satisfy these requirements while actually improving security rather than just "checking a box."

4. Reduce Security Incident Costs
The average cost of a data breach is measured in millions of dollars. Investing in penetration testing is significantly less expensive than dealing with a major security incident.

5. Validate Security Controls
Pen testing verifies that your security technologies and policies actually work as intended. It's the difference between thinking you're secure and knowing you're secure.

6. Gain Business Confidence
Regular testing demonstrates to customers, partners, and stakeholders that you take security seriously and are actively working to protect sensitive information.

In today's threat landscape, penetration testing isn't just a good practice—it's an essential component of a mature security program that can mean the difference between a minor security issue and a major breach.`,
                        completionStatus: false,
                    },
                    {
                        name: "Types of Pen testing",
                        content: `Penetration tests come in different forms, each designed to evaluate security from a specific perspective:

1. Black Box Testing
- Tester has no prior knowledge of the target systems
- Simulates a real external attacker with no inside information
- Tests external security perimeter and public-facing assets
- Most realistic but potentially less comprehensive

2. White Box Testing
- Tester has complete knowledge of systems (architecture, source code, etc.)
- Allows for in-depth, thorough testing
- Identifies more potential vulnerabilities
- Less realistic but more comprehensive

3. Gray Box Testing
- Tester has partial knowledge (like a user with limited privileges)
- Balances realism with efficiency
- Often simulates an insider threat scenario
- Most commonly used approach

Based on Targets:

• Network Penetration Testing
Focuses on network devices, servers, firewalls, and infrastructure to identify misconfigurations and vulnerabilities in network design.

• Web Application Testing
Examines websites and web apps for security issues like injection flaws, broken authentication, and insecure configurations.

• Mobile Application Testing
Tests the security of iOS and Android applications, including data storage, communication, and authentication mechanisms.

• Social Engineering Testing
Assesses human vulnerabilities through phishing campaigns, pretexting, and other psychological manipulation techniques.

• Physical Penetration Testing
Evaluates physical security controls like access cards, locks, sensors, and security personnel.

Organizations often use a combination of these testing types to create a comprehensive security assessment program.`,
                        completionStatus: false,
                    },
                ],
            },
            {
                isContentPractical: true,
                pageContent: [
                    {
                        name: "Network Scanning with Nmap",
                        content:
                            "In this section, we'll learn how to use Nmap to scan networks and identify potential vulnerabilities. Nmap (Network Mapper) is one of the most popular and powerful network scanning tools used by security professionals.\n\nNmap allows you to discover hosts and services on a computer network, thus creating a 'map' of the network. It sends specially crafted packets to the target hosts and then analyzes the responses to accomplish its goal.\n\nBelow you'll find an interactive Nmap tool where you can practice basic scanning techniques.",
                        completionStatus: false,
                        contentAttackToolClass: lesson1PracticalTools.Nmap,
                    },
                ],
            },
        ],
    },
    {
        lessonName: "Lesson 2: Information Gathering and Reconnaissance",
        lessonDifficulty: "Easy",
        lessonDescription:
            "Master the first and critical phase of penetration testing: gathering intelligence about your target to identify potential attack vectors.",
        lessonContent: [
            {
                isContentPractical: false,
                pageContent: [
                    {
                        name: "Understanding Reconnaissance",
                        content: `Reconnaissance, often called "recon," is the first and foundational phase of any penetration test. This phase involves collecting as much information as possible about the target without actively engaging with its systems. Think of reconnaissance as the digital equivalent of casing a building before attempting to break in.

Good reconnaissance is the difference between random, opportunistic attacks and strategic, targeted penetration testing. Without proper intelligence gathering, penetration testers would be working blindly, wasting time on irrelevant attack vectors or missing critical vulnerabilities altogether.

The information gathered during this phase helps penetration testers:

- Map out the target's attack surface
- Identify potential entry points
- Understand the organization's infrastructure
- Discover technology stacks and versions
- Find potential vulnerabilities
- Develop a tailored testing strategy

The reconnaissance phase operates on a simple principle: the more you know about your target, the more effectively you can test its security. Organizations should be concerned about how much information they're exposing publicly, as attackers use the same techniques to plan real attacks.`,
                        completionStatus: false,
                    },
                    {
                        name: "Passive vs. Active Reconnaissance",
                        content: `Reconnaissance techniques fall into two main categories: passive and active. Each has distinct characteristics and applications in penetration testing:

Passive Reconnaissance:
- Doesn't involve direct interaction with the target systems
- Leaves no traces or logs on target infrastructure
- Focuses on publicly available information
- Generally legal and doesn't require explicit permission
- Examples: WHOIS lookups, searching public records, reviewing social media

Active Reconnaissance:
- Involves direct interaction with target systems
- Leaves footprints that could be detected
- Provides more detailed technical information
- Requires proper authorization
- Examples: Port scanning, service enumeration, DNS queries

The Reconnaissance Process:

1. Start with passive techniques to gather non-intrusive intelligence
2. Analyze and organize the collected information
3. Identify potential security weaknesses based on passive data
4. Develop a plan for active reconnaissance
5. Execute active reconnaissance with proper authorization
6. Document all findings for later phases

Best practice involves starting with passive techniques to gather as much intelligence as possible before moving to active methods. This minimizes detection while maximizing information gathering.`,
                        completionStatus: false,
                    },
                    {
                        name: "Open Source Intelligence (OSINT)",
                        content: `Open Source Intelligence (OSINT) is the collection and analysis of information from publicly available sources. For penetration testers, OSINT is a goldmine of information that can reveal surprising details about an organization's security posture without ever touching their systems.

Key OSINT Sources:

1. Corporate Websites
- Job postings reveal technologies used internally
- Employee directories expose potential phishing targets
- Press releases can disclose new systems or infrastructure
- Technical documentation sometimes reveals internal addressing or architecture

2. DNS and Domain Records
- WHOIS data exposes registration details and administrative contacts
- DNS records reveal IP addresses, mail servers, and subdomains
- Historical DNS data can uncover forgotten or legacy systems

3. Social Media Platforms
- LinkedIn profiles show employee skills and technologies
- Twitter discussions may include technical details or complaints
- Technical forums where employees ask questions about specific systems
- Code repositories with corporate contributions

4. Search Engine Operators
- Using specialized search queries (Google dorks)
- Finding exposed documents, configurations, or backup files
- Locating administration panels or login pages

5. Public Code Repositories
- GitHub, GitLab, and Bitbucket may contain organizational code
- Code comments often include credentials or internal URLs
- Commit history can reveal security weaknesses

OSINT tools like TheHarvester, Shodan, and Maltego automate much of this process, but the human analysis of this data is what transforms raw information into actionable intelligence for penetration testing.`,
                        completionStatus: false,
                    },
                    {
                        name: "Technical Information Gathering Techniques",
                        content: `After gathering information through OSINT, penetration testers move to more technical reconnaissance methods to build a detailed profile of the target environment:

1. DNS Enumeration
- Discovering subdomains (subdomain brute forcing)
- Zone transfers to map DNS infrastructure
- DNS record analysis (MX, TXT, CNAME, etc.)
- Tools: DNSenum, DNSrecon, Sublist3r

2. Network Range Identification
- ASN (Autonomous System Number) lookups
- IP range determination
- BGP (Border Gateway Protocol) data analysis
- Tools: ASNLookup, BGPView, WhoisXML API

3. Service and Port Scanning
- Identifying open ports and running services
- Service version fingerprinting
- Operating system detection
- Tools: Nmap, Masscan, Unicornscan

4. Web Application Fingerprinting
- Identifying web servers and technologies
- Content Management System (CMS) detection
- Framework identification
- Tools: Wappalyzer, WhatWeb, BuiltWith

5. SSL/TLS Analysis
- Certificate information gathering
- Cipher suite evaluation
- Protocol version detection
- Tools: SSLScan, testssl.sh

6. Email Security Assessment
- SPF, DKIM, and DMARC record checking
- Mail server configuration analysis
- Anti-spam measure detection
- Tools: MXToolbox, DMARCAnalyzer

Proper documentation during this phase is crucial. Penetration testers should create detailed maps of the discovered infrastructure, noting all potential entry points, unusual configurations, and outdated systems that might present vulnerabilities in later testing phases.`,
                        completionStatus: false,
                    },
                ],
            },
            {
                isContentPractical: true,
                pageContent: [
                    {
                        name: "Directory Discovery with Gobuster",
                        content:
                            "An important part of reconnaissance is discovering hidden directories and files on web servers. In this section, we'll learn how to use Gobuster, a powerful tool for brute-forcing URIs (directories and files) in web sites.\n\nGobuster helps penetration testers identify non-linked content, hidden administrative interfaces, backup files, and other sensitive resources that might not be directly visible through normal browsing.\n\nBelow you'll find an interactive Gobuster tool where you can practice discovering hidden directories on a simulated web server.",
                        completionStatus: false,
                        contentAttackToolClass: lesson2PracticalTools.Gobuster,
                    },
                ],
            },
        ],
    },
    {
        lessonName: "Lesson 3: Web Application Vulnerabilities",
        lessonDifficulty: "Moderate",
        lessonDescription:
            "Learn how to identify and exploit common web application vulnerabilities using industry-standard tools and techniques.",
        lessonContent: [
            {
                isContentPractical: false,
                pageContent: [
                    {
                        name: "Understanding Web Application Security",
                        content: `Web applications have become the primary interface between organizations and their users, making them attractive targets for attackers. Web application security focuses on protecting websites and web services against threats that exploit flaws in application code, design, or implementation.

The unique characteristics of web applications create specific security challenges:

1. Public Accessibility
- Web applications are designed to be accessible from anywhere
- They often serve as front doors to sensitive internal systems
- Public exposure increases the attack surface significantly

2. Complex Technology Stack
- Multiple layers: client-side, server-side, database, APIs
- Various frameworks and libraries with their own vulnerabilities
- Integration points between components create security gaps

3. Rapid Development Cycles
- Frequent updates and changes to functionality
- Security often sacrificed for feature delivery speed
- Legacy code maintained alongside new features

4. User Input Processing
- Web applications process untrusted user inputs
- Input validation failures lead to numerous vulnerabilities
- Data flows between components may introduce security issues

5. Authentication and Session Management
- Managing user identities across stateless protocols
- Session handling introduces unique security challenges
- Credential protection across network boundaries

Understanding these fundamentals is essential before diving into specific vulnerability types and exploitation techniques.`,
                        completionStatus: false,
                    },
                    {
                        name: "Common Web Application Vulnerabilities",
                        content: `Web applications are susceptible to a wide range of vulnerabilities. The Open Web Application Security Project (OWASP) maintains a list of the most critical web application security risks. Here are some of the most common:

1. Injection Flaws
- SQL Injection: Inserting malicious SQL code that executes against a database
- Command Injection: Executing system commands through application inputs
- LDAP Injection: Manipulating LDAP queries to bypass authentication
- Impact: Data theft, authentication bypass, system compromise

2. Broken Authentication
- Session management flaws
- Weak credential storage and transmission
- Multi-factor authentication bypass
- Impact: Account takeover, privilege escalation, identity theft

3. Cross-Site Scripting (XSS)
- Reflected XSS: Malicious script from request is returned in response
- Stored XSS: Malicious script is stored and later displayed to users
- DOM-based XSS: Client-side JavaScript manipulation
- Impact: Session hijacking, credential theft, defacement

4. Cross-Site Request Forgery (CSRF)
- Tricking users into performing unwanted actions
- Leveraging authenticated sessions
- Exploiting predictable application behavior
- Impact: Unauthorized transactions, profile changes, data manipulation

5. Security Misconfigurations
- Default installations without security hardening
- Incomplete configurations leaving gaps
- Unnecessary features enabled
- Impact: Information disclosure, unauthorized access, system compromise

6. Sensitive Data Exposure
- Inadequate encryption at rest or in transit
- Poor key management
- Unnecessary data exposure
- Impact: Privacy violations, regulatory non-compliance, fraud

7. XML External Entity (XXE) Processing
- Processing untrusted XML input
- XML parsers configured to process external entities
- Impact: Server-side file disclosure, SSRF, denial of service

8. Broken Access Control
- Horizontal privilege escalation (accessing other users' data)
- Vertical privilege escalation (accessing higher privilege functions)
- Metadata manipulation to bypass restrictions
- Impact: Data theft, unauthorized functionality access, complete account takeover

Understanding these vulnerabilities helps penetration testers identify where to focus their testing efforts and what attack techniques to employ.`,
                        completionStatus: false,
                    },
                    {
                        name: "SQL Injection Fundamentals",
                        content: `SQL Injection is one of the most prevalent and dangerous web application vulnerabilities. It occurs when untrusted user input is incorrectly filtered or sanitized before being used in SQL statements, allowing attackers to manipulate database queries.

Basic SQL Injection Concepts:

1. How SQL Injection Works
- Web applications build SQL queries using user inputs
- When inputs aren't properly validated or parameterized
- Attackers can escape string contexts and modify query logic
- Example: Input of ' OR '1'='1 might bypass authentication

2. Types of SQL Injection
- In-band: Results returned directly in application response
- Blind: No direct results visible (inferring through true/false conditions)
- Out-of-band: Data exfiltration through alternative channels
- Second-order: Injection stored and triggered later

3. Common Attack Techniques
- Union-based: Combining results with attacker-specified data
- Error-based: Extracting data through error messages
- Boolean-based: Using true/false conditions to extract data
- Time-based: Using time delays to infer information

4. SQL Injection Impact
- Bypassing authentication
- Accessing unauthorized data
- Modifying database content
- Executing administrative operations
- Compromising backend servers

5. Prevention Strategies
- Prepared statements with parameterized queries
- Stored procedures with proper implementation
- Input validation and sanitization
- Least privilege database accounts
- Web Application Firewalls (WAF)

SQL injection vulnerabilities persist because they're relatively easy to introduce during development but can be devastating if exploited. In the practical section, we'll learn how to use SQLmap to detect and exploit these vulnerabilities.`,
                        completionStatus: false,
                    },
                    {
                        name: "Web Application Security Testing Methodology",
                        content: `A systematic approach to web application testing ensures thorough coverage and avoids missing critical vulnerabilities. The following methodology provides a structured framework:

1. Reconnaissance and Mapping
- Identifying all application entry points
- Cataloging input parameters and forms
- Understanding authentication mechanisms
- Mapping application architecture
- Tools: Burp Suite Spider, OWASP ZAP Crawler

2. Authentication Testing
- Password policy strength
- Brute force protection
- Multi-factor authentication implementation
- Password reset functionality
- Session management
- Tools: Hydra, Burp Suite Intruder

3. Authorization Testing
- Horizontal privilege escalation
- Vertical privilege escalation
- Role-based access control verification
- Tools: Burp Suite Repeater, manual testing

4. Input Validation Testing
- Testing all input vectors for injection flaws
- Client-side vs. server-side validation
- Content-type validation
- File upload handling
- Tools: SQLmap, XSS scanners, OWASP ZAP Active Scan

5. Session Management Testing
- Cookie attributes and security
- Session timeout functionality
- Session fixation vulnerability
- Cross-Site Request Forgery protection
- Tools: Cookie editors, proxy tools

6. Business Logic Testing
- Process flow testing
- Feature misuse testing
- Rate limiting and anti-automation
- Tools: Primarily manual testing with proxy support

7. Client-Side Testing
- Frontend JavaScript security
- DOM-based vulnerabilities
- Client-side storage security
- Tools: Browser developer tools, JavaScript analyzers

8. API Security Testing
- Authentication mechanisms
- Rate limiting
- Input validation
- Information exposure
- Tools: Postman, custom scripts, API scanners

A thorough web application penetration test incorporates all these aspects, documenting findings with clear proof of concepts and remediation advice.`,
                        completionStatus: false,
                    },
                ],
            },
            {
                isContentPractical: true,
                pageContent: [
                    {
                        name: "SQL Injection Testing with SQLmap",
                        content:
                            "SQLmap is one of the most powerful open-source tools for detecting and exploiting SQL injection vulnerabilities. In this practical exercise, you'll learn how to use SQLmap to test web applications for SQL injection vulnerabilities.\n\nSQLmap can automatically detect and exploit various types of SQL injection vulnerabilities across different database management systems including MySQL, Oracle, PostgreSQL, Microsoft SQL Server, and others.\n\nBelow you'll find an interactive SQLmap tool where you can practice detecting and exploiting SQL injection vulnerabilities in a simulated environment.",
                        completionStatus: false,
                        contentAttackToolClass: lesson3PracticalTools.SQLmap,
                    },
                ],
            },
        ],
    },
];
