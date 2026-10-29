// Northstar Services Group: the fictional classroom case of BTA1876 Lesson 7.
// Copied from the class workbook "Northstar Requirements Register" and the
// Lesson 7 slides. Nothing here is a real organization or a student decision.

export const facts = {
  employees: 850,
  correctionRate: 28,
  target: 15,
  window: "within 3 months after Release 1",
};

export type FeatureId = "F-01" | "F-02" | "F-03" | "F-04" | "F-05" | "F-06" | "F-07" | "F-08";
export const features: { id: FeatureId; name: string; reqs: number }[] = [
  { id: "F-01", name: "Employee Hub Access and Usability", reqs: 5 },
  { id: "F-02", name: "Time-Off Request Creation and Validation", reqs: 3 },
  { id: "F-03", name: "Employee Request Tracking and Changes", reqs: 3 },
  { id: "F-04", name: "Supervisor Review, Decisions, and Records", reqs: 4 },
  { id: "F-05", name: "HR Exception Handling and Supervisor Availability", reqs: 2 },
  { id: "F-06", name: "HR Information and Leave Balances", reqs: 2 },
  { id: "F-07", name: "Automated Approval Reminders", reqs: 1 },
  { id: "F-08", name: "Payroll Integration and Related Security", reqs: 2 },
];

/** Slide 11, "Applying MoSCoW to Northstar": the class's worked example. */
export const workedMoscow: Partial<Record<FeatureId, { category: string; why: string }>> = {
  "F-02": { category: "Must", why: "Directly supports reducing errors" },
  "F-03": { category: "Must or Should", why: "Check underlying mandatory rules" },
  "F-06": { category: "Won't", why: "Unapproved for Release 1" },
  "F-08": { category: "Won't", why: "Explicitly excluded from Release 1" },
};

/** Slides 13–14: weights and the F-02 worked calculation. */
export const weights = { business: 0.4, user: 0.25, urgency: 0.2, feasibility: 0.15 } as const;
export const workedRatings = { business: 5, user: 5, urgency: 5, feasibility: 4 };

export type Status = "Approved" | "Pending" | "Excluded" | "Partial";
export type Req = { id: string; feature: FeatureId; type: string; text: string; status: Status; statusText: string; decisions: string[]; questions: string[] };

export const requirements: Req[] = [
  { id: "REQ-001", feature: "F-01", type: "User", text: "Employees shall be able to locate the Release 1 employee-services functions through a consistent Hub entry point.", status: "Approved", statusText: "Approved for Release 1", decisions: ["A-01", "A-02"], questions: [] },
  { id: "REQ-002", feature: "F-01", type: "User", text: "Employees shall be able to access the responsive Employee Services Hub through supported mobile and desktop browsers.", status: "Approved", statusText: "Approved for Release 1", decisions: ["A-01"], questions: [] },
  { id: "REQ-003", feature: "F-01", type: "Functional candidate", text: "The Hub shall provide a consistent starting point for the approved Release 1 time-off service.", status: "Approved", statusText: "Approved for Release 1", decisions: ["A-01", "A-02"], questions: [] },
  { id: "REQ-020", feature: "F-01", type: "Quality candidate", text: "The Hub shall support understandable employee use; specific measurable usability criteria require further analysis and approval.", status: "Partial", statusText: "Partially specified / target pending", decisions: ["A-04"], questions: ["Q-13"] },
  { id: "REQ-022", feature: "F-01", type: "Functional candidate", text: "Proposed: Single sign-on may be enabled for technically supported services; detailed coverage and approval remain pending.", status: "Pending", statusText: "Pending", decisions: ["A-04"], questions: ["Q-13"] },
  { id: "REQ-005", feature: "F-02", type: "User", text: "Employees shall be able to create time-off requests with leave type, start date, and end date; identity is supplied by authentication.", status: "Approved", statusText: "Approved for Release 1", decisions: ["A-02", "A-03"], questions: [] },
  { id: "REQ-006", feature: "F-02", type: "Functional candidate", text: "The Hub shall check that mandatory fields are present and that entered request dates form a valid range before submission.", status: "Approved", statusText: "Approved for Release 1", decisions: ["A-03", "A-05"], questions: [] },
  { id: "REQ-007", feature: "F-02", type: "Functional candidate", text: "The Hub shall prevent incomplete or invalid requests from being submitted, keep them in Draft, and display useful correction messages.", status: "Approved", statusText: "Approved for Release 1", decisions: ["A-05"], questions: [] },
  { id: "REQ-008", feature: "F-03", type: "User", text: "Employees shall be able to view the current status of their own time-off requests.", status: "Approved", statusText: "Approved for Release 1", decisions: ["A-06", "A-08"], questions: [] },
  { id: "REQ-009", feature: "F-03", type: "Functional candidate", text: "The Hub shall display the approved request states: Draft, Pending Approval, Returned for Correction, Approved, Denied, and Cancelled.", status: "Approved", statusText: "Approved for Release 1", decisions: ["A-06", "A-08"], questions: [] },
  { id: "REQ-016", feature: "F-03", type: "Functional candidate", text: "Employees shall be able to edit Draft and Returned for Correction requests and resubmit corrected requests; Pending Approval may be cancelled.", status: "Approved", statusText: "Approved for Release 1", decisions: ["A-08"], questions: [] },
  { id: "REQ-010", feature: "F-04", type: "User", text: "Authorized supervisors shall be able to review waiting requests assigned to them and record decisions.", status: "Approved", statusText: "Approved for Release 1", decisions: ["A-07", "A-10"], questions: [] },
  { id: "REQ-011", feature: "F-04", type: "Functional candidate", text: "The Hub shall present request information necessary for authorized supervisors to review assigned time-off requests.", status: "Approved", statusText: "Approved for Release 1", decisions: ["A-07", "A-10"], questions: [] },
  { id: "REQ-012", feature: "F-04", type: "Functional candidate", text: "The Hub shall record authorized supervisor decisions as Approved, Denied, or Returned for Correction.", status: "Approved", statusText: "Approved for Release 1", decisions: ["A-06", "A-07"], questions: [] },
  { id: "REQ-021", feature: "F-04", type: "Data rule candidate", text: "Time-off and decision records require an authorized retention and access policy; the retention period and archival/deletion details remain pending.", status: "Pending", statusText: "Pending", decisions: ["A-15"], questions: ["Q-12"] },
  { id: "REQ-013", feature: "F-05", type: "User", text: "HR representatives shall be able to handle designated exceptional or misrouted requests within authorized responsibility.", status: "Approved", statusText: "Approved for Release 1", decisions: ["A-09", "A-10"], questions: [] },
  { id: "REQ-017", feature: "F-05", type: "Exception candidate", text: "When an assigned supervisor is unavailable or missing, HR shall coordinate authorized manual routing or reassignment; automatic delegation is not approved.", status: "Approved", statusText: "Approved for Release 1", decisions: ["A-09"], questions: [] },
  { id: "REQ-004", feature: "F-06", type: "Functional candidate", text: "Proposed: The Hub would provide searchable HR service information; content ownership and scope remain unapproved.", status: "Pending", statusText: "Pending", decisions: ["A-11"], questions: ["Q-11"] },
  { id: "REQ-014", feature: "F-06", type: "Data / interface candidate", text: "Proposed: The Hub would receive updated leave-balance information from a designated authoritative HR source; authorization is pending.", status: "Pending", statusText: "Pending", decisions: ["A-13"], questions: ["Q-08", "Q-09"] },
  { id: "REQ-015", feature: "F-07", type: "Event / functional candidate", text: "Proposed: The Hub would provide approval reminders after pending requests reach a defined age; recipients and delivery rules are pending.", status: "Pending", statusText: "Pending", decisions: ["A-12"], questions: ["Q-07"] },
  { id: "REQ-018", feature: "F-08", type: "Interface proposal", text: "Excluded from Release 1: The Hub would send approved time-off request information directly to payroll.", status: "Excluded", statusText: "Excluded from Release 1", decisions: ["A-14"], questions: [] },
  { id: "REQ-019", feature: "F-08", type: "Security proposal", text: "Proposed payroll-related multifactor authentication rule; no direct payroll access is part of Release 1, and exact policy requirements remain unapproved.", status: "Excluded", statusText: "Excluded from Release 1 / Policy pending", decisions: ["A-14", "A-04"], questions: ["Q-13"] },
];

export const decisions: Record<string, { text: string; status: string }> = {
  "A-01": { text: "Accept a responsive web application instead of requiring a native application.", status: "Approved" },
  "A-02": { text: "Restrict Release 1 to the initial time-off request process and essential Hub access.", status: "Approved" },
  "A-03": { text: "Require leave type, start date and end date; use authenticated employee identity.", status: "Approved" },
  "A-04": { text: "Define exact single sign-on coverage and measurable quality thresholds.", status: "Pending" },
  "A-05": { text: "Prevent incomplete/invalid submission; retain it as Draft with correction messages.", status: "Approved" },
  "A-06": { text: "Use Draft, Pending Approval, Returned for Correction, Approved, Denied, and Cancelled.", status: "Approved" },
  "A-07": { text: "Route supervisor review using HR-recorded employee-supervisor relationship.", status: "Approved" },
  "A-08": { text: "Permit Draft/Returned for Correction editing; permit Pending Approval cancellation; no direct edits to Approved/Denied.", status: "Approved" },
  "A-09": { text: "HR coordinates authorized manual routing for exceptions; automatic delegation is not approved.", status: "Approved" },
  "A-10": { text: "Apply role-based access for employees, supervisors, and HR; determine permissions by responsibility.", status: "Approved" },
  "A-11": { text: "Approve a searchable HR knowledge base and content ownership model.", status: "Pending" },
  "A-12": { text: "Approve reminder recipients, channel, timing and repeat/escalation rules.", status: "Pending" },
  "A-13": { text: "Authorize live leave-balance data interface and exception behaviour.", status: "Pending" },
  "A-14": { text: "Exclude direct payroll integration from Release 1.", status: "Excluded from Release 1" },
  "A-15": { text: "Approve data retention, archival, deletion and record access rules.", status: "Pending" },
  "A-16": { text: "Exclude AI chatbot, employee social feed and shift-scheduling integration from Release 1.", status: "Excluded from Release 1" },
};

export const questions: Record<string, { text: string; status: string }> = {
  "Q-07": { text: "Who receives 48-hour reminders, using which channel, with what content?", status: "Open" },
  "Q-08": { text: "What happens when HR-supplied leave balance changes after approval?", status: "Open" },
  "Q-09": { text: "Which system is authoritative for leave balances and how fresh must they be?", status: "Open" },
  "Q-11": { text: "Which roles may view, edit, cancel, approve, and review requests?", status: "Resolved for Lesson 7" },
  "Q-12": { text: "What data must be retained, for how long, and under whose policy?", status: "Open" },
  "Q-13": { text: "Which native-app, browser, and authentication choices are mandatory or only proposed?", status: "Resolved for Lesson 7" },
};
