# Zekalo Native iOS & macOS App — Complete Build Prompt

You are building the native iOS and macOS apps for **Zekalo**, a school management SaaS platform for Azerbaijan. The apps support both IB (International Baccalaureate) and government curriculum schools. They complement an existing React web app and share the same Supabase backend. Your job is to build the entire native codebase from scratch following every specification below exactly.

---

## 1. Project Overview

Zekalo serves four user roles — Students, Teachers, Parents, and Admins — across schools in Azerbaijan. The native apps provide grades, attendance, assignments, messaging, AI tutoring (called Zeka), and reporting. All data lives in Supabase (Postgres + Auth + Realtime + Edge Functions). The native apps are a companion to the web app, not a replacement; certain admin-heavy features remain web-only.

**Target platforms:**
- Student App: iOS 16+
- Teacher App: iOS 16+ and macOS 13+
- Parent App: iOS 16+ and macOS 13+
- Admin App: iPad and macOS 13+ only

All four roles live in a single Xcode project. The app routes to the correct experience based on the authenticated user's `role` field in the `profiles` table.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| UI | SwiftUI (no UIKit unless absolutely necessary) |
| Minimum deployment | iOS 16, macOS 13 |
| Backend | supabase-swift SDK via Swift Package Manager |
| AI streaming | URLSession async bytes (connects to Supabase Edge Function) |
| Offline sync | CloudKit (private database) for grade and attendance writes |
| Push notifications | APNs (Apple Push Notification service) |
| IDE | Xcode 15+ |
| Language | Swift 5.9+ |
| Secrets management | `Secrets.xcconfig` (gitignored), loaded via build settings |
| Auth state | `SupabaseManager` singleton holding the Supabase client |

**SPM dependencies to add:**
```
https://github.com/supabase-community/supabase-swift (latest stable)
```

No other third-party packages. Use system frameworks for everything else.

---

## 3. Brand Colors

Create `Extensions/Color+Brand.swift` with a SwiftUI `Color` extension. Use these exact hex values:

```swift
import SwiftUI

extension Color {
    // Purple palette
    static let brandPurple       = Color(hex: "534AB7") // primary
    static let brandPurpleLight  = Color(hex: "EEEDFE")
    static let brandPurpleDark   = Color(hex: "3C3489")
    static let brandPurpleMid    = Color(hex: "7F77DD")

    // Teal palette
    static let brandTeal         = Color(hex: "1D9E75") // primary
    static let brandTealLight    = Color(hex: "E1F5EE")
    static let brandTealMid      = Color(hex: "5DCAA5")

    // Surface and border
    static let brandSurface      = Color(hex: "f7f6ff")
    static let brandBorder       = Color(hex: "e8e6f8")

    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
```

Use `.brandPurple` as the primary action color, `.brandTeal` for success/positive states, `.brandSurface` for backgrounds, and `.brandBorder` for dividers and card outlines.

---

## 4. Complete Database Schema

Every Swift model must mirror these tables exactly. All `id` columns are UUID. All `created_at` / `updated_at` are `timestamptz`. Foreign keys reference the indicated table.

### schools
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| name | text | NOT NULL |
| district | text | |
| edition | text | 'ib' or 'government' |
| ib_programmes | text[] | e.g. ['myp','dp'] |
| logo_url | text | |
| asan_api_key | text | encrypted |
| egov_api_key | text | encrypted |
| egov_api_endpoint | text | |
| default_language | text | 'az', 'en', or 'ru' |
| created_at | timestamptz | default now() |

### profiles
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, FK to auth.users |
| full_name | text | NOT NULL |
| email | text | NOT NULL |
| role | text | 'student', 'teacher', 'parent', 'admin' |
| school_id | uuid | FK to schools |
| edition | text | 'ib' or 'government' |
| language | text | 'az', 'en', 'ru' |
| ib_programme | text | 'myp' or 'dp', nullable |
| avatar_color | text | hex string |
| apns_token | text | nullable |
| notify_new_grade | bool | default true |
| notify_absence | bool | default true |
| notify_message | bool | default true |
| notify_assignment | bool | default true |
| streak_count | int | default 0 |
| streak_longest | int | default 0 |
| streak_last_date | date | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### subjects
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| school_id | uuid | FK to schools |
| name | text | English name |
| name_az | text | Azerbaijani name |
| ib_criterion_group | text | nullable, e.g. 'sciences' |
| created_at | timestamptz | |

### classes
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| school_id | uuid | FK to schools |
| name | text | e.g. '10A' |
| grade_level | int | |
| academic_year | text | e.g. '2025-2026' |
| created_at | timestamptz | |

### class_members
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| class_id | uuid | FK to classes |
| student_id | uuid | FK to profiles |
| enrolled_at | timestamptz | |

### teacher_classes
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| class_id | uuid | FK to classes |
| teacher_id | uuid | FK to profiles |
| subject_id | uuid | FK to subjects |

### parent_children
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| parent_id | uuid | FK to profiles |
| child_id | uuid | FK to profiles |
| created_at | timestamptz | |

### timetable_slots
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| school_id | uuid | FK to schools |
| class_id | uuid | FK to classes |
| teacher_id | uuid | FK to profiles |
| subject_id | uuid | FK to subjects |
| day_of_week | int | 1 = Monday through 6 = Saturday |
| period | int | 1 through 8 |
| start_time | time | |
| end_time | time | |
| room | text | |
| published | bool | default false |
| created_at | timestamptz | |

### grades
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| student_id | uuid | FK to profiles |
| teacher_id | uuid | FK to profiles |
| subject_id | uuid | FK to subjects |
| class_id | uuid | FK to classes |
| assessment_title | text | |
| grade_type | text | e.g. 'formative', 'summative', 'criterion' |
| score | numeric | nullable, for national |
| max_score | numeric | nullable |
| criterion_a | numeric | 0-8, nullable, for IB |
| criterion_b | numeric | 0-8, nullable |
| criterion_c | numeric | 0-8, nullable |
| criterion_d | numeric | 0-8, nullable |
| notes | text | |
| date | date | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### attendance
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| student_id | uuid | FK to profiles |
| class_id | uuid | FK to classes |
| teacher_id | uuid | FK to profiles |
| date | date | |
| status | text | 'present', 'absent', 'late' |
| note | text | |
| created_at | timestamptz | |

### assignments
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| class_id | uuid | FK to classes |
| teacher_id | uuid | FK to profiles |
| subject_id | uuid | FK to subjects |
| title | text | |
| description | text | |
| due_date | timestamptz | |
| max_score | numeric | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### submissions
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| assignment_id | uuid | FK to assignments |
| student_id | uuid | FK to profiles |
| content | text | |
| submitted_at | timestamptz | |
| score | numeric | nullable |
| feedback | text | nullable |
| status | text | 'submitted', 'graded', 'late' |
| graded_at | timestamptz | nullable |

### messages
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| thread_id | uuid | groups messages in a thread |
| sender_id | uuid | FK to profiles |
| recipient_id | uuid | FK to profiles |
| content | text | |
| read | bool | default false |
| read_at | timestamptz | nullable |
| created_at | timestamptz | |

### notifications
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK to profiles |
| type | text | e.g. 'new_grade', 'absence', 'new_message', 'assignment_due' |
| title | text | |
| body | text | |
| data | jsonb | arbitrary payload, e.g. {"grade_id": "..."} |
| read | bool | default false |
| created_at | timestamptz | |

### zeka_conversations
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK to profiles |
| subject | text | |
| language | text | 'az', 'en', 'ru' |
| messages | jsonb | array of {role, content, timestamp} |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### ib_extended_essays
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| student_id | uuid | FK to profiles |
| school_id | uuid | FK to schools |
| supervisor_id | uuid | FK to profiles |
| topic | text | |
| subject | text | |
| status | text | e.g. 'draft', 'submitted', 'reviewed' |
| submitted_at | timestamptz | nullable |
| final_grade | text | nullable |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### announcements
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| school_id | uuid | FK to schools |
| sender_id | uuid | FK to profiles |
| title | text | |
| body | text | |
| audience | text | e.g. 'all', 'students', 'teachers', 'parents' |
| class_id | uuid | nullable, FK to classes |
| created_at | timestamptz | |

### ministry_reports
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| school_id | uuid | FK to schools |
| class_id | uuid | FK to classes |
| generated_by | uuid | FK to profiles |
| report_type | text | |
| status | text | 'draft', 'submitted', 'accepted', 'rejected' |
| submitted_at | timestamptz | nullable |
| egov_reference | text | nullable |
| error_log | text | nullable |
| created_at | timestamptz | |

---

## 5. Swift Models

Create one file per model in `Models/`. Every model conforms to `Codable, Identifiable, Hashable`. Use `CodingKeys` to map snake_case database columns to camelCase Swift properties. Use `UUID` for all id fields. Use `Date` for all timestamp fields. Use optionals where the column is nullable.

Example pattern (apply to every table above):

```swift
// Models/Grade.swift
import Foundation

struct Grade: Codable, Identifiable, Hashable {
    let id: UUID
    let studentId: UUID
    let teacherId: UUID
    let subjectId: UUID
    let classId: UUID
    let assessmentTitle: String
    let gradeType: String
    var score: Double?
    var maxScore: Double?
    var criterionA: Double?
    var criterionB: Double?
    var criterionC: Double?
    var criterionD: Double?
    var notes: String?
    let date: Date
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case studentId = "student_id"
        case teacherId = "teacher_id"
        case subjectId = "subject_id"
        case classId = "class_id"
        case assessmentTitle = "assessment_title"
        case gradeType = "grade_type"
        case score
        case maxScore = "max_score"
        case criterionA = "criterion_a"
        case criterionB = "criterion_b"
        case criterionC = "criterion_c"
        case criterionD = "criterion_d"
        case notes, date
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
```

Create models for ALL tables listed in the schema: `School`, `Profile`, `Subject`, `SchoolClass` (avoid collision with Swift `Class`), `ClassMember`, `TeacherClass`, `ParentChild`, `TimetableSlot`, `Grade`, `Attendance`, `Assignment`, `Submission`, `Message`, `AppNotification` (avoid collision with system `Notification`), `ZekaConversation`, `IBExtendedEssay`, `Announcement`, `MinistryReport`.

---

## 6. Secrets & Configuration

Create `Secrets.xcconfig` at project root (add to `.gitignore`):

```xcconfig
SUPABASE_URL = https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY = your-anon-key-here
```

In the Xcode project, add `Secrets.xcconfig` as the configuration file for both Debug and Release. Access in code via `Bundle.main`:

```swift
// Managers/SupabaseManager.swift
import Foundation
import Supabase

final class SupabaseManager {
    static let shared = SupabaseManager()

    let client: SupabaseClient

    private init() {
        guard let urlString = Bundle.main.infoDictionary?["SUPABASE_URL"] as? String,
              let url = URL(string: urlString),
              let anonKey = Bundle.main.infoDictionary?["SUPABASE_ANON_KEY"] as? String
        else {
            fatalError("Missing Supabase config in Secrets.xcconfig. Add SUPABASE_URL and SUPABASE_ANON_KEY.")
        }
        self.client = SupabaseClient(supabaseURL: url, supabaseKey: anonKey)
    }
}
```

In `Info.plist`, add:
```xml
<key>SUPABASE_URL</key>
<string>$(SUPABASE_URL)</string>
<key>SUPABASE_ANON_KEY</key>
<string>$(SUPABASE_ANON_KEY)</string>
```

---

## 7. Authentication Flow

### Login Screen (`Views/Auth/LoginView.swift`)

A centered card with the Zekalo logo (use SF Symbol `graduationcap.fill` tinted `.brandPurple` as placeholder), email field, password field, "Daxil ol" button, and a "Qeydiyyat" link to sign up. Use `.brandSurface` background.

```swift
// Login logic
let session = try await SupabaseManager.shared.client.auth.signIn(
    email: email,
    password: password
)
```

After login, fetch the profile and route based on `role`.

### Sign Up Screen (`Views/Auth/SignUpView.swift`)

A 4-step flow using a `@State var step: Int = 1` with a progress indicator at the top. Each step slides in from the right. A "Back" button appears on steps 2-4.

**Step 1 — Credentials:**
- Full name text field
- Email text field (keyboard type `.emailAddress`)
- Password secure field (minimum 8 characters, show validation)
- "Növbəti" (Next) button

**Step 2 — Role Picker:**
- Four cards in a 2x2 grid, each with an SF Symbol icon and role name:
  - `person.fill` — Sagird (Student)
  - `person.crop.rectangle.fill` — Muellim (Teacher)
  - `person.2.fill` — Valideyn (Parent)
  - `gearshape.fill` — Administrator (Admin)
- Tapping a card selects it (purple border + checkmark), then auto-advances

**Step 3 — School Picker:**
- Search bar at top
- Scrollable list of schools fetched from `schools` table
- Each row shows school name and a badge: purple "IB" badge if edition is 'ib', teal "National" badge if 'government'
- Tapping selects and advances

**Step 4 — Programme & Language:**
- If selected school's edition is 'ib': show programme picker with two cards — MYP and DP
- If 'government': show an informational notice about national curriculum
- Language picker: three buttons — Az, En, Ru
- "Qeydiyyatdan kec" (Register) button

**Registration logic:**
```swift
let authResponse = try await SupabaseManager.shared.client.auth.signUp(
    email: email,
    password: password
)
// Then insert profile row
try await SupabaseManager.shared.client.from("profiles").insert([
    "id": authResponse.user.id.uuidString,
    "full_name": fullName,
    "email": email,
    "role": selectedRole,
    "school_id": selectedSchool.id.uuidString,
    "edition": selectedSchool.edition,
    "language": selectedLanguage,
    "ib_programme": selectedProgramme // nil for government
]).execute()
```

### Auth State Management

In `ZekaloApp.swift`, observe auth state changes:

```swift
@main
struct ZekaloApp: App {
    @State private var isAuthenticated = false
    @State private var currentProfile: Profile?

    var body: some Scene {
        WindowGroup {
            Group {
                if let profile = currentProfile {
                    switch profile.role {
                    case "student": StudentTabView(profile: profile)
                    case "teacher": TeacherTabView(profile: profile)
                    case "parent":  ParentTabView(profile: profile)
                    case "admin":   AdminSplitView(profile: profile)
                    default:        LoginView()
                    }
                } else {
                    LoginView()
                }
            }
            .task {
                await listenForAuthChanges()
            }
        }
    }

    private func listenForAuthChanges() async {
        for await (event, session) in SupabaseManager.shared.client.auth.authStateChanges {
            if event == .signedIn, let userId = session?.user.id {
                // fetch profile
                let profile: Profile = try await SupabaseManager.shared.client
                    .from("profiles")
                    .select()
                    .eq("id", value: userId.uuidString)
                    .single()
                    .execute()
                    .value
                self.currentProfile = profile
            } else if event == .signedOut {
                self.currentProfile = nil
            }
        }
    }
}
```

---

## 8. Student App (iOS)

### StudentTabView.swift

```swift
TabView {
    StudentDashboard(profile: profile)
        .tabItem { Label("Dashboard", systemImage: "house.fill") }
    ZekaChat(profile: profile)
        .tabItem { Label("Zeka", systemImage: "brain.head.profile") }
    GradesView(profile: profile)
        .tabItem { Label("Qiymetler", systemImage: "chart.bar.fill") }
    AttendanceView(profile: profile)
        .tabItem { Label("Davamiyyet", systemImage: "calendar") }
    StudentProfile(profile: profile)
        .tabItem { Label("Profil", systemImage: "person.fill") }
}
.tint(.brandPurple)
```

### StudentDashboard.swift

Layout (ScrollView, VStack):
1. **Greeting row**: "Salam, {firstName}!" with a circular avatar (initials on `avatarColor` background). Show current streak with flame icon if streak_count > 0.
2. **Stat cards row** (horizontal scroll): 4 `StatCard` views showing: GPA / average, attendance %, assignments due count, streak count. Use `.brandPurple`, `.brandTeal`, orange, and amber backgrounds respectively.
3. **Upcoming assignments section**: fetch from `assignments` joined with `submissions` where `student_id = profile.id` and `due_date > now()`, ordered by due_date. Show up to 5. Each row: subject name, title, due date. Tap navigates to assignment detail.
4. **Recent grades section**: last 5 grades for this student. Each row: subject, assessment title, score or IB criteria, date. Tap navigates to grade detail.
5. **Zeka card**: a branded card with gradient (`.brandPurple` to `.brandPurpleMid`), brain icon, "Zeka ile ogren" text. Tap navigates to Zeka tab.

### GradesView.swift

- Top: horizontal scrolling subject tabs (pills). "All" tab plus one per subject the student is enrolled in (via `class_members` -> `teacher_classes` -> `subjects`).
- Content: `List` of grades filtered by selected subject.
- Each row shows:
  - Assessment title
  - Date
  - If IB edition: show criteria badges (A: 6, B: 7, C: 5, D: 6) colored by level (0-2 red, 3-4 amber, 5-6 teal, 7-8 purple)
  - If national edition: show score/maxScore as "85/100" with a circular progress indicator
- Bottom of list: subject average card

Fetch:
```swift
let grades: [Grade] = try await SupabaseManager.shared.client
    .from("grades")
    .select("*, subjects(name, name_az)")
    .eq("student_id", value: profile.id.uuidString)
    .order("date", ascending: false)
    .execute()
    .value
```

### AttendanceView.swift

- **Calendar grid** at top: a monthly calendar where each day cell is colored:
  - Green (`.brandTeal`): present
  - Red: absent
  - Amber: late
  - Gray: no record / weekend / future
  - Month navigation arrows
- **Stats row**: three stat cards — "Present: X%", "Absent: X", "Late: X"
- **Absence list**: scrollable list of dates marked absent or late with notes

Fetch:
```swift
let records: [Attendance] = try await SupabaseManager.shared.client
    .from("attendance")
    .select()
    .eq("student_id", value: profile.id.uuidString)
    .execute()
    .value
```

### StudentProfile.swift

- Circular avatar (large, initials on color background)
- **Avatar color picker**: horizontal row of 8 color circles. Tapping updates `avatar_color` in profiles.
- Full name (editable text field with save button)
- Language picker (segmented: Az / En / Ru)
- **Notification toggles**: four toggles for `notify_new_grade`, `notify_absence`, `notify_message`, `notify_assignment`
- **Streak stats**: current streak, longest streak, last active date
- **Sign out button** (red, bottom)

All changes save to `profiles` table via:
```swift
try await SupabaseManager.shared.client.from("profiles")
    .update(["field": value])
    .eq("id", value: profile.id.uuidString)
    .execute()
```

---

## 9. Zeka AI Chat

### ZekaChat.swift

This is a full chat interface for the Zeka AI tutor.

**Layout:**
- **Sidebar / sheet** (on iPhone, a `.sheet`; on iPad, a sidebar): list of past conversations from `zeka_conversations` table ordered by `updated_at desc`. Each row shows subject, first message preview, date. "New conversation" button at top.
- **Chat area**: messages displayed in bubbles. User messages right-aligned (`.brandPurple` background, white text). Zeka messages left-aligned (`.brandSurface` background, dark text). Zeka messages render Markdown.
- **Input area** at bottom:
  - Subject chips row: horizontal scroll of subject pills the student studies. Tapping sets the conversation subject context.
  - Language toggle: small segmented control (Az/En/Ru) that sets the conversation language.
  - Suggestion chips: if conversation is empty, show 3-4 starter prompts like "Bu movzunu izah et", "Imtahana hazirlas", "Ev tapsiriginda kokmek et"
  - Text field + send button

**Streaming implementation:**

```swift
// In a ViewModel or within the view
func sendMessage(_ text: String) async {
    // 1. Append user message to local messages array
    let userMessage = ChatMessage(role: "user", content: text, timestamp: Date())
    messages.append(userMessage)

    // 2. Prepare payload
    let payload: [String: Any] = [
        "messages": messages.map { ["role": $0.role, "content": $0.content] },
        "subject": selectedSubject ?? "",
        "language": selectedLanguage,
        "student_id": profile.id.uuidString
    ]

    // 3. Stream from Supabase Edge Function
    let supabaseURL = Bundle.main.infoDictionary!["SUPABASE_URL"] as! String
    let supabaseAnonKey = Bundle.main.infoDictionary!["SUPABASE_ANON_KEY"] as! String

    let url = URL(string: "\(supabaseURL)/functions/v1/zeka-chat")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("Bearer \(supabaseAnonKey)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    // Get current session token for RLS
    if let accessToken = try? await SupabaseManager.shared.client.auth.session.accessToken {
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
    }

    request.httpBody = try? JSONSerialization.data(withJSONObject: payload)

    // 4. Start streaming
    var assistantText = ""
    let assistantMessage = ChatMessage(role: "assistant", content: "", timestamp: Date())
    messages.append(assistantMessage)

    do {
        let (bytes, response) = try await URLSession.shared.bytes(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            // Handle error
            return
        }

        for try await line in bytes.lines {
            if line.hasPrefix("data: ") {
                let jsonString = String(line.dropFirst(6))
                if jsonString == "[DONE]" { break }
                if let data = jsonString.data(using: .utf8),
                   let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let choices = json["choices"] as? [[String: Any]],
                   let delta = choices.first?["delta"] as? [String: Any],
                   let content = delta["content"] as? String {
                    assistantText += content
                    // Update the last message in the array (triggers UI refresh)
                    messages[messages.count - 1].content = assistantText
                }
            }
        }
    } catch {
        messages[messages.count - 1].content = "Xeta bas verdi. Yeniden cehd edin."
    }

    // 5. Save conversation to Supabase
    let conversationMessages = messages.map { msg -> [String: Any] in
        ["role": msg.role, "content": msg.content, "timestamp": ISO8601DateFormatter().string(from: msg.timestamp)]
    }

    if let conversationId = currentConversationId {
        try? await SupabaseManager.shared.client.from("zeka_conversations")
            .update(["messages": conversationMessages, "updated_at": ISO8601DateFormatter().string(from: Date())])
            .eq("id", value: conversationId.uuidString)
            .execute()
    } else {
        let newConversation: [String: Any] = [
            "user_id": profile.id.uuidString,
            "subject": selectedSubject ?? "",
            "language": selectedLanguage,
            "messages": conversationMessages
        ]
        try? await SupabaseManager.shared.client.from("zeka_conversations")
            .insert(newConversation)
            .execute()
    }
}
```

**ChatMessage model** (local, not a database table model):
```swift
struct ChatMessage: Identifiable {
    let id = UUID()
    let role: String // "user" or "assistant"
    var content: String
    let timestamp: Date
}
```

---

## 10. Teacher App (iOS + macOS)

### TeacherTabView.swift (iOS)

```swift
TabView {
    TeacherDashboard(profile: profile)
        .tabItem { Label("Dashboard", systemImage: "house.fill") }
    GradebookView(profile: profile)
        .tabItem { Label("Jurnal", systemImage: "book.fill") }
    AttendanceRegister(profile: profile)
        .tabItem { Label("Davamiyyet", systemImage: "checklist") }
    MessagesView(profile: profile)
        .tabItem { Label("Mesajlar", systemImage: "message.fill") }
    ReportsView(profile: profile)
        .tabItem { Label("Hesabatlar", systemImage: "doc.text.fill") }
}
.tint(.brandPurple)
```

On macOS, use `NavigationSplitView` with a sidebar listing these same sections.

### TeacherDashboard.swift

Layout:
1. **Today's classes**: fetch `timetable_slots` for current day_of_week where `teacher_id = profile.id` and `published = true`. Show period, time, class name, subject, room. Highlight current period.
2. **Stats row**: total students taught, grades entered this week, average attendance rate
3. **At-risk students**: students with attendance below 80% or failing grades (average below 3 for IB or below 50% for national). Show name, class, concern badge.
4. **Recent grades entered**: last 10 grades this teacher entered.

### GradebookView.swift

This is the most complex view. Structure:

1. **Top bar**: Class picker (dropdown/menu of classes from `teacher_classes`) and Subject picker (auto-filtered by selected class).
2. **Assessment list / Add button**: horizontal scroll of existing assessments for this class+subject. Plus button to add new assessment (sheet with title, grade_type, max_score, date).
3. **Student roster**: a scrollable table/list of students in the selected class (from `class_members`). Each row:
   - Student name
   - For the selected assessment: editable grade fields
     - If IB: four small text fields for criteria A, B, C, D (0-8 each)
     - If national: one text field for score (0 to max_score)
   - Notes field (expandable)
4. **Save button**: batch upsert all grades. Use CloudKit offline queue if no network.
5. **CSV Export**: button that generates CSV of all grades for this class+subject and presents a share sheet.

**Grade save logic:**
```swift
func saveGrades() async {
    let gradesToSave = editedGrades.map { edited -> [String: Any] in
        var dict: [String: Any] = [
            "student_id": edited.studentId.uuidString,
            "teacher_id": profile.id.uuidString,
            "subject_id": selectedSubject.id.uuidString,
            "class_id": selectedClass.id.uuidString,
            "assessment_title": selectedAssessment.title,
            "grade_type": selectedAssessment.gradeType,
            "date": ISO8601DateFormatter().string(from: selectedAssessment.date)
        ]
        if profile.edition == "ib" {
            dict["criterion_a"] = edited.criterionA
            dict["criterion_b"] = edited.criterionB
            dict["criterion_c"] = edited.criterionC
            dict["criterion_d"] = edited.criterionD
        } else {
            dict["score"] = edited.score
            dict["max_score"] = selectedAssessment.maxScore
        }
        if let notes = edited.notes { dict["notes"] = notes }
        return dict
    }

    do {
        try await SupabaseManager.shared.client.from("grades")
            .upsert(gradesToSave, onConflict: "student_id,subject_id,assessment_title")
            .execute()
    } catch {
        // Queue to CloudKit for offline sync
        CloudKitSyncManager.shared.queueGrades(gradesToSave)
    }
}
```

### AttendanceRegister.swift

1. **Date picker** at top (defaults to today)
2. **Class picker** (from `teacher_classes`)
3. **Student list**: each row has student name and three toggle buttons:
   - Green checkmark = present
   - Red X = absent
   - Amber clock = late
   - Optional note field
4. **Quick actions**: "Mark all present" button
5. **Save button**: batch insert/upsert attendance records

**Save with offline support:**
```swift
func saveAttendance() async {
    let records = students.map { student -> [String: Any] in
        [
            "student_id": student.id.uuidString,
            "class_id": selectedClass.id.uuidString,
            "teacher_id": profile.id.uuidString,
            "date": dateFormatter.string(from: selectedDate),
            "status": attendanceStatus[student.id]?.rawValue ?? "present",
            "note": attendanceNotes[student.id] ?? ""
        ]
    }

    do {
        try await SupabaseManager.shared.client.from("attendance")
            .upsert(records, onConflict: "student_id,class_id,date")
            .execute()
    } catch {
        CloudKitSyncManager.shared.queueAttendance(records)
    }
}
```

### MessagesView.swift

1. **Thread list**: fetch distinct threads where `sender_id = profile.id OR recipient_id = profile.id`. Group by `thread_id`. Show other participant's name, last message preview, unread badge, timestamp.
2. **Chat view**: messages in bubbles, similar to Zeka but simpler (no streaming). Load messages for selected `thread_id` ordered by `created_at`.
3. **Compose**: button to start new thread. Shows searchable list of parents (for teacher -> parent communication). Creates a new `thread_id` UUID.
4. **Realtime subscription**: subscribe to messages table changes for live updates:

```swift
let channel = SupabaseManager.shared.client.channel("messages")
channel.on("postgres_changes", filter: .init(
    event: .insert,
    schema: "public",
    table: "messages",
    filter: "recipient_id=eq.\(profile.id.uuidString)"
)) { payload in
    // Append new message to the thread
}
await channel.subscribe()
```

### ReportsView.swift

1. **Report type selector**: segmented control or menu with options like "Sinif hesabati" (class report), "Fenn hesabati" (subject report), "Davamiyyet hesabati" (attendance report)
2. **Filters**: class picker, date range
3. **Preview**: generated report content in a styled card
4. **Export**: "PDF Export" button using `UIGraphicsImageRenderer` or a print formatter
5. **Ministry reports list**: fetch from `ministry_reports` where `generated_by = profile.id`. Show status badges (draft/submitted/accepted/rejected). View-only — submission is web-only.

---

## 11. Parent App (iOS + macOS)

### ParentTabView.swift (iOS)

```swift
TabView {
    ParentDashboard(profile: profile, selectedChild: $selectedChild)
        .tabItem { Label("Dashboard", systemImage: "house.fill") }
    ParentGrades(child: selectedChild)
        .tabItem { Label("Qiymetler", systemImage: "chart.bar.fill") }
    ParentAttendance(child: selectedChild)
        .tabItem { Label("Davamiyyet", systemImage: "calendar") }
    ParentMessages(profile: profile)
        .tabItem { Label("Mesajlar", systemImage: "message.fill") }
    StudentProfile(profile: profile) // reuse student profile
        .tabItem { Label("Profil", systemImage: "person.fill") }
}
.tint(.brandPurple)
```

### ChildSwitcher.swift

A reusable view (used in `ParentDashboard` and available as overlay) that:
1. Fetches children via `parent_children` where `parent_id = profile.id`
2. For each child, fetches their `Profile`
3. Shows a horizontal row of child avatar circles with names
4. Tapping a child updates `@Binding var selectedChild: Profile?`

```swift
// Fetch children
let parentChildren: [ParentChild] = try await SupabaseManager.shared.client
    .from("parent_children")
    .select("*, child:profiles!child_id(*)")
    .eq("parent_id", value: profile.id.uuidString)
    .execute()
    .value
```

### ParentDashboard.swift

1. **Child switcher** at top (if multiple children)
2. **Child summary card**: child name, class, school, edition badge
3. **This week overview**: attendance summary (present/absent/late counts), grades received this week, upcoming assignments
4. **Quick actions**: "Message teacher", "View grades", "View attendance" buttons
5. **Recent notifications**: last 5 notifications for this parent

### ParentGrades.swift / ParentAttendance.swift

Reuse the same views as the student app (`GradesView` and `AttendanceView`) but pass the selected child's ID instead of the logged-in user's ID. Make these views accept a generic `studentId: UUID` parameter. These are read-only — no edit capabilities.

### MenuBarExtra.swift (macOS only)

On macOS, add a menu bar extra that shows the child's latest grade and today's attendance:

```swift
#if os(macOS)
@main
struct ZekaloApp: App {
    var body: some Scene {
        WindowGroup { /* ... main window ... */ }

        MenuBarExtra("Zekalo", systemImage: "graduationcap.fill") {
            if let child = selectedChild {
                Text(child.fullName)
                    .font(.headline)
                Divider()
                if let latestGrade = latestGrade {
                    Label("Son qiymet: \(latestGrade.assessmentTitle) — \(gradeDisplay(latestGrade))",
                          systemImage: "chart.bar.fill")
                }
                if let todayAttendance = todayAttendance {
                    Label("Bugun: \(todayAttendance.status)",
                          systemImage: todayAttendance.status == "present" ? "checkmark.circle.fill" : "xmark.circle.fill")
                }
                Divider()
                Button("Zekalo-nu ac") { /* open main window */ }
                Button("Cixis") { /* sign out */ }
            }
        }
    }
}
#endif
```

---

## 12. Admin App (iPad + macOS)

### AdminSplitView.swift

Use `NavigationSplitView` with a three-column layout:

```swift
NavigationSplitView {
    // Sidebar
    List(selection: $selectedSection) {
        Label("Dashboard", systemImage: "square.grid.2x2.fill")
            .tag(AdminSection.dashboard)
        Label("Sagirdler", systemImage: "person.3.fill")
            .tag(AdminSection.students)
        Label("Muellimler", systemImage: "person.crop.rectangle.fill")
            .tag(AdminSection.teachers)
        Label("Sinifler", systemImage: "building.2.fill")
            .tag(AdminSection.classes)
        Label("Dars cedveli", systemImage: "calendar")
            .tag(AdminSection.timetable)
        Label("Hesabatlar", systemImage: "doc.text.fill")
            .tag(AdminSection.reports)
        Label("Analitika", systemImage: "chart.xyaxis.line")
            .tag(AdminSection.analytics)
        Label("Elanlar", systemImage: "megaphone.fill")
            .tag(AdminSection.announcements)
        if profile.edition == "ib" {
            Label("IB Panel", systemImage: "globe")
                .tag(AdminSection.ibPanel)
        }
        Label("Nazirlik", systemImage: "building.columns.fill")
            .tag(AdminSection.ministry)
        Label("Parametrler", systemImage: "gearshape.fill")
            .tag(AdminSection.settings)
    }
    .listStyle(.sidebar)
    .navigationTitle("Zekalo Admin")
} content: {
    // Detail for selected section
    switch selectedSection {
    case .dashboard: AdminDashboard(profile: profile)
    case .students: StudentsAdmin(profile: profile)
    case .teachers: TeachersAdmin(profile: profile)
    case .classes: ClassesAdmin(profile: profile)
    case .timetable: TimetableAdmin(profile: profile)
    case .reports: ReportsView(profile: profile)
    case .analytics: AnalyticsView(profile: profile)
    case .announcements: AnnouncementsAdmin(profile: profile)
    case .ibPanel: IBPanelView(profile: profile)
    case .ministry: MinistryView(profile: profile)
    case .settings: SettingsView(profile: profile)
    default: AdminDashboard(profile: profile)
    }
} detail: {
    // Selected item detail
    Text("Select an item")
}
```

### AdminDashboard.swift

- School overview stats: total students, teachers, classes, average attendance
- Charts (use Swift Charts): attendance trend line, grade distribution bar chart
- Recent activity feed: latest grades, attendance, messages
- Quick actions: add student, add teacher, create class, post announcement

### StudentsAdmin.swift

- Searchable table of all students in the school
- Columns: name, email, class, edition, IB programme
- Add student button (sheet with form)
- Tap row to see student detail (grades, attendance, profile)
- Edit and delete capabilities

### TeachersAdmin.swift

- Same pattern as StudentsAdmin but for teachers
- Shows assigned classes and subjects
- Assign teacher to class+subject

### ClassesAdmin.swift

- List of classes with student count, grade level, academic year
- Tap to see class detail: student roster, assigned teachers+subjects
- Add/remove students from class
- Create new class

### TimetableAdmin.swift

- Read-only grid view of the school timetable
- Filter by class or teacher
- Shows period, time, subject, teacher, room
- Note: timetable editing is web-only

### AnnouncementsAdmin.swift

- List of announcements with audience badge, date
- Create new announcement: title, body, audience picker (all/students/teachers/parents), optional class scope
- Uses `announcements` table

### IBPanelView.swift (only for IB edition)

- Extended essays tracker: list from `ib_extended_essays`
- Status pipeline: draft -> submitted -> reviewed
- Supervisor assignment

### MinistryView.swift

- List of `ministry_reports` for the school
- View report details and status
- Note: actual E-Gov submission is web-only; show view-only status here

---

## 13. Push Notifications

### NotificationManager.swift

```swift
import Foundation
import UserNotifications
#if os(iOS)
import UIKit
#endif

final class NotificationManager: NSObject, ObservableObject {
    static let shared = NotificationManager()

    func requestPermission() async -> Bool {
        let center = UNUserNotificationCenter.current()
        do {
            return try await center.requestAuthorization(options: [.alert, .badge, .sound])
        } catch {
            return false
        }
    }

    func registerForPushNotifications() {
        #if os(iOS)
        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
        }
        #endif
    }

    func uploadToken(_ token: Data) async {
        let tokenString = token.map { String(format: "%02.2hhx", $0) }.joined()
        guard let userId = try? await SupabaseManager.shared.client.auth.session.user.id else { return }
        try? await SupabaseManager.shared.client.from("profiles")
            .update(["apns_token": tokenString])
            .eq("id", value: userId.uuidString)
            .execute()
    }
}
```

### AppDelegate for token handling (iOS):

```swift
#if os(iOS)
class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        Task {
            await NotificationManager.shared.uploadToken(deviceToken)
        }
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("APNs registration failed: \(error)")
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse) async {
        let userInfo = response.notification.request.content.userInfo
        handleDeepLink(userInfo)
    }

    private func handleDeepLink(_ userInfo: [AnyHashable: Any]) {
        guard let type = userInfo["type"] as? String else { return }
        switch type {
        case "new_grade":
            // Navigate to grade detail
            if let gradeId = userInfo["grade_id"] as? String {
                NotificationCenter.default.post(name: .navigateToGrade, object: gradeId)
            }
        case "absence":
            NotificationCenter.default.post(name: .navigateToAttendance, object: nil)
        case "new_message":
            if let threadId = userInfo["thread_id"] as? String {
                NotificationCenter.default.post(name: .navigateToThread, object: threadId)
            }
        case "assignment_due":
            if let assignmentId = userInfo["assignment_id"] as? String {
                NotificationCenter.default.post(name: .navigateToAssignment, object: assignmentId)
            }
        default: break
        }
    }
}
#endif
```

Register the AppDelegate in `ZekaloApp.swift`:
```swift
#if os(iOS)
@UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
#endif
```

### Deep link notification names:
```swift
extension Notification.Name {
    static let navigateToGrade = Notification.Name("navigateToGrade")
    static let navigateToAttendance = Notification.Name("navigateToAttendance")
    static let navigateToThread = Notification.Name("navigateToThread")
    static let navigateToAssignment = Notification.Name("navigateToAssignment")
}
```

---

## 14. CloudKit Offline Sync

### CloudKitSyncManager.swift

```swift
import Foundation
import CloudKit
import Network

final class CloudKitSyncManager: ObservableObject {
    static let shared = CloudKitSyncManager()

    private let container = CKContainer.default()
    private let database: CKDatabase
    private let monitor = NWPathMonitor()
    private let monitorQueue = DispatchQueue(label: "com.zekalo.networkmonitor")

    @Published var isOnline = true
    private var pendingGrades: [[String: Any]] = []
    private var pendingAttendance: [[String: Any]] = []

    private init() {
        self.database = container.privateCloudDatabase
        startMonitoring()
    }

    private func startMonitoring() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isOnline = path.status == .satisfied
                if path.status == .satisfied {
                    Task { await self?.flushPendingRecords() }
                }
            }
        }
        monitor.start(queue: monitorQueue)
    }

    // MARK: - Queue writes when offline

    func queueGrades(_ grades: [[String: Any]]) {
        pendingGrades.append(contentsOf: grades)
        saveToCKRecords(grades, type: "PendingGrade")
    }

    func queueAttendance(_ records: [[String: Any]]) {
        pendingAttendance.append(contentsOf: records)
        saveToCKRecords(records, type: "PendingAttendance")
    }

    private func saveToCKRecords(_ records: [[String: Any]], type: String) {
        for record in records {
            let ckRecord = CKRecord(recordType: type)
            if let data = try? JSONSerialization.data(withJSONObject: record) {
                ckRecord["payload"] = data as CKRecordValue
                ckRecord["createdAt"] = Date() as CKRecordValue
            }
            database.save(ckRecord) { _, error in
                if let error = error {
                    print("CloudKit save error: \(error)")
                }
            }
        }
    }

    // MARK: - Flush on reconnect

    func flushPendingRecords() async {
        guard isOnline else { return }

        // Flush grades
        if !pendingGrades.isEmpty {
            do {
                try await SupabaseManager.shared.client.from("grades")
                    .upsert(pendingGrades, onConflict: "student_id,subject_id,assessment_title")
                    .execute()
                pendingGrades.removeAll()
                await deleteCKRecords(ofType: "PendingGrade")
            } catch {
                print("Failed to flush grades: \(error)")
            }
        }

        // Flush attendance (merge strategy: insert, skip conflicts)
        if !pendingAttendance.isEmpty {
            do {
                try await SupabaseManager.shared.client.from("attendance")
                    .upsert(pendingAttendance, onConflict: "student_id,class_id,date")
                    .execute()
                pendingAttendance.removeAll()
                await deleteCKRecords(ofType: "PendingAttendance")
            } catch {
                print("Failed to flush attendance: \(error)")
            }
        }
    }

    private func deleteCKRecords(ofType type: String) async {
        let query = CKQuery(recordType: type, predicate: NSPredicate(value: true))
        do {
            let (results, _) = try await database.records(matching: query)
            for (recordID, _) in results {
                try? await database.deleteRecord(withID: recordID)
            }
        } catch {
            print("CloudKit cleanup error: \(error)")
        }
    }
}
```

**Conflict resolution strategy:**
- **Grades**: server wins. When flushing, use upsert with `onConflict`. If the server has a newer `updated_at`, the server version is kept.
- **Attendance**: merge. Use upsert on the composite key `(student_id, class_id, date)`. The last write wins, which is acceptable since attendance is typically taken once per day.

---

## 15. Shared UI Components

### Avatar.swift
```swift
struct Avatar: View {
    let name: String
    let color: String
    var size: CGFloat = 40

    var initials: String {
        let parts = name.split(separator: " ")
        let first = parts.first?.prefix(1) ?? ""
        let last = parts.count > 1 ? parts.last!.prefix(1) : ""
        return "\(first)\(last)".uppercased()
    }

    var body: some View {
        Circle()
            .fill(Color(hex: color))
            .frame(width: size, height: size)
            .overlay(
                Text(initials)
                    .font(.system(size: size * 0.4, weight: .semibold))
                    .foregroundColor(.white)
            )
    }
}
```

### StatCard.swift
```swift
struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    var color: Color = .brandPurple

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Spacer()
            }
            Text(value)
                .font(.title2.bold())
                .foregroundColor(.primary)
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.brandSurface)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.brandBorder, lineWidth: 1)
        )
    }
}
```

### Badge.swift
```swift
struct Badge: View {
    let text: String
    var color: Color = .brandPurple

    var body: some View {
        Text(text)
            .font(.caption2.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.15))
            .foregroundColor(color)
            .cornerRadius(6)
    }
}
```

### EmptyState.swift
```swift
struct EmptyState: View {
    let icon: String
    let title: String
    let message: String

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundColor(.brandPurpleMid)
            Text(title)
                .font(.headline)
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(40)
    }
}
```

---

## 16. Date Formatting Extension

### Extensions/Date+Format.swift

```swift
import Foundation

extension Date {
    func formatted(as style: DateFormatStyle) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "az_AZ")
        switch style {
        case .short:
            formatter.dateStyle = .short
        case .medium:
            formatter.dateStyle = .medium
        case .long:
            formatter.dateFormat = "d MMMM yyyy"
        case .time:
            formatter.dateFormat = "HH:mm"
        case .dayMonth:
            formatter.dateFormat = "d MMM"
        case .iso:
            formatter.dateFormat = "yyyy-MM-dd"
        }
        return formatter.string(from: self)
    }

    enum DateFormatStyle {
        case short, medium, long, time, dayMonth, iso
    }

    var isToday: Bool {
        Calendar.current.isDateInToday(self)
    }

    var isThisWeek: Bool {
        Calendar.current.isDate(self, equalTo: Date(), toGranularity: .weekOfYear)
    }
}
```

---

## 17. Localization

### Resources/az.lproj/Localizable.strings

```
/* Auth */
"login" = "Daxil ol";
"signup" = "Qeydiyyat";
"next" = "Novbeti";
"register" = "Qeydiyyatdan kec";
"email" = "E-poct";
"password" = "Sifre";
"full_name" = "Ad, soyad";
"select_role" = "Rolunuzu secin";
"select_school" = "Mektebinizi secin";
"search_school" = "Mekteb axtar...";

/* Navigation */
"dashboard" = "Dashboard";
"grades" = "Qiymetler";
"attendance" = "Davamiyyet";
"assignments" = "Tapshiriqlar";
"messages" = "Mesajlar";
"profile" = "Profil";
"notifications" = "Bildirisler";
"settings" = "Parametrler";
"reports" = "Hesabatlar";
"gradebook" = "Jurnal";
"analytics" = "Analitika";
"announcements" = "Elanlar";
"timetable" = "Dars cedveli";

/* Actions */
"save" = "Yadda saxla";
"cancel" = "Legv et";
"delete" = "Sil";
"edit" = "Redakte et";
"add" = "Elava et";
"search" = "Axtar";
"export" = "Export";
"send" = "Gonder";

/* Status */
"error" = "Xeta bas verdi. Yeniden cehd edin.";
"loading" = "Yuklenilir...";
"no_data" = "Melumat tapilmadi";
"success" = "Ugurla yerine yetirildi";
"offline" = "Oflayn rejim";

/* Attendance */
"present" = "Istirak";
"absent" = "Buraxilmis";
"late" = "Geciken";
"mark_all_present" = "Hamisi istirak";

/* Roles */
"student" = "Sagird";
"teacher" = "Muellim";
"parent" = "Valideyn";
"admin" = "Administrator";

/* Zeka */
"zeka_greeting" = "Salam! Men Zekayam.";
"zeka_placeholder" = "Sualinizi yazin...";
"new_conversation" = "Yeni sohbet";

/* Profile */
"streak" = "gunluk seriya";
"sign_out" = "Cixis";
"change_language" = "Dili deyis";
"notification_settings" = "Bildiris parametrleri";

/* IB */
"myp" = "MYP";
"dp" = "DP";
"criterion" = "Kriteriya";
"ib_programme" = "IB Proqrami";
"national_curriculum" = "Milli kurikulum";

/* Admin */
"students_count" = "%d sagird";
"teachers_count" = "%d muellim";
"classes_count" = "%d sinif";
"add_student" = "Sagird elava et";
"add_teacher" = "Muellim elava et";
"create_class" = "Sinif yarat";
"post_announcement" = "Elan paylas";
```

Use `NSLocalizedString("key", comment: "")` or the SwiftUI `Text("key")` pattern with `.strings` files. Also create `en.lproj/Localizable.strings` and `ru.lproj/Localizable.strings` with translated equivalents.

---

## 18. File Structure

```
Zekalo/
  Zekalo.xcodeproj/
  Secrets.xcconfig                          # gitignored
  .gitignore                                # include Secrets.xcconfig
  Zekalo/
    ZekaloApp.swift                         # @main, auth routing
    ContentView.swift                       # fallback / loading
    Managers/
      SupabaseManager.swift                 # singleton, Supabase client
      CloudKitSyncManager.swift             # offline queue + flush
      NotificationManager.swift             # APNs registration + handling
    Models/
      School.swift
      Profile.swift
      Subject.swift
      SchoolClass.swift                     # named to avoid Swift Class collision
      ClassMember.swift
      TeacherClass.swift
      ParentChild.swift
      TimetableSlot.swift
      Grade.swift
      Attendance.swift
      Assignment.swift
      Submission.swift
      Message.swift
      AppNotification.swift                 # named to avoid system Notification collision
      ZekaConversation.swift
      IBExtendedEssay.swift
      Announcement.swift
      MinistryReport.swift
    Views/
      Auth/
        LoginView.swift
        SignUpView.swift
      Student/
        StudentTabView.swift
        StudentDashboard.swift
        ZekaChat.swift
        GradesView.swift
        AttendanceView.swift
        StudentProfile.swift
      Teacher/
        TeacherTabView.swift
        TeacherDashboard.swift
        GradebookView.swift
        AttendanceRegister.swift
        MessagesView.swift
        ReportsView.swift
      Parent/
        ParentTabView.swift
        ParentDashboard.swift
        ChildSwitcher.swift
        ParentGrades.swift
        ParentAttendance.swift
        ParentMessages.swift
        MenuBarExtra.swift                  # macOS only, #if os(macOS)
      Admin/
        AdminSplitView.swift
        AdminDashboard.swift
        StudentsAdmin.swift
        TeachersAdmin.swift
        ClassesAdmin.swift
        TimetableAdmin.swift
        AnnouncementsAdmin.swift
        IBPanelView.swift
        MinistryView.swift
        AnalyticsView.swift
        SettingsView.swift
      Shared/
        Avatar.swift
        Badge.swift
        StatCard.swift
        EmptyState.swift
    Extensions/
      Color+Brand.swift
      Date+Format.swift
    Resources/
      az.lproj/
        Localizable.strings
      en.lproj/
        Localizable.strings
      ru.lproj/
        Localizable.strings
```

---

## 19. Build Order

Follow this order strictly. Complete each step fully before moving to the next. Test each step by building and running.

### Step 1: Project Setup
1. Create a new Xcode project: multiplatform App, name "Zekalo", organization "com.zekalo"
2. Set deployment targets: iOS 16.0, macOS 13.0
3. Add SPM dependency: `https://github.com/supabase-community/supabase-swift`
4. Create `Secrets.xcconfig` at project root with placeholder values
5. Configure both Debug and Release to use `Secrets.xcconfig`
6. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `Info.plist`
7. Create the full folder structure listed above
8. Add `.gitignore` with `Secrets.xcconfig` entry
9. Create `Color+Brand.swift` and `Date+Format.swift` extensions
10. Create all model files

### Step 2: Auth
1. Create `SupabaseManager.swift`
2. Create `LoginView.swift` with full login logic
3. Create `SignUpView.swift` with all 4 steps
4. Set up auth state listener in `ZekaloApp.swift`
5. Route to correct tab view based on profile role
6. Test: login, signup, role-based routing

### Step 3: Student Dashboard + Grades + Attendance
1. Create `StudentTabView.swift`
2. Create `StudentDashboard.swift` with all sections
3. Create `GradesView.swift` with subject tabs and IB/national modes
4. Create `AttendanceView.swift` with calendar grid
5. Create `StudentProfile.swift` with all edit capabilities
6. Create shared components: `Avatar`, `StatCard`, `Badge`, `EmptyState`
7. Test: student login, dashboard data, grades list, attendance calendar

### Step 4: Zeka AI Chat
1. Create `ZekaChat.swift` with full streaming implementation
2. Implement conversation persistence to `zeka_conversations`
3. Add subject chips, language toggle, suggestion chips
4. Test: send message, see streaming response, switch conversations

### Step 5: Teacher Gradebook + Attendance
1. Create `TeacherTabView.swift`
2. Create `TeacherDashboard.swift`
3. Create `GradebookView.swift` with class/subject picker, student roster, inline editing
4. Create `AttendanceRegister.swift` with toggle buttons and batch save
5. Test: teacher login, enter grades, take attendance

### Step 6: Messages
1. Create `MessagesView.swift` with thread list and chat
2. Set up Supabase Realtime subscription for live messages
3. Add compose functionality
4. Test: send and receive messages in real time

### Step 7: Push Notifications
1. Create `NotificationManager.swift`
2. Add `AppDelegate` for iOS with token handling
3. Enable Push Notifications capability in Xcode
4. Implement deep link routing for all notification types
5. Test: receive notification, tap to navigate

### Step 8: CloudKit Offline Sync
1. Create `CloudKitSyncManager.swift`
2. Enable CloudKit capability in Xcode
3. Wire up grade saves and attendance saves to use offline queue
4. Test: toggle airplane mode, save grades, reconnect, verify sync

### Step 9: Parent App
1. Create `ParentTabView.swift`
2. Create `ChildSwitcher.swift`
3. Create `ParentDashboard.swift`
4. Create `ParentGrades.swift` and `ParentAttendance.swift` (reuse student views with child ID)
5. Create `ParentMessages.swift`
6. Test: parent login, switch children, view child data

### Step 10: Admin App
1. Create `AdminSplitView.swift` with full sidebar
2. Create `AdminDashboard.swift` with stats and charts
3. Create `StudentsAdmin.swift`, `TeachersAdmin.swift`, `ClassesAdmin.swift`
4. Create `TimetableAdmin.swift` (read-only)
5. Create `AnnouncementsAdmin.swift`, `IBPanelView.swift`, `MinistryView.swift`
6. Create `AnalyticsView.swift`, `SettingsView.swift`
7. Test: admin login, CRUD operations, charts

### Step 11: macOS Features
1. Add `NavigationSplitView` variants for teacher and parent apps on macOS
2. Create `MenuBarExtra.swift` for parent app
3. Add keyboard shortcuts (Cmd+N for new, Cmd+S for save, etc.)
4. Test: macOS build, menu bar extra, keyboard shortcuts

---

## 20. Features NOT in Native Apps

Do NOT implement these — they exist only in the web app:
- Timetable builder (admin web only — native shows read-only timetable)
- E-Gov.az submission UI (web only — native shows report status but cannot submit)
- Billing and subscription management
- Blog and marketing pages
- CSV import
- CEESA export

---

## 21. Key Implementation Notes

1. **IB vs National**: Always check `profile.edition` (or school's edition) to show IB criteria (A-D, 0-8) or national scores. Never mix them.

2. **Supabase RLS**: All queries automatically respect Row Level Security via the auth token. No client-side filtering needed for access control.

3. **Error handling**: Wrap every Supabase call in do/catch. Show user-friendly Azerbaijani error messages. Use the `EmptyState` component for empty data states.

4. **Loading states**: Every view that fetches data should show a `ProgressView()` while loading.

5. **Pull to refresh**: Add `.refreshable { }` to all scrollable data views.

6. **Haptic feedback**: Add `UIImpactFeedbackGenerator` for grade saves, attendance toggles, and message sends on iOS.

7. **Dark mode**: All brand colors should work in both light and dark mode. Use `.brandSurface` which should adapt. Test both modes.

8. **Accessibility**: Add `.accessibilityLabel()` to all icon-only buttons. Use Dynamic Type. Test with VoiceOver.

9. **iPad layout**: Use `NavigationSplitView` on iPad for teacher and admin apps. Use `.navigationSplitViewStyle(.balanced)`.

10. **Animations**: Use `.animation(.spring(), value:)` for tab switches, grade updates, and attendance toggles. Use `withAnimation { }` for state changes.

---

## 22. ContentView.swift (Loading / Router)

```swift
import SwiftUI

struct ContentView: View {
    @State private var isLoading = true
    @State private var currentProfile: Profile?

    var body: some View {
        Group {
            if isLoading {
                VStack {
                    Image(systemName: "graduationcap.fill")
                        .font(.system(size: 64))
                        .foregroundColor(.brandPurple)
                    Text("Zekalo")
                        .font(.largeTitle.bold())
                        .foregroundColor(.brandPurple)
                    ProgressView()
                        .padding(.top)
                }
            } else if let profile = currentProfile {
                switch profile.role {
                case "student": StudentTabView(profile: profile)
                case "teacher": TeacherTabView(profile: profile)
                case "parent":  ParentTabView(profile: profile)
                case "admin":   AdminSplitView(profile: profile)
                default:        LoginView()
                }
            } else {
                LoginView()
            }
        }
        .task {
            await checkExistingSession()
        }
    }

    private func checkExistingSession() async {
        defer { isLoading = false }
        guard let session = try? await SupabaseManager.shared.client.auth.session else { return }
        let profile: Profile? = try? await SupabaseManager.shared.client
            .from("profiles")
            .select()
            .eq("id", value: session.user.id.uuidString)
            .single()
            .execute()
            .value
        self.currentProfile = profile
    }
}
```

---

This is the complete specification. Build every file, every view, every model, every manager. Follow the build order. Use only the technologies listed. Match the database schema exactly. Ship a polished, production-ready native app for all four user roles on both iOS and macOS.
