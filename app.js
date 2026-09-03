

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

import { getCulturalGameContent } from "./cultural-content.js";
import { calculateAdaptiveDifficulty } from "./adaptive-difficulty.js";




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

        console.log("🔔 Create Reminder opened.");

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


        // Gemini
        const ai = getAI(app, {
            backend: new GoogleAIBackend()
        });

        const model = getGenerativeModel(ai, {
            model: "gemini-3.5-flash"
        });


        console.log("Cognitive Gaming Firebase + Gemini ready!");

        const assistantLanguages = {
            en: "English",
            as: "Assamese",
            "mni-Mtei": "Meiteilon (Manipuri), using Meetei Mayek script",
            lus: "Mizo",
            bn: "Bengali",
            ne: "Nepali",
            hi: "Hindi"
        };

        const speechLanguages = {
            en: "en-IN",
            as: "as-IN",
            "mni-Mtei": "mni-Mtei-IN",
            lus: "lus-IN",
            bn: "bn-IN",
            ne: "ne-NP",
            hi: "hi-IN"
        };

        const promptElement = document.getElementById("prompt");
        const responseElement = document.getElementById("response");
        const listenButton = document.getElementById("startListening");
        const repeatButton = document.getElementById("repeatResponse");
        const voiceStatus = document.getElementById("voiceStatus");
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        function selectedSpeechLanguage() {
            const language = document.getElementById("languageSelect").value;
            return speechLanguages[language] || "en-IN";
        }

        function setVoiceStatus(message) {
            voiceStatus.textContent = message;
        }

        function speakResponse() {
            const text = responseElement.textContent.trim();
            const language = selectedSpeechLanguage();

            if (!text || text === "The assistant's response will appear here.") {
                setVoiceStatus("Ask a question first, then you can hear the answer aloud.");
                return;
            }

            if (!("speechSynthesis" in window)) {
                setVoiceStatus("Reading answers aloud is not available in this browser.");
                return;
            }

            const availableVoices = window.speechSynthesis.getVoices();
            const languageCode = language.split("-")[0].toLowerCase();
            if (availableVoices.length && !availableVoices.some((voice) =>
                voice.lang.toLowerCase().split("-")[0] === languageCode
            )) {
                setVoiceStatus("This browser does not have a voice for the selected language. The answer is available as text.");
                return;
            }

            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language;
            utterance.rate = 0.85;
            utterance.onstart = () => setVoiceStatus("Reading the answer aloud…");
            utterance.onend = () => setVoiceStatus("Finished reading the answer.");
            utterance.onerror = () => setVoiceStatus("I could not read that answer aloud.");
            window.speechSynthesis.speak(utterance);
        }

        if (!SpeechRecognition) {
            listenButton.disabled = true;
            setVoiceStatus("Voice input is not available in this browser. You can still type a question.");
        } else {
            const recognition = new SpeechRecognition();
            let shouldSubmitVoiceQuestion = false;
            recognition.continuous = false;
            recognition.interimResults = true;

            listenButton.addEventListener("click", () => {
                recognition.lang = selectedSpeechLanguage();
                shouldSubmitVoiceQuestion = false;
                try {
                    recognition.start();
                } catch (error) {
                    setVoiceStatus("Voice input is already starting. Please wait a moment.");
                }
            });

            recognition.onstart = () => {
                listenButton.classList.add("is-listening");
                listenButton.setAttribute("aria-pressed", "true");
                listenButton.textContent = "Listening…";
                setVoiceStatus("Listening. Speak your question now.");
            };

            recognition.onresult = (event) => {
                let transcript = "";
                for (let index = event.resultIndex; index < event.results.length; index += 1) {
                    transcript += event.results[index][0].transcript;
                }
                promptElement.value = transcript.trim();
                setVoiceStatus("I heard: “" + promptElement.value + "”");
                shouldSubmitVoiceQuestion = Array.from(event.results)
                    .some((result) => result.isFinal);
            };

            recognition.onerror = (event) => {
                shouldSubmitVoiceQuestion = false;
                let message = "I could not hear that. Please try again or type your question.";
                if (event.error === "not-allowed") {
                    message = "Microphone access was not allowed. Please enable it and try again.";
                } else if (event.error === "language-not-supported") {
                    message = "Voice input is not available for the selected language in this browser. Please type your question.";
                }
                setVoiceStatus(message);
            };

            recognition.onend = () => {
                listenButton.classList.remove("is-listening");
                listenButton.setAttribute("aria-pressed", "false");
                listenButton.textContent = "Start listening";
                if (shouldSubmitVoiceQuestion && promptElement.value.trim()) {
                    shouldSubmitVoiceQuestion = false;
                    setVoiceStatus("Sending your question to the assistant…");
                    document.getElementById("askGemini").click();
                }
            };
        }

        repeatButton.addEventListener("click", speakResponse);

        // Gemini Assistant
        document
            .getElementById("askGemini")
            .addEventListener("click", async () => {

                const prompt = promptElement.value.trim();


                if (!prompt) {
                    responseElement.textContent =
                        "Please type a question first.";
                    return;
                }


                responseElement.textContent =
                    "The assistant is thinking...";


                try {

                    const selectedLanguage =
                        document.getElementById("languageSelect").value;

                    const responseLanguage =
                        assistantLanguages[selectedLanguage] || "English";

                    const result =
                        await model.generateContent(
                            `You are a friendly memory assistance AI
                             for an elderly user.

                             Give simple, clear and supportive answers.
                             Do not diagnose medical conditions.
                             Do not give medical treatment instructions.
                             Respond only in ${responseLanguage}.

                             User question:
                             ${prompt}`
                        );


                    responseElement.textContent =
                        result.response.text();
                    repeatButton.disabled = false;
                    speakResponse();


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

async function loadCaregiverDashboard() {

        const caregiverSection =
            document.getElementById("caregiverSection");

        const caregiverContent =
    document.getElementById("caregiverContent");

if (!caregiverSection || !caregiverContent) {
    console.error(
        "Caregiver dashboard elements not found."
    );
    return;
}

caregiverSection.style.display = "block";

caregiverSection.scrollIntoView({
    behavior: "smooth"
});

        caregiverContent.innerHTML = `
            <div style="
                text-align: center;
                padding: 30px;
                color: #657184;
            ">
                Loading patient activity...
            </div>
        `;

        try {

            const activityQuery = query(
                collection(db, "activityResults"),
                where("patientId", "==", PATIENT_ID)
            );

            const snapshot =
                await getDocs(activityQuery);

            if (snapshot.empty) {

                caregiverContent.innerHTML = `
                    <div style="
                        text-align: center;
                        padding: 30px;
                        background: #f4f7fb;
                        border-radius: 15px;
                    ">
                        <h3>📭 No Activity Yet</h3>
                        <p>
                            No patient activity has been recorded yet.
                        </p>
                    </div>
                `;

                return;
            }

            let totalScore = 0;
let activityCount = 0;
let successfulActivities = 0;
let bestScore = 0;

            const activities = [];

            snapshot.forEach((doc) => {

                const data = doc.data();

                const score =
                    Number(data.score) || 0;
                totalScore += score;
activityCount++;

if (score > bestScore) {
    bestScore = score;
}

if (score >= 100) {
    successfulActivities++;
}

                activities.push({
                    ...data,
                    score: score
                });

            });


            // Sort newest activity first
            activities.sort((a, b) => {

                const timeA =
                    a.timestamp && a.timestamp.toDate
                        ? a.timestamp.toDate()
                        : new Date(0);

                const timeB =
                    b.timestamp && b.timestamp.toDate
                        ? b.timestamp.toDate()
                        : new Date(0);

                return timeB - timeA;

            });


            const averageScore =
                Math.round(
                    totalScore / activityCount
                );
                const latestActivity =
    activities[0];

const latestActivityName =
    latestActivity.activityType || "Activity";

const latestActivityDate =
    latestActivity.timestamp &&
    latestActivity.timestamp.toDate
        ? latestActivity.timestamp.toDate().toLocaleString()
        : "Not available";


            // ================================
            // ACTIVITY HISTORY
            // ================================

            let historyHTML = "";

            activities.forEach((data) => {

                const activityDate =
                    data.timestamp && data.timestamp.toDate
                        ? data.timestamp.toDate().toLocaleString()
                        : "Not available";

                historyHTML += `
                    <div style="
                        background: #ffffff;
                        border: 1px solid #dce2ea;
                        padding: 20px;
                        margin-bottom: 14px;
                        border-radius: 16px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.04);
                    ">

                        <div style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            gap: 15px;
                            flex-wrap: wrap;
                        ">

                            <h3 style="
                                margin: 0;
                                font-size: 20px;
                            ">
                                🧠 ${data.activityType || "Activity"}
                            </h3>

                            <span style="
                                background: #eef3ff;
                                color: #3157d5;
                                padding: 7px 12px;
                                border-radius: 20px;
                                font-weight: bold;
                            ">
                                Score: ${data.score}
                            </span>

                        </div>

                        <div style="
                            margin-top: 15px;
                            line-height: 1.8;
                            color: #526070;
                        ">

                            <div>
                                🎯 <strong>Difficulty:</strong>
                                ${data.difficulty ?? "-"}
                            </div>

                            <div>
                                🔄 <strong>Attempts:</strong>
                                ${data.attempts ?? "-"}
                            </div>

                            <div>
                                🕒 <strong>Date:</strong>
                                ${activityDate}
                            </div>

                        </div>

                    </div>
                `;

            });


            // ================================
            // CAREGIVER SUMMARY
            // ================================

            caregiverContent.innerHTML = `

                <div style="
                    background: linear-gradient(
                        135deg,
                        #eef3ff,
                        #f7f9ff
                    );
                    border: 1px solid #dce2ea;
                    padding: 25px;
                    border-radius: 18px;
                    margin-bottom: 25px;
                ">

                    <h3 style="
                        margin-top: 0;
                        font-size: 24px;
                    ">
                        📊 Patient Activity Summary
                    </h3>

                    <div style="
                        display: grid;
                        grid-template-columns:
                            repeat(
                                auto-fit,
                                minmax(150px, 1fr)
                            );
                        gap: 15px;
                        margin-top: 20px;
                    ">

                        <div style="
                            background: white;
                            padding: 18px;
                            border-radius: 14px;
                            text-align: center;
                        ">

                            <div style="font-size: 28px;">
                                🧠
                            </div>

                            <strong style="font-size: 24px;">
                                ${activityCount}
                            </strong>

                            <p style="
                                margin: 5px 0 0;
                                color: #657184;
                            ">
                                Activities
                            </p>

                        </div>


                        <div style="
                            background: white;
                            padding: 18px;
                            border-radius: 14px;
                            text-align: center;
                        ">

                            <div style="font-size: 28px;">
                                📈
                            </div>

                            <strong style="font-size: 24px;">
                                ${averageScore}
                            </strong>

                            <p style="
                                margin: 5px 0 0;
                                color: #657184;
                            ">
                                Average Score
                            </p>

                        </div>
                        <div style="
    background: white;
    padding: 18px;
    border-radius: 14px;
    text-align: center;
">

    <div style="font-size: 28px;">
        🏆
    </div>

    <strong style="font-size: 24px;">
        ${bestScore}
    </strong>

    <p style="
        margin: 5px 0 0;
        color: #657184;
    ">
        Best Score
    </p>

</div>


                        <div style="
                            background: white;
                            padding: 18px;
                            border-radius: 14px;
                            text-align: center;
                        ">

                            <div style="font-size: 28px;">
                                ✅
                            </div>

                            <strong style="font-size: 24px;">
                                ${successfulActivities}
                            </strong>

                            <p style="
                                margin: 5px 0 0;
                                color: #657184;
                            ">
                                Successful
                            </p>

                        </div>

                    </div>

                </div>
                <div style="
    background: white;
    padding: 18px;
    border-radius: 14px;
    margin-top: 15px;
">

    <strong>
        🕒 Latest Activity
    </strong>

    <p style="
        margin: 8px 0 0;
        color: #526070;
    ">
        ${latestActivityName}
    </p>

    <p style="
        margin: 5px 0 0;
        color: #657184;
        font-size: 14px;
    ">
        ${latestActivityDate}
    </p>

</div>


                <h3 style="
                    font-size: 23px;
                    margin-bottom: 15px;
                ">
                    📝 Recent Activity
                </h3>

                ${historyHTML}

            `;

        } catch (error) {

            console.error(
                "Caregiver dashboard error:",
                error
            );

            caregiverContent.innerHTML = `
                <div style="
                    background: #fff4f4;
                    padding: 20px;
                    border-radius: 15px;
                ">
                    ❌ Could not load patient information.
                </div>
            `;

        }

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
const memoryOptions = document.getElementById("memoryOptions");

let currentSequence = [];
let selectedMemoryItems = [];
let currentLength = 3;
let roundTimer;

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
    answerElement.disabled = true;
    selectedMemoryItems = [];
    memoryOptions.innerHTML = "";
    gameResult.textContent = "";

    checkAnswer.style.display = "inline-block";
    checkAnswer.disabled = true;
    nextRound.style.display = "none";
    gameInstructions.textContent = "Remember the number shown below. You will have 3 seconds.";

    currentSequence = Array.from(
        { length: currentLength },
        () => Math.floor(Math.random() * 10)
    );

    sequenceElement.textContent = currentSequence.join("");

    clearTimeout(roundTimer);
    roundTimer = setTimeout(() => {

        sequenceElement.textContent = "?".repeat(currentLength);
        gameInstructions.textContent = "Enter the number you remember, then check your answer.";
        answerElement.disabled = false;
        answerElement.focus();
        checkAnswer.disabled = false;

    }, 3000);
}

function showMemoryOptions(objects) {
    [...objects].sort(() => Math.random() - 0.5).forEach(([id, label]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.className = "memory-object-option";
        button.addEventListener("click", () => {
            selectedMemoryItems.push(id);
            answerElement.value = selectedMemoryItems.join("|");
            button.disabled = true;
            button.textContent = `✓ ${label}`;
            checkAnswer.disabled = selectedMemoryItems.length !== currentSequence.length;
        });
        memoryOptions.appendChild(button);
    });
}

checkAnswer.addEventListener("click", async () => {

    const userAnswer = answerElement.value.trim();

    if (answerElement.disabled || !userAnswer) {
        gameResult.textContent = "Please enter the number before checking.";
        return;
    }

    const correct = userAnswer === currentSequence.join("");
    const score = correct ? 100 : 0;

    if (correct) {

        gameResult.textContent =
           t("memorySuccess");

    } else {

        gameResult.textContent =
           t("memoryTryAgain");
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
    memoryOptions.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    nextRound.style.display = "inline-block";
});

nextRound.addEventListener("click", () => {
    startRound();
});

// Performance-based adaptive difficulty: gradual game settings, not a medical AI diagnosis.
async function getActivityDifficulty(activityType, levels) {
    try {
        const snapshot = await getDocs(query(
            collection(db, "activityResults"),
            where("patientId", "==", PATIENT_ID)
        ));
        const results = [];

        snapshot.forEach((resultDocument) => {
            const result = resultDocument.data();
            if (result.activityType === activityType) {
                results.push({
                    score: result.score,
                    difficulty: result.difficulty,
                    timestamp: result.timestamp?.toMillis?.() || 0
                });
            }
        });

        results.sort((first, second) => first.timestamp - second.timestamp);
        return calculateAdaptiveDifficulty(results, levels);
    } catch (error) {
        console.error("Adaptive difficulty could not load results:", error);
        return levels[0];
    }
}
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
let attentionChoiceCount = 9;
const ATTENTION_DIFFICULTY_LEVELS = [9, 16, 25];

async function createAttentionGame() {

    attentionChoiceCount = await getActivityDifficulty(
        "attention_challenge",
        ATTENTION_DIFFICULTY_LEVELS
    );

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
        Math.floor(Math.random() * attentionChoiceCount);

    attentionCorrectAnswer = differentPosition;
    attentionGrid.style.gridTemplateColumns =
        `repeat(${Math.sqrt(attentionChoiceCount)}, 1fr)`;

    for (let i = 0; i < attentionChoiceCount; i++) {

        const button = document.createElement("button");

        button.textContent =
            i === differentPosition
                ? differentNumber
                : normalNumber;

        button.dataset.position = i;

        button.style.minHeight = "70px";
        button.style.fontSize = "28px";

        button.addEventListener("click", () => {

           if (
    Number(button.dataset.position) ===
    attentionCorrectAnswer
) {

    attentionResult.textContent =
        "✅ Excellent! You found it.";

    saveAttentionResult(100);

} else {

    attentionResult.textContent =
        "That's okay. Try again!";

    saveAttentionResult(0);
}

        });

        attentionGrid.appendChild(button);
    }
}
async function saveAttentionResult(score) {
    try {
        await addDoc(
            collection(db, "activityResults"),
            {
                patientId: PATIENT_ID,
                activityType: "attention_challenge",
                score: score,
                difficulty: attentionChoiceCount,
                attempts: 1,
                timestamp: serverTimestamp()
            }
        );

        console.log("✅ Attention challenge result saved.");

    } catch (error) {
        console.error(
            "❌ Could not save attention challenge result:",
            error
        );
    }
}

// Open Attention Game
attentionBtn.addEventListener("click", async () => {

    attentionGame.style.display = "block";

    attentionGame.scrollIntoView({
        behavior: "smooth"
    });

    await createAttentionGame();
});


// Start / restart game
startAttentionGame.addEventListener("click", async () => {

    await createAttentionGame();
    async function saveAttentionResult(score) {
    try {
        await addDoc(
            collection(db, "activityResults"),
            {
                patientId: PATIENT_ID,
                activityType: "attention_challenge",
                score: score,
                difficulty: 16,
                attempts: 1,
                timestamp: serverTimestamp()
            }
        );

        console.log("✅ Attention challenge result saved.");

    } catch (error) {
        console.error(
            "❌ Could not save attention challenge result:",
            error
        );
    }
}

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

let currentRoutine = [];
let routineCurrentStep = 0;
let routineScore = 0;
let currentRoutineTime = null;

function currentGameContent() {
    return getCulturalGameContent(getCurrentLanguage());
}

function applyCulturalGameLabels() {
    const content = currentGameContent();
    morningRoutineBtn.textContent = content.timeLabels.morning;
    afternoonRoutineBtn.textContent = content.timeLabels.afternoon;
    eveningRoutineBtn.textContent = content.timeLabels.evening;
    checkAnswer.textContent = content.text.checkAnswer;
    nextRound.textContent = content.text.next;
    nextRoutineRound.textContent = content.text.next;
    nextPatternRound.textContent = content.text.next;
}


// Start a new round
function startRoutineRound(timeOfDay) {

    routineCurrentStep = 0;
    routineScore = 0;

    routineResult.textContent = "";
    routineProgress.textContent = "";

    nextRoutineRound.style.display = "none";

    const content = currentGameContent();
    currentRoutine = [...content.routines[timeOfDay]];

    routineInstructions.textContent = content.text.rememberRoutine;

    routineSequence.textContent =
        currentRoutine.join(" → ");

    routineOptions.innerHTML = "";

    setTimeout(() => {

        routineSequence.textContent =
            "● ● ● ●";

        routineInstructions.textContent = content.text.chooseObjects;

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

    routineTimeOptions.style.display = "grid";
    routineInstructions.textContent = currentGameContent().text.chooseTime;

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
let activePatterns = [];

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

    const content = currentGameContent();
    activePatterns = content.patterns;
    patternInstructions.textContent = content.text.patternRemember;

    correctPattern =
        activePatterns[
            Math.floor(Math.random() * activePatterns.length)
        ];

    patternDisplay.textContent =
        correctPattern;

    patternOptions.innerHTML = "";

    setTimeout(() => {

        patternDisplay.textContent =
            "● ● ● ●";

        patternInstructions.textContent = content.text.patternChoose;

        showPatternOptions();

    }, 7500);
}


// Show pattern choices
function showPatternOptions() {

    patternOptions.innerHTML = "";

    const options = [
        correctPattern,
        ...activePatterns.filter(
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
// ================================
// LANGUAGE SELECTION
// ================================

const languageSelect =
    document.getElementById("languageSelect");
languageSelect.addEventListener("change", () => {

    const selectedLanguage =
        languageSelect.value;

    applyLanguage(selectedLanguage);

});
// ================================
// TRANSLATIONS
// ================================

const translations = {

    en: {
        welcome: "Welcome 👋",
        cognitiveActivity: "🧠 Cognitive Activity",
        startActivity: "Start Activity",
        attention: "🎯 Attention Challenge",
        routine: "🔢 Daily Routine Recall",
        pattern: "🧩 Pattern Recognition",
        mood: "😊 Mood Check-In",
        reminders: "📅 Reminders",
        progress: "📊 Progress",
        caregiver: "👨‍👩‍👧 Caregiver",
        assistant: "🤖 Memory Assistant",
memoryTitle: "🧠 Memory Sequence",
rememberNumbers: "Remember the numbers shown below.",
enterNumbers: "Now enter the numbers you remember.",
pleaseEnter: "Please enter your answer.",
memorySuccess: "✅ Excellent! You remembered correctly.",
memoryTryAgain: "That's okay. Let's try again.",
nextRound: "Next Round",
    },

    hi: {
        welcome: "स्वागत है 👋",
        cognitiveActivity: "🧠 स्मृति गतिविधि",
        startActivity: "गतिविधि शुरू करें",
        attention: "🎯 ध्यान चुनौती",
        routine: "🔢 दैनिक दिनचर्या याद करें",
        pattern: "🧩 पैटर्न पहचान",
        mood: "😊 मन की स्थिति",
        reminders: "📅 रिमाइंडर",
        progress: "📊 प्रगति",
        caregiver: "👨‍👩‍👧 देखभालकर्ता",
        assistant: "🤖 स्मृति सहायक",
        memoryTitle: "🧠 स्मृति क्रम",
    rememberNumbers: "नीचे दिखाई गई संख्याओं को याद रखें।",
    enterNumbers: "अब वे संख्याएँ दर्ज करें जो आपको याद हैं।",
    pleaseEnter: "कृपया अपना उत्तर दर्ज करें।",
    memorySuccess: "✅ बहुत बढ़िया! आपने सही याद रखा।",
    memoryTryAgain: "कोई बात नहीं। फिर से कोशिश करें।",
    nextRound: "अगला राउंड",

    },
as: {
    welcome: "স্বাগতম 👋",
    cognitiveActivity: "🧠 জ্ঞানীয় কাৰ্যকলাপ",
    startActivity: "কাৰ্যকলাপ আৰম্ভ কৰক",
    attention: "🎯 মনোযোগৰ প্ৰত্যাহ্বান",
    routine: "🔢 দৈনন্দিন কাৰ্যসূচী মনত পেলাওক",
    pattern: "🧩 আৰ্হি চিনাক্তকৰণ",
    mood: "😊 মনৰ অৱস্থা",
    reminders: "📅 সোঁৱৰণী",
    progress: "📊 অগ্ৰগতি",
    caregiver: "👨‍👩‍👧 যত্ন লওঁতা",
    assistant: "🤖 স্মৃতি সহায়ক",

    memoryTitle: "🧠 স্মৃতিৰ ক্ৰম",
    rememberNumbers: "তলত দেখুওৱা সংখ্যাবোৰ মনত ৰাখক।",
    enterNumbers: "এতিয়া আপোনাৰ মনত থকা সংখ্যাবোৰ লিখক।",
    pleaseEnter: "অনুগ্ৰহ কৰি আপোনাৰ উত্তৰ লিখক।",
    memorySuccess: "✅ বৰ ভাল! আপুনি সঠিকভাৱে মনত ৰাখিছে।",
    memoryTryAgain: "ঠিক আছে। আকৌ চেষ্টা কৰোঁ আহক।",
    nextRound: "পৰৱৰ্তী ৰাউণ্ড",
},

"mni-Mtei": {
    welcome: "স্বাগতম 👋",
    cognitiveActivity: "🧠 মশিং তাংখাই ওইবা থবক",
    startActivity: "থবক হৌজিক হৌগদবা",
    attention: "🎯 থাংজিং শিংজিনবা",
    routine: "🔢 নিত্য থবক শেমজিনবা",
    pattern: "🧩 প্যাটার্ন শিংজিনবা",
    mood: "😊 মীৎয়েংগী অৱস্থা",
    reminders: "📅 রিমাইন্ডর",
    progress: "📊 প্রগ্রেস",
    caregiver: "👨‍👩‍👧 কেয়ারগিভর",
    assistant: "🤖 মেমোরি এসিস্টেন্ট",

    memoryTitle: "🧠 মেমোরি সিকোয়েন্স",
    rememberNumbers: "মখাদা উৎপা নাম্বর্শিং অসি নুংশিংদা থম্মু।",
    enterNumbers: "হৌজিক নুংশিংদা থম্লিবা নাম্বর্শিং অসি এন্টর তৌ।",
    pleaseEnter: "মরুপ অসি মখোয়গী উত্তর এন্টর তৌ।",
    memorySuccess: "✅ ফজরবা! নুংশিংদা সঠিকভাবে থম্লে।",
    memoryTryAgain: "চিন্তা তৌগনু। অমুক হায়রক্না চেষ্টা তৌসি।",
    nextRound: "মখাগী রাউন্ড",
},

lus: {
    welcome: "Chibai 👋",
    cognitiveActivity: "🧠 Hriatna Inṭhawnna",
    startActivity: "Inṭhawnna Ṭan",
    attention: "🎯 Ngaihtuahna Inṭhawnna",
    routine: "🔢 Ni tin Thil tihte Hriat Leh",
    pattern: "🧩 Pattern Hriatna",
    mood: "😊 Thinrim Dan",
    reminders: "📅 Hriatna",
    progress: "📊 Hmasawnna",
    caregiver: "👨‍👩‍👧 Hmalakpui Tu",
    assistant: "🤖 Hriatna Ṭanpuitu",

    memoryTitle: "🧠 Hriatna Rual",
    rememberNumbers: "A hnuaia number-te hi hre reng rawh.",
    enterNumbers: "Tunah i hre reng number-te hi ziak rawh.",
    pleaseEnter: "I chhanna hi ziak rawh.",
    memorySuccess: "✅ A ṭha! Dik takin i hre reng.",
    memoryTryAgain: "A ṭha e. Tum leh ila.",
    nextRound: "Round Leh",
},

bn: {
    welcome: "স্বাগতম 👋",
    cognitiveActivity: "🧠 স্মৃতি কার্যকলাপ",
    startActivity: "কার্যকলাপ শুরু করুন",
    attention: "🎯 মনোযোগের চ্যালেঞ্জ",
    routine: "🔢 দৈনন্দিন কাজ মনে করুন",
    pattern: "🧩 প্যাটার্ন শনাক্তকরণ",
    mood: "😊 মনের অবস্থা",
    reminders: "📅 অনুস্মারক",
    progress: "📊 অগ্রগতি",
    caregiver: "👨‍👩‍👧 যত্নদাতা",
    assistant: "🤖 স্মৃতি সহায়ক",

    memoryTitle: "🧠 স্মৃতি ক্রম",
    rememberNumbers: "নিচে দেখানো সংখ্যাগুলো মনে রাখুন।",
    enterNumbers: "এখন আপনার মনে থাকা সংখ্যাগুলো লিখুন।",
    pleaseEnter: "অনুগ্রহ করে আপনার উত্তর লিখুন।",
    memorySuccess: "✅ দারুণ! আপনি সঠিকভাবে মনে রেখেছেন।",
    memoryTryAgain: "ঠিক আছে। আবার চেষ্টা করি।",
    nextRound: "পরবর্তী রাউন্ড",
},

ne: {
    welcome: "स्वागत छ 👋",
    cognitiveActivity: "🧠 स्मरण गतिविधि",
    startActivity: "गतिविधि सुरु गर्नुहोस्",
    attention: "🎯 ध्यान चुनौती",
    routine: "🔢 दैनिक दिनचर्या सम्झनुहोस्",
    pattern: "🧩 ढाँचा पहिचान",
    mood: "😊 मनको अवस्था",
    reminders: "📅 सम्झना",
    progress: "📊 प्रगति",
    caregiver: "👨‍👩‍👧 हेरचाहकर्ता",
    assistant: "🤖 स्मृति सहायक",

    memoryTitle: "🧠 स्मृति क्रम",
    rememberNumbers: "तल देखाइएका नम्बरहरू सम्झनुहोस्।",
    enterNumbers: "अब तपाईंलाई याद भएका नम्बरहरू लेख्नुहोस्।",
    pleaseEnter: "कृपया आफ्नो उत्तर लेख्नुहोस्।",
    memorySuccess: "✅ उत्कृष्ट! तपाईंले सही रूपमा सम्झनुभयो।",
    memoryTryAgain: "ठीक छ। फेरि प्रयास गरौँ।",
    nextRound: "अर्को राउन्ड",
},
};
function getCurrentLanguage() {
    return languageSelect.value || "en";
}
function t(key) {
    const language = getCurrentLanguage();

    if (
        translations[language] &&
        translations[language][key]
    ) {
        return translations[language][key];
    }

    return translations.en[key] || key;
}



// ================================
// APPLY LANGUAGE
// ================================

function applyLanguage(language) {

    const t = translations[language];

    if (!t) {
        return;
    }

    const elements = {

        welcome:
            document.querySelector(".welcome h2"),

        cognitiveActivity:
            document.querySelector("#cognitiveActivityCard h3"),

        startActivity:
            document.getElementById("activityBtn"),

        attention:
            document.getElementById("attentionBtn"),

        routine:
            document.getElementById("routineRecallBtn"),

        pattern:
            document.getElementById("patternGameBtn"),

        mood:
            document.getElementById("moodCheckinBtn"),

        reminders:
            document.querySelector(".cards .card:nth-child(2) h3"),

        progress:
            document.querySelector(".cards .card:nth-child(3) h3"),

        caregiver:
            document.querySelector(".cards .card:nth-child(4) h3"),

        assistant:
            document.querySelector(".assistant:last-of-type h2")
    };

    Object.keys(elements).forEach((key) => {

        if (elements[key] && t[key]) {
            elements[key].textContent = t[key];
        }

    });

    applyCulturalGameLabels();

    console.log(
        "🌐 UI language applied:",
        language
    );
}
