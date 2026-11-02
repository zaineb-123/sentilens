# Privacy & anonymity model

## No identity in the Feedback database
`feedback_db.feedbacks` has no column for `userId`, IP, or user-agent — not an access rule, the
field doesn't exist. Participation lives separately in `survey_db.participations`, with no link
back to feedback content.

## Receipts, not accounts
Submission returns a random receipt code; only its SHA-256 hash is stored
(`services/feedback-service/src/services/receiptService.js`). Nobody can work backward from a
receipt to the employee who holds it.

## k-anonymity threshold
Every department-filterable analytics endpoint checks the response count against the org's
`minGroupSize` (default 5, floor 3) before returning anything:
```json
{ "privacy": { "suppressed": true, "reason": "Not enough responses to protect anonymity.", "minGroupSize": 5, "count": 3 } }
```
The frontend's `PrivacyGate`/`PrivacyNotice` components render exactly this state instead of a
chart.

## Complementary suppression
If exactly one department in a comparison is below threshold while another is visible, the
next-smallest visible department is suppressed too — otherwise its value could be reverse-
engineered as `total − every other visible department`. See
`services/analytics-service/src/services/statsService.js::departmentComparison` and its tests.

## Date rounding
Timestamps are rounded to midnight UTC of the submission day before storage.

## PII masking
Emails/phones/URLs in free text are replaced with `[email]`/`[phone]`/`[link]`
(`services/feedback-service/src/services/piiMasking.js`) — best-effort, not a guarantee.

## No individual profiling
Analysis output is always attached to a `feedbackId`, never a person. There is no endpoint,
table, or screen anywhere that shows a score for an individual employee.

## HR Explorer: shuffling
Comments shown to HR are shuffled (Fisher-Yates) so submission order can't be correlated with
session timing.

## Frontend token handling
Access token lives in memory only (`frontend/src/lib/tokenStore.ts`) — never localStorage; the
refresh token is an httpOnly cookie the frontend never reads directly.

## What this system deliberately does NOT do
- No individual mental-health diagnosis, scoring, or flagging.
- Alerts describe a detected trend only, never a claimed cause.
- Shrinking a department below threshold does not retroactively hide its historical rollups —
  a known gap, not a feature.

## Honest limitations
- k-anonymity protects against casual re-identification, not a determined adversary with
  auxiliary data.
- Complementary suppression handles the single-hidden-group case, not a full differential-
  privacy guarantee against repeated overlapping filter queries.
- None of this has been tested against a real MongoDB instance — see the main README.
