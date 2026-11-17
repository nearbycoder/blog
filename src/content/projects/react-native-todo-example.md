---
title: "react-native-todo-example"
summary: "A small to-do list app for React Native 0.40, from January 2017. It adds, edits, completes, filters and clears to-dos, and saves the list on the device with AsyncStorage."
role: "Creator"
createdAt: "2017-01-20"
year: "2017"
stack: ["React Native", "JavaScript", "iOS"]
githubLink: "https://github.com/nearbycoder/react-native-todo-example"
image: "/images/projects/react-native-todo-example.webp"
imageAlt: "The to-do app in a landscape phone-sized window: a What needs to be done? field beside a check mark, three to-dos with switches and X buttons (Pick up groceries switched on and struck through, then Call the dentist and Water the plants), and a footer reading 2 count with All, Active, Completed and Clear Completed."
imageCaption: "The app with one of three sample to-dos completed. The repository's unchanged components, rendered in a browser with react-native-web 0.0.68 in place of the iOS and Android runtimes."
featured: false
accent: "rose"
draft: false
---

react-native-todo-example is a to-do list app for React Native, written in January 2017. You type a to-do in the field at the top and press return to add it. Each row has a switch to mark it done, a long press to edit its text, and an X to delete it. The footer counts what's left, filters the list to all, active or completed to-dos, and clears the completed ones. The check mark beside the field marks every to-do complete at once, and pressing it again unchecks them all.

The list is saved to AsyncStorage on every change, so it's still there after the app restarts. The repository is a single commit with no README: the standard React Native 0.40 project with the app in four files. It hasn't been touched since.

<div class="project-media-gallery">
  <figure><img src="/images/projects/react-native-todo-example-active.webp" alt="The app filtered to Active, showing Call the dentist and Water the plants with their switches off, the Active filter outlined, and 2 count in the footer." width="828" height="1472" loading="lazy" /><figcaption>The Active filter hides the completed to-do.</figcaption></figure>
  <figure><img src="/images/projects/react-native-todo-example-editing.webp" alt="Water the plants in edit mode, its text in a bordered multiline field with a green-outlined Save button, below the struck-through Pick up groceries and Call the dentist." width="828" height="1472" loading="lazy" /><figcaption>A long press turns a row into a text field with a Save button.</figcaption></figure>
</div>

## How it's built

`app.js` holds the state: the items, the current filter, the text being typed, and whether everything is marked complete. Every change goes through `setSource`, which hands the filtered items to the `ListView` data source and writes the whole list to AsyncStorage as JSON. While the saved list loads at startup, an `ActivityIndicator` covers the screen, and scrolling the list dismisses the keyboard.

<figure>
  <picture><source srcset="/images/projects/react-native-todo-example-state-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/react-native-todo-example-state.webp" alt="Lines 68 to 89 of app.js: setSource, which sets the items and the ListView data source and saves the items to AsyncStorage as JSON, followed by handleClearComplete, handleFilter and handleRemoveItem, which each build a new list and pass it through setSource." width="1440" height="897" loading="lazy" /></picture>
  <figcaption>Every change goes through setSource, which also saves the list. From app.js.</figcaption>
</figure>

The other three files are presentational. `header.js` has the check mark and the text field, `footer.js` the count, the filters and Clear Completed, and `row.js` a single to-do in its normal or editing state.

<figure>
  <picture><source srcset="/images/projects/react-native-todo-example-row-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/react-native-todo-example-row.webp" alt="Lines 17 to 44 of row.js: the editing component, an autofocused multiline TextInput; a Save button that ends editing; and the row's render, a Switch bound to complete followed by either the text field or the text, and either Save or the remove button." width="1440" height="1113" loading="lazy" /></picture>
  <figcaption>A row and its editing state. From row.js.</figcaption>
</figure>

Both platform entry points load the same `App` component. `index.ios.js` registers it as `todo2`, the name the iOS project asks for, but `index.android.js` registers it as `todo`, so the Android project, which also asks for `todo2`, wouldn't find it as committed.

## About the screenshots

These weren't taken on a phone. They come from the repository's `app.js`, `header.js`, `footer.js` and `row.js`, unchanged, bundled for the browser with webpack 2 and react-native-web 0.0.68, which was released in January 2017. The switches and text fields are react-native-web's versions of the native controls, and AsyncStorage is backed by the browser's localStorage. The to-dos are sample text typed in by the capture script.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by rendering the repository's components in a browser with react-native-web, with sample to-dos, and the code cards show the repository's source files.
