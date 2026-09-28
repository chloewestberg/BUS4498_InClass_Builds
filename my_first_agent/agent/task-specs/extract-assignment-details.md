# Extract assignment details — Task Specification

## Basic Information

```text
task_id: T2
task_name: Extract assignment details
task_owner: BUS 4498 student
```

## 1. Task Goal

Produce an evidence-backed candidate record for each assignment item in the course information received by HackTrack, including the assignment title, due date, and status, while clearly identifying missing or conflicting details for the next workflow decision.

## 2. Inbound Inputs

### Input: Course information item

- **Contents:** An assignment announcement, syllabus excerpt, or task-list item provided by the BUS 4498 student. It may contain an assignment title, due-date wording, status wording, repeated references, or conflicting details.
- **Source:** T1 — Receive course information.

## 3. Tools, Permissions, and Boundaries

## 4. How the Agent Should Reason

### Permitted Subtask: Locate assignment references

- **Description:** Examine the provided course information for candidate assignment references and produce the relevant text or section for each candidate.
- **Boundary:** Use only the supplied course information. Do not search outside the provided material, create an assignment that is not referenced, or change any task record. Begin only after T1 has supplied the course information.
- **Retry limit:** Attempt at most 2 times for the same item. If no reliable assignment reference can be located, hand the item to the BUS 4498 student.

### Permitted Subtask: Interpret due-date evidence

- **Description:** Examine date and time wording tied to the candidate assignment and produce the stated due date, along with the source wording and any ambiguity.
- **Boundary:** Report only dates supported by the supplied material. Do not guess a missing date, convert an unclear date into a definite one, or resolve a conflict without evidence or student clarification.
- **Retry limit:** Attempt at most 2 interpretations of the same evidence. If the due date remains missing or conflicting, route the item for clarification or human review.

### Permitted Subtask: Identify status evidence

- **Description:** Examine the supplied material for explicit wording that states the assignment status and produce that wording as the status finding.
- **Boundary:** Use explicit status evidence only. Do not infer completion, progress, or non-completion from silence or unrelated wording, and do not invent status categories.
- **Retry limit:** Attempt at most 2 reviews of the same item. If no supported status is available, report the status as unresolved and route the item according to the workflow.

### Permitted Subtask: Reconcile conflicting details

- **Description:** Compare multiple references to the same assignment and produce the conflict, the supporting evidence for each version, and whether the conflict can be resolved from the supplied material.
- **Boundary:** Do not select a winning version merely because it appears more plausible. Do not consult outside sources or update the task record. Required student clarification or human review takes precedence when the material does not resolve the conflict.
- **Retry limit:** Attempt at most 2 comparisons for the same conflict. After that limit, hand the item to the BUS 4498 student for clarification or human review.

Use intermediate findings to choose which permitted subtask is useful next. The permitted subtasks are available choices, not a required sequence. Revisit a subtask only when new evidence changes the finding, and stop when the task can produce a supported candidate record or a clear unresolved-item handoff.

## 5. When to Stop or Hand Off to a Human

Stop successfully when the title, due date, and status for the assignment item are supported by the supplied course information and the findings are ready for T3 — Add or update task record. Include the supporting evidence and any uncertainty in the outbound deliverable.

Hand off early when the item cannot be identified, a required detail is missing, the source contains an unresolved conflict, the retry limit is reached, or the student must decide which interpretation is authoritative. The BUS 4498 student receives the clarification request or unresolved-item handoff. The agent must not invent details, change the task list, submit coursework, or change Canvas records.

## 6. Outbound Deliverable

Return an extraction finding for each provided assignment item containing:

- the candidate assignment title;
- the supported due date, or an explicit unresolved-date note;
- the supported status wording, or an explicit unresolved-status note;
- the source evidence used for each finding;
- any conflict, uncertainty, or missing-detail note; and
- the recommended next workflow destination: T3 — Add or update task record, T4 — Ask student to clarify details, or T5 — Mark item unclear for human review.
Add inference configuration and tool boundaries
