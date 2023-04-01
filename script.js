// *********************************/
// This part is for moving from the homepage to the game-screen page
// Select the elements needed from the DOM
const homePage = document.querySelector(".homePage");
const gameScreen = document.querySelector(".gameScreen");
const modeBtns = document.querySelectorAll(".mode");

// Add event listeners to the mode buttons to start the game
modeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        // Hide the homepage and show the game screen
        homePage.classList.add("displayNone");
        gameScreen.classList.remove("displayNone");
        // Start the game with the appropriate settings based on the mode selected
        if (e.target.value === "player") {
            game.startGame("player 1", "player 2", "X", "O", false);
        } else if (e.target.value === "bot") {
            game.startGame("Human", "bot", "X", "O", true);
        }
    });
});
// ********************************/

// Player factory
// This function creates a new player object with the specified name, symbol, and score
const createPlayer = (name, symbol) => {
    let score = 0;

    const getName = () => name;
    const getSymbol = () => symbol;
    const getScore = () => score;
    const upScore = () => ++score;
    const resetScore = () => (score = 0);

    // Return an object with methods to access the player's name, symbol, and score
    return { getName, getSymbol, getScore, upScore, resetScore };
};

// A utility function to introduce a delay in executing a function
const delay = (myFunction, time) => {
    setTimeout(myFunction, time * 1000);
};

// Game module
// This module contains all the logic for the tic-tac-toe game
const game = (() => {
    // Initialize the game state
    let board = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
    ];
    let currentPlayer = null;
    let gameFinished = false;
    let roundFinished = false;
    let player1 = null;
    let player2 = null;
    let botMode = false;
    //  added all the eventLister of the board;
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
        cell.addEventListener("click", (e) => {
            playTurn(index);
        });
    });
    // Display controller object
    // This object contains methods to update the game board, scores, and messages displayed on the screen
    const displayController = (() => {
        const updateBoard = () => {
            cells.forEach((cell, index) => {
                cell.textContent = board[Math.floor(index / 3)][index % 3];
            });
        };

        const updateScores = () => {
            const scores = document.querySelectorAll(".score");
            scores[0].textContent = player1.getScore();
            scores[1].textContent = player2.getScore();
        };

        const showMessage = (message) => {
            const messageElement = document.querySelector(".message");
            messageElement.textContent = message;
        };
        // Return an object with methods to update the game board, scores, and messages
        return { updateBoard, showMessage, updateScores };
    })();

    // Start the game with the specified settings
    const startGame = (player1Name, player2Name, player1Symbol, player2Symbol, mode) => {
        player1 = createPlayer(player1Name, player1Symbol);
        player2 = createPlayer(player2Name, player2Symbol);
        botMode = mode;
        currentPlayer = player1;

        displayController.updateBoard();
        displayController.showMessage(`${currentPlayer.getName()}'s turn`);
    };
    // this method will handle all the logic of the game
    const playTurn = (index) => {
        if (!roundFinished && board[Math.floor(index / 3)][index % 3] === "") {
            board[Math.floor(index / 3)][index % 3] = currentPlayer.getSymbol();
            displayController.updateBoard();
            if (checkAnyWin(board)) {
                roundFinished = true;
                currentPlayer.upScore();
                displayController.updateScores();
                displayController.showMessage(`${currentPlayer.getName()} wins!`);
                // the win condition of the game is 3 round so the condition here need to be 3
                if (currentPlayer.getScore() === 3) {
                    gameFinished = true;
                }
            } else if (checkTie()) {
                roundFinished = true;
                displayController.showMessage(`Draw!`);
            } else {
                // if the round doesn't end (roundFinished = false) the current player switch
                currentPlayer = currentPlayer === player1 ? player2 : player1;
                displayController.showMessage(`${currentPlayer.getName()}'s turn`);
                if (botMode && currentPlayer === player2) {
                    botPlay();
                }
            }
        }
        if (roundFinished) {
            if (gameFinished) {
                delay(resetGame, 2);
            } else {
                board = [
                    ["", "", ""],
                    ["", "", ""],
                    ["", "", ""],
                ];
                delay(displayController.updateBoard, 0.5);
                roundFinished = false;
                currentPlayer = player1;
            }
        }
    };

    const botPlay = () => {
        let bestScore = -Infinity;
        let bestMove = 0;
        board.forEach((cells, row) => {
            cells.forEach((cell, col) => {
                if (cell === "") {
                    board[row][col] = player2.getSymbol();
                    let score = minimax(board, 7, false, -Infinity, +Infinity);
                    board[row][col] = "";
                    console.log(score);
                    if (score !== undefined && score > bestScore) {
                        bestScore = score;
                        bestMove = row * 3 + col;
                    }
                }
            });
        });
        console.log(bestScore);
        playTurn(bestMove);
    };

    const checkAnyWin = (node) => {
        // Check for a win
        for (let i = 0; i < 3; i++) {
            if (node[i][0] === node[i][1] && node[i][0] === node[i][2] && node[i][0] !== "") {
                return true;
            }
            if (node[0][i] === node[1][i] && node[0][i] === node[2][i] && node[0][i] !== "") {
                return true;
            }
        }
        if (node[0][0] === node[1][1] && node[0][0] === node[2][2] && node[0][0] !== "") {
            return true;
        }
        if (node[0][2] === node[1][1] && node[0][2] === node[2][0] && node[0][2] !== "") {
            return true;
        }

        return false;
    };

    const checkTie = () => {
        return board.every((row) => row.every((cell) => cell !== ""));
    };

    const resetGame = () => {
        board = [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""],
        ];
        currentPlayer = null;
        gameFinished = false;
        roundFinished = false;
        player1.resetScore();
        player2.resetScore();
        displayController.updateBoard();
        displayController.updateScores();
        displayController.showMessage("");
        currentPlayer = player1;
        displayController.showMessage(`${currentPlayer.getName()}'s turn`);
    };

    function minimax(node, depth, maximizingPlayer, alpha, beta) {
        if (depth === 0 || checkTie(node) || checkAnyWin(node)) {
            if (checkMarkedWin(node, player1.getSymbol())) {
                return -1;
            }

            if (checkMarkedWin(node, player2.getSymbol())) {
                return 1;
            } else return 0;
        }

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (let child of getChildren(node, player2.getSymbol())) {
                let eval = minimax(child, depth - 1, false, alpha, beta);
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) {
                    break;
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let child of getChildren(node, player1.getSymbol())) {
                let eval = minimax(child, depth - 1, true, alpha, beta);
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) {
                    break;
                }
            }
            return minEval;
        }
    }

    function getChildren(node, symbol) {
        let children = [];
        node.forEach((cells, row) => {
            cells.forEach((cell, col) => {
                if (cell === "") {
                    let child = node.map((row) => [...row]);
                    child[row][col] = symbol;
                    children.push(child);
                }
            });
        });

        return children;
    }

    const checkMarkedWin = (node, mark) => {
        for (let i = 0; i < 3; i++) {
            if (node[i][0] === node[i][1] && node[i][0] === node[i][2] && node[i][0] === mark) {
                return true;
            }
            if (node[0][i] === node[1][i] && node[0][i] === node[2][i] && node[0][i] === mark) {
                return true;
            }
        }
        if (node[0][0] === node[1][1] && node[0][0] === node[2][2] && node[0][0] === mark) {
            return true;
        }
        if (node[0][2] === node[1][1] && node[0][2] === node[2][0] && node[0][2] === mark) {
            return true;
        }

        return false;
    };

    return { startGame, playTurn, resetGame };
})();
