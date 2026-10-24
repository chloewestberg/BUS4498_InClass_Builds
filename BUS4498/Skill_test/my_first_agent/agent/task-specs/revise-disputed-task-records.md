# Revise disputed task records — Task Specification

## Basic Information

```yaml
task_id: T8
task_name: Revise disputed task records
task_type: Bounded corrective update
automation_level: L2
task_owner: BUS 4498 student
```

## Task Description

Apply the specific correction identified by the student during review and produce a revised task-list draft for another review. The task may change only the disputed record fields supported by the student's response and the existing evidence. It must not reinterpret unrelated records, infer an unstated correction, or treat a failed or uncertain revision as complete.

## Inputs

### Input 1: Student error report

- **Required contents and format:** The review reference, disputed record, field the student says is wrong, and the student's requested correction or clarification.
- **Source:** T7 — Show update summary.
- **Missing or invalid input:** Do not change any record. Hand the case to the BUS 4498 student to provide a complete correction and restart the review.

### Input 2: Current updated task list draft

- **Required contents and format:** The exact draft and record version shown to the student, including evidence and unresolved notes.
- **Source:** T7 — Show update summary.
- **Missing or invalid input:** Do not revise a record. Hand the case to the BUS 4498 student for a fresh review.

## Outputs

### Output 1: Updated task list draft

- **Required contents and format:** The prior draft with only the disputed correction applied, a revision reference, the student's correction evidence, and any remaining unresolved notes. This is the revised version of the updated task list draft.
- **Recipient:** T7 — Show update summary for another review.
- **Completion condition:** The revised draft can be compared with the prior version and shows that only the authorized disputed change was applied, or the item is explicitly unresolved and handed to the student.

## Planned Tools

### Tool 1

- **Tool name:** `revise_disputed_task_records`
- **Input:** `student error report` and `current updated task list draft`
- **Output:** `updated task list draft`
- **Implementation Route:** Database queries or file operations that apply a bounded correction and produce a new draft version.
- **Integration approach:** Direct integration.
- **Role in this task:** Supports correction of the disputed fields identified by T7 while preserving the student's review evidence.
- **Task timeout:** 5 minutes per task run, including version verification.
- **Maximum retries:** 1 additional attempt.
- **Retry only when:** Retry only after a verified pre-write failure. If the correction outcome is uncertain, read the current revision reference and compare the disputed fields before retrying; do not apply the same correction twice.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `revision_status: unresolved`, preserve the error and prior draft, and hand the case to the BUS 4498 student. Do not return to T7 claiming the correction was applied.
