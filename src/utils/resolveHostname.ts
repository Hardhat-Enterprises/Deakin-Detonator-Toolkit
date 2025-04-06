export const resolveHostname = async (hostname: string): Promise<string> => {
  // @ts-ignore
  const resolved = await window.__TAURI__.invoke("resolve_hostname", { hostname });
  return resolved;
};
