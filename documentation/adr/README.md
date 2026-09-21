## Architecture decision record (ADR) explained

### What?

An architecture decision record (ADR) is a document that captures an important architecture decision made along with its context and consequences.

### Why?

**Justification**: ADRs help align architectural decisions with project goals by explicitly stating the reasons for choosing one approach over another, based on needs.

**Traceability**: ADRs provide a clear record of why certain architectural decisions were made, making it easier to trace the evolution of the system's architecture over time.

**Transparency**: Documenting decisions ensures that all stakeholders are aware of the reasoning behind architectural choices, promoting transparency.

**Onboarding**: New team members can quickly understand the rationale behind the system's architecture, reducing the learning curve.

### When?

- Making major changes to the architecture
- Making major changes to the operation of the application

### How?

1. **Branch** Create a branch for the ADR and check out the branch.

2. **Copy the Template:** Locate the `adr_template.md` file in this directory. This template, inspired by [Michael Nygard](https://www.michaelnygard.com/), will serve as the foundation for your ADR. Make a copy of this file.

3. **Determine the Next ADR ID:** Located the `adr_register.md` file in this directory. Review the ADR register below in the to find the latest available ADR ID. You will use this ID for your new ADR.

4. **Name Your ADR:** Rename your copy of the template to `ADR-[ADR ID].md`. For example, if the next ID is `0000`, your file should be named `ADR-0000.md`.

5. **Complete Your ADR:** Fill out the template with the details of your change. Once complete, save your ADR in this directory.

6. **Update the Register:** Add your ADR to the adr register in the `adr_register.md` file in this directory with the status set to `PROPOSED`.

7. **Push your branch:** When you're happy with your ADR, push your up to date branch to Github then message a team leader for review.

8. **Post-Review Actions:**

- If your ADR is accepted, update the status in the table to `ACCEPTED`.
- If your ADR is rejected, update the status to `REJECTED`.

9. **Submit a Pull Request:** Follow the standard pull request (PR) process to submit your ADR document for review, the message a team leader.

10. **Merge your Pull Request:** Once your ADR document has been merged, proceed to implement the changes outlined in the ADR.
