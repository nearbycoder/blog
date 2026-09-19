import { mountDoom } from "./desktop-doom";
import {
  flagCell,
  newSweep,
  revealCell,
  shuffled,
  SWEEP_BUGS,
  SWEEP_SIZE,
} from "../lib/desktop-games";

export function mountArcade(
  root: HTMLElement,
  party: () => string,
): () => void {
  const controller = new AbortController();
  const events = { signal: controller.signal };
  const disposeDoom = mountDoom(root, events);
  const find = <T extends HTMLElement = HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  root
    .querySelectorAll<HTMLButtonElement>("[data-arcade-select]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          root
            .querySelectorAll<HTMLButtonElement>("[data-arcade-select]")
            .forEach((tab) =>
              tab.setAttribute("aria-pressed", String(tab === button)),
            );
          root
            .querySelectorAll<HTMLElement>("[data-arcade-panel]")
            .forEach((panel) => {
              panel.hidden =
                panel.dataset.arcadePanel !== button.dataset.arcadeSelect;
            });
          if (button.dataset.arcadeSelect === "terminal")
            find<HTMLInputElement>("#arcade-command").focus();
        },
        events,
      );
    });

  const memory = find("[data-memory-board]");
  const memoryStatus = find("[data-memory-status]");
  const symbols = ["{ }", "</>", "[ ]", "=>", "#", "@"];
  let deck: string[] = [],
    flipped: number[] = [],
    matched = new Set<number>(),
    moves = 0;
  let mismatch: ReturnType<typeof setTimeout> | undefined;
  function renderMemory() {
    [...memory.children].forEach((item, index) => {
      const button = item as HTMLButtonElement;
      const visible = flipped.includes(index) || matched.has(index);
      button.textContent = visible ? deck[index] : "?";
      button.dataset.state = matched.has(index)
        ? "matched"
        : visible
          ? "face-up"
          : "hidden";
      button.setAttribute(
        "aria-label",
        `Card ${index + 1}: ${visible ? deck[index] : "hidden"}${matched.has(index) ? ", matched" : ""}`,
      );
      button.setAttribute(
        "aria-disabled",
        String(visible || flipped.length === 2),
      );
    });
    memoryStatus.textContent =
      matched.size === deck.length
        ? `All six pairs found in ${moves} moves. Nicely done!`
        : `${moves} moves · ${matched.size / 2} / 6 pairs found`;
  }
  function resetMemory() {
    clearTimeout(mismatch);
    mismatch = undefined;
    deck = shuffled([...symbols, ...symbols]);
    flipped = [];
    matched = new Set();
    moves = 0;
    memory.replaceChildren(
      ...deck.map((_, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.card = String(index);
        return button;
      }),
    );
    renderMemory();
  }
  memory.addEventListener(
    "click",
    (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(
        "[data-card]",
      );
      if (!button) return;
      const index = Number(button.dataset.card);
      if (flipped.length === 2 || flipped.includes(index) || matched.has(index))
        return;
      flipped.push(index);
      if (flipped.length === 2) {
        moves++;
        if (deck[flipped[0]] === deck[flipped[1]]) {
          flipped.forEach((card) => matched.add(card));
          flipped = [];
        } else {
          mismatch = setTimeout(() => {
            flipped = [];
            renderMemory();
            mismatch = undefined;
          }, 850);
        }
      }
      renderMemory();
    },
    events,
  );
  find("[data-memory-reset]").addEventListener("click", resetMemory, events);
  resetMemory();

  const sweep = find("[data-sweep-board]");
  const sweepStatus = find("[data-sweep-status]");
  const flagButton = find<HTMLButtonElement>("[data-sweep-flag]");
  let board = newSweep(),
    flagMode = false,
    focusedCell = 0;
  const cells = board.cells.map((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.cell = String(index);
    return button;
  });
  sweep.append(...cells);
  function renderSweep(message = "") {
    const finished = board.status === "lost" || board.status === "won";
    flagButton.disabled = finished;
    cells.forEach((button, index) => {
      const cell = board.cells[index];
      const bug = cell.mine && board.status === "lost";
      const label = bug
        ? "bug"
        : cell.flagged
          ? "flagged"
          : cell.revealed
            ? `${cell.nearby} nearby bugs`
            : "hidden";
      button.textContent = bug
        ? "✹"
        : cell.flagged
          ? "⚑"
          : cell.revealed && cell.nearby
            ? String(cell.nearby)
            : "";
      button.dataset.state = bug
        ? "bug"
        : cell.flagged
          ? "flagged"
          : cell.revealed
            ? "revealed"
            : "hidden";
      button.setAttribute(
        "aria-label",
        `Row ${Math.floor(index / SWEEP_SIZE) + 1}, column ${(index % SWEEP_SIZE) + 1}: ${label}`,
      );
      button.setAttribute("aria-disabled", String(finished || cell.revealed));
      button.tabIndex = index === focusedCell ? 0 : -1;
    });
    const flags = board.cells.filter((cell) => cell.flagged).length;
    find("[data-sweep-count]").textContent = `${flags} / ${SWEEP_BUGS} flagged`;
    const revealed = board.cells.filter(
      (cell) => cell.revealed && !cell.mine,
    ).length;
    sweepStatus.textContent =
      board.status === "won"
        ? "Clean build! All 54 safe squares revealed."
        : board.status === "lost"
          ? "Found a bug! No production systems were harmed. Try a new board."
          : board.status === "ready"
            ? message || "Pick a square to begin."
            : `${message ? message + " · " : ""}${revealed} / 54 safe squares revealed`;
  }
  function playCell(index: number, flag = flagMode) {
    if (board.cells[index].revealed || ["won", "lost"].includes(board.status))
      return;
    focusedCell = index;
    const wasFlagged = board.cells[index].flagged;
    if (flag) flagCell(board, index);
    else revealCell(board, index);
    renderSweep(
      flag
        ? wasFlagged === board.cells[index].flagged
          ? "All ten flags are in use"
          : board.cells[index].flagged
            ? "Square flagged"
            : "Square unflagged"
        : wasFlagged
          ? "Unflag this square before revealing it"
          : "",
    );
  }
  sweep.addEventListener(
    "click",
    (event) => {
      const cell = (event.target as Element).closest<HTMLButtonElement>(
        "[data-cell]",
      );
      if (cell) playCell(Number(cell.dataset.cell));
    },
    events,
  );
  sweep.addEventListener(
    "contextmenu",
    (event) => {
      const cell = (event.target as Element).closest<HTMLButtonElement>(
        "[data-cell]",
      );
      if (!cell) return;
      event.preventDefault();
      playCell(Number(cell.dataset.cell), true);
      cell.focus();
    },
    events,
  );
  sweep.addEventListener(
    "keydown",
    (event) => {
      const cell = (event.target as Element).closest<HTMLButtonElement>(
        "[data-cell]",
      );
      if (!cell) return;
      const index = Number(cell.dataset.cell);
      const row = Math.floor(index / SWEEP_SIZE),
        col = index % SWEEP_SIZE;
      let next = index;
      if (event.key === "ArrowLeft")
        next = row * SWEEP_SIZE + Math.max(0, col - 1);
      else if (event.key === "ArrowRight")
        next = row * SWEEP_SIZE + Math.min(SWEEP_SIZE - 1, col + 1);
      else if (event.key === "ArrowUp")
        next = Math.max(0, row - 1) * SWEEP_SIZE + col;
      else if (event.key === "ArrowDown")
        next = Math.min(SWEEP_SIZE - 1, row + 1) * SWEEP_SIZE + col;
      else return;
      event.preventDefault();
      focusedCell = next;
      cells.forEach((button, i) => {
        button.tabIndex = i === next ? 0 : -1;
      });
      cells[next].focus();
    },
    events,
  );
  flagButton.addEventListener(
    "click",
    () => {
      flagMode = !flagMode;
      flagButton.setAttribute("aria-pressed", String(flagMode));
      sweepStatus.textContent = flagMode
        ? "Flag mode on. Select a hidden square to mark it."
        : "Reveal mode on. Select a square to uncover it.";
    },
    events,
  );
  find("[data-sweep-reset]").addEventListener(
    "click",
    () => {
      board = newSweep();
      focusedCell = 0;
      flagMode = false;
      flagButton.setAttribute("aria-pressed", "false");
      renderSweep();
    },
    events,
  );
  renderSweep();

  const output = find("[data-terminal-output]");
  const input = find<HTMLInputElement>("#arcade-command");
  function print(text: string) {
    const entry = document.createElement("div");
    entry.textContent = text;
    output.append(entry);
    while (output.children.length > 30) output.firstElementChild!.remove();
    output.scrollTop = output.scrollHeight;
  }
  print(
    "nearbyOS — curiosity edition\nType help to look around. Nothing here runs real shell commands.",
  );
  find<HTMLFormElement>("[data-terminal-form]").addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      const command = input.value.trim().slice(0, 120);
      if (!command) return;
      input.value = "";
      const normalized = command.toLowerCase().replace(/\s+/g, " ");
      if (normalized === "clear") {
        output.replaceChildren();
        input.focus();
        return;
      }
      let response: string;
      switch (normalized) {
        case "help":
          response =
            "Available: help, ls, whoami, cat README.txt, clear\nRumor has it this machine also makes coffee.\nNeed a hint? Open the note below.";
          break;
        case "ls":
          response =
            "memory.game   bug-sweep.game   doom.exe   README.txt\nOpen games with the buttons above.";
          break;
        case "whoami":
          response =
            "guest@nearbycoder\nCurious human. Welcome to Josh’s corner of the web.";
          break;
        case "sudo make coffee":
        case "coffee":
          response =
            "    ( (\n     ) )\n  .------.\n  |      |]\n  `------'\nCoffee compiled successfully.\nWarning: may cause side projects.";
          break;
        case "cat readme.txt":
          response =
            " /\\_/\\\n( o.o )\n > ^ <\nYou found the resident code reviewer.\nVerdict: needs more naps.\nP.S. Try party for the after-hours wallpaper.";
          break;
        case "party":
          response = party();
          break;
        case "sudo rm -rf /":
          response = "Nice try. The cat has revoked your sudo privileges.";
          break;
        case "42":
          response =
            "The answer checks out. The question is still in code review.";
          break;
        default:
          response = `Command not found: ${command}\nTry help. This is a pocket terminal, not a real shell.`;
      }
      print(`~ $ ${command}\n${response}`);
      input.focus();
    },
    events,
  );
  return () => {
    disposeDoom();
    clearTimeout(mismatch);
    controller.abort();
  };
}
