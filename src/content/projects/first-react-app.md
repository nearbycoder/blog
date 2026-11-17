---
title: "First React App"
summary: "A first React app, from July 2015: a pin board of sticky notes you can drag, resize, tilt, edit and delete, built with React 0.13, in-browser JSX and jQuery UI."
role: "Creator"
createdAt: "2015-07-08"
year: "2015"
stack: ["JavaScript", "React", "jQuery UI", "Bootstrap"]
githubLink: "https://github.com/nearbycoder/first-react-app"
image: "/images/projects/first-react-app.webp"
imageAlt: "A bright blue board covered in twenty overlapping sticky notes in red, purple, orange, navy, teal, green, yellow and slate, each tilted a little and written in a handwritten font with meat names like Brisket fatback biltong short loin, Picanha beef ribs bacon, Pancetta bacon meatball kielbasa and Ham hock shankle shank, and a plus button in the top right corner."
imageCaption: "The board as it loads, with twenty notes from the Bacon Ipsum API. Captured by running the project locally from its source."
featured: false
accent: "sky"
draft: false
---

The repository is named for what it is: a first React app, a pin board built over four days in July 2015. The page, titled "React Bulletin Board", fills a blue board with 20 sticky notes, each at a random spot with a slight tilt and one of eleven colors, in a handwritten font. You can drag notes around, resize them, edit or delete them with buttons that appear on hover, and add one reading "New Note" with the + button.

The notes' text comes from the Bacon Ipsum API: the board asks for 20 sentences, splits them up and cuts each one to 40 characters. The README's "new additions" were rotation and random colors. Each note has a rotate button that turns red when it's on, and while it's on, dragging the note also spins it, by as many degrees as it sits pixels from the left edge.

<figure><img src="/images/projects/first-react-app-notes.webp" alt="Three sticky notes on the blue board: a slate note reading Bacon ipsum dolor amet hamburger tenderl, a teal note in edit mode with a textarea holding Meatball tail t-bone, buffalo andouille and a green save button, and a green note reading Chislic pig kevin, bacon turducken landj, turned clockwise, with red delete, blue edit and red rotate buttons showing." width="1208" height="590" loading="lazy" /><figcaption>A note being edited, and one with rotate turned on after a drag. The other seventeen notes were deleted with their own buttons.</figcaption></figure>

## How it's built

The app is three files: `index.html`, a stylesheet and `js/Note.js`. React 0.13.3 and its JSXTransformer load from Facebook's fb.me links, and the transformer compiles the JSX in the browser. A `Board` component holds the list of notes and checks its `count` prop with a custom validator that warns when it isn't a number or is over 300. Each `Note` is a `React.createClass` component that hands its DOM node to jQuery UI's draggable and resizable, and Bootstrap 3 supplies the buttons and their icons.

<figure>
  <picture><source srcset="/images/projects/first-react-app-note-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/first-react-app-note.webp" alt="Lines 5 to 29 of Note.js: componentWillMount sets willRotate to false, lists eleven hex colors, and builds a style with a random right and top position, a random rotation and a random background color; componentDidMount makes the note draggable within the window, sets a rotate transform from ui.position.left while willRotate is true, and makes it resizable." width="1440" height="1041" loading="lazy" /></picture>
  <figcaption>Each note picks its own position, tilt and color, then becomes a jQuery UI draggable that can also rotate.</figcaption>
</figure>

## Running it today

It still runs as it was. The fb.me links for React now redirect to unpkg, and the jQuery, jQuery UI, Bootstrap and Google Fonts links still answer. Serve the folder with any static web server: JSXTransformer fetches `js/Note.js` with an XHR, which the browser blocks when the page is opened as a file. The notes depend on Bacon Ipsum, which answered when these screenshots were taken on November 17, 2026 but was refusing connections later that day. Without it the board starts empty, though the + button still adds notes.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by running the project locally from its unmodified source, with note text from the live Bacon Ipsum API, and the code card shows the project's own source.
