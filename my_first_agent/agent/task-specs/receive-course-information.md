# Receive course information — Task Specification

## Basic Information

```yaml
task_id: T1
task_name: Receive course information
task_type: Assisted intake
automation_level: L1
task_owner: BUS 4498 student
```

## Task Description

Accept the course information supplied by the BUS 4498 student and preserve it as the input for one HackTrack run. The task may capture and label the material, but it may not decide what an assignment means or fill in information that the student did not provide. A readable, identifiable submission is required before the workflow passes the item to T2 — Extract assignment details.

## Inputs

### Input 1: Student course information

- **Required contents and format:** One assignment announcement, syllabus excerpt, or task-list item in readable text or a readable document. The submission should identify the course context or assignment material being supplied.
- **Source:** BUS 4498 student at the workflow trigger.
- **Missing or invalid input:** Ask the BUS 4498 student to resubmit readable course information and restart T1. Do not create a course item from assumptions.

## Outputs

### Output 1: Course information item

- **Required contents and format:** The supplied material preserved without invented content, with a run reference and source label indicating that it came from the BUS 4498 student.
- **Recipient:** T2 — Extract assignment details.
- **Completion condition:** The material is readable, the source is recorded, and T2 can inspect the item without needing the student to resubmit it.

## Planned Tools

### Tool 1

- **Tool name:** `capture_course_information`
- **Input:** `student course information`
- **Output:** `course information item`
- **Implementation Route:** File operations or a form/input function that preserves the supplied text and source label.
- **Integration approach:** Direct integration.
- **Role in this task:** Supports receipt and basic readability validation; it does not interpret assignment details or make workflow decisions.
- **Task timeout:** 5 minutes per task run, excluding the student response deadline for a resubmission.
- **Maximum retries:** 1 additional attempt.
- **Retry only when:** Retry once when the input was not captured or is unreadable because of a transient capture error. Do not duplicate a captured submission; check the run reference before retrying.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `intake_status: unresolved`, preserve any available source evidence, and hand the case to the BUS 4498 student for resubmission. Do not continue to T2 as if the input were complete.
