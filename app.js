
    
        import {
    app,
    db,
    auth,
    PATIENT_ID,
    signInWithEmailAndPassword,
    collection,
    addDoc,
    getDocs,
    query,
    getDoc,
    doc,
    where,
    serverTimestamp,
    deleteDoc,
    setDoc
} from "./firebase.js";

        
            

        // Analytics
        import { getAnalytics }
            from "https://www.gstatic.com/firebasejs/12.18.0/firebase-analytics.js";
            // FCM
import {
    getMessaging,
    getToken,
    onMessage
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging.js";
const messaging = getMessaging(app);
            
        // App Check
import {
    initializeAppCheck,
    ReCaptchaEnterpriseProvider
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-check.js";
// Firebase AI Logic
import {
    getAI,
    getGenerativeModel,
    GoogleAIBackend
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-ai.js";
        


        
        // ================================
// FCM NOTIFICATIONS
// ================================

const VAPID_KEY =
    "BEDkJXDRip7D_j2rKuNK2Br_SsBG_qTybDJj5GwqIwpMKTtHIvOHkL3lYs2pDUVedd322BOb7_63xhrEpEaKsi8";

// Store token until the user logs in
let pendingFCMToken = null;


// Save FCM token to the currently logged-in user
async function saveFCMToken(token) {

    const currentUser = auth.currentUser;

    if (!currentUser) {
        console.error("❌ No logged-in user found.");
        return;
    }

    try {

        await setDoc(
            doc(db, "users", currentUser.uid),
            {
                fcmToken: token
            },
            {
                merge: true
            }
        );

        console.log("✅ FCM token saved to Firestore.");

    } catch (error) {

        console.error(
            "❌ Error saving FCM token:",
            error
        );

    }
}


// Request notification permission
Notification.requestPermission().then(async (permission) => {

    if (permission !== "granted") {

        console.log(
            "🔕 Notification permission not granted."
        );

        return;
    }

    console.log(
        "🔔 Notification permission granted!"
    );

    try {

        const token = await getToken(
            messaging,
            {
                vapidKey: VAPID_KEY
            }
        );

        if (!token) {

            console.log(
                "⚠️ No FCM registration token available."
            );

            return;
        }

        console.log(
            "🔥 FCM Token generated."
        );

        // Check whether user is already logged in
        if (auth.currentUser) {

            await saveFCMToken(token);

        } else {

            // User hasn't logged in yet.
            // Keep token temporarily.
            pendingFCMToken = token;

            console.log(
                "⏳ FCM token waiting for login..."
            );
        }

    } catch (error) {

        console.error(
            "❌ Error getting FCM token:",
            error
        );

    }

});
        // ================================
// AUTHENTICATION
// ================================

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginMessage =
    document.getElementById("loginMessage");

async function loginUser(role) {

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    if (!email || !password) {
        loginMessage.textContent =
            "Please enter your email and password.";
        return;
    }

    loginMessage.textContent =
        "Signing in...";

    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        // Get user's role from Firestore
        const userDoc = await getDoc(
            doc(db, "users", user.uid)
        );

        if (!userDoc.exists()) {

            loginMessage.textContent =
                "User role not found.";

            await auth.signOut();
            return;
        }

        const userData = userDoc.data();
        const actualRole = userData.role;

        console.log(
            "Logged in:",
            user.email,
            "Role:",
            actualRole
        );

        // Check selected login against actual role
        if (actualRole !== role) {

            loginMessage.textContent =
                "This account is not registered for this login.";

            await auth.signOut();
            return;
        }

        loginMessage.textContent =
            "Login successful!";
            if (pendingFCMToken) {
    await saveFCMToken(pendingFCMToken);
    pendingFCMToken = null;
}

        console.log(
            "✅ Correct role:",
            actualRole
        );
        // Hide login screen
document.getElementById("loginSection").style.display = "none";

// Show application
document.getElementById("appHeader").style.display = "block";
document.getElementById("appMain").style.display = "block";

// Role-based interface
const caregiverSection =
    document.getElementById("caregiverSection");

const progressSection =
    document.getElementById("progressSection");

const caregiverBtn =
    document.getElementById("caregiverBtn");

const cognitiveActivityCard =
    document.getElementById("cognitiveActivityCard");

if (actualRole === "patient") {

    // Patient should not access caregiver dashboard
    if (caregiverBtn) {
        caregiverBtn.parentElement.style.display = "none";
    }

    console.log("👴 Patient view enabled.");

} else if (actualRole === "caregiver") {

    

    // Hide cognitive activity from caregiver
if (cognitiveActivityCard) {
    cognitiveActivityCard.style.display = "none";
}
// Hide Caregiver Area button because
// caregiver features are already shown directly
if (caregiverBtn) {
    caregiverBtn.parentElement.style.display = "none";
}
// Show Create Reminder directly for caregiver
const createReminderSection =
    document.getElementById("createReminderSection");

if (createReminderSection) {
    createReminderSection.style.display = "block";
}
// Show Caregiver Dashboard directly
if (caregiverSection) {
    caregiverSection.style.display = "block";
}

loadCaregiverDashboard(); 
loadCaregiverReminders();

console.log("👨‍👩‍👧 Caregiver view enabled.");
}

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        loginMessage.textContent =
            "Invalid email or password.";
    }
}


document
    .getElementById("patientLoginBtn")
    .addEventListener("click", () => {

        loginUser("patient");

    });


document
    .getElementById("caregiverLoginBtn")
    .addEventListener("click", () => {

        loginUser("caregiver");

    });
    // ================================
// ================================
// CAREGIVER AREA BUTTON
// ================================

const caregiverAreaButton =
    document.getElementById("caregiverBtn");

if (caregiverAreaButton) {

    caregiverAreaButton.addEventListener("click", () => {

        console.log("🔥 CAREGIVER AREA CLICKED");

        const caregiverSection =
            document.getElementById("caregiverSection");

        const createReminderSection =
            document.getElementById("createReminderSection");

        if (caregiverSection) {
            caregiverSection.style.display = "block";
        }

        if (createReminderSection) {
            createReminderSection.style.display = "block";
        }

        // Defensive: ensure dashboard data loads if this
        // legacy entry point is ever clicked.
        if (typeof loadCaregiverDashboard === "function") {
            loadCaregiverDashboard();
        }
        if (typeof loadCaregiverReminders === "function") {
            loadCaregiverReminders();
        }

        console.log("🔔 Caregiver dashboard / reminders opened.");

    });

}
        // Initialize App Check
        initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider(
                "6LcWg5stAAAAALngrRuWkZcle7fyTtMweFFZOOgM"
            ),
            isTokenAutoRefreshEnabled: true
        });


        // Analytics
        getAnalytics(app);


        // Gemini
        const ai = getAI(app, {
            backend: new GoogleAIBackend()
        });

        const model = getGenerativeModel(ai, {
            model: "gemini-3.5-flash"
        });


        console.log("Cognitive Gaming Firebase + Gemini ready!");


        // Gemini Assistant
        document
            .getElementById("askGemini")
            .addEventListener("click", async () => {

                const prompt =
                    document.getElementById("prompt").value.trim();

                const responseElement =
                    document.getElementById("response");


                if (!prompt) {
                    responseElement.textContent =
                        "Please type a question first.";
                    return;
                }


                responseElement.textContent =
                    "The assistant is thinking...";


                try {

                    const result =
                        await model.generateContent(
                            `You are a friendly memory assistance AI
                             for an elderly user.

                             Give simple, clear and supportive answers.
                             Do not diagnose medical conditions.
                             Do not give medical treatment instructions.

                             User question:
                             ${prompt}`
                        );


                    responseElement.textContent =
                        result.response.text();


                } catch (error) {

                    console.error("Gemini error:", error);

                    responseElement.textContent =
                        "Sorry, the assistant could not respond right now.";
                }

            });


        // ================================
// REMINDERS
// ================================

document
    .getElementById("reminderBtn")
    .addEventListener("click", async () => {

        const remindersSection =
            document.getElementById("remindersSection");

        const remindersContent =
            document.getElementById("remindersContent");

        // Show Reminders page
        remindersSection.style.display = "block";

        remindersSection.scrollIntoView({
            behavior: "smooth"
        });
        routineTimeOptions.style.display = "grid";

        remindersContent.innerHTML =
            "Loading reminders...";

        try {

            const reminderQuery = query(
                collection(db, "reminders"),
                where("patientId", "==", PATIENT_ID)
            );

            const snapshot =
                await getDocs(reminderQuery);

            if (snapshot.empty) {

                remindersContent.innerHTML =
                    "<p>No reminders found.</p>";

                return;
            }

            const reminders = [];

            snapshot.forEach((doc) => {

                reminders.push({
                    id: doc.id,
                    ...doc.data()
                });

            });

            // Sort reminders by date and time
            reminders.sort((a, b) => {

    const getDateTime = (reminder) => {

        if (reminder.date && reminder.time) {
            return new Date(
                `${reminder.date}T${reminder.time}`
            );
        }

        if (reminder.time && reminder.time.toDate) {
            return reminder.time.toDate();
        }

        return new Date(0);
    };

    return getDateTime(a) - getDateTime(b);

});

            let html = "";

const now = new Date();

reminders.forEach((reminder) => {

    let reminderDate;
    let reminderTime;
    let reminderDateTime;

    // New reminder format
    if (reminder.date && reminder.time) {

        reminderDate =
            reminder.date;

        reminderTime =
            reminder.time;

        reminderDateTime =
            new Date(
                `${reminder.date}T${reminder.time}`
            );

    }

    // Old reminder format
    else if (reminder.time && reminder.time.toDate) {

        const oldDate =
            reminder.time.toDate();

        reminderDate =
            oldDate.toISOString().split("T")[0];

        reminderTime =
            oldDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

        reminderDateTime =
            oldDate;

    }

    else {

        reminderDate = "-";
        reminderTime = "-";
        reminderDateTime = new Date(0);

    }

    const isPast =
        reminderDateTime < now;

    const isToday =
        reminder.date ===
        new Date().toISOString().split("T")[0];

    let statusText = "Upcoming";
let statusStyle =
    "background: #eef3ff; color: #3157d5;";

// Reminder is due if its scheduled time has arrived
const isDue =
    reminderDateTime <= now &&
    reminderDateTime > new Date(now.getTime() - 5 * 60 * 1000);

if (isDue) {

    statusText = "🔔 Due Now";
    statusStyle =
        "background: #fff3cd; color: #946200;";

} else if (isPast) {

    statusText = "Passed";
    statusStyle =
        "background: #f1f3f5; color: #657184;";

} else if (isToday) {

    statusText = "Today";
    statusStyle =
        "background: #e8f7ee; color: #23864b;";

}

    html += `
        <div style="
            background: white;
            border: 1px solid #dce2ea;
            border-radius: 18px;
            padding: 20px;
            margin-top: 16px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        ">

            <div style="
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 15px;
            ">

                <div>

                    <h3 style="
                        margin: 0 0 8px;
                        font-size: 22px;
                    ">
                        🔔 ${reminder.title}
                    </h3>

                    <p style="
                        margin: 0;
                        color: #526070;
                        font-size: 16px;
                    ">
                        ${reminder.type || "Reminder"}
                    </p>

                </div>

                <span style="
                    ${statusStyle}
                    padding: 7px 12px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: bold;
                    white-space: nowrap;
                ">
                    ${statusText}
                </span>

            </div>

            <div style="
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 18px;
">

    <div style="
        background: #f4f7fb;
        padding: 10px 14px;
        border-radius: 10px;
        font-size: 15px;
    ">
        📅 ${reminderDate}
    </div>

    <div style="
        background: #f4f7fb;
        padding: 10px 14px;
        border-radius: 10px;
        font-size: 15px;
    ">
        ⏰ ${reminderTime}
    </div>

</div>
        </div>
    `;
});

remindersContent.innerHTML = html;

        } catch (error) {

            console.error(
                "Reminder loading error:",
                error
            );

            remindersContent.innerHTML =
                "<p>❌ Could not load reminders.</p>";
        }

    });
    // ================================
// AUTO CHECK REMINDERS
// ================================

let lastReminderNotification = "";

async function checkDueReminders() {

    try {

        const reminderQuery = query(
            collection(db, "reminders"),
            where("patientId", "==", PATIENT_ID)
        );

        const snapshot =
            await getDocs(reminderQuery);

        const now = new Date();

        snapshot.forEach((doc) => {

            const reminder = doc.data();

            if (!reminder.date || !reminder.time) {
                return;
            }

            const reminderDateTime =
                new Date(
                    `${reminder.date}T${reminder.time}`
                );

            const difference =
                now - reminderDateTime;

            // Reminder is due within 1 minute after its scheduled time
            if (
                difference >= 0 &&
                difference < 60000
            ) {

                const notificationId =
                    `${doc.id}-${reminder.date}-${reminder.time}`;

                // Prevent repeated notifications
                if (
                    lastReminderNotification !==
                    notificationId
                ) {

                    lastReminderNotification =
                        notificationId;

                    alert(
                        `🔔 Reminder\n\n` +
                        `${reminder.title}\n\n` +
                        `Type: ${reminder.type || "Reminder"}`
                    );

                }

            }

        });

    } catch (error) {

        console.error(
            "Reminder notification error:",
            error
        );

    }
}


// Check every 60 seconds
setInterval(() => {

    checkDueReminders();

    const remindersSection =
        document.getElementById("remindersSection");

    // Refresh the visible reminders page
    if (
        remindersSection &&
        remindersSection.style.display !== "none"
    ) {

        document
            .getElementById("reminderBtn")
            .click();

    }

}, 60000);

// ================================
// PROGRESS
// ================================


            

       document.getElementById("progressBtn")
    .addEventListener("click", async () => {

        const progressSection =
    document.getElementById("progressSection");

const progressContent =
    document.getElementById("progressContent");

if (!progressSection || !progressContent) {
    console.error(
        "Progress section elements not found."
    );
    return;
}

progressSection.style.display = "block";

        progressSection.scrollIntoView({
            behavior: "smooth"
        });

        progressContent.textContent =
            "Loading your progress...";

        try {
const activityQuery = query(
    collection(db, "activityResults"),
    where("patientId", "==", PATIENT_ID)
);

const snapshot = await getDocs(activityQuery);

            if (snapshot.empty) {

                progressContent.textContent =
                    "No activity results yet.";

                return;
            }

            let totalScore = 0;
            let activityCount = 0;

            let html = "";

            snapshot.forEach((doc) => {

                const data = doc.data();

                totalScore += data.score || 0;
                activityCount++;

                html += `
                    <div style="
                        background: #f4f7fb;
                        padding: 18px;
                        margin-bottom: 12px;
                        border-radius: 12px;
                    ">
                        <strong>
                            🧠 ${data.activityType || "Activity"}
                        </strong>

                        <br>

                        Score:
                        <strong>${data.score ?? 0}</strong>

                        <br>

                        Difficulty:
                        ${data.difficulty ?? "-"}

                        <br>

                        Attempts:
                        ${data.attempts ?? "-"}

                        <br>

                        Date:
                        ${data.timestamp
                            ? data.timestamp.toDate().toLocaleString()
                            : "Not available"}
                    </div>
                `;
            });

            const averageScore =
                Math.round(totalScore / activityCount);

            progressContent.innerHTML = `
                <div style="
                    background: #eef3ff;
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                ">
                    <h3>📈 Overall Progress</h3>

                    <p>
                        Activities completed:
                        <strong>${activityCount}</strong>
                    </p>

                    <p>
                        Average score:
                        <strong>${averageScore}</strong>
                    </p>
                </div>

                <h3>Recent Activities</h3>

                ${html}
            `;

        } catch (error) {

            console.error(
                "Progress loading error:",
                error
            );

            progressContent.textContent =
                "Could not load progress.";
        }
    });

       // ================================
// CAREGIVER DASHBOARD
// ================================
//
// Structure note:
// The dashboard is rendered into seven semantic HTML containers
// (defined in index.html #caregiverSection):
//   #caregiverPatientIdentity  – patient info card
//   #caregiverSummary          – 4 stat cards
//   #caregiverLatestActivity   – single latest-activity card
//   #caregiverRecentActivities – list, newest first (limit 10)
//   #caregiverRemindersSlot    – reminders slot (X2/X3 plug in here)
//   #caregiverAlerts           – caregiver alerts placeholder (X5)
//   #caregiverSystemStatus     – sync status placeholder (X6/X7)
//
// The legacy #caregiverContent element is only used for
// loading / empty / error banners so it never collides with
// the new structured containers.
// ============================================================

const RECENT_ACTIVITIES_LIMIT = 10;

// ----------------------------------------------------------------
// SAFE FORMAT HELPERS
// ----------------------------------------------------------------

function formatActivityDate(timestamp) {
    try {
        if (!timestamp) return "Not available";

        // Firestore Timestamp
        if (typeof timestamp.toDate === "function") {
            const d = timestamp.toDate();
            if (isNaN(d.getTime())) return "Not available";
            return d.toLocaleString();
        }

        // ISO string or other JS-parsable string
        if (typeof timestamp === "string" || typeof timestamp === "number") {
            const d = new Date(timestamp);
            if (isNaN(d.getTime())) return "Not available";
            return d.toLocaleString();
        }
    } catch (e) {
        console.warn("formatActivityDate fallback:", e);
    }
    return "Not available";
}

function formatActivityScore(score) {
    try {
        if (score === null || score === undefined) return "Not available";
        const n = Number(score);
        if (Number.isNaN(n)) return "Not available";
        if (!Number.isFinite(n)) return "Not available";
        return String(n);
    } catch (e) {
        return "Not available";
    }
}

function formatActivityNumber(value) {
    try {
        if (value === null || value === undefined) return "-";
        const n = Number(value);
        if (Number.isNaN(n)) return "-";
        if (!Number.isFinite(n)) return "-";
        return String(n);
    } catch (e) {
        return "-";
    }
}

function formatActivityName(activityType) {
    if (!activityType || typeof activityType !== "string") {
        return "Unknown Activity";
    }
    // Friendly label map for known types, else raw
    const map = {
        memory_sequence: "Memory Sequence",
        routine_recall: "Daily Routine Recall",
        pattern_recognition: "Pattern Recognition",
        attention_challenge: "Attention Challenge"
    };
    return map[activityType] || activityType;
}

// Existing app rule: score >= 100 is successful.
// Do NOT change this threshold. It matches the original
// caregiver dashboard implementation.
function getActivityStatus(score) {
    if (score === null || score === undefined) return "Unknown";
    const n = Number(score);
    if (Number.isNaN(n)) return "Unknown";
    if (n >= 100) return "Successful";
    return "Incomplete";
}

function getActivityStatusClass(score) {
    const s = getActivityStatus(score);
    if (s === "Successful") return "status-success";
    if (s === "Incomplete") return "status-incomplete";
    return "status-unknown";
}

// ----------------------------------------------------------------
// DATA: fetch & stats
// ----------------------------------------------------------------

async function fetchCaregiverActivities() {
    const activityQuery = query(
        collection(db, "activityResults"),
        where("patientId", "==", PATIENT_ID)
    );

    const snapshot = await getDocs(activityQuery);

    if (snapshot.empty) return [];

    const rawActivities = [];
    snapshot.forEach((doc) => {
        try {
            rawActivities.push({
                ...doc.data(),
                _id: doc.id
            });
        } catch (docErr) {
            console.warn("Skipping malformed activity doc:", doc.id, docErr);
        }
    });

    // Normalize + safe per-activity parse
    const activities = rawActivities.map((data) => {
        const scoreNum =
            data.score !== undefined && data.score !== null
                ? Number(data.score)
                : NaN;
        return {
            _id: data._id || null,
            activityType: data.activityType || null,
            score: Number.isFinite(scoreNum) ? scoreNum : null,
            difficulty:
                data.difficulty !== undefined
                    ? formatActivityNumber(data.difficulty)
                    : "-",
            attempts:
                data.attempts !== undefined
                    ? formatActivityNumber(data.attempts)
                    : "-",
            timestamp: data.timestamp || null,
            _raw: data
        };
    });

    // Sort newest first
    activities.sort((a, b) => {
        const extract = (t) => {
            try {
                if (t && typeof t.toDate === "function") return t.toDate();
                if (typeof t === "string" || typeof t === "number") {
                    const d = new Date(t);
                    return isNaN(d.getTime()) ? new Date(0) : d;
                }
            } catch (_) {}
            return new Date(0);
        };
        const timeA = extract(a.timestamp).getTime();
        const timeB = extract(b.timestamp).getTime();
        return timeB - timeA;
    });

    return activities;
}

function calculateDashboardStats(activities) {
    const validScores = activities
        .map((a) => a.score)
        .filter((s) => s !== null && Number.isFinite(s));

    const totalActivities = activities.length;

    let averageScore = 0;
    if (validScores.length > 0) {
        const sum = validScores.reduce((acc, s) => acc + s, 0);
        averageScore = Math.round(sum / validScores.length);
    }

    const bestScore = validScores.length > 0 ? Math.max(...validScores) : 0;

    // Existing rule: score >= 100 successful
    const successfulActivities = validScores.filter((s) => s >= 100).length;

    return {
        totalActivities,
        averageScore,
        bestScore,
        successfulActivities,
        scoreCount: validScores.length
    };
}

// ----------------------------------------------------------------
// CONTAINER HELPERS
// ----------------------------------------------------------------

function getDashboardContainers() {
    return {
        caregiverSection: document.getElementById("caregiverSection"),
        caregiverContent: document.getElementById("caregiverContent"),
        patientIdentity: document.getElementById("caregiverPatientIdentity"),
        summary: document.getElementById("caregiverSummary"),
        latest: document.getElementById("caregiverLatestActivity"),
        recent: document.getElementById("caregiverRecentActivities"),
        remindersSlot: document.getElementById("caregiverRemindersSlot"),
        alerts: document.getElementById("caregiverAlerts"),
        systemStatus: document.getElementById("caregiverSystemStatus")
    };
}

function showContainer(el) {
    if (el) el.style.display = "block";
}
function hideContainer(el) {
    if (el) el.style.display = "none";
}

function renderDashboardState(visibleKeys) {
    // visibleKeys: array of container IDs to show (excluding caregiverContent)
    const c = getDashboardContainers();
    const all = [
        "patientIdentity",
        "summary",
        "latest",
        "recent",
        "remindersSlot",
        "alerts",
        "systemStatus"
    ];
    all.forEach((k) => {
        if (visibleKeys.includes(k)) showContainer(c[k]);
        else hideContainer(c[k]);
    });
}

// ----------------------------------------------------------------
// RENDER FUNCTIONS
// ----------------------------------------------------------------

function renderPatientIdentity() {
    const c = getDashboardContainers();
    if (!c.patientIdentity) return;

    // Use last 4 chars of the hardcoded PATIENT_ID to create a
    // friendly "Patient #" label without exposing the full raw ID.
    const shortId =
        (PATIENT_ID || "").toString().slice(-4) || "----";

    c.patientIdentity.innerHTML = `
        <div class="patient-identity-card" role="region" aria-label="Patient identity">
            <div class="patient-avatar" aria-hidden="true">👴</div>
            <div class="patient-identity-info">
                <h3>Patient Profile</h3>
                <p>Assigned patient for caregiver monitoring</p>
                <span class="patient-id-chip" title="Patient ID">
                    Patient #${shortId}
                </span>
            </div>
        </div>
    `;
}

function renderDashboardStats(stats) {
    const c = getDashboardContainers();
    if (!c.summary) return;

    c.summary.innerHTML = `
        <h3 class="section-header">📊 Patient Summary</h3>
        <div class="summary-grid" role="list">
            <div class="summary-card" role="listitem">
                <div class="summary-card-icon" aria-hidden="true">🧠</div>
                <div class="summary-card-value">${stats.totalActivities}</div>
                <p class="summary-card-label">Total Activities</p>
            </div>
            <div class="summary-card" role="listitem">
                <div class="summary-card-icon" aria-hidden="true">📈</div>
                <div class="summary-card-value">${stats.averageScore}</div>
                <p class="summary-card-label">
                    Average Score
                    <span style="font-size:12px;display:block;">
                        (${stats.scoreCount} scored)
                    </span>
                </p>
            </div>
            <div class="summary-card" role="listitem">
                <div class="summary-card-icon" aria-hidden="true">🏆</div>
                <div class="summary-card-value">${stats.bestScore}</div>
                <p class="summary-card-label">Best Score</p>
            </div>
            <div class="summary-card" role="listitem">
                <div class="summary-card-icon" aria-hidden="true">✅</div>
                <div class="summary-card-value">${stats.successfulActivities}</div>
                <p class="summary-card-label">Successful</p>
            </div>
        </div>
    `;
}

function renderLatestActivity(activity) {
    const c = getDashboardContainers();
    if (!c.latest) return;

    if (!activity) {
        c.latest.innerHTML = `
            <h3 class="section-header">🧠 Latest Activity</h3>
            <div class="dashboard-empty">
                <h4>Not available yet</h4>
                <p>No activity record is available to display.</p>
            </div>
        `;
        return;
    }

    const name = formatActivityName(activity.activityType);
    const dateStr = formatActivityDate(activity.timestamp);
    const scoreStr = formatActivityScore(activity.score);
    const statusText = getActivityStatus(activity.score);
    const statusClass = getActivityStatusClass(activity.score);
    const difficulty = activity.difficulty || "-";

    c.latest.innerHTML = `
        <h3 class="section-header">🧠 Latest Activity</h3>
        <div class="latest-card">
            <div class="latest-card-top">
                <div>
                    <h4 class="latest-card-title">${name}</h4>
                    <p class="latest-card-meta">🕒 ${dateStr}</p>
                </div>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="latest-card-stats">
                <div class="latest-stat">
                    <p class="latest-stat-label">Score</p>
                    <p class="latest-stat-value">${scoreStr}</p>
                </div>
                <div class="latest-stat">
                    <p class="latest-stat-label">Difficulty</p>
                    <p class="latest-stat-value">${difficulty}</p>
                </div>
                <div class="latest-stat">
                    <p class="latest-stat-label">Attempts</p>
                    <p class="latest-stat-value">${activity.attempts || "-"}</p>
                </div>
            </div>
        </div>
    `;
}

function renderRecentActivities(activities, limit) {
    const c = getDashboardContainers();
    if (!c.recent) return;

    const capped = Math.max(0, Math.min(activities.length, limit));
    const slice = activities.slice(0, capped);

    if (slice.length === 0) {
        c.recent.innerHTML = `
            <h3 class="section-header">📈 Recent Performance</h3>
            <div class="dashboard-empty">
                <h4>No activity records</h4>
                <p>Recent activity will appear here once the patient
                   completes a cognitive activity.</p>
            </div>
        `;
        return;
    }

    let itemsHTML = "";
    slice.forEach((act, idx) => {
        try {
            const name = formatActivityName(act.activityType);
            const dateStr = formatActivityDate(act.timestamp);
            const scoreStr = formatActivityScore(act.score);
            const statusText = getActivityStatus(act.score);
            const statusClass = getActivityStatusClass(act.score);

            itemsHTML += `
                <article class="recent-item" aria-label="Activity ${idx + 1}">
                    <h4 class="recent-item-title">🧠 ${name}</h4>
                    <div class="recent-item-meta">
                        <span>🕒 ${dateStr}</span>
                        <span>🎯 Difficulty: ${act.difficulty || "-"}</span>
                        <span>🔄 Attempts: ${act.attempts || "-"}</span>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="recent-item-score">
                        <strong>${scoreStr}</strong>
                        <small>Score</small>
                    </div>
                </article>
            `;
        } catch (itemErr) {
            console.warn("Skipping recent activity render:", itemErr);
        }
    });

    c.recent.innerHTML = `
        <h3 class="section-header">
            📈 Recent Performance
            <span style="
                font-size:14px;
                font-weight:400;
                color:var(--secondary);
            ">
                (latest ${slice.length}${activities.length > slice.length
                    ? " of " + activities.length : ""})
            </span>
        </h3>
        <div class="recent-list">
            ${itemsHTML}
        </div>
    `;
}

function renderRemindersSlot() {
    const c = getDashboardContainers();
    if (!c.remindersSlot) return;

    c.remindersSlot.innerHTML = `
        <div class="placeholder-card">
            <h4>📅 Reminders</h4>
            <p>
                Reminders are managed in the Create Reminder panel
                directly below.
            </p>
            <p>
                Future X2 / X3 will surface upcoming reminders and
                reminder-management controls here.
            </p>
            <button
                type="button"
                class="placeholder-link-btn"
                id="dashboardJumpToRemindersBtn"
            >
                🔔 Go to Create Reminder panel
            </button>
        </div>
    `;

    // Wire a small jump-to button (no create/delete logic touched)
    const jump = document.getElementById("dashboardJumpToRemindersBtn");
    if (jump) {
        jump.addEventListener("click", () => {
            const target = document.getElementById("createReminderSection");
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }
}

function renderAlertsPlaceholder() {
    const c = getDashboardContainers();
    if (!c.alerts) return;

    c.alerts.innerHTML = `
        <div class="placeholder-card">
            <h4>🚨 Caregiver Alerts</h4>
            <p>
                No alerts configured.
            </p>
            <p>
                A future task (X5) will surface important patient
                activity trends and anomalies here, powered by the
                existing FCM notification infrastructure.
            </p>
        </div>
    `;
}

function renderSystemStatusPlaceholder() {
    const c = getDashboardContainers();
    if (!c.systemStatus) return;

    c.systemStatus.innerHTML = `
        <div class="placeholder-card">
            <h4>📡 System Status</h4>
            <p>
                <span class="system-status-pill">
                    <span class="system-status-dot" aria-hidden="true"></span>
                    Online
                </span>
            </p>
            <p>
                Last data refresh: just now
            </p>
            <p style="margin-top:10px;">
                Full offline mode and sync status indicators will be
                added by tasks X6 (Offline Strategy) and X7 (Offline
                Synchronization).
            </p>
        </div>
    `;
}

function renderDashboardLoadingMessage() {
    const c = getDashboardContainers();
    if (!c.caregiverContent) return;
    c.caregiverContent.innerHTML = `
        <div class="dashboard-loading">
            Loading patient information…
        </div>
    `;
}

function renderDashboardErrorMessage() {
    const c = getDashboardContainers();
    if (!c.caregiverContent) return;
    c.caregiverContent.innerHTML = `
        <div class="dashboard-error">
            Unable to load patient activity. Please try again.
        </div>
    `;
}

function renderDashboardEmptyMessage() {
    const c = getDashboardContainers();
    if (!c.caregiverContent) return;
    c.caregiverContent.innerHTML = `
        <div class="dashboard-empty">
            <h4>📭 No activity records available yet.</h4>
            <p>
                Summary and history will appear here as soon as the
                patient completes cognitive activities.
            </p>
        </div>
    `;
}

function clearDashboardBanners() {
    const c = getDashboardContainers();
    if (!c.caregiverContent) return;
    c.caregiverContent.innerHTML = "";
}

// ----------------------------------------------------------------
// MAIN ENTRY POINT (preserves original name)
// ----------------------------------------------------------------

async function loadCaregiverDashboard() {
    const c = getDashboardContainers();

    if (!c.caregiverSection || !c.caregiverContent) {
        console.error("Caregiver dashboard elements not found.");
        return;
    }

    c.caregiverSection.style.display = "block";
    c.caregiverSection.scrollIntoView({ behavior: "smooth" });

    // Always render identity, reminders slot, alerts & status
    // placeholders so the layout structure is always present
    // (even when no data exists).
    renderPatientIdentity();
    renderRemindersSlot();
    renderAlertsPlaceholder();
    renderSystemStatusPlaceholder();

    // Show loading message while fetching
    renderDashboardLoadingMessage();
    renderDashboardState(["patientIdentity", "remindersSlot", "alerts", "systemStatus"]);

    let activities = [];
    try {
        activities = await fetchCaregiverActivities();
    } catch (error) {
        console.error("Caregiver dashboard error:", error);
        renderDashboardErrorMessage();
        renderDashboardState(["patientIdentity", "remindersSlot", "alerts", "systemStatus"]);
        return;
    }

    if (activities.length === 0) {
        clearDashboardBanners();
        renderDashboardEmptyMessage();
        renderLatestActivity(null);
        renderRecentActivities([], RECENT_ACTIVITIES_LIMIT);
        renderDashboardStats({
            totalActivities: 0,
            averageScore: 0,
            bestScore: 0,
            successfulActivities: 0,
            scoreCount: 0
        });
        renderDashboardState([
            "patientIdentity",
            "summary",
            "latest",
            "recent",
            "remindersSlot",
            "alerts",
            "systemStatus"
        ]);
        return;
    }

    // Success path: data present
    clearDashboardBanners();
    const stats = calculateDashboardStats(activities);
    renderDashboardStats(stats);
    renderLatestActivity(activities[0]);
    renderRecentActivities(activities, RECENT_ACTIVITIES_LIMIT);
    renderDashboardState([
        "patientIdentity",
        "summary",
        "latest",
        "recent",
        "remindersSlot",
        "alerts",
        "systemStatus"
    ]);
}
// ================================
// MEMORY SEQUENCE ACTIVITY
// ================================

const activityBtn = document.getElementById("activityBtn");
const memoryGame = document.getElementById("memoryGame");
const sequenceElement = document.getElementById("sequence");
const answerElement = document.getElementById("answer");
const checkAnswer = document.getElementById("checkAnswer");
const nextRound = document.getElementById("nextRound");
const gameResult = document.getElementById("gameResult");
const gameInstructions = document.getElementById("gameInstructions");

let currentSequence = "";
let currentLength = 3;

const MIN_DIFFICULTY = 2;
const MAX_DIFFICULTY = 6;

async function updateDifficulty() {

    try {

        const activityQuery = query(
            collection(db, "activityResults"),
            where("patientId", "==", PATIENT_ID)
        );

        const snapshot = await getDocs(activityQuery);

        const scores = [];

        snapshot.forEach((doc) => {

            const data = doc.data();

            if (data.activityType === "memory_sequence") {
                scores.push(data.score || 0);
            }
        });

        if (scores.length === 0) {
            currentLength = MIN_DIFFICULTY;
            return;
        }

        // Use the most recent 5 results
        const recentScores = scores.slice(-5);

        const averageScore =
            recentScores.reduce(
                (sum, score) => sum + score,
                0
            ) / recentScores.length;

        if (averageScore >= 80) {

            currentLength = Math.min(
                currentLength + 1,
                MAX_DIFFICULTY
            );

        } else if (averageScore < 50) {

            currentLength = Math.max(
                currentLength - 1,
                MIN_DIFFICULTY
            );
        }

        console.log(
            "Adaptive difficulty:",
            currentLength,
            "Average:",
            averageScore
        );

    } catch (error) {

        console.error(
            "Adaptive difficulty error:",
            error
        );
    }
}

activityBtn.addEventListener("click", () => {

    memoryGame.style.display = "block";

    memoryGame.scrollIntoView({
        behavior: "smooth"
    });

    startRound();
});

async function startRound() {

    await updateDifficulty();
    
    answerElement.value = "";
    gameResult.textContent = "";

    checkAnswer.style.display = "inline-block";
    nextRound.style.display = "none";

    gameInstructions.textContent =
        "Remember the numbers shown below.";

    currentSequence = "";

    for (let i = 0; i < currentLength; i++) {
        currentSequence += Math.floor(Math.random() * 10);
    }

    sequenceElement.textContent = currentSequence;

    setTimeout(() => {

        sequenceElement.textContent = "● ● ●";

        gameInstructions.textContent =
            "Now enter the numbers you remember.";

    }, 3000);
}

checkAnswer.addEventListener("click", async () => {

    const userAnswer = answerElement.value.trim();

    if (!userAnswer) {
        gameResult.textContent =
            "Please enter your answer.";
        return;
    }

    const correct = userAnswer === currentSequence;
    const score = correct ? 100 : 0;

    if (correct) {

        gameResult.textContent =
            "✅ Excellent! You remembered correctly.";

    } else {

        gameResult.textContent =
            "That's okay. Let's try again.";
    }

    // Save the result to Firestore
    try {

        await addDoc(collection(db, "activityResults"), {

            patientId: PATIENT_ID ,

            activityType: "memory_sequence",

            score: score,

            difficulty: currentLength,

            attempts: 1,

            timestamp: serverTimestamp()

        });

        console.log("✅ Activity result saved to Firestore!");

    } catch (error) {

        console.error(
            "❌ Could not save activity result:",
            error
        );

    }

    checkAnswer.style.display = "none";
    nextRound.style.display = "inline-block";
});

nextRound.addEventListener("click", () => {
    startRound();
});
// ================================
// ATTENTION / CONCENTRATION GAME
// ================================

const attentionBtn = document.getElementById("attentionBtn");
const attentionGame = document.getElementById("attentionGame");
const attentionGrid = document.getElementById("attentionGrid");
const startAttentionGame =
    document.getElementById("startAttentionGame");
const attentionResult =
    document.getElementById("attentionResult");
const attentionInstructions =
    document.getElementById("attentionInstructions");

let attentionCorrectAnswer = null;

function createAttentionGame() {

    attentionGrid.innerHTML = "";
    attentionResult.textContent = "";

    attentionInstructions.textContent =
        "Find the number that appears only once.";

    const normalNumber =
        Math.floor(Math.random() * 9) + 1;

    let differentNumber;

    do {
        differentNumber =
            Math.floor(Math.random() * 9) + 1;
    } while (differentNumber === normalNumber);

    const differentPosition =
        Math.floor(Math.random() * 16);

    attentionCorrectAnswer = differentPosition;

    for (let i = 0; i < 16; i++) {

        const button = document.createElement("button");

        button.textContent =
            i === differentPosition
                ? differentNumber
                : normalNumber;

        button.dataset.position = i;

        button.style.minHeight = "70px";
        button.style.fontSize = "28px";

        button.addEventListener("click", () => {

            if (Number(button.dataset.position) ===
                attentionCorrectAnswer) {

                attentionResult.textContent =
                    "✅ Excellent! You found it.";

            } else {

                attentionResult.textContent =
                    "That's okay. Try again!";
            }

        });

        attentionGrid.appendChild(button);
    }
}


// Open Attention Game
attentionBtn.addEventListener("click", () => {

    attentionGame.style.display = "block";

    attentionGame.scrollIntoView({
        behavior: "smooth"
    });

    createAttentionGame();
});


// Start / restart game
startAttentionGame.addEventListener("click", () => {

    createAttentionGame();

});
// ================================
// DAILY ROUTINE RECALL GAME
// ================================

const routineRecallBtn =
    document.getElementById("routineRecallBtn");
    const morningRoutineBtn =
    document.getElementById("morningRoutineBtn");

const afternoonRoutineBtn =
    document.getElementById("afternoonRoutineBtn");

const eveningRoutineBtn =
    document.getElementById("eveningRoutineBtn");

const routineTimeOptions =
    document.getElementById("routineTimeOptions");

const routineRecallGame =
    document.getElementById("routineRecallGame");

const routineSequence =
    document.getElementById("routineSequence");

const routineOptions =
    document.getElementById("routineOptions");

const nextRoutineRound =
    document.getElementById("nextRoutineRound");

const routineResult =
    document.getElementById("routineResult");

const routineInstructions =
    document.getElementById("routineInstructions");

const routineProgress =
    document.getElementById("routineProgress");

const dailyRoutines = {
    morning: [
        "🌅 Wake up",
        "🪥 Brush teeth",
        "🍳 Have breakfast",
        "💊 Take medicine"
    ],

    afternoon: [
        "🍛 Have lunch",
        "💧 Drink water",
        "🚶 Go for a walk",
        "😴 Take a short rest"
    ],

    evening: [
        "☕ Have evening snack",
        "💧 Drink water",
        "📺 Relax",
        "🍽️ Have dinner"
    ]
};

let currentRoutine = [];
let routineCurrentStep = 0;
let routineScore = 0;
let currentRoutineTime = null;


// Start a new round
function startRoutineRound(timeOfDay) {

    routineCurrentStep = 0;
    routineScore = 0;

    routineResult.textContent = "";
    routineProgress.textContent = "";

    nextRoutineRound.style.display = "none";

    currentRoutine = [...dailyRoutines[timeOfDay]];

    routineInstructions.textContent =
        "Remember this routine in the correct order.";

    routineSequence.textContent =
        currentRoutine.join(" → ");

    routineOptions.innerHTML = "";

    setTimeout(() => {

        routineSequence.textContent =
            "● ● ● ●";

        routineInstructions.textContent =
            "Tap the activities in the order you remember.";

        showRoutineOptions();

    }, 10000);
}


// Show large activity buttons
function showRoutineOptions() {

    routineOptions.innerHTML = "";

    const shuffledOptions =
        [...currentRoutine]
            .sort(() => Math.random() - 0.5);

    shuffledOptions.forEach((activity) => {

        const button =
            document.createElement("button");

        button.textContent = activity;

        button.style.minHeight = "65px";
        button.style.fontSize = "20px";
        button.style.textAlign = "left";
        button.style.padding = "15px 20px";

        button.addEventListener("click", () => {

            handleRoutineSelection(
                activity,
                button
            );

        });

        routineOptions.appendChild(button);

    });

    updateRoutineProgress();
}


// Handle patient's selection
function handleRoutineSelection(
    selectedActivity,
    selectedButton
) {

    const correctActivity =
        currentRoutine[routineCurrentStep];

    if (selectedActivity === correctActivity) {

        routineScore += 20;

        selectedButton.disabled = true;

        selectedButton.textContent =
            "✅ " + selectedActivity;

        routineCurrentStep++;

        updateRoutineProgress();

        // Completed the whole routine
        if (
            routineCurrentStep ===
            currentRoutine.length
        ) {

            routineResult.textContent =
                "🎉 Excellent! You remembered the whole routine.";

            routineInstructions.textContent =
                "Great job!";

            saveRoutineResult();

            nextRoutineRound.style.display =
                "inline-block";

            return;
        }

        routineInstructions.textContent =
            "✅ Correct! Now find the next activity.";

    } else {

        routineResult.textContent =
            "That's okay! Try to remember the order.";

        selectedButton.disabled = true;

        selectedButton.textContent =
            "❌ " + selectedActivity;

        // Small penalty
        routineScore =
            Math.max(0, routineScore - 5);
    }
}


// Update progress text
function updateRoutineProgress() {

    routineProgress.textContent =
        `Activity ${routineCurrentStep + 1} of ${currentRoutine.length}`;
}


// Save result to Firestore
async function saveRoutineResult() {

    try {

        await addDoc(
            collection(db, "activityResults"),
            {
                patientId: PATIENT_ID,
                activityType: "routine_recall",
                score: routineScore,
                difficulty: currentRoutine.length,
                attempts: 1,
                timestamp: serverTimestamp()
            }
        );

        console.log(
            "✅ Routine recall result saved."
        );

    } catch (error) {

        console.error(
            "❌ Could not save routine recall result:",
            error
        );

    }
}

routineRecallBtn.addEventListener("click", () => {

    routineRecallGame.style.display = "block";

    routineRecallGame.scrollIntoView({
        behavior: "smooth"
    });

    routineInstructions.textContent =
        "Choose Morning, Afternoon, or Evening.";

    routineSequence.textContent = "";

    routineOptions.innerHTML = "";

    routineResult.textContent = "";

    routineProgress.textContent = "";

    nextRoutineRound.style.display = "none";

});
morningRoutineBtn.addEventListener("click", () => {

    routineTimeOptions.style.display = "none";

    currentRoutineTime = "morning";

    routineInstructions.textContent =
        "🌅 Morning Routine — Remember the order.";

    startRoutineRound("morning");

});


afternoonRoutineBtn.addEventListener("click", () => {

    routineTimeOptions.style.display = "none";

    currentRoutineTime = "afternoon";

    routineInstructions.textContent =
        "☀️ Afternoon Routine — Remember the order.";

    startRoutineRound("afternoon");

});


eveningRoutineBtn.addEventListener("click", () => {

    routineTimeOptions.style.display = "none";

    currentRoutineTime = "evening";

    routineInstructions.textContent =
        "🌙 Evening Routine — Remember the order.";

    startRoutineRound("evening");

});

nextRoutineRound.addEventListener("click", () => {

    startRoutineRound(currentRoutineTime);

});
// ================================
// PATTERN / OBJECT RECOGNITION
// ================================

const patternGameBtn =
    document.getElementById("patternGameBtn");

const patternGame =
    document.getElementById("patternGame");

const patternDisplay =
    document.getElementById("patternDisplay");

const patternOptions =
    document.getElementById("patternOptions");

const patternInstructions =
    document.getElementById("patternInstructions");

const patternResult =
    document.getElementById("patternResult");

const nextPatternRound =
    document.getElementById("nextPatternRound");

let correctPattern = "";

const patterns = [
    "🔵 ⭐ 🔵 ⭐",
    "❤️ 🟢 ❤️ 🟢",
    "🔺 🟡 🔺 🟡",
    "🌸 🔷 🌸 🔷"
];


// Start a pattern round
function startPatternRound() {

    patternResult.textContent = "";

    nextPatternRound.style.display = "none";

    patternInstructions.textContent =
        "Remember the pattern shown below.";

    correctPattern =
        patterns[
            Math.floor(Math.random() * patterns.length)
        ];

    patternDisplay.textContent =
        correctPattern;

    patternOptions.innerHTML = "";

    setTimeout(() => {

        patternDisplay.textContent =
            "● ● ● ●";

        patternInstructions.textContent =
            "Tap the pattern you remember.";

        showPatternOptions();

    }, 7500);
}


// Show pattern choices
function showPatternOptions() {

    patternOptions.innerHTML = "";

    const options = [
        correctPattern,
        ...patterns.filter(
            pattern => pattern !== correctPattern
        ).slice(0, 3)
    ];

    options.sort(() => Math.random() - 0.5);

    options.forEach((pattern) => {

        const button =
            document.createElement("button");

        button.textContent = pattern;

        button.style.minHeight = "75px";
        button.style.fontSize = "28px";
        button.style.letterSpacing = "5px";

        button.addEventListener("click", () => {

            if (pattern === correctPattern) {

                patternResult.textContent =
                    "✅ Excellent! You remembered the pattern.";

                savePatternResult(100);

            } else {

                patternResult.textContent =
                    "That's okay. Let's try another one.";

                savePatternResult(0);
            }

            // Disable all options
            const buttons =
                patternOptions.querySelectorAll("button");

            buttons.forEach(button => {
                button.disabled = true;
            });

            nextPatternRound.style.display =
                "inline-block";

        });

        patternOptions.appendChild(button);

    });
}


// Save pattern result
async function savePatternResult(score) {

    try {

        await addDoc(
            collection(db, "activityResults"),
            {
                patientId: PATIENT_ID,
                activityType: "pattern_recognition",
                score: score,
                difficulty: 4,
                attempts: 1,
                timestamp: serverTimestamp()
            }
        );

        console.log(
            "✅ Pattern result saved."
        );

    } catch (error) {

        console.error(
            "❌ Could not save pattern result:",
            error
        );

    }
}


// Open Pattern Game
patternGameBtn.addEventListener("click", () => {

    patternGame.style.display = "block";

    patternGame.scrollIntoView({
        behavior: "smooth"
    });

    startPatternRound();

});
// ================================
// MOOD CHECK-IN
// ================================

const moodCheckinBtn =
    document.getElementById("moodCheckinBtn");

const moodCheckin =
    document.getElementById("moodCheckin");

const moodOptions =
    document.querySelectorAll("#moodOptions button");

const moodResult =
    document.getElementById("moodResult");


// Open Mood Check-In
moodCheckinBtn.addEventListener("click", () => {

    moodCheckin.style.display = "block";

    moodCheckin.scrollIntoView({
        behavior: "smooth"
    });

    moodResult.textContent =
        "";

});


// Handle mood selection
moodOptions.forEach((button) => {

    button.addEventListener("click", async () => {

        const mood =
            button.dataset.mood;

        moodResult.textContent =
            "Saving your response...";

        try {

            await addDoc(
                collection(db, "moodCheckins"),
                {
                    patientId: PATIENT_ID,
                    mood: mood,
                    timestamp: serverTimestamp()
                }
            );

            moodResult.textContent =
                "💙 Thank you for sharing how you feel.";

            console.log(
                "✅ Mood check-in saved."
            );

        } catch (error) {

            console.error(
                "❌ Could not save mood check-in:",
                error
            );

            moodResult.textContent =
                "Sorry, we could not save your response.";
        }

    });

});


// Next pattern
nextPatternRound.addEventListener("click", () => {

    startPatternRound();

});
// ================================
// SAVE REMINDER
// ================================

document
    .getElementById("saveReminderBtn")
    .addEventListener("click", async () => {

        const title =
            document.getElementById("reminderTitle").value.trim();

        const type =
            document.getElementById("reminderType").value.trim();

        const date =
            document.getElementById("reminderDate").value;

        const time =
            document.getElementById("reminderTime").value;

        const message =
            document.getElementById("reminderMessage");

        if (!title || !type || !date || !time) {

            message.textContent =
                "Please fill in all reminder details.";

            return;
        }

        try {

            await addDoc(
                collection(db, "reminders"),
                {
                    patientId: PATIENT_ID,
                    title: title,
                    type: type,
                    date: date,
                    time: time,
                    createdAt: serverTimestamp()
                }
            );

            message.textContent =
                "✅ Reminder saved successfully.";

            document.getElementById("reminderTitle").value = "";
            document.getElementById("reminderType").value = "";
            document.getElementById("reminderDate").value = "";
            document.getElementById("reminderTime").value = "";

        } catch (error) {

            console.error(
                "Error saving reminder:",
                error
            );

            message.textContent =
                "❌ Failed to save reminder.";
        }

    });
    // ================================
// LOAD CAREGIVER REMINDERS
// ================================

async function loadCaregiverReminders() {

    const container =
        document.getElementById("caregiverRemindersContent");

    if (!container) {
        console.error("Saved reminders container not found.");
        return;
    }

    try {

        const reminderQuery = query(
            collection(db, "reminders"),
            where("patientId", "==", PATIENT_ID)
        );

        const snapshot =
            await getDocs(reminderQuery);

        if (snapshot.empty) {

            container.innerHTML = `
                <div style="
                    background: #f4f7fb;
                    padding: 20px;
                    border-radius: 14px;
                    color: #657184;
                ">
                    📭 No reminders created yet.
                </div>
            `;

            return;
        }

        let html = "";

        snapshot.forEach((reminderDoc) => {

    const reminder =
        reminderDoc.data();

    html += `
        <div style="
            background: #ffffff;
            border: 1px solid #dce2ea;
            padding: 18px;
            margin-bottom: 12px;
            border-radius: 14px;
        ">

            <h4 style="
                margin: 0 0 8px;
                font-size: 20px;
            ">
                🔔 ${reminder.title || "Reminder"}
            </h4>

            <p style="
                margin: 5px 0;
                color: #526070;
            ">
                Type: ${reminder.type || "-"}
            </p>

            <p style="
                margin: 5px 0;
                color: #526070;
            ">
                📅 ${reminder.date || "Date not set"}
                &nbsp;&nbsp;
                ⏰ ${reminder.time || "Time not set"}
            </p>

            <button
                class="deleteReminderBtn"
                data-id="${reminderDoc.id}"
                style="
                    margin-top: 10px;
                    background: #d92d20;
                    color: white;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                "
            >
                🗑️ Delete
            </button>

        </div>
    `;
});

        container.innerHTML = html;

    } catch (error) {

        console.error(
            "Error loading caregiver reminders:",
            error
        );

        container.innerHTML = `
            <div style="
                background: #fff4f4;
                padding: 20px;
                border-radius: 14px;
                color: #b42318;
            ">
                ❌ Could not load saved reminders.
            </div>
        `;
    }
}
// ================================
// DELETE REMINDER
// ================================

document.addEventListener("click", async (event) => {

    const deleteButton =
        event.target.closest(".deleteReminderBtn");

    if (!deleteButton) {
        return;
    }

    const reminderId =
        deleteButton.dataset.id;

    if (!reminderId) {
        return;
    }

    const confirmed =
        confirm("Are you sure you want to delete this reminder?");

    if (!confirmed) {
        return;
    }

    try {

        await deleteDoc(
            doc(db, "reminders", reminderId)
        );

        alert("✅ Reminder deleted.");

        // Refresh saved reminders
        loadCaregiverReminders();

    } catch (error) {

        console.error(
            "Error deleting reminder:",
            error
        );

        alert("❌ Could not delete reminder.");
    }

});

    


