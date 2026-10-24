# Automation Level Assignment Worksheet

System: HackTrack  
Workflow source: `my_first_agent/agent/workflow-of-tasks.md`  
Selected Level 3 task: **T2 — Extract assignment details**

| Task ID | Exact task name | Level | Reason |
|---|---|---|---|
| T1 | Receive course information | L1 | The task accepts information supplied by the student and passes it into the workflow without independently deciding what course information to obtain. |
| T2 | Extract assignment details | L3 | The task must adapt to announcements, syllabus excerpts, and task lists; intermediate findings about evidence or conflicts determine which permitted analysis subtask is useful next, with unresolved cases handed to the student. |
| T3 | Add or update task record | L2 | The task performs a bounded add-or-update action using details that have already been extracted and judged clear. |
| T4 | Ask student to clarify details | L1 | The task produces a targeted clarification request when required fields are missing or ambiguous, but the student supplies the authoritative answer. |
| T5 | Mark item unclear for human review | L1 | The task flags an unresolved item for a human instead of deciding or recording unsupported assignment details. |
| T6 | Generate updated task list | L2 | The task creates a bounded summary from the processed task records and does not independently change the workflow scope. |
| T7 | Show update summary | L1 | The task presents the proposed update for student review; the student remains responsible for identifying errors. |
| T8 | Revise disputed task records | L2 | The task applies bounded corrections identified during student review and returns the revised records for another summary review. |
| T9 | Save approved task list | L1 | The task can save only after the student has approved the summary, so the human approval is the controlling condition. |

## Level 3 justification

T2 qualifies because the source can contain several assignment references, repeated or conflicting details, and different kinds of evidence. The agent may use intermediate findings to choose whether to locate another reference, interpret a due-date statement, identify explicit status wording, or reconcile a conflict. It cannot invent missing information, alter the task list, or continue past the retry limit without handing the item to the BUS 4498 student for review.
