class InversionGame {
    constructor(sentences) {
        this.originalSentences = sentences;
        this.sentences = this.shuffle([...sentences]);
        this.currentIndex = 0;
        this.score = 0;
        this.wrongAnswers = [];
        this.timer = 120; // 2 minutes
        this.interval = null;
        this.gameActive = false;
        this.reviewMode = false;
        this.initUI();
    }

    shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    initUI() {
        console.log("Game script is running!");
        document.body.innerHTML = `
            <style>
                body {
                    font-family: 'Poppins', sans-serif;
                    background: linear-gradient(135deg, #2E3192, #1BFFFF);
                    color: white;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }
                /* Instructions overlay */
                #instructions-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                #instructions-box {
                    background: #333;
                    padding: 20px;
                    border-radius: 10px;
                    max-width: 500px;
                    text-align: left;
                }
                #instructions-box h2 {
                    margin-top: 0;
                }
                #close-instructions {
                    margin-top: 15px;
                    padding: 5px 10px;
                    background: #28a745;
                    border: none;
                    border-radius: 5px;
                    color: white;
                    cursor: pointer;
                    transition: 0.3s;
                }
                #close-instructions:hover {
                    opacity: 0.8;
                }
                /* Game container styles */
                #game-container {
                    background: rgba(0, 0, 0, 0.8);
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
                    text-align: center;
                    margin-top: 20px;
                }
                p {
                    font-size: 18px;
                }
                input {
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
    border: none;
    outline: none;
    text-align: center;
    width: 80%;          /* Makes the text bar wider */
    display: block;      /* Ensures it's treated as a block element */
    margin: 10px auto;   /* Centers it horizontally */
}
                input.correct {
                    border: 2px solid #00FF00;
                    background-color: rgba(0, 255, 0, 0.2);
                }
                input.incorrect {
                    border: 2px solid #FF0000;
                    background-color: rgba(255, 0, 0, 0.2);
                }
                button {
                    padding: 10px 20px;
                    font-size: 18px;
                    margin-top: 10px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: 0.3s;
                }
                button:hover {
                    opacity: 0.8;
                }
                #start {
                    background: #28a745;
                    color: white;
                }
                #restart {
                    background: #007bff;
                    color: white;
                    display: none;
                }
                #review {
                    background: #ffc107;
                    color: black;
                    display: none;
                }
                #downloadReport {
                    display: none;
                    padding: 10px 20px;
                    font-size: 18px;
                    margin-top: 20px;
                    background: #ff6f61;
                    color: white;
                    border-radius: 5px;
                }
                #timer-bar {
                    width: 100%;
                    height: 10px;
                    background: red;
                    transition: width 1s linear;
                }
            </style>
            <!-- Instructions Overlay -->
            <div id="instructions-overlay">
                <div id="instructions-box">
                    <h2>How to Play</h2>
                    <p>Welcome to the Inversion Sentence Challenge!</p>
                    <p>Read the original sentence, then complete the incomplete sentence by inverting it correctly.</p>
                    <p>You have 120 seconds to complete the challenge.</p>
                    <p>Good luck!</p>
                    <button id="close-instructions">Got It!</button>
                </div>
            </div>
            <!-- Game Container -->
            <div id="game-container">
                <h1>Inversion Sentence Challenge</h1>
                <div id="timer-bar"></div>
                <p id="timer">Time left: 120s</p>
                <p id="sentence"></p>
                <input type="text" id="answer" autofocus>
                <p id="feedback"></p>
                <p>Score: <span id="score">0</span></p>
                <p>Best Score: <span id="bestScore">0</span></p>
                <button id="start">Start Game</button>
                <button id="restart">Restart</button>
                <button id="review">Review Mistakes</button>
                <button id="downloadReport">Download Report</button>
            </div>
        `;

        document.getElementById("close-instructions").addEventListener("click", () => {
            document.getElementById("instructions-overlay").style.display = "none";
        });
        document.getElementById("start").addEventListener("click", () => this.startGame());
        document.getElementById("restart").addEventListener("click", () => this.restartGame());
        document.getElementById("review").addEventListener("click", () => this.startReview());
        this.setupInputListener();
        this.updateBestScoreDisplay();
    }

    setupInputListener() {
        document.getElementById("answer").addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                this.checkAnswer();
            }
        });
    }

    updateBestScoreDisplay() {
        let storedBest = localStorage.getItem("bestScoreInversion") || 0;
        document.getElementById("bestScore").textContent = storedBest;
    }

    startGame() {
        this.gameActive = true;
        this.reviewMode = false;
        this.currentIndex = 0;
        this.score = 0;
        this.wrongAnswers = [];
        this.sentences = this.shuffle([...this.originalSentences]);
        this.timer = 120; // Reset timer to 2 minutes
        clearInterval(this.interval);
        document.getElementById("start").style.display = "none";
        document.getElementById("restart").style.display = "block";
        document.getElementById("review").style.display = "none";
        document.getElementById("downloadReport").style.display = "none";
        document.getElementById("score").textContent = this.score;
        document.getElementById("feedback").textContent = "";
        document.getElementById("timer-bar").style.width = "100%";
        document.getElementById("answer").value = "";
        document.getElementById("answer").focus();
        this.updateSentence();
        this.startTimer();
    }

    updateSentence() {
        if (this.currentIndex < this.sentences.length) {
            // Show original sentence and incomplete sentence separated by a newline
            const originalSentence = this.sentences[this.currentIndex].sentence;
            const incompleteSentence = this.sentences[this.currentIndex].incompleteSentence;
            document.getElementById("sentence").textContent = `${originalSentence}\n\n${incompleteSentence}`;
            document.getElementById("answer").value = "";
        } else {
            this.endGame();
        }
    }

    checkAnswer() {
    if (!this.gameActive && !this.reviewMode) return;

    const input = document.getElementById("answer");
    const userInput = input.value.trim().toLowerCase();
    const currentSet = this.reviewMode ? this.wrongAnswers : this.sentences;
    const correctAnswer = currentSet[this.currentIndex].correctAnswer.toLowerCase();

    if (userInput === correctAnswer) {
        if (!this.reviewMode) {
            this.score += 10;
            document.getElementById("score").textContent = this.score;
        }
        input.classList.add("correct");
        // Delay of 500ms for correct answer feedback
        if (this.reviewMode) {
            setTimeout(() => {
                input.classList.remove("correct");
                input.value = "";
                this.currentIndex++;
                this.showReviewSentence();
            }, 500);
        } else {
            setTimeout(() => {
                input.classList.remove("correct");
                input.value = "";
                this.currentIndex++;  // Increment the sentence index here
                this.updateSentence();
            }, 500);
        }
    } else {
        if (!this.reviewMode) {
            this.score -= 1;
            document.getElementById("score").textContent = this.score;
        }
        input.classList.add("incorrect");
        document.getElementById("feedback").textContent = `Incorrect: Correct answer is '${currentSet[this.currentIndex].correctAnswer}'`;

        if (this.reviewMode) {
            setTimeout(() => {
                input.classList.remove("incorrect");
                input.value = "";
                this.currentIndex++;
                this.showReviewSentence();
            }, 1000);
        } else {
            this.wrongAnswers.push({
                sentence: currentSet[this.currentIndex].sentence,
                incompleteSentence: currentSet[this.currentIndex].incompleteSentence,
                correctAnswer: currentSet[this.currentIndex].correctAnswer,
                userAnswer: userInput || "(no answer)"
            });
            setTimeout(() => {
                input.classList.remove("incorrect");
                input.value = "";
                this.currentIndex++;  // Increment the sentence index here as well
                this.updateSentence();
            }, 1000);
        }
    }
}

    startTimer() {
        this.interval = setInterval(() => {
            if (this.timer > 0) {
                this.timer--;
                document.getElementById("timer").textContent = `Time left: ${this.timer}s`;
                document.getElementById("timer-bar").style.width = (this.timer / 120) * 100 + "%";
            } else {
                clearInterval(this.interval);
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
        this.gameActive = false;
        clearInterval(this.interval);

        // Check and update best score
        let storedBest = localStorage.getItem("bestScoreInversion") || 0;
        let newHighScore = false;
        if (this.score > storedBest) {
            localStorage.setItem("bestScoreInversion", this.score);
            newHighScore = true;
        }
        this.updateBestScoreDisplay();

        // Build Game Over message
        let endMessage = `
            <div class="game-over">Game Over!</div>
            <div>Your score: ${this.score}</div>
        `;
        if (newHighScore) {
            endMessage += `<div class="new-high">New High Score!</div>`;
        }
        document.getElementById("sentence").innerHTML = endMessage;

        // Hide answer input and clear feedback
        document.getElementById("answer").style.display = "none";
        document.getElementById("feedback").textContent = "";

        // Show restart button and review button (if mistakes exist)
        document.getElementById("restart").style.display = "block";
        document.getElementById("review").style.display = this.wrongAnswers.length > 0 ? "block" : "none";

        // Show Download Report button if mistakes were made
        if (this.wrongAnswers.length > 0) {
            const reportButton = document.getElementById("downloadReport");
            if (reportButton) {
                reportButton.style.display = "block";
                reportButton.addEventListener("click", () => this.generateReport());
            }
        }
    }

    startReview() {
    if (this.wrongAnswers.length === 0) return;
    this.reviewMode = true;
    this.currentIndex = 0;
    // Ensure the answer input is visible during review:
    document.getElementById("answer").style.display = "block";
    this.showReviewSentence();
}


    showReviewSentence() {
        if (this.currentIndex < this.wrongAnswers.length) {
            const currentMistake = this.wrongAnswers[this.currentIndex];
            const originalSentence = currentMistake.sentence;
            const incompleteSentence = currentMistake.incompleteSentence;
            const displayText = `${originalSentence}\n\n${incompleteSentence}`;
            document.getElementById("sentence").textContent = displayText;
            document.getElementById("answer").value = "";
            document.getElementById("feedback").textContent = "";
        } else {
            document.getElementById("sentence").textContent = "Review complete!";
            document.getElementById("answer").style.display = "none";
            document.getElementById("feedback").textContent = "";
            this.reviewMode = false;
            this.currentIndex = 0;
        }
    }

    generateReport() {
        if (this.wrongAnswers.length === 0) {
            alert("No mistakes were made. Great job!");
            return;
        }

        let reportText = "Inversion Sentence Challenge - Mistakes Report\n\n";
        this.wrongAnswers.forEach(mistake => {
            const userAnswer = mistake.userAnswer || "(no answer)";
            const correctAnswer = mistake.correctAnswer;
            const userSentence = mistake.incompleteSentence.replace("______", userAnswer);
            const correctSentence = mistake.incompleteSentence.replace("______", correctAnswer);
            reportText += `Original sentence: "${mistake.sentence}"\n`;
            reportText += `You wrote: "${userSentence}"\n`;
            reportText += `The correct answer is: "${correctSentence}"\n\n`;
        });

        const blob = new Blob([reportText], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "inversion_game_report.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    restartGame() {
    this.gameActive = false;
    this.reviewMode = false;
    clearInterval(this.interval);
    this.currentIndex = 0;
    this.score = 0;
    this.timer = 120;
    this.wrongAnswers = [];
    this.sentences = this.shuffle([...this.originalSentences]);

    document.getElementById("score").textContent = this.score;
    document.getElementById("feedback").textContent = "";
    document.getElementById("sentence").textContent = "";
    document.getElementById("answer").value = "";
    document.getElementById("timer").textContent = "Time left: 120s";
    document.getElementById("timer-bar").style.width = "100%";

    // Re-show the answer input with centralized styling and increased width
    const answerInput = document.getElementById("answer");
    answerInput.style.display = "block";
    answerInput.style.width = "80%";
    answerInput.style.margin = "10px auto";

    // Hide review and restart buttons, show the start button
    document.getElementById("review").style.display = "none";
    document.getElementById("restart").style.display = "none";
    document.getElementById("start").style.display = "block";
}

}

// Sentences with negative adverbial prompts for inversion
const sentences = [
    { 
        sentence: "I had just sat down when the train left.", 
        incompleteSentence: "No sooner ________ the train left.", 
        correctAnswer: "had I sat down than"
    },
    { 
        sentence: "I didn't realize my mistake until years later.", 
        incompleteSentence: "Not until ________ realize my mistake.", 
        correctAnswer: "years later did I"
    },
    { 
        sentence: "We have never seen such magnificent scenery.", 
        incompleteSentence: "Never ________ magnificent scenery.", 
        correctAnswer: "have we seen such"
    },
    { 
        sentence: "We only understood what he had really suffered when we read his autobiography.", 
        incompleteSentence: "Only when ________ understand what he had really suffered.", 
        correctAnswer: "we read his autobiography did we"
    },
    { 
        sentence: "We had just started when we heard someone knocking at the door.", 
        incompleteSentence: "Hardly ________ we heard someone knocking at the door.", 
        correctAnswer: "had we started when"
    },
    { 
        sentence: "I have rarely read such a badly written book.", 
        incompleteSentence: "Rarely ________ badly written book.", 
        correctAnswer: "have I read such a"
    },
    { 
        sentence: "We did not put down our tools and rest until the sun set.", 
        incompleteSentence: "Not until ________ down our tools and rest.", 
        correctAnswer: "the sun set did we put"
    },
    { 
        sentence: "The hotel room was not only depressing, but it was cold as well.", 
        incompleteSentence: "Not only ________ depressing, but it was cold as well.", 
        correctAnswer: "was the hotel room"
    },
    { 
        sentence: "They only lit the fire when it was unusually cold.", 
        incompleteSentence: "Only when ________ they light the fire.", 
        correctAnswer: "it was unusually cold did"
    },
    { 
        sentence: "Shortly after he had gone to sleep there was a knock on the door.", 
        incompleteSentence: "No sooner ________ there was a knock on the door.", 
        correctAnswer: "had he gone to sleep than"
    },
    { 
        sentence: "I spoke to the manager and the problem was sorted out.", 
        incompleteSentence: "Only when ________ the problem sorted out.", 
        correctAnswer: "I spoke to the manager was"
    },
    { 
        sentence: "He has never regretted the decision he took on that day.", 
        incompleteSentence: "Never ________ he took on that day.", 
        correctAnswer: "has he regretted the decision"
    },
    { 
        sentence: "I only destroyed the evidence when the police arrived.", 
        incompleteSentence: "Scarcely ________ the police arrived.", 
        correctAnswer: "had I destroyed the evidence when"
    },
    { 
        sentence: "I only realized the full scale of the disaster when I watched the six o'clock news.", 
        incompleteSentence: "Only then ________ of the disaster.", 
        correctAnswer: "did I realize the full scale"
    },
    { 
        sentence: "We rarely sit down as a family to eat dinner together.", 
        incompleteSentence: "Rarely ________ to eat dinner together.", 
        correctAnswer: "do we sit down as a family"
    },
    { 
        sentence: "Shortly after we sat down to start eating, somebody's phone rang.", 
        incompleteSentence: "No sooner ________ eating than somebody's phone rang.", 
        correctAnswer: "had we sat down to start"
    },
    { 
        sentence: "You shouldn't stick your head out of the window while the train is moving.", 
        incompleteSentence: "On no account ________ out of the window while the train is moving.", 
        correctAnswer: "should you stick your head"
    },
    { 
        sentence: "As soon as the race started, it began to rain.", 
        incompleteSentence: "No sooner ________ it began to rain.", 
        correctAnswer: "had the race started than"
    },
    { 
        sentence: "I have never read such a boring book.", 
        incompleteSentence: "Never before ________ boring book.", 
        correctAnswer: "have I read such a"
    },
    { 
        sentence: "This door must not be left open at any time.", 
        incompleteSentence: "At no time ________ open.", 
        correctAnswer: "must this door be left"
    },
    { 
        sentence: "Children must not be left unattended under any circumstances.", 
        incompleteSentence: "Under no ________ unattended.", 
        correctAnswer: "circumstances must children be left"
    },
    { 
        sentence: "The police only caught the man when his wife came forward.", 
        incompleteSentence: "Only when ________ police catch him.", 
        correctAnswer: "his wife came forward did the"
    },
    { 
        sentence: "The identity of the murderer is not revealed until the very last page.", 
        incompleteSentence: "Not until ________ of the murderer revealed.", 
        correctAnswer: "the very last page is the identity"
    },
    { 
        sentence: "He would never play in front of a live audience again.", 
        incompleteSentence: "Never again ________ a live audience.", 
        correctAnswer: "would he play in front of"
    },
    { 
        sentence: "She had hardly sat down to watch her favourite program when the phone rang.", 
        incompleteSentence: "Hardly ________ her favourite program when the phone rang.", 
        correctAnswer: "had she sat down to watch"
    },
    { 
        sentence: "They only realised the painting had been hung upside down when someone complained at reception.", 
        incompleteSentence: "Only when ________ realise the painting had been hung upside down.", 
        correctAnswer: "someone complained at reception did they"
    },
    { 
        sentence: "You will not be allowed to enter the auditorium under any circumstances once the play has started.", 
        incompleteSentence: "Under no ________ to enter the auditorium once the play has started.", 
        correctAnswer: "circumstances will you be allowed"
    },
    { 
        sentence: "John had not enjoyed himself so much since he went to the theme park as a child.", 
        incompleteSentence: "Not since John went to the theme ________ enjoyed himself so much.", 
        correctAnswer: "park as a child had he"
    },
    { 
        sentence: "A film has rarely won as many awards as this one did today.", 
        incompleteSentence: "Seldom ________ awards as this one did today.", 
        correctAnswer: "has a film won as many"
    },
    { 
        sentence: "I won't ever allow myself to be deceived by him again.", 
        incompleteSentence: "Never again ________ be deceived by him.", 
        correctAnswer: "will I allow myself to"
    },
    { 
        sentence: "One rarely finds someone with such integrity as Harold.", 
        incompleteSentence: "Seldom ________ such integrity as Harold.", 
        correctAnswer: "does one find someone with"
    },
    { 
        sentence: "He loves counting all his money more than anything.", 
        incompleteSentence: "Nothing ________ counting his money.", 
        correctAnswer: "does he love more than"
    },
    { 
        sentence: "He little suspected what she was up to.", 
        incompleteSentence: "Little ________ she was up to.", 
        correctAnswer: "did he suspect what"
    },
    { 
        sentence: "Nobody has ever spoken to me like that!", 
        incompleteSentence: "Never before ________ like that!", 
        correctAnswer: "has anybody spoken to me"
    },
    { 
        sentence: "You won't find a kinder man anywhere.", 
        incompleteSentence: "Nowhere ________ man.", 
        correctAnswer: "will you find a kinder"
    },
    { 
        sentence: "She was rude and she was really unkind.", 
        incompleteSentence: "Not only ________ really unkind.", 
        correctAnswer: "was she rude but she was also"
    },
    { 
        sentence: "Her reaction couldn't possibly be described as sympathetic.", 
        incompleteSentence: "In no way ________ described as sympathetic.", 
        correctAnswer: "could her reaction possibly be"
    },
    { 
        sentence: "As soon as one war ended, the Ruritanians started another one.", 
        incompleteSentence: "No sooner ________ the Ruritanians started another one.", 
        correctAnswer: "had one war ended than"
    },
    { 
        sentence: "He didn't realize the error of his ways until she threatened to leave him.", 
        incompleteSentence: "Not until she ________ realize the error of his ways.", 
        correctAnswer: "threatened to leave him did he"
    }
];

const game = new InversionGame(sentences);
