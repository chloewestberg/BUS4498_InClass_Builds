# Save approved task list — Task Specification

## Basic Information

```yaml
task_id: T9
task_name: Save approved task list
task_type: Approved record persistence
automation_level: L1
task_owner: BUS 4498 student
```

## Task Description

Persist the exact task-list draft after T7 — Show update summary has recorded that the student identified no further error. The task may save the approved records and verify the result, but it may not approve the list, add unsupported information, or save when the review response is missing or indicates an error.

## Inputs

### Input 1: Approved task list

- **Required contents and format:** The final task-list draft, its revision reference, the complete update summary, and an explicit student review response of `no error identified`.
- **Source:** T7 — Show update summary.
- **Missing or invalid input:** Do not save. Route the case back to T7 for review or to the BUS 4498 student when the approval evidence is unavailable.

## Outputs

### Output 1: Saved task list confirmation

- **Required contents and format:** The saved revision reference, the records persisted, a read-back confirmation that the saved content matches the approved draft, and the completion timestamp.
- **Recipient:** End of the workflow run.
- **Completion condition:** The saved task list has been read back and matches the approved input. A request sent without confirmation is not a successful save.

## Planned Tools

### Tool 1

- **Tool name:** `save_approved_task_list`
- **Input:** `approved task list`
- **Output:** `saved task list confirmation`
- **Implementation Route:** Database queries or file operations that persist the approved revision and read it back for verification.
- **Integration approach:** Direct integration.
- **Role in this task:** Supports final persistence only after explicit student review approval; it cannot supply the approval.
- **Task timeout:** 5 minutes per task run, including read-back verification.
- **Maximum retries:** 1 additional attempt.
- **Retry only when:** Retry only after a verified pre-write failure. If the save outcome is uncertain, read by the revision reference and compare the saved content before retrying; do not create a second approved revision or duplicate records.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `save_status: unresolved`, preserve the approved draft and any write/read-back evidence, and hand the case to the BUS 4498 student. Do not report the workflow as complete.
