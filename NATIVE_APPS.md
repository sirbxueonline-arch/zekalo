# Zekalo Native Apps — Internal Planning Document

> **Status:** Planning  
> **Last Updated:** 2026-04-12  
> **Audience:** Engineering team, product leads  
> **Confidential:** Internal use only

---

## 1. Overview

Zekalo is a school management SaaS platform built for Azerbaijan, serving both International Baccalaureate (IB) and government-curriculum schools. The platform manages grades, attendance, assignments, messaging, AI-powered tutoring (branded as "Zeka" / "Zeka"), and ministry reporting workflows including E-Gov.az integration.

The native apps will share a **single SwiftUI codebase** targeting **iOS 16+** and **macOS 13+** via a multi-platform Xcode project. The apps connect to the **same Supabase backend** already powering the web application — same database, same Row Level Security (RLS) policies, same Realtime channels, same Storage buckets.

### Goals

- Provide a fast, offline-capable experience for the four primary roles: Student, Teacher, Parent, and Admin.
- Leverage native platform capabilities (push notifications, CloudKit offline sync, macOS menu bar, iPad multitasking) that the web app cannot deliver.
- Maintain feature parity with the web app for day-to-day workflows while deferring administrative/bulk operations to the web interface.
- Deliver the Zeka AI tutor with a native streaming experience that feels responsive and conversational.

### Non-Goals

- The native apps are **not** a full replacement for the web admin panel. Heavy configuration tasks remain web-only (see Section 10).
- No plans for Android or Windows at this stage.

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| UI Framework | SwiftUI | Single codebase, conditional compilation for iOS/macOS/iPadOS |
| Language | Swift 5.9+ | Strict concurrency enabled, async/await throughout |
| IDE | Xcode 15+ | Multi-platform target configuration |
| Minimum Deployment | iOS 16 / macOS 13 (Ventura) | Required for NavigationSplitView, Swift concurrency improvements |
| Backend SDK | supabase-swift (SPM) | Auth, Database (PostgREST), Realtime, Storage |
| AI Streaming | URLSession + AsyncBytes | Direct calls to Claude API (claude-sonnet-4-6) for Zeka |
| Offline Sync | CloudKit (CKContainer) | Queue writes when offline, flush on reconnect |
| Push Notifications | APNs (Apple Push Notification service) | Server-side triggers via Supabase Edge Functions |
| Networking Monitor | NWPathMonitor (Network framework) | Detect connectivity changes for sync decisions |
| Package Manager | Swift Package Manager (SPM) | No CocoaPods or Carthage |
| Secrets Management | Secrets.xcconfig + .gitignore | Supabase URL, anon key, Claude API key |
| Charts | Swift Charts (native) | Analytics and grade distribution visualizations |
| PDF Generation | PDFKit | Report card and attendance report export |
| Keychain | Security framework | Token storage for auth sessions |

### SPM Dependencies

```
supabase-swift          — Supabase client (Auth, Database, Realtime, Storage)
```

All other functionality uses first-party Apple frameworks. No third-party UI libraries.

---

## 3. User Roles — Native Experience

Each role has a distinct navigation structure and feature set. The app reads the user's role from the `profiles` table after authentication and renders the appropriate interface.

---

### 3.1 Student (iPhone)

**Primary device:** iPhone  
**Navigation:** TabView with five tabs

#### Tabs and Screens

**Dashboard Tab**
- Personalized greeting using the student's first name and time of day ("Good morning, Aysel")
- Current streak counter (consecutive school days with full attendance)
- Quick stats row: current GPA or IB total points, attendance percentage, pending assignments count
- Upcoming deadlines list (next 3 assignments due)
- Recent grade cards (last 3 grades received, tappable to detail)

**Zeka AI Tab**
- Full-screen chat interface with the Zeka AI tutor
- Streaming responses rendered token-by-token in a SwiftUI Text view
- Message history persisted locally and synced via Supabase
- Subject-aware context: student can select a subject before asking a question
- Suggested prompts for common requests ("Explain this topic", "Help me with homework", "Quiz me")
- Conversation history list with ability to start new conversations
- Same system prompt and safety guardrails as the web version

**Grades Tab**
- Segmented control to switch between IB criteria view and national score view (if school supports both)
- IB view: subjects listed with criteria columns (A, B, C, D), each showing the latest criterion level (1-8)
- National view: subjects listed with numerical scores (1-10 or percentage)
- Tap a subject to see full grade history with trend chart (Swift Charts)
- Grade detail view showing teacher comments, rubric criteria, date, and assignment link

**Attendance Tab**
- Calendar view (month grid) with color-coded days: green (present), red (absent), yellow (late), gray (no school)
- Tap a day to see per-period attendance breakdown
- Summary stats at top: total present, absent, late, attendance percentage
- Current month shown by default with swipe navigation to previous months

**Assignments Tab**
- Segmented control: Upcoming / Past / All
- Each assignment card shows: title, subject, due date, status (not started, in progress, submitted, graded)
- Tap to open assignment detail with instructions, attachments, and submission area
- File upload for submissions using PhotosPicker or document picker
- Submission confirmation with timestamp

**Messages Tab**
- Conversation list sorted by most recent message
- Real-time updates via Supabase Realtime subscription
- Individual message threads with teachers
- Support for text messages and file attachments
- Unread badge count on tab icon

**Profile Tab**
- Student info (name, class, student ID, photo)
- Avatar upload via Supabase Storage
- Language preference (Azerbaijani / English)
- Notification preferences
- App version and logout

---

### 3.2 Teacher (iPhone + macOS)

**Primary devices:** iPhone for on-the-go, macOS for desk work  
**iPhone Navigation:** TabView with six tabs  
**macOS Navigation:** NavigationSplitView with sidebar

#### Tabs and Screens

**Dashboard Tab**
- Today's class schedule pulled from timetable data
- Each class card shows: subject, class name, room, time, student count
- Tap a class to jump directly to that class's gradebook or attendance register
- Quick action buttons: "Take Attendance", "Enter Grades"
- Notification summary: unread messages count, pending assignment submissions

**Gradebook Tab**
- Class picker at the top (dropdown or segmented control)
- Grid/list view of students with grade columns
- **IB mode:** Columns for each criterion (A, B, C, D) with inline editing — tap a cell, enter level 1-8
- **National mode:** Single score column with inline editing — tap a cell, enter score
- Batch save with optimistic UI update and background Supabase write
- Student row tap opens full grade history for that student
- Add new assessment: title, date, criteria/max score, weight
- Filter by term/semester
- macOS: full spreadsheet-style grid with keyboard navigation between cells

**Attendance Tab**
- Class picker and date picker at the top
- Student list with toggle buttons for each status: Present (default), Absent, Late
- All students default to Present — teacher taps to mark exceptions
- Bulk actions: "Mark All Present", "Mark All Absent"
- Submit button saves all attendance records in a single batch
- Visual confirmation with checkmark animation on save
- Historical view: calendar showing which days have been recorded

**Zeka AI Tab**
- Same chat interface as student but with teacher-specific capabilities
- Report writing assistant: teacher selects a student and subject, Zeka drafts IB-style report comments
- Essay feedback mode: teacher pastes or photographs student work, Zeka provides structured feedback
- Suggested prompts tailored to teacher workflows ("Write report for...", "Generate rubric for...", "Create quiz on...")

**Assignments Tab**
- List of created assignments with status summary (X submitted, Y graded)
- Create new assignment: title, description, subject, class, due date, attachments, rubric
- Review submissions: student list with submission status, tap to view/grade
- Inline grading with score entry and comment field

**Messages Tab**
- Conversation list with parents and students
- Class group messages
- Real-time updates via Supabase Realtime
- Quick parent contact from gradebook (tap student name, tap "Message Parent")

**Reports Tab**
- Generate report cards per student, per class, or per term
- PDF preview using PDFKit
- E-Gov report data preview (read-only — actual submission happens on web)
- Export options: PDF to Files, AirDrop, share sheet

**Analytics Tab (macOS primarily)**
- Class performance charts using Swift Charts
- Grade distribution histograms
- Attendance trends over time
- Comparison across classes taught
- Filter by term, subject, assessment type

**Timetable Tab**
- Weekly view of teacher's own schedule
- Read-only (editing is admin web only)
- Today's classes highlighted
- Tap a class to navigate to that class's gradebook

**Profile Tab**
- Teacher info, avatar upload, language preference
- Notification preferences (granular: grades, messages, attendance, assignments)
- Logout

---

### 3.3 Parent (iPhone + macOS)

**Primary devices:** iPhone for notifications and quick checks, macOS for deeper review  
**iPhone Navigation:** TabView with four tabs  
**macOS Navigation:** NavigationSplitView with sidebar + NSMenuBarExtra

#### Tabs and Screens

**Dashboard Tab**
- **Child switcher** at the top for parents with multiple children — horizontal scroll of child avatars or dropdown
- Selected child's summary: latest grades, attendance percentage, pending assignments
- Recent activity feed: "Aysel received 7 in Mathematics Criterion A", "Aysel was marked present today"
- Quick links to grades, attendance, assignments for selected child

**Grades Tab (read-only)**
- Same layout as student grades view but without any editing capability
- IB criteria view or national score view depending on school
- Full grade history with trend charts
- Teacher comments visible

**Attendance Tab (read-only)**
- Same calendar view as student
- Color-coded days with per-period breakdown on tap
- Attendance percentage summary

**Assignments Tab (read-only)**
- View assigned work and submission status
- See due dates and teacher feedback/grades
- Cannot submit on behalf of student

**Messages Tab**
- Direct messaging with child's teachers
- Conversation list sorted by recency
- Real-time updates via Supabase Realtime
- Ability to initiate new conversations with any of child's teachers

**Notifications Center**
- Chronological list of all push notifications received
- Categories: Grades, Attendance, Assignments, Messages, Announcements
- Filter by category and by child
- Tap to deep link to relevant screen

**Profile Tab**
- Parent info, avatar, language preference
- Child management: view linked children
- Notification preferences per child and per category
- Logout

#### macOS-Specific: Menu Bar Extra

- **NSMenuBarExtra** showing a small Zekalo icon in the macOS menu bar
- Clicking reveals a popover with:
  - Child switcher (if multiple children)
  - Latest grade received (subject, score, date)
  - Today's attendance status
  - Unread messages count with quick link to open main app
  - "Open Zekalo" button to launch the full app window
- Updates in near-real-time via Supabase Realtime subscription
- Lightweight — does not require the full app to be open

---

### 3.4 Admin (iPad + macOS only)

**Primary devices:** iPad (with keyboard) and macOS  
**Not available on iPhone** — admin workflows require larger screens  
**Navigation:** NavigationSplitView with three-column layout (sidebar, list, detail)

The admin native app mirrors the full web admin panel. All CRUD operations are supported.

#### Sidebar Sections

**Students**
- Searchable, filterable student list
- Student detail view with all profile fields
- Add new student form
- Edit student information
- Assign student to class
- View student's grades, attendance, assignments across all subjects

**Teachers**
- Searchable teacher list
- Teacher detail with assigned subjects and classes
- Add/edit teacher profiles
- Assign teachers to classes and subjects

**Classes**
- Class list with student count and assigned teachers
- Class detail showing roster and timetable
- Add/edit/archive classes
- Bulk student assignment to classes

**Timetable**
- Read-only timetable viewer for all classes
- Weekly grid view
- Note: Timetable builder/editor remains web-only at launch

**Reports**
- Generate school-wide reports
- Per-class and per-student report generation
- PDF export with school branding (logo from Supabase Storage)
- E-Gov report data preview (submission is web-only)
- Report history and archives

**Analytics**
- School-wide dashboards using Swift Charts
- Enrollment statistics
- Grade distributions across subjects and classes
- Attendance trends school-wide and per class
- Teacher workload metrics
- Exportable charts (share sheet)

**Announcements**
- Create school-wide or class-specific announcements
- Rich text input
- Schedule announcements for future delivery
- View sent announcements and read receipts

**IB Panel**
- IB-specific settings and reporting
- Criterion-based grading configuration
- IB learner profile tracking
- CAS (Creativity, Activity, Service) hours overview
- TOK and EE status tracking (if applicable)

**Ministry Panel**
- Ministry reporting data overview
- Student statistics required for government reporting
- Data validation before web-based submission
- Historical submission records

**Settings**
- School profile (name, logo, address, contact)
- Academic year and term configuration
- Grading system selection (IB, national, or hybrid)
- Feature flags (enable/disable modules)
- User role management

---

## 4. Supabase Swift Integration

### 4.1 SupabaseManager Singleton

All Supabase interactions go through a single manager class that initializes the client and exposes typed methods for each domain.

```swift
import Supabase

@MainActor
final class SupabaseManager {
    static let shared = SupabaseManager()

    let client: SupabaseClient

    private init() {
        guard let url = URL(string: Secrets.supabaseURL) else {
            fatalError("Invalid Supabase URL in Secrets.xcconfig")
        }
        client = SupabaseClient(
            supabaseURL: url,
            supabaseKey: Secrets.supabaseAnonKey
        )
    }
}
```

### 4.2 Secrets Management

Create a `Secrets.xcconfig` file (added to `.gitignore`) containing:

```
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIs...
CLAUDE_API_KEY = sk-ant-...
```

Access via a generated `Secrets.swift` enum:

```swift
enum Secrets {
    static let supabaseURL = Bundle.main.infoDictionary?["SUPABASE_URL"] as! String
    static let supabaseAnonKey = Bundle.main.infoDictionary?["SUPABASE_ANON_KEY"] as! String
    static let claudeAPIKey = Bundle.main.infoDictionary?["CLAUDE_API_KEY"] as! String
}
```

The `Info.plist` references `$(SUPABASE_URL)` etc. from the xcconfig.

### 4.3 Authentication

Email/password authentication using supabase-swift Auth module:

```swift
// Sign in
let session = try await SupabaseManager.shared.client.auth.signIn(
    email: email,
    password: password
)

// Get current user
let user = try await SupabaseManager.shared.client.auth.session.user

// Sign out
try await SupabaseManager.shared.client.auth.signOut()
```

After sign-in:
1. Fetch the user's profile from the `profiles` table to determine their role.
2. Fetch the school record to load school-specific settings (grading system, logo, name).
3. Route to the appropriate role-specific UI.

Session tokens are stored in the iOS Keychain automatically by supabase-swift. Sessions persist across app launches.

### 4.4 Realtime Subscriptions

Used for live updates on messages and notifications:

```swift
// Subscribe to new messages in a conversation
let channel = SupabaseManager.shared.client.realtime.channel("messages")

let subscription = channel.on(
    "postgres_changes",
    filter: .init(
        event: .insert,
        schema: "public",
        table: "messages",
        filter: "conversation_id=eq.\(conversationId)"
    )
) { payload in
    // Decode and append new message to the conversation
}

await channel.subscribe()
```

Active subscriptions:
- **Messages:** New messages in active conversations (all roles)
- **Notifications:** New notification records for the current user (all roles)
- **Grades:** New grade entries for parent/student dashboards
- **Attendance:** Today's attendance updates for parent dashboard

Subscriptions are managed by a `RealtimeManager` class that subscribes/unsubscribes based on the active screen and app lifecycle (foreground/background).

### 4.5 Storage

Supabase Storage is used for:
- **Avatars:** Profile photos uploaded by any user, stored in `avatars` bucket
- **School logos:** Uploaded by admin, stored in `school-assets` bucket
- **Assignment attachments:** Files uploaded by teachers and students

```swift
// Upload avatar
let fileData = image.jpegData(compressionQuality: 0.8)!
let path = "avatars/\(userId).jpg"
try await SupabaseManager.shared.client.storage
    .from("avatars")
    .upload(path: path, file: fileData, options: .init(contentType: "image/jpeg", upsert: true))
```

### 4.6 Database Queries

All queries use the supabase-swift PostgREST client. The same RLS policies from the web app apply — the native app sends the authenticated user's JWT, and Supabase enforces row-level access.

```swift
// Fetch grades for a student
let grades: [Grade] = try await SupabaseManager.shared.client
    .from("grades")
    .select("*, subjects(name), teachers(full_name)")
    .eq("student_id", value: studentId)
    .order("created_at", ascending: false)
    .execute()
    .value

// Insert attendance record
try await SupabaseManager.shared.client
    .from("attendance")
    .insert(AttendanceRecord(
        studentId: studentId,
        date: today,
        status: .present,
        period: 1,
        teacherId: currentTeacherId
    ))
    .execute()
```

Model structs conform to `Codable` and match the database schema exactly, using `CodingKeys` to map between Swift naming conventions and PostgreSQL snake_case columns.

---

## 5. Offline Support and CloudKit Sync

### 5.1 Architecture

Offline support ensures that teachers can record grades and attendance even without an internet connection (common in some Azerbaijani school environments). Writes are queued locally and flushed to Supabase when connectivity is restored.

### 5.2 CloudKitSyncManager

```swift
import CloudKit
import Network

final class CloudKitSyncManager: ObservableObject {
    static let shared = CloudKitSyncManager()

    private let container = CKContainer(identifier: "iCloud.com.zekalo.app")
    private let monitor = NWPathMonitor()
    private let monitorQueue = DispatchQueue(label: "com.zekalo.network-monitor")

    @Published var isOnline: Bool = true
    @Published var pendingWriteCount: Int = 0

    private var pendingWrites: [PendingWrite] = []

    func startMonitoring() {
        monitor.pathUpdateHandler = { [weak self] path in
            let online = path.status == .satisfied
            DispatchQueue.main.async {
                self?.isOnline = online
                if online {
                    Task { await self?.flushPendingWrites() }
                }
            }
        }
        monitor.start(queue: monitorQueue)
    }

    func queueWrite(_ write: PendingWrite) {
        pendingWrites.append(write)
        pendingWriteCount = pendingWrites.count
        savePendingWritesToCloudKit()
    }

    func flushPendingWrites() async {
        for write in pendingWrites {
            do {
                try await executeWrite(write)
                removePendingWrite(write)
            } catch {
                // Leave in queue for next attempt
                break
            }
        }
        pendingWriteCount = pendingWrites.count
    }
}
```

### 5.3 PendingWrite Model

```swift
struct PendingWrite: Identifiable, Codable {
    let id: UUID
    let table: String          // "grades" or "attendance"
    let operation: Operation   // .insert, .update
    let payload: Data          // JSON-encoded record
    let createdAt: Date
    let userId: String

    enum Operation: String, Codable {
        case insert, update
    }
}
```

### 5.4 CKRecord Mapping

Pending writes are stored as CKRecords in the user's private CloudKit database for cross-device persistence:

| CKRecord Field | Type | Source |
|---|---|---|
| `writeId` | String | PendingWrite.id |
| `table` | String | Target table name |
| `operation` | String | insert / update |
| `payload` | Data (CKAsset) | JSON-encoded record |
| `createdAt` | Date | Timestamp of offline action |
| `userId` | String | Authenticated user ID |

### 5.5 Conflict Resolution Strategy

- **Grades (server wins):** If a grade record was modified on the server between the offline write and the sync, the server version takes precedence. The user is notified that their offline entry was overridden and shown both values.
- **Attendance (merge):** Attendance records are merged. If the offline write and server record cover different periods, both are kept. If they conflict on the same period, the most recent timestamp wins.

### 5.6 Connectivity Monitoring

`NWPathMonitor` runs continuously in the background. On transition from offline to online:

1. `flushPendingWrites()` is called automatically.
2. Each pending write is attempted in chronological order.
3. Successful writes are removed from the CloudKit queue.
4. Failed writes remain queued for the next attempt.
5. A non-intrusive banner is shown: "X records synced" or "Sync failed — will retry".

### 5.7 Offline-Readable Data

In addition to write queuing, the app caches the following for offline read access using SwiftData or a local JSON cache:

- Student roster for teacher's classes
- Grade history for the current term
- Attendance records for the current week
- Timetable data
- Recent messages (last 50 per conversation)

Cache is refreshed on each app launch when online.

---

## 6. APNs Push Notifications

### 6.1 Registration Flow

1. On first launch after login, request notification permission via `UNUserNotificationCenter`.
2. On permission grant, register for remote notifications: `UIApplication.shared.registerForRemoteNotifications()`.
3. In `AppDelegate.application(_:didRegisterForRemoteNotificationsWithDeviceToken:)`, convert the device token to a hex string.
4. Upload the token to the `profiles` table:

```swift
try await SupabaseManager.shared.client
    .from("profiles")
    .update(["apns_token": tokenString])
    .eq("id", value: userId)
    .execute()
```

5. On token refresh (iOS may issue new tokens), repeat step 4.

### 6.2 Server-Side Triggers

Supabase Edge Functions (or database triggers + Edge Functions) send APNs payloads when:

| Event | Recipient | Payload Category |
|---|---|---|
| New grade entered | Student + Parent | `grade` |
| Absence recorded | Parent | `attendance` |
| New message received | Message recipient | `message` |
| Assignment due in 24h | Student | `assignment_reminder` |
| Assignment due in 1h | Student | `assignment_urgent` |
| New announcement | All school users | `announcement` |
| Report card published | Student + Parent | `report` |

### 6.3 Notification Payload Structure

```json
{
    "aps": {
        "alert": {
            "title": "New Grade in Mathematics",
            "body": "You received 7 in Criterion A"
        },
        "badge": 1,
        "sound": "default",
        "category": "grade"
    },
    "data": {
        "type": "grade",
        "gradeId": "uuid-here",
        "studentId": "uuid-here",
        "subjectName": "Mathematics"
    }
}
```

### 6.4 Deep Linking from Notification Tap

When a user taps a notification, the app extracts the `data` payload and navigates to the relevant screen:

| Notification Type | Deep Link Destination |
|---|---|
| `grade` | Grade detail view for the specific grade |
| `attendance` | Attendance calendar scrolled to the relevant date |
| `message` | Message thread for the conversation |
| `assignment_reminder` | Assignment detail view |
| `assignment_urgent` | Assignment detail view with due date highlighted |
| `announcement` | Announcement detail view |
| `report` | Report card PDF preview |

Deep linking is handled via a `DeepLinkRouter` that receives the notification payload and updates the app's navigation state:

```swift
@MainActor
final class DeepLinkRouter: ObservableObject {
    @Published var activeTab: AppTab = .dashboard
    @Published var navigationPath = NavigationPath()

    func handleNotification(_ userInfo: [AnyHashable: Any]) {
        guard let type = userInfo["type"] as? String else { return }

        switch type {
        case "grade":
            activeTab = .grades
            if let gradeId = userInfo["gradeId"] as? String {
                navigationPath.append(GradeDestination.detail(id: gradeId))
            }
        case "message":
            activeTab = .messages
            if let conversationId = userInfo["conversationId"] as? String {
                navigationPath.append(MessageDestination.thread(id: conversationId))
            }
        case "attendance":
            activeTab = .attendance
            // Calendar will scroll to relevant date
        default:
            break
        }
    }
}
```

### 6.5 Badge Management

- Badge count is updated server-side in the APNs payload.
- On app foreground, the badge is cleared: `UNUserNotificationCenter.current().setBadgeCount(0)`.
- Unread counts are tracked per category in the notifications table.

---

## 7. Zeka AI Streaming

### 7.1 Architecture

Zeka (the AI tutor) uses the Claude API directly from the native app. Responses are streamed token-by-token to provide a real-time conversational experience.

### 7.2 Streaming Implementation

```swift
final class ZekaStreamingService {
    private let apiKey = Secrets.claudeAPIKey
    private let endpoint = URL(string: "https://api.anthropic.com/v1/messages")!
    private let model = "claude-sonnet-4-6"

    func streamResponse(
        messages: [ZekaMessage],
        systemPrompt: String,
        onToken: @escaping (String) -> Void,
        onComplete: @escaping () -> Void,
        onError: @escaping (Error) -> Void
    ) async {
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")

        let body: [String: Any] = [
            "model": model,
            "max_tokens": 2048,
            "stream": true,
            "system": systemPrompt,
            "messages": messages.map { $0.toAPIFormat() }
        ]

        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        do {
            let (asyncBytes, response) = try await URLSession.shared.bytes(for: request)

            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                onError(ZekaError.apiError)
                return
            }

            for try await line in asyncBytes.lines {
                guard line.hasPrefix("data: ") else { continue }
                let jsonString = String(line.dropFirst(6))

                if jsonString == "[DONE]" {
                    onComplete()
                    return
                }

                if let data = jsonString.data(using: .utf8),
                   let event = try? JSONDecoder().decode(StreamEvent.self, from: data),
                   event.type == "content_block_delta",
                   let text = event.delta?.text {
                    await MainActor.run {
                        onToken(text)
                    }
                }
            }
        } catch {
            onError(error)
        }
    }
}
```

### 7.3 SwiftUI Integration

The chat view model accumulates tokens and triggers UI updates:

```swift
@MainActor
@Observable
final class ZekaChatViewModel {
    var messages: [ZekaMessage] = []
    var currentStreamingText: String = ""
    var isStreaming: Bool = false

    private let service = ZekaStreamingService()

    func sendMessage(_ text: String) async {
        let userMessage = ZekaMessage(role: .user, content: text)
        messages.append(userMessage)
        isStreaming = true
        currentStreamingText = ""

        await service.streamResponse(
            messages: messages,
            systemPrompt: ZekaPrompts.systemPrompt,
            onToken: { [weak self] token in
                self?.currentStreamingText += token
            },
            onComplete: { [weak self] in
                guard let self else { return }
                let assistantMessage = ZekaMessage(
                    role: .assistant,
                    content: self.currentStreamingText
                )
                self.messages.append(assistantMessage)
                self.currentStreamingText = ""
                self.isStreaming = false
                // Persist conversation to Supabase
                Task { await self.saveConversation() }
            },
            onError: { [weak self] error in
                self?.isStreaming = false
                // Show error state
            }
        )
    }
}
```

The SwiftUI Text view renders the streaming text with a cursor animation:

```swift
Text(viewModel.currentStreamingText)
    .textSelection(.enabled)
    + Text(viewModel.isStreaming ? "|" : "")
    .foregroundColor(.accentColor)
    .opacity(cursorOpacity) // Animated blink
```

### 7.4 System Prompt

The Zeka system prompt is identical to the web version. It is stored in a `ZekaPrompts.swift` file and includes:

- Role definition: AI tutor for Azerbaijani school students
- Language handling: responds in the language the student uses (Azerbaijani or English)
- Subject awareness: adjusts explanations based on student's grade level and curriculum (IB or national)
- Safety guardrails: does not complete homework, guides learning through questions
- Teacher mode additions: report writing, essay feedback, rubric generation

### 7.5 Conversation Persistence

Conversations are saved to the `zeka_conversations` and `zeka_messages` tables in Supabase after each exchange. On app launch, the most recent conversations are fetched and displayed in the conversation list.

---

## 8. macOS-Specific Features

### 8.1 NavigationSplitView Layout

All macOS views use `NavigationSplitView` for a native sidebar experience:

```swift
NavigationSplitView {
    SidebarView()
} content: {
    ContentListView()
} detail: {
    DetailView()
}
.navigationSplitViewStyle(.balanced)
```

The sidebar contains role-appropriate navigation items matching the tab structure on iOS.

### 8.2 NSMenuBarExtra for Parents

Parents get a lightweight menu bar presence:

```swift
@main
struct ZekaloApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }

        #if os(macOS)
        MenuBarExtra("Zekalo", systemImage: "graduationcap.fill") {
            MenuBarView()
        }
        .menuBarExtraStyle(.window)
        #endif
    }
}
```

`MenuBarView` contains:
- Child switcher (picker)
- Latest grade display (subject, score, date)
- Today's attendance status
- Unread messages count
- "Open Zekalo" button

The menu bar extra maintains its own lightweight Supabase Realtime subscription to keep data current without the main window being open.

### 8.3 Keyboard Shortcuts

| Shortcut | Action | Scope |
|---|---|---|
| Cmd+N | New message | Messages screen |
| Cmd+G | Open gradebook | Teacher, anywhere |
| Cmd+A | Open attendance | Teacher, anywhere |
| Cmd+F | Search / Find | Global |
| Cmd+1...6 | Switch sidebar sections | Global |
| Cmd+R | Refresh current view | Global |
| Cmd+P | Print / Export PDF | Reports |
| Cmd+, | Open preferences | Global |
| Esc | Close detail panel / Cancel | Global |

Implemented via `.keyboardShortcut()` modifier on buttons and `Commands` menu customization:

```swift
.commands {
    CommandGroup(replacing: .newItem) {
        Button("New Message") {
            router.navigate(to: .newMessage)
        }
        .keyboardShortcut("n", modifiers: .command)
    }

    CommandMenu("Zekalo") {
        Button("Gradebook") {
            router.navigate(to: .gradebook)
        }
        .keyboardShortcut("g", modifiers: .command)

        Button("Attendance") {
            router.navigate(to: .attendance)
        }
        .keyboardShortcut("a", modifiers: .command)
    }
}
```

### 8.4 Window Management

- Minimum window size: 900x600
- Default window size: 1200x800
- Support for multiple windows (teacher can have gradebook and messages open simultaneously)
- Full screen support
- Proper resizing behavior with adaptive layouts

```swift
WindowGroup {
    ContentView()
}
.defaultSize(width: 1200, height: 800)
.defaultPosition(.center)
#if os(macOS)
.windowResizability(.contentMinSize)
#endif
```

### 8.5 macOS Admin Experience

The Admin role on macOS gets the most expansive layout:
- Three-column NavigationSplitView (sidebar, list, detail)
- Toolbar with contextual actions
- Table views with sortable columns for student/teacher lists
- Drag-and-drop for class assignments (drag student to class)
- Right-click context menus on list items
- Touch Bar support (if applicable) for quick actions

---

## 9. Build Order

Development is phased to deliver incremental value, with each phase building on the previous one. Each phase includes unit tests and UI tests for the features delivered.

### Phase 1: Auth Flow + School Picker
**Duration estimate:** 2 weeks

- Xcode project setup with multi-platform target (iOS + macOS)
- SPM integration of supabase-swift
- Secrets.xcconfig configuration
- SupabaseManager singleton
- Login screen (email + password)
- Session persistence via Keychain
- Post-login profile fetch to determine role
- School picker for users associated with multiple schools
- Role-based navigation routing (show correct UI per role)
- Basic app shell with tab bar (iOS) and sidebar (macOS)
- Error handling and loading states

**Deliverable:** User can log in, see their role, and land on an empty dashboard.

---

### Phase 2: Student App (Dashboard, Grades, Attendance, Profile)
**Duration estimate:** 3 weeks

- Student dashboard with greeting, streak, and stats
- Grades list view with subject grouping
- Grade detail view with history and teacher comments
- IB criteria view (columns A, B, C, D with levels 1-8)
- National score view (numerical scores)
- Grade trend chart using Swift Charts
- Attendance calendar view with color coding
- Attendance detail per day (period breakdown)
- Profile screen with avatar upload to Supabase Storage
- Language preference toggle (Azerbaijani / English)
- Pull-to-refresh on all data screens
- Loading skeletons and empty states

**Deliverable:** Students can view all their academic data natively.

---

### Phase 3: Zeka AI Chat with Streaming
**Duration estimate:** 2 weeks

- ZekaStreamingService with URLSession AsyncBytes
- ZekaChatViewModel with token accumulation
- Chat UI with message bubbles (user and assistant)
- Streaming text display with cursor animation
- Conversation list and new conversation creation
- System prompt integration (same as web)
- Subject selector before asking questions
- Suggested prompt chips
- Conversation persistence to Supabase
- Error handling (network errors, API rate limits)
- Teacher-specific Zeka features (report writing, essay feedback)

**Deliverable:** Zeka AI works natively with streaming responses for both students and teachers.

---

### Phase 4: Teacher Gradebook + Attendance
**Duration estimate:** 3 weeks

- Teacher dashboard with today's schedule
- Class picker component
- Gradebook list/grid view
- Inline grade editing (tap cell, enter value, save)
- IB criteria columns with level picker (1-8)
- National score entry with validation
- New assessment creation form
- Batch save with optimistic UI updates
- Attendance register with student list
- Toggle buttons for Present/Absent/Late
- Bulk attendance actions (Mark All Present)
- Attendance submission with confirmation
- Historical attendance view

**Deliverable:** Teachers can enter grades and take attendance natively.

---

### Phase 5: Messages with Realtime
**Duration estimate:** 2 weeks

- Conversation list screen (all roles)
- Message thread view with bubbles
- Compose and send messages
- File attachment support (images, documents)
- Supabase Realtime subscription for live message updates
- Unread message badges
- New conversation initiation
- Parent-teacher messaging
- Student-teacher messaging
- Typing indicators (optional, via Realtime presence)

**Deliverable:** All users can send and receive messages in real time.

---

### Phase 6: Push Notifications
**Duration estimate:** 2 weeks

- APNs registration and token upload
- Supabase Edge Function for sending notifications
- Notification categories: grade, attendance, message, assignment, announcement
- Deep linking from notification tap via DeepLinkRouter
- Badge count management
- Notification preferences screen (per category toggle)
- Background notification handling
- Rich notifications with images (school logo)

**Deliverable:** Users receive push notifications for all key events and tap to navigate directly to the relevant content.

---

### Phase 7: Offline / CloudKit Sync
**Duration estimate:** 3 weeks

- CloudKitSyncManager implementation
- PendingWrite model and CKRecord mapping
- NWPathMonitor for connectivity detection
- Write queuing for grades and attendance
- Flush-on-reconnect logic
- Conflict resolution (server wins for grades, merge for attendance)
- Sync status indicator in UI (banner or icon)
- Local data caching for offline reads (SwiftData or JSON file cache)
- Cache invalidation on reconnect
- Comprehensive error handling and retry logic

**Deliverable:** Teachers can record grades and attendance offline; data syncs automatically when connectivity returns.

---

### Phase 8: Parent App
**Duration estimate:** 2 weeks

- Parent-specific navigation and dashboard
- Child switcher component (horizontal scroll or dropdown)
- Read-only grades view (reuse student grades components)
- Read-only attendance view (reuse student attendance components)
- Read-only assignments view
- Activity feed for selected child
- Notification center with category filtering
- Parent profile and preferences
- All parent screens are read-only with no edit capabilities

**Deliverable:** Parents can monitor their children's academic progress and communicate with teachers.

---

### Phase 9: Admin iPad/macOS App
**Duration estimate:** 4 weeks

- Admin-only app gate (role check, iPad/macOS only)
- Three-column NavigationSplitView layout
- Students CRUD (list, detail, create, edit)
- Teachers CRUD (list, detail, create, edit)
- Classes management (list, roster, assign students/teachers)
- Timetable viewer (read-only)
- Reports generation with PDF export
- School-wide analytics dashboards (Swift Charts)
- Announcements management (create, schedule, view)
- IB Panel screens
- Ministry Panel screens (data preview, validation)
- Settings screens (school profile, academic year, grading system)
- Search across all entities

**Deliverable:** Admins can manage the school through a native iPad/macOS interface with full CRUD capabilities.

---

### Phase 10: macOS-Specific Features
**Duration estimate:** 2 weeks

- NSMenuBarExtra for parents (latest grade, attendance, unread count)
- Menu bar Realtime subscription
- Keyboard shortcuts (Cmd+N, Cmd+G, etc.)
- Custom Commands menus
- Multi-window support for teachers
- Drag-and-drop in admin class management
- Right-click context menus
- Touch Bar support (if applicable)
- Window size and position persistence
- macOS-specific UI polish (sidebar icons, toolbar styling)

**Deliverable:** macOS app feels like a first-class Mac citizen with platform-specific interactions.

---

### Total Estimated Timeline

| Phase | Duration | Cumulative |
|---|---|---|
| Phase 1: Auth + School Picker | 2 weeks | 2 weeks |
| Phase 2: Student App | 3 weeks | 5 weeks |
| Phase 3: Zeka AI | 2 weeks | 7 weeks |
| Phase 4: Teacher Gradebook | 3 weeks | 10 weeks |
| Phase 5: Messages | 2 weeks | 12 weeks |
| Phase 6: Push Notifications | 2 weeks | 14 weeks |
| Phase 7: Offline Sync | 3 weeks | 17 weeks |
| Phase 8: Parent App | 2 weeks | 19 weeks |
| Phase 9: Admin App | 4 weeks | 23 weeks |
| Phase 10: macOS Features | 2 weeks | 25 weeks |

**Total: approximately 25 weeks (6 months)** for a single iOS/macOS developer. With two developers working in parallel on independent phases, this can be compressed to approximately 14-16 weeks.

---

## 10. NOT in Native at Launch

The following features are intentionally excluded from the native apps at launch. They will remain web-only.

| Feature | Reason |
|---|---|
| **Timetable builder** | Complex drag-and-drop grid UI is better suited for web. Admin can view timetables natively but must build/edit on web. |
| **E-Gov.az submit UI** | Government portal integration requires web browser interaction and complex form submission. Data preview is available natively, but actual submission is web-only. |
| **Billing / Subscription management** | Stripe integration and subscription management is handled via the web dashboard. If App Store billing is added later, it would be a separate effort. |
| **Blog / Marketing pages** | Public-facing marketing content is served by the web app. The native app is for authenticated users only. |
| **CSV import** | Bulk data import (students, teachers, grades) requires file parsing and validation workflows better suited for web. |
| **CEESA export** | CEESA (Central and Eastern European Schools Association) data export is a specialized administrative function that does not justify native development at this stage. |
| **School onboarding wizard** | Initial school setup (creating the school, configuring grading system, uploading logo) is done via the web admin panel. |
| **User invitation flow** | Inviting new users (sending email invitations, setting up accounts) remains web-only. |
| **Advanced analytics / custom reports** | While basic charts are available natively, advanced analytics with custom date ranges, filters, and export options remain web-only. |

### Future Considerations

- **Widgets (iOS/macOS):** WidgetKit extensions for home screen widgets showing grade summary, attendance status, and next class. Planned for a post-launch update.
- **Apple Watch:** Complication showing next class and attendance status. Low priority, evaluated based on user demand.
- **SharePlay:** Collaborative study sessions using Zeka AI. Experimental, not planned.
- **App Clips:** Quick attendance check-in at school entrance via NFC. Explored if schools adopt NFC infrastructure.
- **Siri Integration:** "Hey Siri, what's my GPA?" via App Intents framework. Planned for a post-launch update.

---

## Appendix A: Project Structure

```
Zekalo/
├── ZekaloApp.swift                    # App entry point, scene configuration
├── Secrets.xcconfig                   # API keys (gitignored)
├── Info.plist                         # References xcconfig values
├── Assets.xcassets/                   # App icons, colors, images
├── Core/
│   ├── SupabaseManager.swift          # Supabase client singleton
│   ├── RealtimeManager.swift          # Realtime subscription management
│   ├── CloudKitSyncManager.swift      # Offline sync manager
│   ├── DeepLinkRouter.swift           # Notification deep linking
│   ├── Secrets.swift                  # Secrets enum reading from bundle
│   └── NetworkMonitor.swift           # NWPathMonitor wrapper
├── Models/
│   ├── Profile.swift                  # User profile (Codable)
│   ├── Grade.swift                    # Grade record
│   ├── Attendance.swift               # Attendance record
│   ├── Assignment.swift               # Assignment record
│   ├── Message.swift                  # Message record
│   ├── Conversation.swift             # Conversation record
│   ├── School.swift                   # School configuration
│   ├── Subject.swift                  # Subject record
│   ├── ClassGroup.swift               # Class/section record
│   ├── Timetable.swift                # Timetable entry
│   ├── Announcement.swift             # Announcement record
│   ├── ZekaMessage.swift              # Zeka conversation message
│   └── PendingWrite.swift             # Offline write queue item
├── Services/
│   ├── AuthService.swift              # Login, logout, session management
│   ├── GradesService.swift            # Grade CRUD operations
│   ├── AttendanceService.swift        # Attendance CRUD operations
│   ├── AssignmentsService.swift       # Assignment CRUD operations
│   ├── MessagesService.swift          # Message operations
│   ├── ZekaStreamingService.swift     # Claude API streaming client
│   ├── NotificationService.swift      # APNs registration and handling
│   ├── StorageService.swift           # Supabase Storage operations
│   └── ReportsService.swift           # PDF generation and export
├── ViewModels/
│   ├── AuthViewModel.swift
│   ├── DashboardViewModel.swift
│   ├── GradesViewModel.swift
│   ├── AttendanceViewModel.swift
│   ├── GradebookViewModel.swift
│   ├── ZekaChatViewModel.swift
│   ├── MessagesViewModel.swift
│   ├── AssignmentsViewModel.swift
│   └── AdminViewModel.swift
├── Views/
│   ├── Auth/
│   │   ├── LoginView.swift
│   │   └── SchoolPickerView.swift
│   ├── Student/
│   │   ├── StudentTabView.swift
│   │   ├── StudentDashboardView.swift
│   │   ├── GradesListView.swift
│   │   ├── GradeDetailView.swift
│   │   ├── AttendanceCalendarView.swift
│   │   └── AssignmentDetailView.swift
│   ├── Teacher/
│   │   ├── TeacherTabView.swift
│   │   ├── TeacherDashboardView.swift
│   │   ├── GradebookView.swift
│   │   ├── GradebookCellView.swift
│   │   ├── AttendanceRegisterView.swift
│   │   └── ReportsView.swift
│   ├── Parent/
│   │   ├── ParentTabView.swift
│   │   ├── ParentDashboardView.swift
│   │   ├── ChildSwitcherView.swift
│   │   └── NotificationCenterView.swift
│   ├── Admin/
│   │   ├── AdminSplitView.swift
│   │   ├── StudentsListView.swift
│   │   ├── TeachersListView.swift
│   │   ├── ClassesListView.swift
│   │   ├── AnalyticsDashboardView.swift
│   │   ├── AnnouncementsView.swift
│   │   └── SettingsView.swift
│   ├── Zeka/
│   │   ├── ZekaChatView.swift
│   │   ├── ZekaMessageBubble.swift
│   │   └── ZekaConversationListView.swift
│   ├── Messages/
│   │   ├── ConversationListView.swift
│   │   ├── MessageThreadView.swift
│   │   └── ComposeMessageView.swift
│   ├── Shared/
│   │   ├── ProfileView.swift
│   │   ├── AvatarView.swift
│   │   ├── LoadingView.swift
│   │   ├── EmptyStateView.swift
│   │   └── ErrorView.swift
│   └── macOS/
│       ├── MenuBarView.swift
│       └── SidebarView.swift
├── Extensions/
│   ├── Date+Zekalo.swift
│   ├── Color+Zekalo.swift
│   └── View+Zekalo.swift
└── Tests/
    ├── ZekaloTests/
    └── ZekaloUITests/
```

---

## Appendix B: Environment and Build Configuration

### Build Schemes

| Scheme | Configuration | API Target |
|---|---|---|
| Zekalo Debug | Debug | Supabase development project |
| Zekalo Staging | Release | Supabase staging project |
| Zekalo Release | Release | Supabase production project |

### Xcconfig Files

```
// Debug.xcconfig
SUPABASE_URL = https://dev-xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJ...dev
CLAUDE_API_KEY = sk-ant-...dev

// Staging.xcconfig
SUPABASE_URL = https://staging-xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJ...staging
CLAUDE_API_KEY = sk-ant-...staging

// Release.xcconfig
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJ...prod
CLAUDE_API_KEY = sk-ant-...prod
```

All xcconfig files are listed in `.gitignore`. A `Secrets.xcconfig.example` is committed with placeholder values for developer onboarding.

---

## Appendix C: Localization

The app supports two languages:

| Language | Code | Usage |
|---|---|---|
| Azerbaijani | `az` | Primary language for government schools |
| English | `en` | Primary language for IB/international schools |

- All user-facing strings are in `Localizable.strings` files organized by language.
- The app respects the user's language preference stored in their profile, not the device language.
- Zeka AI responds in whichever language the student uses in the conversation.
- Date and number formatting respects the selected locale.
- Right-to-left layout is not required (neither Azerbaijani nor English is RTL).

---

*End of document.*
