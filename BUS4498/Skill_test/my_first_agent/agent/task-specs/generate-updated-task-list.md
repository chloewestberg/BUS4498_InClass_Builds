# Generate updated task list — Task Specification

## Basic Information

```yaml
task_id: T6
task_name: Generate updated task list
task_type: Bounded list assembly
automation_level: L2
task_owner: BUS 4498 student
```

## Task Description

Assemble the processed task-record results into one updated task-list draft and an update summary. Include confirmed additions or updates and clearly labeled unclear items. The task may format and organize the supplied results, but it may not invent assignment details, resolve an unresolved item, or claim that the student approved the draft.

## Inputs

### Input 1: Processed task record results

- **Required contents and format:** One result for each provided course item from T3 — Add or update task record or T5 — Mark item unclear for human review. Each result must identify the record or unresolved-item reference, title when known, due date and status when supported, evidence, and processing status.
- **Source:** T3 and T5 through the workflow's processed-item loop.
- **Missing or invalid input:** Record `list_input_status: incomplete` and hand the case to the BUS 4498 student. Do not generate a partial list as complete.

## Outputs

### Output 1: Updated task list draft

- **Required contents and format:** A structured draft containing every processed item, confirmed title/due date/status fields where supported, unresolved flags where required, and a reference back to the evidence or review case.
- **Recipient:** T7 — Show update summary.
- **Completion condition:** Every provided item has exactly one processed result and the draft distinguishes confirmed information from unresolved information.

### Output 2: Update summary

- **Required contents and format:** A concise summary of records added, records updated, items marked unclear, and evidence or review notes that the student must see.
- **Recipient:** T7 — Show update summary.
- **Completion condition:** The summary reconciles with the updated task list draft and is ready for student review.

## Planned Tools

### Tool 1

- **Tool name:** `assemble_updated_task_list`
- **Input:** `processed task record results`
- **Output:** `updated task list draft` and `update summary`
- **Implementation Route:** Functions/scripts or file operations that validate completeness and assemble the supplied results into a draft.
- **Integration approach:** Direct integration.
- **Role in this task:** Supports bounded formatting and completeness checking before the student sees the update summary.
- **Task timeout:** 5 minutes per task run.
- **Maximum retries:** 1 additional attempt.
- **Retry only when:** Retry only after a transient assembly error before a draft is returned. Because this tool creates a draft rather than changing the task list, a retry must use the same run reference and complete input set; do not retry with silently changed results.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `list_generation_status: unresolved`, preserve the processed results, and hand the case to the BUS 4498 student. Do not send an incomplete draft to T7 as if it were complete.
