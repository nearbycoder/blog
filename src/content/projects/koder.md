---
title: "koder"
summary: "A small programming puzzle for the browser from November 2020. You write JavaScript in a Monaco editor to walk a player across a grid, around walls and over stars, with a limit on how many calls you can make."
role: "Creator"
createdAt: "2020-11-15"
year: "2020"
stack: ["JavaScript", "React", "Create React App", "Monaco Editor", "Tailwind CSS"]
githubLink: "https://github.com/nearbycoder/koder"
image: "/images/projects/koder.webp"
imageAlt: "koder after a run: on the left, a dark Monaco editor with comments listing up, down, left, right, loop and func, and two func blocks of loop calls; on the right, Star Count: 3, Call Count: 2 and Max Call Count: 5 with Reset and Stop buttons above a 10 by 10 grid with two dark wall blocks and a gray path from the top-left corner to the player near the bottom-right corner."
imageCaption: "The sample program after a run, with all three stars collected in two calls. Captured from a local build of the source."
featured: false
accent: "cyan"
draft: false
---

koder is a small programming puzzle in the browser. The left half of the screen is a code editor, and the right half is a 10 by 10 grid with a player in the top-left corner, two walls, three stars and a blue square near the bottom-right corner. You write a program with `up()`, `down()`, `left()`, `right()`, `loop(direction, count)` and `func(() => { ... })`, press Run, and the player walks it out one square every 100 milliseconds, picking up stars on the way.

All eight commits are from November 14 and 15, 2020, starting from a fresh Create React App project, and it hasn't changed since. The package was called smeeborg-teen-edition until a commit named "update name" renamed it koder.

## How it plays

- The editor opens with a comment listing the functions and a sample program: two `func` blocks of `loop` calls that walk to the blue square and collect all three stars.
- `loop(DOWN, 3)` moves several squares in one call. `func` groups up to three calls, and more than that stops the run with "Only 3 function calls in function allowed".
- The header counts stars and calls, with a maximum of five calls. Going over shows "Max Calls Created" and "You Lose, Please Try Again".
- Walking into a wall or off the board stops the run with "Blocked By Wall" or "Invalid Move" and turns the player's square red. Code that throws shows "Compiler Error, Please Try Again!".
- Reset puts the board back, Stop cancels the remaining moves, and Ctrl+S or Cmd+S formats the program with Prettier.

Only one board is built in, and nothing checks for the blue square, so a run simply ends when the moves run out.

<div class="project-media-gallery">
  <figure><img src="/images/projects/koder-wall.webp" alt="koder with the program loop(RIGHT, 4) under the comment Walk right until something stops us. The header shows Call Count: 1 and the error Blocked By Wall in red, and on the grid the player stands on a red square in the top row, right next to the first wall." width="1440" height="900" loading="lazy" /><figcaption>A program typed in for this capture walks into the first wall. Local build of the source.</figcaption></figure>
  <figure><img src="/images/projects/koder-narrow.webp" alt="koder at 768 pixels wide: the star and call counts with Reset and Stop buttons and the grid after a run on top, and the dark code editor with the sample program below it." width="900" height="1200" loading="lazy" /><figcaption>Below 1024 pixels wide, the board sits above the editor. Captured at 768 by 1024.</figcaption></figure>
</div>

The narrow layout came from the last commit, "mobile friendly". Each half takes half the screen's height, so on a phone the board is taller than its half and spills over the editor.

## How it's built

It's a Create React App 4 project with React 17. react-app-rewired adds the Monaco webpack plugin, so the editor is Monaco, through react-monaco-editor, with JavaScript as its only language and the dark theme. Styling is Tailwind CSS 1.9 with the Tailwind UI plugin, compiled by an npm script before `start` and `build`, and Prettier 1.13 loads from unpkg for formatting.

The whole game lives in `src/App.js`. Run hands the program to `eval` inside a function that defines the movement functions, so the program can call them directly. Each move schedules a `setTimeout` 100 milliseconds after the last one, which is what animates the walk, and Stop clears the moves that haven't happened yet.

<figure>
  <picture><source srcset="/images/projects/koder-func-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/koder-func.webp" alt="Lines 207 to 232 of src/App.js: a loop function that counts a call when it isn't inside a func and then evaluates the direction name to call the matching move function with the count, and a func function that resets a per-function call counter, sets the limit to three, runs the callback, and sets the error Only 3 function calls in function allowed and stops if the limit was passed." width="1440" height="1041" loading="lazy" /></picture>
  <figcaption>loop and func in src/App.js, which count calls and enforce the three-call limit.</figcaption>
</figure>

## Running it today

`npm install` and `npm start` still work with Node 14. `npm start` compiles the Tailwind CSS first and serves the app on port 8080.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by running the project locally from its source, and the code card shows a real excerpt of `src/App.js`.
