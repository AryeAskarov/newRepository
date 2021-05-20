'use strict'
console.log('** Mine Sweeper 2021 by Arye Askarov **');

const MINE = '🎇';
const FLAG = '🚩';
const MINE_BOOM = '💥';
const HINT = '❔';

const SMILEY = '😀';
const SMILEY_WIN = '🤴';
const SMILEY_LOST = '😭';
const SMILEY_POWER = '😎'
const SMILE_BOOM = '😲';


var gTimerInterval;
var gId = 0;
var gBoard;
var gLevel = {
    SIZE: 0,
    MINES: 0
};
var gMine;
var gScore = 0;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isTimeOn: false,
    isFirsMine: false
};

var gLife = 0;
var gSafeClikes = 0;
var gUsedSafeClickes = 0;
var gHints = 0;
var gUsedHints=0;
var gIsSafeBtnUsed = false;
var gIsLifeBtnUsed = false;
var gIsHintsBtnUsed = false;
var isSafeClickOn = false;
var isHintOn = false;



// This is called when page loads
function initGame() {
    renderPowerUps();
    renderSmiley(SMILEY)
    gGame.shownCount = 0;
    gGame.isOn = true;
    gGame.isFirsMine = false;
    gBoard = buildBoard(gLevel.SIZE);
    setMines(gBoard);
    showNeighbours(gBoard);
    renderBoard(gBoard, '.game-board');

}

function starOver() {
    gScore = 0;
    gIsSafeBtnUsed = false;
    gIsLifeBtnUsed = false;
    isSafeClickOn = false;
    isHintOn = false;
    gGame.isOn = false;
    gGame.isTimeOn = false;
    gGame.shownCount = 0;
    gGame.secsPassed = 0;
    gGame.markedCount = 0;
    gSafeClikes = 0;
    gUsedSafeClickes = 0;
    clearInterval(gTimerInterval);
    renderScore(0);
    renderTime()
    gLife = 0;
    gHints = 0;
    addLifes(gLife);
    clearSafeClick()
    clearHint()
    clearLife()
    initGame()
}

function getCell(i, j) {
    var cell = {
        id: gId++,
        location: { i: i, j: j },
        neighbours: 0,
        color: 'black',
        isMine: false,
        isFlag: false,
        isVisible: false,
        isBoom: false
    }
    // console.log('cell',cell);
    return cell;
}

// Builds the board Set mines at random location Call setMinesNegsCount() Return the created board
function buildBoard(size = 4) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = getCell(i, j);
        }
    }
    console.log('buildBoard:', board);
    return board;
}


// Count mines around each cell and set the cell's minesAroundCount.
function setMines(board) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var cell = board[getRandInc(0, board.length - 1)][getRandInc(0, board.length - 1)];
        if (!cell.isMine) cell.isMine = true;
        else i--;
    }
}
function setOneMine(cellI, cellJ, board) {
    if ((gLevel.SIZE ** 2) < (gLevel.MINES - 3)) {
        console.log('Too many mines in the game');
        return;
    }
    var isSet = false;
    while (!isSet) {
        var cell = board[getRandInc(0, board.length - 1)][getRandInc(0, board.length - 1)];
        if (cell.location.i === cellI && cell.location.j === cellJ) continue;
        if (cell.isMine) continue;
        cell.isMine = true;
        console.log('Place mine in a new locatin', cell, cell.location.i, cell.location.j)
        isSet = true;
    }
}

function countMineNeighbours(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            var cell = board[i][j];
            cell.neighbours++;
        }
    }
}
function showNeighbours(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (cell.isMine) {
                countMineNeighbours(i, j, board);
            }
        }
    }
}

function resetNeighbours(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            cell.neighbours = 0;
        }
    }
}


// Render the board as a <table> to the page
function renderBoard(board, selector) {
    var inputCell = '';
    var cellStyle = '';
    var strHTML = `<table><tbody>`;
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (cell.isMine && !gGame.isOn && !cell.isVisible) {
                inputCell = MINE;
                cellStyle = 'unVisible';
                console.log("SHOW")
            }
            if (!cell.isVisible) {
                inputCell = ' '
                cellStyle = 'unVisible';
                if (cell.isFlag) {
                    inputCell = FLAG;
                    cellStyle = 'unVisible'
                }
            } else {
                if (cell.isMine) {
                    inputCell = MINE_BOOM;
                    cellStyle = 'onMine';
                    // cellStyle = 'visible';
                }
                else if (cell.neighbours) {
                    inputCell = cell.neighbours;
                    cellStyle = 'visible';
                }
                else {
                    inputCell = ' ';
                    cellStyle = 'visible';
                }
            }
            var className = `cell-${i}-${j}`;
            strHTML += `<td id="${className}" class="cell ${cellStyle}" 
            onclick="cellClicked(this)" oncontextmenu="cellMarked(this)">${inputCell}</td>`;
        }
        strHTML += `</tr>`
    }
    strHTML += `</tbody></table>`;
    var elGameBord = document.querySelector(selector);
    // console.log('elGameBord:', elGameBord);
    elGameBord.innerHTML = strHTML;
    // console.log('strHtml:', strHTML);
}

// Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
function cellMarked(mouseEvent) {
    if (!gGame.isOn) return;
    // console.log('mouseEvent:',mouseEvent);
    var cellPos = getCellPos(mouseEvent.id);
    console.log('cellPosFLAG:', cellPos);
    renderCell(cellPos.i, cellPos.j, FLAG);
    var cell = gBoard[cellPos.i][cellPos.j];
    if (cell.isVisible) return;
    if (!cell.isFlag) {
        cell.isFlag = true;
        if (!cell.isMine) gGame.markedCount++
    } else {
        cell.isFlag = false;
        gGame.markedCount--
        renderCell(cellPos.i, cellPos.j, ' ');
    }
    console.log('gGame.markedCount:', gGame.markedCount);
}


// Called when a cell (td) is clicked
function cellClicked(elCell) {
    if (!gGame.isOn) return;
    if (isSafeClickOn) return;
    renderSmiley(SMILEY);
    var cellPos = getCellPos(elCell.id);
    console.log('cellPos:', cellPos);
    var cell = gBoard[cellPos.i][cellPos.j];
    if (isHintOn) {
        openArea(cellPos.i, cellPos.j, gBoard);
        renderBoard(gBoard, '.game-board');
        renderSmiley('🤓');
        setTimeout(function () {
            renderBoard(gBoard, '.game-board');
            renderSmiley(SMILEY);
            closeArea(cellPos.i, cellPos.j, gBoard)
            isHintOn = false;
            renderBoard(gBoard, '.game-board');
        }, 2000);      
    }
    if (!cell.isVisible && !cell.isFlag) {
        if (!cell.neighbours) expandShown(gBoard, cellPos.i, cellPos.j);
        cell.isVisible = true;
        if(!cell.isMine) gGame.shownCount++;
        console.log('gGame.shownCount', gGame.shownCount);
        renderScore(0);
        if (gGame.shownCount > 0 && !gGame.isTimeOn) {
            gGame.isTimeOn = true;
            gTimerInterval = setInterval(renderTime, 1000);
        }
        // console.log('cell:',cell);
        renderBoard(gBoard, '.game-board');
        // console.log('gGame.shownCount:', gGame.shownCount)
    }
    if (cell.isMine && !cell.isFlag && !cell.isBoom) {
        if (!gGame.isFirsMine && gGame.shownCount <= 1) {
            renderScore(0);
            cell.isMine = false;
            console.log('START ON MINE');
            setOneMine(cellPos.i, cellPos.j, gBoard);
            resetNeighbours(gBoard);
            showNeighbours(gBoard);
            renderBoard(gBoard, '.game-board');
            gGame.isFirsMine = true;
            return;
        }
        gMine = elCell;                                 // location of mine
        cell.isBoom = true;
        if (gLife === 0) {
            cell.isBoom = true;
            renderSmiley(SMILEY_LOST);
            console.log('Game over 😭');
            checkGameOver();
            return;
        }
        gLife--;
        renderSmiley(SMILE_BOOM);
        addLifes(gLife);
        return;
        // elCell.classList.add('onMine');
    }
    // console.log('gGame.shownCount',gGame.shownCount)
    if (gGame.shownCount >= ((gLevel.SIZE ** 2) - gLevel.MINES)) {
        renderSmiley(SMILEY_WIN);
        // if (gGame.markedCount === gLevel.MINES){
        //     console.log('Victory 😃');
        //     gGame.shownCount+=20;
        //     checkGameOver();
        // }
        console.log('Victory 😃');
        gGame.shownCount += 20;
        checkGameOver();
        return;
    }
}


// Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {
    addLifes(gLife);
    gGame.isOn = false;
    renderAllMines(gBoard);
    renderScore(gGame.secsPassed);
    gGame.shownCount = 0;
    clearInterval(gTimerInterval);
    // gTimer.time=0;
    // renderBoard(gBoard, '.game-board')
}


// When user clicks a cell with nomines around, we need to open not only that cell, but also its neighbors. 
// NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
// BONUS: if you have the timelater, try to work more like the real algorithm (see description at the Bonuses section below
function expandShown(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            var cell = board[i][j];
            if (cell.neighbours === 0 && !cell.isVisible && !cell.isFlag) {
                cell.isVisible = true;
                gGame.shownCount++
                renderScore(0);
                // console.log('gGame.shownCountEX:', gGame.shownCount)
            }
        }
    }
    renderBoard(gBoard, '.game-board');
}


// function expandShown(board, cell, cellI, cellJ) {
//     console.log('cell:',cell)
//     if (cell.neighbours === 0 && !cell.isVisible && !cell.isMine) {
//         cell.isVisible = true;
//         gGame.shownCount++
//     } else return;
//     if (cellI <= 0) return;
//     else {
//         --cellI;
//         cell = board[cellI][cellJ];
//         expandShown(board, cell, cellI, cellJ);
//     }
//     if (cellI >= board.length) return;
//     else {
//         ++cellI;
//         cell = board[cellI][cellJ];
//         expandShown(board, cell, cellI, cellJ);
//     }
//     if (cellJ <= 0) return;
//     else {
//         --cellJ;
//         cell = board[cellI][cellJ];
//         expandShown(board, cell, cellI, cellJ);
//     }
//     if (cellJ >= board[0].length) return;
//     else {
//         ++cellJ;
//         cell = board[cellI][cellJ];
//         expandShown(board, cell, cellI, cellJ);
//     }
//     renderBoard(gBoard, '.game-board');
// }

function getGameLevel(elId) {
    if (gGame.secsPassed) return;
    var elGetLevel = document.getElementById(elId);
    switch (elGetLevel.innerText) {
        case 'Beginner':
            gLevel.SIZE = 4;
            gLevel.MINES = 3;
            console.log('Level: Beginner ,SIZE', gLevel.SIZE, '*', gLevel.SIZE, ',MINES', gLevel.MINES);
            break;
        case 'Medium':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            console.log('Level: Medium ,SIZE', gLevel.SIZE, '*', gLevel.SIZE, ',MINES', gLevel.MINES);
            break;
        case 'Expert':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            console.log('Level: Expert ,SIZE', gLevel.SIZE, '*', gLevel.SIZE, ',MINES', gLevel.MINES);
            break;
        default:
            break;

    }
    // console.log('elGetLevel:',elGetLevel.innerText);
    initGame();

}

function getCellPos(strCellId) {
    var parts = strCellId.split('-')
    var position = { i: +parts[1], j: +parts[2] };
    return position;
}

function renderCell(i, j, value) {
    var elCell = document.querySelector(`#cell-${i}-${j}`)
    elCell.innerText = value;
}

function renderAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j];
            if (cell.isMine && !cell.isBoom) renderCell(i, j, MINE);
            else if (cell.isMine && cell.isBoom) renderCell(i, j, MINE_BOOM);
        }
    }
}

function getRandInc(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function renderTime() {
    gGame.secsPassed++;
    if (!gGame.isTimeOn) gGame.secsPassed = 0;
    var elTime = document.querySelector('#timer');
    // console.log('elTime:',elTime);  
    elTime.innerText = gGame.secsPassed;
}

function renderScore(value) {
    gScore = (gGame.shownCount * 5) - value;
    var elScore = document.querySelector('#score');
    if (gScore < 0) gScore = 0;
    // console.log('gScore:',gScore);
    elScore.innerText = gScore;
}

function renderSmiley(value) {
    var elSmiley = document.querySelector('#smiley-face');
    // console.log('elSmiley:',elSmiley);
    elSmiley.innerText = value;
}

////////////////////////////POWER UPS/////////////////////////////////

function renderPowerUps() {
    var elPowerUps = document.querySelector('.power-ups');
    elPowerUps.innerHTML = `<button onclick="usePowerUps('bt4')"><span id="bt4">Power-ups</span></button>`;
}
function usePowerUps(btn) {
    if (gGame.shownCount) {
        document.getElementById("bt4").style.color = "red";
        return;
    }
    renderSmiley(SMILEY_POWER);
    var elPowerUps = document.querySelector('.power-ups');
    elPowerUps.innerHTML = `<button onclick="openLife('2')"><span id="bt5">3 Lives</span></button>
    <button onclick="openHints('3')"><span id="bt6">3 Hints</span></button>
    <button onclick="openSefeClick('3')"><span id="bt7">3 Safe Click</span></button>`;
}

function openHints(value){
    if(gIsHintsBtnUsed) return;
    addHints(value);
    gIsHintsBtnUsed = true;
}

function addHints(value){
    gHints = value;
    var elPowerUps = document.querySelector('.power-ups-hints');
    elPowerUps.innerText = '';
    for (var i = 1; i <= gHints; i++) {
        elPowerUps.innerText += '💡';
    }
    for (var i = 1; i <= gUsedHints; i++) {
        elPowerUps.innerText += '📍';
    }
}

function openArea(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            var cell = board[i][j];
            cell.isVisible = true;
        }
    }
}
function closeArea(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            var cell = board[i][j];
            cell.isVisible = false;
        }
    }
}



function useHints() {
    // console.log('click');
    if (!gGame.shownCount) return;
    if (gHints > 0) {
        gUsedHints++;
        gHints--;
        addHints(gHints);
        isHintOn = true;
        renderSmiley('🤓');
    }
}

// function setHint(){
//         renderSmiley('🤓');
//         setTimeout(function () {
//             renderBoard(gBoard, '.game-board');
//             renderSmiley(SMILEY);
//             isHintOn = false;
//         }, 5000);      
// }


function openLife(value){
    // if (gGame.shownCount) return;
    if (gIsLifeBtnUsed) return;
    addLifes(value);
    gIsLifeBtnUsed = true;
}

function addLifes(value) {
    gLife = value;
    var elPowerUps = document.querySelector('.power-ups-lifes');
    elPowerUps.innerText = '';
    if (gLife === 0) return;
    for (var i = 0; i <= gLife; i++) {
        elPowerUps.innerText += '🧡';
    }

}
function openSefeClick(value) {
    // if (gGame.shownCount) return;
    if (gIsSafeBtnUsed) return;
    addSafeClick(value)
    gIsSafeBtnUsed = true;
}
function addSafeClick(value) {
    gSafeClikes = value;
    var elPowerUps = document.querySelector('.power-ups-safeclick');
    elPowerUps.innerText = '';
    for (var i = 1; i <= gSafeClikes; i++) {
        elPowerUps.innerText += '🟦';
    }
    for (var i = 1; i <= gUsedSafeClickes; i++) {
        elPowerUps.innerText += '✅';
    }
}

function clearSafeClick() {
    var elPowerUps = document.querySelector('.power-ups-safeclick');
    elPowerUps.innerText = '';
}
function clearLife() {
    var elPowerUps = document.querySelector('.power-ups-lifes');
    elPowerUps.innerText = '';
}
    function clearHint() {
        var elPowerUps = document.querySelector('.power-ups-hints');
        elPowerUps.innerText = '';
}
function useSafeClick() {
    // console.log('click');
    if (!gGame.shownCount) return;
    if (gSafeClikes > 0) {
        gUsedSafeClickes++;
        gSafeClikes--;
        addSafeClick(gSafeClikes);
        setSafeClick(gBoard);
    }
}
function setSafeClick(board) {
    if ((gLevel.SIZE ** 2) < (gLevel.MINES - 3)) {
        console.log('Too many mines in the game');
        return;
    }
    isSafeClickOn = true;
    var isSet = false;
    while (!isSet) {
        var cell = board[getRandInc(0, board.length - 1)][getRandInc(0, board[0].length - 1)];
        if (cell.isMine) continue;
        if (cell.isVisible) continue;
        cell.isVisible = true;
        renderSmiley('🧐');
        setTimeout(function () {
            cell.isVisible = false;
            renderBoard(gBoard, '.game-board');
            renderSmiley(SMILEY);
            isSafeClickOn = false;
        }, 3000);
        console.log('cell.location.i', cell.location.i);
        renderBoard(gBoard, '.game-board');
        console.log('used safe click on a location:', cell, cell.location.i, cell.location.j)
        isSet = true;
    }
}






