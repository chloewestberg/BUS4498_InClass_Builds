# Ask student to clarify details — Task Specification

## Basic Information

```yaml
task_id: T4
task_name: Ask student to clarify details
task_type: Human clarification request
automation_level: L1
task_owner: BUS 4498 student
```

## Task Description

Explain the missing or ambiguous assignment detail to the BUS 4498 student and request the specific information needed to continue T2 — Extract assignment details. The task may draft and send a focused question, but the student supplies the authoritative clarification. It must not choose between conflicting dates or infer a status from silence.

## Inputs

### Input 1: Clarification request

- **Required contents and format:** The assignment item, the missing or conflicting field, the source evidence already reviewed, and one focused question for the student.
- **Source:** T2 — Extract assignment details.
- **Missing or invalid input:** Route the item to T5 — Mark item unclear for human review because a clarification request cannot be safely formed.

## Outputs

### Output 1: Student clarification response

- **Required contents and format:** The student's answer tied to the clarification request, or an explicit `no response` or `declined` status after the response deadline.
- **Recipient:** T2 — Extract assignment details when the student provides clarification; T5 — Mark item unclear for human review when no usable clarification arrives.
- **Completion condition:** The student has supplied a usable answer, declined to answer, or the response deadline has passed and the unresolved status is recorded.

## Planned Tools

### Tool 1

- **Tool name:** `send_clarification_request`
- **Input:** `clarification request`
- **Output:** `student clarification response`
- **Implementation Route:** A message, form, or notification function that sends the focused question and records the response status.
- **Integration approach:** Direct integration.
- **Role in this task:** Supports delivery of the question and capture of the student's authoritative response; it does not decide the answer.
- **Task timeout:** 1 business day for the student response, with 5 minutes for each send or response-recording operation.
- **Maximum retries:** 1 additional attempt.
- **Retry only when:** Retry a send only when no message acknowledgment was returned and the open clarification request has not already been delivered. Use the same request reference to prevent duplicate questions. Do not retry after a response has been recorded.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `clarification_status: unresolved`, preserve the question and any response evidence, and route the item to T5 — Mark item unclear for human review. Do not treat silence as clarification.
