const board = document.querySelector(".puzzle-board");
const piecesBin = document.querySelector(".pieces-bin");
const menuModal = document.querySelector(".menu-modal");
const diffSelect = document.querySelector(".diff-select");

const maxBoardWidth = 300;
const maxBoardHeight = 300;
const difficulties = [
  { name: "Easy", size: 3 },
  { name: "Normal", size: 4 },
  { name: "Hard", size: 5 },
];

let currentDiff = 0;
let gridSize = 3;
let slotCount = gridSize * gridSize;
let slots = [];
let currentImageUrl = "";
let currentImg = null;
let boardWidth = 100;
let boardHeight = 100;
let tileWidth = boardWidth / gridSize;
let tileHeight = boardHeight / gridSize;

document.addEventListener("DOMContentLoaded", () => {
  start();
});

diffSelect.addEventListener("change", () => {
  currentDiff = parseInt(diffSelect.value);
  start();
});

piecesBin.addEventListener("dragover", (e) => e.preventDefault());
piecesBin.addEventListener("drop", placePiece);

function changeImage(file) {
  currentImageUrl = URL.createObjectURL(file);
  start();
}

async function start() {
  if (!currentImageUrl) currentImageUrl = `assets/images/boards/${getRandomInt(0, 8)}.png`;

  currentImg = await loadImage(currentImageUrl);

  gridSize = difficulties[currentDiff].size || 4;
  slotCount = gridSize * gridSize;

  slots = Array.from({ length: slotCount }, () => ({ filled: false, matched: false }));

  displayBoard();
  displayPieceBin();
  displayDiffSelect();
  toggleMenuModal(false);
}

function displayBoard() {
  // Calculate board dimensions
  const scale = Math.min(1, maxBoardWidth / currentImg.width, maxBoardHeight / currentImg.height);
  boardWidth = Math.round(currentImg.width * scale);
  boardHeight = Math.round(currentImg.height * scale);

  // Calculate tile sizes based purely on Grid Size and aspect-scaled board
  tileWidth = boardWidth / gridSize;
  tileHeight = boardHeight / gridSize;

  // Set dynamic Board CSS Grid (preserves true rectangular proportions)
  board.style.minWidth = `${boardWidth}px`;
  board.style.minHeight = `${boardHeight}px`;
  board.style.gridTemplateColumns = `repeat(${gridSize}, ${tileWidth}px)`;
  board.style.gridTemplateRows = `repeat(${gridSize}, ${tileHeight}px)`;

  // Create Board Drop Slots
  board.innerHTML = "";
  for (let i = 0; i < slotCount; i++) {
    const slotEl = document.createElement("div");
    slotEl.classList.add("slot");
    slotEl.style.width = `${tileWidth}px`;
    slotEl.style.height = `${tileHeight}px`;
    slotEl.dataset.index = i;

    slotEl.addEventListener("dragover", (e) => e.preventDefault());
    slotEl.addEventListener("drop", placePiece);
    slotEl.onclick = () => pickPiece(i);
    board.appendChild(slotEl);
  }
}

function updateBoard() {
  board.querySelectorAll(".slot").forEach((el, i) => {
    el.classList.toggle("filled", slots[i].filled);
  });
}

function displayPieceBin() {
  piecesBin.style.minHeight = `${tileHeight + 50}px`;

  // Slice original image onto individual Canvas Tiles
  const pieces = [];
  const srcTileWidth = currentImg.width / gridSize;
  const srcTileHeight = currentImg.height / gridSize;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const canvas = document.createElement("canvas");
      canvas.width = tileWidth;
      canvas.height = tileHeight;
      canvas.style.width = `${tileWidth}px`;
      canvas.style.height = `${tileHeight}px`;
      const ctx = canvas.getContext("2d");

      // Render cropped slice scaled to matched screen tile dimension
      ctx.drawImage(currentImg, col * srcTileWidth, row * srcTileHeight, srcTileWidth, srcTileHeight, 0, 0, tileWidth, tileHeight);

      const index = row * gridSize + col;
      canvas.classList.add("piece");
      canvas.draggable = true;
      canvas.dataset.index = index;
      canvas.id = `piece-${index}`;

      canvas.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", canvas.id);
      });

      pieces.push(canvas);
    }
  }

  // Shuffle pieces into bin
  piecesBin.innerHTML = "";
  pieces.sort(() => Math.random() - 0.5);
  pieces.forEach((piece) => piecesBin.appendChild(piece));
}

function placePiece(e) {
  e.preventDefault();
  const pieceId = e.dataTransfer.getData("text/plain");
  const pieceEl = document.getElementById(pieceId);

  if (e.target.classList.contains("slot")) {
    const targetSlot = e.target;
    const index = targetSlot.dataset.index;

    if (!slots[index].filled) {
      const prevIndex = pieceEl.dataset.slotIndex;
      if (prevIndex) {
        slots[prevIndex].filled = false;
        slots[prevIndex].matched = false;
      }

      slots[index].filled = true;
      slots[index].matched = pieceEl.dataset.index === index;
      pieceEl.dataset.slotIndex = index;

      targetSlot.appendChild(pieceEl);
      checkWin();
      updateBoard();
    }
  } else if (e.target.closest(".pieces-bin")) {
    const slotIndex = pieceEl.dataset.slotIndex;
    if (slotIndex) {
      pieceEl.dataset.slotIndex = "";
      slots[slotIndex].filled = false;
      slots[slotIndex].matched = false;

      piecesBin.prepend(pieceEl);
      updateBoard();
    }
  }
}

function pickPiece(slotIndex) {
  if (!slots[slotIndex].filled) return;

  const slotEl = document.querySelector(`.slot[data-index="${slotIndex}"]`);
  const pieceEl = slotEl.querySelector(".piece");

  pieceEl.dataset.slotIndex = "";
  slots[slotIndex].filled = false;
  slots[slotIndex].matched = false;
  piecesBin.appendChild(pieceEl);
  checkWin();
  updateBoard();
}

function checkWin() {
  const isWin = !slots.some((slot) => slot.matched === false);

  if (isWin) {
    setTimeout(() => fireConfetti(), 500);
  }
}

function toggleMenuModal(force) {
  const shouldHide = force !== undefined ? !force : undefined;
  menuModal.classList.toggle("hidden", shouldHide);
}

function displayDiffSelect() {
  diffSelect.innerHTML = difficulties
    .map(
      (item, i) => `
    <option value="${i}"${currentDiff === i ? " selected" : ""}>${item.name}</option>
  `,
    )
    .join("");
}

function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}
