# ADR-0110: Remove CrackMapExec Tool

## Status
PROPOSED

## Context
The CrackMapExec tool is no longer maintained. Its upstream repository has no active contributors and lacks documentation. The tool was originally integrated for post-exploitation and SMB enumeration functionality, but it is now outdated and fails to run correctly within the DDT environment.

## Decision
We will remove the CrackMapExec tool from the Deakin Detonator Toolkit. This includes:
- Removing the CrackMapExec component from `src/components/`
- Deleting its route from `RouteWrapper.tsx`
- Removing its entry from `tauri.conf.json`
- Ensuring the toolkit still builds and functions as expected after its removal

## Consequences
- Reduces maintenance burden by eliminating an unused and unsupported tool.
- Improves user experience by avoiding broken functionality in the GUI.
- Slightly reduces the overall feature set, but this is outweighed by improved reliability.

