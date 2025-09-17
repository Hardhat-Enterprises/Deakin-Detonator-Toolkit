import { useEffect, useMemo, useState } from "react";
import { TextInput, CloseButton } from "@mantine/core";

type Props = {
    placeholder?: string;
    defaultValue?: string;
    onChange: (value: string) => void; // called after debounce
    delayMs?: number; // debounce time
    autoFocus?: boolean;
    ariaLabel?: string;
};

export default function SearchInput({
    placeholder = "Search…",
    defaultValue = "",
    onChange,
    delayMs = 200,
    autoFocus = false,
    ariaLabel = "Search",
}: Props) {
    const [value, setValue] = useState(defaultValue);

    // Debounce the outbound onChange
    const debouncedNotify = useMemo(() => {
        let t: number | undefined;
        return (v: string) => {
            window.clearTimeout(t);
            // @ts-ignore TS dom lib timeout type
            t = window.setTimeout(() => onChange(v), delayMs);
        };
    }, [onChange, delayMs]);

    useEffect(() => debouncedNotify(value), [value, debouncedNotify]);

    return (
        <TextInput
            aria-label={ariaLabel}
            placeholder={placeholder}
            value={value}
            autoFocus={autoFocus}
            onChange={(e) => setValue(e.currentTarget.value)}
            rightSection={
                value ? <CloseButton aria-label="Clear search" onClick={() => setValue("")} title="Clear" /> : null
            }
        />
    );
}
