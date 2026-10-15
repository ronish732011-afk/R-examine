let examData = {};
let currentExam = "";
let currentSubject = "";
let currentChapter = "";
let activeQuestions = [];
let qIndex = 0;
let score = 0;
let timerInterval;

// Automatically load your questions from questions.json
async function loadExamData() {
    try {
        let response = await fetch('questions.json');
        examData = await response.json();
    } catch (error) {
        console.error("Error loading questions.json:", error);
    }
}

loadExamData();

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function goToHome() {
    const name = document.getElementById("username").value;
    if(!name) { alert("Please enter your name or email!"); return; }
    showScreen("home-screen");
}

function selectExam(exam) {
    currentExam = exam;
    document.getElementById("selected-exam-title").innerText = `${exam} - Subjects`;
    
    const subList = document.getElementById("subject-list");
    subList.innerHTML = "";
    
    if (examData[exam]) {
        Object.keys(examData[exam]).forEach(sub => {
            subList.innerHTML += `<button onclick="selectSubject('${sub}')">${sub}</button>`;
        });
    } else {
        subList.innerHTML = "<p>No subjects found in questions.json for this exam.</p>";
    }
    
    showScreen("subject-screen");
}

function selectSubject(subject) {
    currentSubject = subject;
    document.getElementById("selected-subject-title").innerText = `${currentExam} > ${subject} Chapters`;
    
    const chapList = document.getElementById("chapter-list");
    chapList.innerHTML = "";
    
    if (examData[currentExam] && examData[currentExam][subject]) {
        let chapters = Object.keys(examData[currentExam][subject]);
        chapters.forEach(chap => {
            chapList.innerHTML += `<button onclick="startMockTest('${chap}')">${chap}</button>`;
        });
    } else {
        chapList.innerHTML = "<p>No chapters available for this subject yet.</p>";
    }
    
    showScreen("chapter-screen");
}

function startMockTest(chapter) {
    currentChapter = chapter;
    
    if (examData[currentExam] && examData[currentExam][currentSubject][chapter]) {
        activeQuestions = examData[currentExam][currentSubject][chapter];
    } else {
        activeQuestions = [];
    }
    
    if (activeQuestions.length === 0) {
        alert("No questions found for this chapter inside questions.json!");
        return;
    }
    
    qIndex = 0;
    score = 0;
    document.getElementById("test-title").innerText = `${currentChapter} Test`;
    showScreen("test-screen");
    loadTestQuestion();
    startTimer(300); // 5 minutes test timer
}

function loadTestQuestion() {
    if (qIndex >= activeQuestions.length) {
        endTest();
        return;
    }
    const currentQ = activeQuestions[qIndex];
    document.getElementById("q-text").innerText = `Q${qIndex + 1}: ${currentQ.question}`;
    
    const optContainer = document.getElementById("options-container");
    optContainer.innerHTML = "";
    currentQ.options.forEach((opt, idx) => {
        optContainer.innerHTML += `
            <label style="background:#fdfdfd; border: 1px solid #ddd; padding:10px; border-radius:5px; cursor:pointer;">
                <input type="radio" name="test-opt" value="${idx}"> ${opt}
            </label>`;
    });
}

function nextTestQuestion() {
    const selected = document.querySelector("input[name='test-opt']:checked");
    if(selected) {
        if(parseInt(selected.value) === activeQuestions[qIndex].answer) {
            score += 4; // +4 for correct answer
        } else {
            score -= 1; // -1 for incorrect answer
        }
    }
    qIndex++;
    loadTestQuestion();
}

function startTimer(duration) {
    let timer = duration;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        let minutes = parseInt(timer / 60, 10);
        let seconds = parseInt(timer % 60, 10);
        document.getElementById("time-left").innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        if (--timer < 0) {
            clearInterval(timerInterval);
            endTest();
        }
    }, 1000);
}

function endTest() {
    clearInterval(timerInterval);
    showScreen("result-screen");
    document.getElementById("final-score").innerText = `${score} Marks`;
}

function goBackToHome() { showScreen("home-screen"); }
function goBackToSubjects() { selectExam(currentExam); }
