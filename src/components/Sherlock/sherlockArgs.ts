export interface SherlockFormValues {
    username: string;
    site: string;
    timeout: number;
}

interface SherlockOptions {
    verbose: boolean;
    outputDirectory: string;
}

/**
 * Build arguments that work with the Sherlock version packaged by Kali.
 *
 * Sherlock 0.14.x always writes a text file. Keeping that output in the app
 * cache prevents the Tauri development watcher from restarting DDT when a
 * previously searched username is used again.
 */
export function buildSherlockArgs(values: SherlockFormValues, options: SherlockOptions): string[] {
    const args = ["--local", "--folderoutput", options.outputDirectory];

    if (options.verbose) {
        args.push("--verbose");
    }
    if (values.site) {
        args.push("--site", values.site);
    }
    if (values.timeout) {
        args.push("--timeout", `${values.timeout}`);
    }

    args.push(...values.username.trim().split(/\s+/));
    return args;
}
