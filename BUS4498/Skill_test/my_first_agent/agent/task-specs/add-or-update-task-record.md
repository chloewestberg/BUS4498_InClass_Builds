# Add or update task record — Task Specification

## Basic Information

```yaml
task_id: T3
task_name: Add or update task record
task_type: Bounded record update
automation_level: L2
task_owner: BUS 4498 student
```

## Task Description

Use a clear extraction finding and the current task list to add a new assignment record or update the matching existing record. The task may write only the title, due date, and status supported by T2 — Extract assignment details. If the finding does not identify a safe add-or-update action, the task records the unresolved condition and routes it for human review instead of guessing.

## Inputs

### Input 1: Extraction finding

- **Required contents and format:** A finding from T2 containing a candidate assignment title, supported due date, supported status wording, source evidence, and any uncertainty or conflict note.
- **Source:** T2 — Extract assignment details.
- **Missing or invalid input:** Route the item to T4 — Ask student to clarify details or T5 — Mark item unclear for human review, depending on whether clarification is still useful.

### Input 2: Current task list context

- **Required contents and format:** The current HackTrack task records relevant to the candidate item, including any existing record identity and its current title, due date, and status.
- **Source:** HackTrack's current task list.
- **Missing or invalid input:** Do not write a new record. Record `task_list_context: unavailable` and hand the case to the BUS 4498 student for review.

## Outputs

### Output 1: Task record result

- **Required contents and format:** The resulting record identity when available, the supported title, due date, and status, the action taken (`added` or `updated`), and the evidence reference used for the change. If no safe change was possible, identify the unresolved condition instead.
- **Recipient:** The loop decision that checks whether all provided items are processed; after the final item, T6 — Generate updated task list.
- **Completion condition:** A read-back confirms that the written record matches the supported extraction finding, or the item is explicitly marked unresolved and routed for human review. An uncertain write is not a successful completion.

## Planned Tools

### Tool 1

- **Tool name:** `upsert_task_record`
- **Input:** `extraction finding` and `current task list context`
- **Output:** `task record result`
- **Implementation Route:** Database queries or file operations that compare the supplied finding with the current task list and perform one bounded add-or-update action.
- **Integration approach:** Direct integration.
- **Role in this task:** Supports the clear-record add-or-update operation after T2 has produced supported details.
- **Task timeout:** 5 minutes per task run, including read-back verification.
- **Maximum retries:** 1 additional attempt.
- **Retry only when:** Retry only after a pre-write timeout or a verified failed write. If the write outcome is uncertain, first read the current record and compare it with the intended finding; do not issue a second write unless the intended change is absent. Use the existing record identity or run reference to avoid duplicates.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `record_update_status: unresolved`, preserve the intended change and any read-back evidence, and route the item to T5 — Mark item unclear for human review or the BUS 4498 student. Do not continue as if the record was updated.
