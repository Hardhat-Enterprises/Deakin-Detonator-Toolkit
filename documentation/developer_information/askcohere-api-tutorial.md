# AskCohere API Setup Guide

To use AskCohere for tool output analysis, an API key from Cohere is required.

## **Setup Instructions**

### **1. Create a Cohere Account**

-   Visit [Cohere's official website](https://cohere.ai/) to create an account.

### **2. Obtain Your API Key**

1. Log in to Cohere account.
2. Go to the **API Keys** section in dashboard.
3. Click on **Create API Key**.
4. Give the API key a descriptive name (e.g., "PT-GUI AskCohere").
5. Copy the generated API key.

### **3. Configure the Project**

1. In the root directory of the project, create or locate a '.env' file to store environment variables.
2. Insert the following line into the '.env' file:VITE_COHERE_API_KEY='API key'
3. Replace 'API key' with the actual key obtained from Cohere.
4. Save changes to the '.env' file.

### **4. Restart the Development Server**

Restart the development server to apply the new environment variable settings.

## **Integration Details**

-   The API key is securely stored in the '.env' file and can be accessed through 'import.meta.env.VITE_COHERE_API_KEY'.
-   Ensure the '.env' file is included in the '.gitignore' file to prevent accidental sharing of sensitive data in version control.

## **Common Issues and Fixes**

-   **Missing API Key Error**: If an error like 'COHERE_API_KEY is missing' occurs, verify that the '.env' file is correctly configured and saved.
-   **Incorrect Key**: Verify that the API key in the '.env' file matches the one provided by Cohere.
-   **Formatting Errors**: Check for typos or missing quotes in the '.env' file.

## **Additional Notes**

-   Keep the '.env' file private to ensure the API key remains secure.
-   Utilize the free tier responsibly to avoid exceeding its limits and ensure uninterrupted service.
