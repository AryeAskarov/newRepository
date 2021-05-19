'use strict'
console.log('Mine Sweeper 2021 by Arye Askarov');

const MINE = '🎇';
const FLAG = '🚩';

var gId = 0;
var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gMine;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


// This is called when page loads
function initGame() {
    gGame.shownCount = 0
    gGame.isOn = true;
    gBoard = buildBoard(gLevel.SIZE);
    setMinesNegsCount(gBoard);
    showNeighbours(gBoard);
    renderBoard(gBoard, '.game-board');
}

function getCell(i, j) {
    var cell = {
        id: gId++,
        location: { i: i, j: j },
        neighbours: 0,
        color: 'black',
        isMine: false,
        isFlag: false,
        isVisible: false
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
function setMinesNegsCount(board) {
    for(var i=0;i<gLevel.MINES;i++){
        var cell = board[getRandInc(0, board.length-1) ][getRandInc(0, board.length-1) ]; 
        if (!cell.isMine)cell.isMine = true; 
        else i--;
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
function showNeighbours(board){
    for (var i = 0; i < board.length; i++) {
         for (var j = 0; j < board[0].length; j++){
            var cell = board[i][j];
            if (cell.isMine) {
            countMineNeighbours(i, j, board);
            }
        }
    }
}

// Render the board as a <table> to the page
function renderBoard(board, selector) {
    var inputCell = '';
    var cellStyle = '';
    var strHTML = `<table border="0"><tbody>`;
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (cell.isMine && !gGame.isOn && !cell.isVisible){
                inputCell = MINE;
                cellStyle = 'unVisible';
                console.log("SHOW")
            }
            if (!cell.isVisible){
                inputCell = ' '
                cellStyle = 'unVisible';   
            }else{
                if (cell.isMine){
                    inputCell = MINE;
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
            strHTML += `<td id="${className}" class="cell ${cellStyle}" onclick="cellClicked(this)">${inputCell}</td>`;
        }
        strHTML += `</tr>`
    }
    strHTML += `</tbody></table>`;
    var elGameBord = document.querySelector(selector);
    // console.log('elGameBord:', elGameBord);
    elGameBord.innerHTML = strHTML;
    // console.log('strHtml:', strHTML);
}

// Called when a cell (td) is clicked
function cellClicked(elCell){
    if (gGame.isOn === false) return;
    var cellPos = getCellPos(elCell.id);
    console.log('cellPos:',cellPos);
    var cell = gBoard[cellPos.i][cellPos.j];
    if (!cell.isVisible){
        cell.isVisible = true;
        // console.log('cell:',cell);
        renderBoard(gBoard, '.game-board'); 
        gGame.shownCount++
    }
    if (cell.isMine) {
        gMine = elCell;
        console.log('Game over 😭');
        checkGameOver()
        // elCell.classList.add('onMine');
    }    
    // console.log('gGame.shownCount',gGame.shownCount)
    if (gGame.shownCount===((gLevel.SIZE**2)-gLevel.MINES)){
        console.log('Victory 😃');
        checkGameOver();
    }
 }

// Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
function cellMarked(elCell) { }

// Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {
    gGame.isOn = false;
    renderAllMines(gBoard);
    gGame.shownCount = 0;

    // renderBoard(gBoard, '.game-board')
}


// When user clicks a cell with nomines around, we need to open not only that cell, but also its neighbors. 
// NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
// BONUS: if you have the timelater, try to work more like the real algorithm (see description at the Bonuses section below
function expandShown(board, elCell, i, j) { }

function getCellPos(strCellId) {
    var parts = strCellId.split('-')
    var position = { i: +parts[1], j: +parts[2] };
    return position;
}
function renderMineCells(){

}
function renderCell(i, j, value) {
    var elCell = document.querySelector(`#cell-${i}-${j}`)
    elCell.innerText = value;
}
function renderAllMines(board){
    for (var i=0;i<board.length;i++){
        for (var j=0;j<board.length;j++){
            var cell = board[i][j];
            if (cell.isMine) renderCell(i, j, MINE);
        }
    }
}

function getRandInc(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
