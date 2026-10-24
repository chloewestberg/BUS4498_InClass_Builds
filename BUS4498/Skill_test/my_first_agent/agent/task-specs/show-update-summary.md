# Show update summary — Task Specification

## Basic Information

```yaml
task_id: T7
task_name: Show update summary
task_type: Human review presentation
automation_level: L1
task_owner: BUS 4498 student
```

## Task Description

Present the updated task list draft and its summary to the BUS 4498 student in a readable form, including confirmed changes and unresolved items. The task must make review possible without implying approval. It waits for an explicit student response indicating either that an error was identified or that no further error was identified.

## Inputs

### Input 1: Updated task list draft

- **Required contents and format:** A complete draft from T6 containing every processed item and clear labels for confirmed and unresolved information.
- **Source:** T6 — Generate updated task list.
- **Missing or invalid input:** Do not present a partial list. Record `review_input_status: incomplete` and hand the case to the BUS 4498 student.

### Input 2: Update summary

- **Required contents and format:** The matching summary of additions, updates, unclear items, evidence, and review notes from T6.
- **Source:** T6 — Generate updated task list.
- **Missing or invalid input:** Return the draft to T6 for correction or hand the case to the BUS 4498 student; do not request approval of an unexplained summary.

## Outputs

### Output 1: Student review response

- **Required contents and format:** An explicit response tied to the displayed draft: `error identified` with the disputed record and correction information, or `no error identified`.
- **Recipient:** T8 — Revise disputed task records when an error is identified; T9 — Save approved task list when no error is identified.
- **Completion condition:** The summary was displayed successfully and the student response is recorded explicitly. No response is not approval.

### Output 2: Approved task list

- **Required contents and format:** The unchanged or revised draft, its revision reference, the matching update summary, and the explicit student response `no error identified`.
- **Recipient:** T9 — Save approved task list.
- **Completion condition:** The draft and summary match the version the student reviewed, and the no-error response is recorded.

## Planned Tools

### Tool 1

- **Tool name:** `present_update_summary`
- **Input:** `updated task list draft` and `update summary`
- **Output:** `student review response` and, when no error is identified, `approved task list`
- **Implementation Route:** File operations, a display function, or a form that presents the draft and records the student's explicit review response.
- **Integration approach:** Direct integration.
- **Role in this task:** Supports readable presentation and captures the human review decision without making the approval decision itself.
- **Task timeout:** 1 business day for the student's review, with 5 minutes for each display or response-recording operation.
- **Maximum retries:** 1 additional attempt.
- **Retry only when:** Retry a display or response-recording operation only when no acknowledgment was returned and the same review reference has not already been recorded. Do not duplicate a review request or convert silence into approval.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `review_status: unresolved`, preserve the draft and summary, and hand the case to the BUS 4498 student. Do not continue to T9 without an explicit no-error response.
