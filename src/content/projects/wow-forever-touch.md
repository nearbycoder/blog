---
title: "Forever Touch"
summary: "Touch screen controls for World of Warcraft: Forever, as an addon: a thumb-sized spell wheel, one-tap menus and a guided setup for phones and foldables, built for playing through DroidDeck on a Galaxy Z Fold 8."
role: "Creator"
createdAt: "2026-11-06"
year: "2026"
stack:
  [
    "Lua",
    "World of Warcraft AddOn API",
    "Python",
    "Shell",
    "Headless Chrome",
    "FFmpeg",
  ]
link: "https://github.com/nearbycoder/wow-forever-touch/releases/latest"
githubLink: "https://github.com/nearbycoder/wow-forever-touch"
image: "/images/projects/wow-forever-touch.webp"
imageAlt: "A rendered preview of the Forever Touch layout on a wide phone screen: a character on a dirt path at sunset facing a Ridge Prowler, DroidDeck's on-screen stick and an A button on the left, Target, Assist and Clear buttons in the middle, and a spell wheel of round buttons around a big glowing sword button on the right."
imageCaption: "The default folded layout. A rendered preview from the README, not an in-game capture."
featured: false
accent: "pink"
draft: false
---

Forever Touch is a World of Warcraft: Forever addon that makes the game playable on a touch screen. It puts a spell wheel under your right thumb, every game window one tap away, and a guided setup in front of you on first login. I built it for playing through [DroidDeck](https://www.techspot.com/downloads/7924-droiddeck.html) on a Galaxy Z Fold 8, with DroidDeck's on-screen stick under the left thumb for running.

It's free and open source under the MIT license. It's an unofficial fan project, not affiliated with or endorsed by Blizzard Entertainment or the DroidDeck project.

A note on the images: they're rendered previews, not in-game captures. The position and size of every button comes from the addon's real Lua code, run through a mock WoW client, but the world, the character and the unit frames are stand-in drawings and the icons are original placeholders, not Blizzard art.

## A spell wheel for your thumb

The spell wheel has 12 buttons: one big thumb button, an inner arc of four, an outer arc of five and two minis. Together they hold exactly one action bar. Buttons show round cooldown sweeps with seconds, a red tint when you're out of range, blue when you're out of mana or rage, stack counts, a gold glow for auto-attack and a pink glow for procs.

There are three pages. Page 1 follows your main bar, so warrior stances, druid forms and rogue stealth swap it automatically, and pages 2 and 3 can show any other action bar. Tap the small number on the wheel to flip pages, even in combat. A target row offers Target nearest enemy, Assist and Clear target, plus Pet attack for hunters and warlocks. Drag on empty ground to turn the camera, and use the + and − buttons to zoom.

<div class="project-media-gallery">
  <figure><img src="/images/projects/wow-forever-touch-unfolded.webp" alt="A rendered preview of the unfolded inner screen layout: a nearly square view with the same stick, target row and spell wheel, sized larger." width="852" height="768" loading="lazy" /><figcaption>The unfolded inner screen gets its own layout.</figcaption></figure>
  <figure><img src="/images/projects/wow-forever-touch-left-handed.webp" alt="A rendered preview of the left-handed layout: the spell wheel and big sword button on the left and the DroidDeck stick on the right." width="1280" height="549" loading="lazy" /><figcaption>Left-handed mode mirrors everything.</figcaption></figure>
</div>

The folded cover screen and the unfolded inner screen each keep their own layout, and the addon switches between them automatically when you open or close the phone. Left-handed mode mirrors the whole thing.

## Menus and assigning spells

The one-tap menu covers Character, Bags, Spellbook, Talents, Quests, Map, Social, Chat, Close windows, Edit layout, Touch settings and Game menu. It works in combat, and tapping outside closes it. To put a spell on an empty button, tap the **+** and pick a spell, usable item or macro from a big grid. Classic's rank lists show only the best rank by default.

<div class="project-media-gallery">
  <figure><img src="/images/projects/wow-forever-touch-menu.webp" alt="A rendered preview of the Forever Touch menu: a grid of twelve tiles for Character, Bags, Spellbook, Talents, Quests, Map, Social, Chat, Close windows, Edit layout, Touch settings and Game menu." width="1280" height="549" loading="lazy" /><figcaption>Every game window, one tap away.</figcaption></figure>
  <figure><img src="/images/projects/wow-forever-touch-spell-picker.webp" alt="A rendered preview of the spell picker titled “Choose an action for button 3”, with tabs for General, Arms, Fury, Protection, Items and Macros, and Arms spells such as Heroic Strike, Rend, Charge and Thunder Clap." width="1280" height="549" loading="lazy" /><figcaption>Tap an empty button to choose what goes on it.</figcaption></figure>
</div>

**Edit layout** shows pink handles to move groups and resize them from 50 to 170%. You can set their opacity, tap a button to reassign it, or drag one button onto another to swap them. A pink circle shows where DroidDeck's stick fits, and the stick area can be resized and moved too. Touches that slide off the stick don't spin the camera, and you can choose whether that applies near the stick or across the whole stick side.

<figure>
  <img src="/images/projects/wow-forever-touch-edit-layout.webp" alt="A rendered preview of Edit layout mode: a toolbar with tabs for Spell wheel, Target buttons, Menu button, Camera zoom and Stick area, size and opacity steppers, Reset layout and Done, with pink handles on each group and a pink circle labelled “Put DroidDeck's left stick here”." width="1280" height="549" loading="lazy" />
  <figcaption>Edit layout, with the pink circle for DroidDeck's stick.</figcaption>
</figure>

## How movement works

Blizzard doesn't allow any addon to move or jump your character. The protection exists to stop bots and applies to every addon, so an addon can't draw a working joystick. Forever Touch uses the path Blizzard does allow, which is WoW's own controller support:

1. The setup guide turns on WoW's controller support and binds **A** to Jump.
2. DroidDeck's on-screen stick shows up to the game as a controller, so the left stick gives smooth analog running: half-push to walk, full push to run.
3. Your other thumb stays on the spell wheel, so you can run and cast at the same time.

Tap-to-move, using WoW's click-to-move, is an option, and so are on-screen W, A, S, D and Space keys if your DroidDeck build has them. The guided setup walks through all of it in three steps, covering your thumbs with a live diagram, movement, and comfort settings. Settings live in four tabs, Layout, Controls, Movement and Help, and both troubleshooting tests are buttons, so you never need to type a command.

<div class="project-media-gallery">
  <figure><img src="/images/projects/wow-forever-touch-setup-movement.webp" alt="A rendered preview of the setup guide's second step, Running and jumping, explaining that Blizzard doesn't let addons move your character, with Controller movement on, a Test the stick button, three DroidDeck steps and a tap-to-move toggle." width="1280" height="549" loading="lazy" /><figcaption>Setup step 2 switches on controller movement.</figcaption></figure>
  <figure><img src="/images/projects/wow-forever-touch-settings.webp" alt="A rendered preview of the Forever Touch v1.1.0 settings panel on its Layout tab, with Screen set to Auto, Spell thumb set to Right thumb, Edit layout and Reset layout buttons, and two spell wheel pages." width="1280" height="549" loading="lazy" /><figcaption>Settings in tabs, sized for the cover screen.</figcaption></figure>
</div>

## Combat safe

The addon is built on Blizzard's secure templates. Casting, page flips and the menu all work in combat. Anything that can't change in combat, like assigning or moving buttons, waits until the fight ends instead of erroring, and Edit layout closes itself when a fight starts.

The README is honest about the rest of the limits. Two taps on WoW buttons at the very same moment arrive as one mouse click, though running while casting works because DroidDeck handles its stick separately. Auto fold switching reads the game's screen size, so a fixed DroidDeck resolution needs the screen chosen by hand. Real-device testing is early: the first reports from a Galaxy Z Fold 8 found the touch and stick issues covered in its troubleshooting section, and more testers are wanted.

## How it's built

The addon is Lua 5.1, the version WoW uses, split into modules for the spell wheel, the menu, the spell picker, edit mode, setup, settings and the touch and stick tests. The tests run it against `tests/mock_wow.lua`, a small fake WoW client that models frames, scripts, Blizzard's restricted snippet environment and, most importantly, combat lockdown. Any insecure change to a protected frame during combat fails the run, the same class of bug that breaks addons in the real game. The suite runs in three click modes: cast on press, cast on release, and legacy clients.

The previews come from the same mock client. A script loads the real addon, logs in and exports the on-screen rectangle of every control for each layout, and fails if any control would be off screen. An HTML page draws those rectangles over a stand-in scene, and a shell script screenshots it with headless Chrome and builds the README's animated GIF with FFmpeg. A Python script packages the release zip.

## Install

Download the latest zip from the [releases page](https://github.com/nearbycoder/wow-forever-touch/releases/latest) and copy the `ForeverTouch` folder into the game's `Interface/AddOns` folder. Under DroidDeck, that's on the Windows drive of the Proton prefix where you installed Battle.net. Make sure Forever Touch is ticked in the AddOns list on the character select screen, then log in, and the setup guide opens after about two seconds. Type `/ft` at any time for settings.

The [repository README](https://github.com/nearbycoder/wow-forever-touch) has the DroidDeck setup, the full settings and commands, and troubleshooting tables for taps that land in the wrong place and a stick that doesn't move your character. Real-device screenshots and recordings are welcome as pull requests.

The creation date shown here is the GitHub repository's UTC creation date. The images on this page are the rendered previews from the README.
