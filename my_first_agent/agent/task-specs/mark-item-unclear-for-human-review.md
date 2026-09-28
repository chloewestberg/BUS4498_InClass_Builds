# Mark item unclear for human review — Task Specification

## Basic Information

```yaml
task_id: T5
task_name: Mark item unclear for human review
task_type: Exception and human-review flag
automation_level: L1
task_owner: BUS 4498 student
```

## Task Description

Create an explicit unresolved-item flag when an assignment cannot be identified or a required detail remains missing, conflicting, or unconfirmed after clarification. The task records the evidence and the reason for review; it does not resolve the issue or silently omit the item. The resulting flag allows T6 — Generate updated task list to include the unresolved item in the summary.

## Inputs

### Input 1: Unresolved item

- **Required contents and format:** The assignment reference, evidence already reviewed, missing or conflicting field, retry or clarification history, and the reason human judgment is required.
- **Source:** T2 — Extract assignment details, T4 — Ask student to clarify details, or a failed T3 — Add or update task record attempt.
- **Missing or invalid input:** Record `review_case_status: incomplete` and hand the case to the BUS 4498 student rather than creating an unsupported flag.

## Outputs

### Output 1: Unclear item record

- **Required contents and format:** A stable review reference, the supplied evidence, unresolved field or issue, reason for handoff, and status `unclear — human review required`.
- **Recipient:** The loop decision that checks whether all provided items are processed; after the final item, T6 — Generate updated task list. The BUS 4498 student is the human reviewer.
- **Completion condition:** The unresolved item is recorded once and can be displayed in the updated task list without being presented as a confirmed assignment detail.

## Planned Tools

### Tool 1

- **Tool name:** `flag_unclear_item`
- **Input:** `unresolved item`
- **Output:** `unclear item record`
- **Implementation Route:** Database queries or file operations that create or update one human-review flag.
- **Integration approach:** Direct integration.
- **Role in this task:** Supports transparent exception recording and preserves the evidence needed by the student reviewer.
- **Task timeout:** 5 minutes per task run, including read-back verification.
- **Maximum retries:** 1 additional attempt.
- **Retry only when:** Retry only after a verified pre-write failure. If the write outcome is uncertain, read by the same review reference before retrying; do not create a second flag for the same item.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `review_case_status: unresolved`, preserve the handoff evidence outside the task list if possible, and notify the BUS 4498 student. Do not pass the item forward as successfully flagged.
