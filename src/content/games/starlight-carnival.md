---
title: "Starlight Carnival"
summary: "A pachinko puzzle game for the browser, set in a traveling carnival that has gone dark: aim pearls through 40 authored boards to light every orange sun, helped by eight performers whose powers change the shot. The whole game is one HTML file of about 377 KB, drawn with Canvas 2D, with its music and effects synthesized by the Web Audio API."
role: "Creator"
genre: "Pachinko puzzle"
platforms: ["Web"]
engine: "Custom Canvas 2D"
year: "2026"
createdAt: "2026-11-18T01:03:14Z"
stack:
  [
    "JavaScript",
    "Canvas2D",
    "Web Audio API",
    "Node.js",
    "Headless Chrome",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/starlight-carnival/play/index.html?mode=adventure"
githubLink: "https://github.com/nearbycoder/starlight-carnival"
featured: false
accent: "yellow"
draft: false
image: "/images/games/starlight-carnival.webp"
imageAlt: "Tiko, a green gecko in round glasses and a brown coat, waves from a pedestal at the left of the Clockwork Arcade stage as five glowing pearls fall through two engine-shaped rings of blue pegs and orange suns, with brass gears at both edges, a clock-topped organ at the right, and a Split Spark! banner over a score of 1,485."
imageCaption: "Tiko's Split Spark on Twin Engines, the 13th board, with five pearls in play. A frame of the Twin Engines clip on the game's website, from the repository's assets folder."
demoVideos:
  - src: "https://nearbycoder.github.io/starlight-carnival/assets/midway/opening-night.mp4"
    title: "Starlight Carnival gameplay trailer"
    caption: "Opening Night, the 33-second trailer that the website plays from its Watch trailer link. It starts on the title screen, then each performer takes a shot in their own world: Pip's Star Sight traces three rebounds before he fires, Mabel's wide basket catches a pearl beneath the turning Moonwheel, Tiko's sparks split the shot into several pearls and two land in the basket, a bubble lifts Nori's pearl back up between the boats, Vesper's echo lights a ring of pegs inside the crown, Brass's meteor punches through a row of pegs, Juniper's vine springs a falling pearl back up, and a single hit lights the suns in Luma's constellation. The last sun opens the scoring pockets below the lantern, the Carnival alight! results come up in front of all eight performers, and it ends on a title card. It has music and sound effects, runs 1152×720 at 30 fps, and is served from the game's website."
    poster: "/images/games/starlight-carnival-trailer-poster.webp"
    original: "https://github.com/nearbycoder/starlight-carnival/blob/main/assets/midway/opening-night.mp4"
---

Starlight Carnival is a pachinko puzzle game. A traveling carnival has gone dark, and you bring it back one attraction at a time. Each board is a field of pegs below a launcher at the top of the stage: you aim, fire a pearl, and it bounces down through the pegs, lighting each one it touches. Light every orange sun before your pearls run out and the mission is done. Green diamonds set off your performer's power, a violet bonus star hops to a new peg after every shot, and a basket slides back and forth along the bottom, ready to catch a falling pearl and hand it back.

There are 40 authored boards in eight worlds, each world with its own performer, and four ways to play, which the game calls tickets: Adventure, Free Play, Score Attack and Seeded Challenge. The whole game is one self-contained HTML file with no libraries and no image or audio files. Its own code draws the stage, the performers and the interface with Canvas 2D, and the music and sound effects are synthesized with the Web Audio API. It plays with a mouse, a keyboard or touch, from the game's website or straight from disk.

<figure>
  <img src="/images/games/starlight-carnival-restored.webp" alt="The Attraction restored! card for Comet Grounds 05: the Entrance Marquee with the lines Pip raises the striped gate and The first wagon rolls into the midway, three medals for clearing all suns, 16,750 points and hitting 7 pegs in one shot, 23,650 points with Mabel unlocked and a final pocket of 5,000, and buttons for the next mission, a replay, the final shot and the score receipt, between Pip and a lit STARLIGHT arch in front of a Ferris wheel and striped tents." width="1440" height="900" loading="lazy" />
  <figcaption>Finishing Light the Marquee, the fifth board in Comet Grounds, restores the Entrance Marquee and unlocks Mabel. Captured locally after replaying the three-star route that the repository's tests use for this mission.</figcaption>
</figure>

## How a shot plays

As you aim, a dotted guide runs from the launcher to the first thing the pearl will touch, moving pieces included. Pegs light up and score when the pearl hits them but stay solid until the shot ends, then fade away, so each shot clears a little room for the next. A blue peg is worth 70 points, a green diamond 130, an orange sun 180 and the violet star 550, all multiplied by a bonus that climbs from ×1 toward ×5 as the suns go out. Every fifth peg in a chain adds 100, a peg struck straight off a side rail adds 50 as a wall bank, and a long jump from one peg to the next adds 125 as a long shot.

Missions start with 10 to 12 pearls. A catch in the moving basket gives one back and scores 350, and a single shot worth 2,500 points or more earns another. When the last sun lights up, the basket gives way to five scoring pockets worth 1,000, 2,500, 5,000, 2,500 and 1,000, and every pearl still on the stage plays out before the results. Select the score to see a receipt of where the points came from, and the pause menu and the results can play the last shot again.

Every mission has three medals: one for clearing it, one for reaching its score goal, and one for an objective of its own, such as lighting both engines in one shot on Twin Engines or ringing the gong twice in one shot on The Great Gong. Only the first is needed to move on.

<figure>
  <img src="/images/games/starlight-carnival-pockets.webp" alt="The lantern-shaped board almost cleared under an All suns alight! banner, with the score at 17,875 and a ×5 multiplier, a few blue pegs left, a pearl dropping at the left, Luma the moth on a pedestal at the right, and five pockets along the bottom marked 1,000, 2,500, 5,000, 2,500 and 1,000." width="1152" height="720" loading="lazy" />
  <figcaption>All suns alight on The Last Lantern, where the basket gives way to five scoring pockets. A frame from the trailer.</figcaption>
</figure>

## The troupe

Each world has a performer who stands beside the stage, reacts to your shots with lines of their own, and lends the board a power when a pearl strikes a green diamond.

- **Pip, the Comet Fox**, in Comet Grounds: Star Sight stretches the guide to show up to three rebounds, for the next three shots.
- **Mabel, the Moon Bear**, in Moonwork Midway: Moon Basket doubles the basket's width for this shot and the next two.
- **Tiko, the Clockwork Gecko**, in Clockwork Arcade: Split Spark releases two more pearls from beside the diamond.
- **Nori, the Tide Otter**, in Lantern Lagoon: Bubble Lift gives each pearl one upward rescue above the drain.
- **Vesper, the Velvet Bat**, in Velvet Sky Theatre: Echo Pulse sends out a ring that lights the pegs it reaches.
- **Brass, the Lion Automaton**, in Brassbound Heights: Meteor Ball makes the next pearl bigger and lets it pierce six fresh pegs.
- **Juniper, the Garden Witch**, in Wildbloom Gardens: Vine Bridge grows a springy vine across the middle of the drain for the rest of the shot.
- **Luma, the Star Moth**, in Starlight Summit: Constellation links up to five of the nearest suns, and striking any one of them lights them all.

New Adventure missions are played by their own world's performer, and replaying a cleared one lets you pick any performer you've unlocked. The other tickets offer all eight.

<div class="project-media-gallery">
  <figure><img src="/images/games/starlight-carnival-moon-basket.webp" alt="Mabel, a purple bear in a miner's cap holding a wrench, stands at the right of a board shaped like a Ferris wheel, its rim and hub lined with blue pegs, orange suns, green diamonds and a violet star, while a pearl falls toward a basket stretched to twice its usual width under a Moon Basket! banner." width="1152" height="720" loading="lazy" /><figcaption>Mabel's Moon Basket on The Moonwheel, whose rim of pegs turns.</figcaption></figure>
  <figure><img src="/images/games/starlight-carnival-echo-pulse.webp" alt="Vesper, a purple bat in a top hat with a wand, stands at the right of a velvet-curtained stage while a pale expanding ring lights pegs inside a crown-shaped board of blue pegs, orange suns and green diamonds, with +540 and +360 floating up and an Extra ball! banner at the top." width="1152" height="720" loading="lazy" /><figcaption>Vesper's Echo Pulse on The Vanishing Crown.</figcaption></figure>
  <figure><img src="/images/games/starlight-carnival-vine-bridge.webp" alt="Juniper, in a red mushroom cap and a green apron, waves from the left of a garden board where blue pegs and orange suns form three flowers on curling stems, with a leafy vine stretched across the bottom above the basket and a glass greenhouse wagon at the right, under a Vine Bridge! banner." width="1152" height="720" loading="lazy" /><figcaption>Juniper's Vine Bridge on The Bloom Machine.</figcaption></figure>
  <figure><img src="/images/games/starlight-carnival-constellation.webp" alt="Luma, a pale moth with brown wings and a blue coat, stands beside a telescope at the right of a lantern-shaped board as gold lines link five orange suns across it, under a Constellation! banner, with a small lantern on stilts at the left." width="1152" height="720" loading="lazy" /><figcaption>Luma's Constellation on The Last Lantern. Striking any linked sun lights all five.</figcaption></figure>
</div>

## Forty boards, four tickets

The boards come five to a world, and their shapes follow the world: tent tops and a marquee in Comet Grounds; crescents, a pendulum and the Moonwheel in Moonwork Midway; clock hands, engines and gears in Clockwork Arcade; jellyfish, coral and a regatta of boats in Lantern Lagoon; sliding gates, mirrors and a crown in Velvet Sky Theatre; bricks, bell towers, anvils and a gong in Brassbound Heights; a sunflower spiral, mushrooms and turning petals in Wildbloom Gardens; and currents, a celestial clock and a great lantern on Starlight Summit. Thirteen boards have moving parts, and two have currents that bend the pearl's path. On the last board, The Last Lantern, each of the lantern's three panes lights its own part of the midway as you clear it.

**Adventure** follows a route across the carnival map, and each cleared mission opens the next. The fifth board in each world restores that world's attraction, from the Entrance Marquee to the Great Lantern, unlocks the next performer and adds an illustrated postcard to the map. Adventure saves after every settled shot, so a mission left halfway resumes where it stopped. **Free Play** opens any board with any performer and has an option for unlimited practice pearls. **Score Attack** starts any board with six pearls, and each board keeps its five best local runs. **Seeded Challenge** keeps a board's layout but uses a numbered seed to choose which pegs are suns, diamonds and the star, and the pause menu and the results copy a link that carries the board, the performer and the seed.

<div class="project-media-gallery">
  <figure><img src="/images/games/starlight-carnival-title.webp" alt="The title screen: STARLIGHT CARNIVAL in cream and gold circus lettering on a framed poster of striped tents under a dusk sky, Pip the fox waving in a blue cap and coat beside a Ferris wheel, and below it the ticket booth with four tickets, Adventure, Free Play, Score Attack and Seeded Challenge." width="1152" height="720" loading="lazy" /><figcaption>The title screen and its ticket booth. A frame from the gameplay trailer.</figcaption></figure>
  <figure><img src="/images/games/starlight-carnival-map.webp" alt="The Adventure map on a fresh save: a dotted route winds across parchment bands for Comet Grounds, Moonwork Midway and Clockwork Arcade through numbered stops from First Spark to Midnight Mechanism, with only the first one open, 0 / 40 complete at the top right and buttons to jump to worlds 1 to 8 along the bottom." width="1440" height="900" loading="lazy" /><figcaption>The Adventure map, captured locally on a fresh save, so only the first mission is open.</figcaption></figure>
</div>

## Mouse, keyboard or touch

With a mouse, the aim follows the pointer, holding Shift turns it in fine steps instead, and a click fires. On a keyboard, the Left and Right arrows aim, Shift makes each turn smaller and Space fires. On a touchscreen or with a pen, you drag to aim, lift, then tap Fire, and holding still before sliding sideways gives a fine aim dial. F or the 2× button runs the current shot at double speed, I reads out the aim angle and the predicted contacts, M turns the sound on and off, Escape pauses and R asks before restarting. There's no controller support.

The gear opens the settings: Low, Balanced or High graphics, high-contrast aim, a star mark on the green power pegs, reduced motion (on from the start when the system asks for it), and separate switches and volume sliders for music and effects, with a meter of the output. Sound starts off. For screen readers, the canvas carries a text description of the current screen, and a live region announces each shot's score, the suns and pearls left, and the aim readout.

## One file, drawn in code

`play/index.html` is the whole game: 11,867 lines and about 377 KB, nearly all of it a single script. The only outside requests are for three Google Fonts, Barlow Condensed, Rye and DM Sans, and without them it falls back to system fonts. Everything on screen is drawn with Canvas 2D. The performers are built from SVG-style path strings, the pegs come from sprites painted at three times their size and cached for each type and state, and the scenery, title poster, ticket art and map are painted once into offscreen canvases, kept within a pixel budget set by the graphics quality. Low, Balanced and High also cap the canvas at 1, 1.5 and 2 times the screen's pixel density and shorten or lengthen the pearl trails and sparks.

Boards are code rather than data files. Each is a few lines that place pegs with helpers for rows, arcs, rings and clusters, add obstacles, and give pieces a rotation, a slide or a swing, while a separate table says which pegs are suns, diamonds and the star. Across all 40 boards there are 1,544 pegs, from 20 to 60 a board, including 355 suns.

<figure>
  <picture><source srcset="/images/games/starlight-carnival-boards-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/games/starlight-carnival-boards.webp" alt="JavaScript source, lines 1439 to 1473 of play/index.html: case 9 sets a slow rotation and places a ring of 29 pegs with a cluster at its hub and a row below; case 10 places two rings of 12 pegs around sets of three obstacles that rotate, one set each way; case 11 places three fixed posts and four staggered rows of 7 pegs; case 12 places two mirrored arcs of 14 pegs, each with two short rows." width="1440" height="1365" loading="lazy" /></picture>
  <figcaption>Four boards in <code>play/index.html</code>: The Moonwheel, Tick Tock, Pinball Post and Twin Engines (the cases count from zero). Which pegs are suns, diamonds and the star comes from a separate table.</figcaption>
</figure>

The stage is 600 units wide and 650 tall, and the simulation steps at a fixed 120 Hz, with gravity of 480 units per second squared and a launch speed of 410. Each step works out the exact moment the pearl meets a peg, a brick or an obstacle, moving ones included, and resolves up to seven contacts in order. A bounce keeps 77 percent of the speed going into a peg, 84 percent into the rails and 94 percent into posts, gates and other obstacles. Double speed just runs more of the same steps per frame, and the moment the last sun lights plays at under half speed. Positions are rounded to a millionth of a unit, which a comment in the code says keeps round-off from different math libraries out of long rebound chains. The dotted guide is the same flight code run ahead on a copy of the board. A wedged pearl gets up to 14 trial nudges, simulated on a private copy where they can't light pegs or score, and the best one is applied; a pearl that has been in play for 32 seconds without lighting a peg in the last six goes back to your supply. Replays don't store frames: the game keeps the board as it was at launch and plays the shot again through the same solver.

The sound is all oscillators: a pool of up to 20 voices, each with its own envelope and stereo position, feeds separate music and effects channels, a short echo and a compressor used as a limiter. The music is a waltz played in each world's key with its own eight-note melody, at one of three tempos. Peg notes climb a scale as a chain grows and pan toward the peg, each performer has a short signature phrase that plays when their power fires, and the last sun sets off an overture.

## The website

The repository's root is the game's website, which GitHub Pages serves with no build step. It's laid out as a carnival entrance: a marquee sign, Pip and Vesper on pedestals, a Play Adventure button that Enter also presses, and a line that reads your saved progress in the same browser, down to the mission to resume and the pearls left. Ticket stubs lead to three rooms. The ticket booth holds the four tickets, the world map walks the eight stops with each performer's portrait, description and power and a link to play their world, and How to play has the rules, a 9-second clip of one complete Twin Engines shot with Tiko, and the controls. The trailer opens in a dialog, and Download the game saves the whole game as a single HTML file.

## How it was made

The repository's eight commits span November 17 and 18, 2026: an initial commit with a stub README and an icon; the game and a first illustrated website; a rebuild of the website as the carnival entrance with its route map and ticket booth; a large commit that brought the eight attractions to life, tuned the full campaign and added the trailer, the Twin Engines clip and the tests; and four smaller ones that relit the finale pane by pane and made the aim and results easier to read, gave touch and mouse players the fine aim dial, accepted typed and pasted challenge seeds, and made the game wait for an embedded stage to become visible before drawing.

The tests exercise the script that ships to players. A helper pulls it out of `play/index.html` and runs it under Node with only browser startup and drawing stubbed, and Node's built-in test runner runs 17 tests against it. They check that all 40 layouts are distinct, that nothing leaves the stage or overlaps as the moving parts turn, that seeds keep each board's layout and counts, that the dotted guide predicts the real contact on still and moving surfaces, that each power changes a shot by the advertised amount, that every pearl in the finale is counted, that saves, checkpoints and Score Attack records hold up across two open tabs, and that bad storage falls back to a playable board. One test plays a three-star route through every mission, 153 launches from a fixture of angles and waits, and checks each exact score and all three medals. `tests/browser.mjs` drives Chrome or Chromium over the DevTools protocol, with no server, driver or npm install, and plays the standalone file through its real keyboard, touch and rendering paths, including a phone-sized screen turned sideways in the middle of a shot and the game running inside an iframe. With `--captures`, it saves screenshots of the title, the map, every world and power, a catch, multiball and the finale.

## Play it

Play Adventure in your browser at [nearbycoder.github.io/starlight-carnival/play](https://nearbycoder.github.io/starlight-carnival/play/index.html?mode=adventure), or start at [the carnival entrance](https://nearbycoder.github.io/starlight-carnival/). The other tickets have links of their own: [Free Play](https://nearbycoder.github.io/starlight-carnival/play/index.html?mode=free-play), [Score Attack](https://nearbycoder.github.io/starlight-carnival/play/index.html?mode=score-attack) and [Seeded Challenge](https://nearbycoder.github.io/starlight-carnival/play/index.html?mode=seeded). There's nothing to install. To play offline, use Download the game at the entrance or save [the game file](https://nearbycoder.github.io/starlight-carnival/play/index.html) and open it from disk; a downloaded copy keeps its own progress. Turn the sound on with M or the speaker button.

Starlight Carnival's repository is one of four created on GitHub within a minute of each other on November 18, 2026 (UTC), each a browser game with its own GitHub Pages site; the other three are [Dusk Rush ’64](/games/dusk-rush-64), [Wildlight](/games/wildlight) and [Veilbound](/games/veilbound).

[Browse the source on GitHub](https://github.com/nearbycoder/starlight-carnival). The creation date shown here is the GitHub repository's UTC creation date. The cover is the website's poster for its Twin Engines clip, a frame of that clip from the repository's `assets/midway` folder. The title screen, the four powers and the scoring pockets are frames of the gameplay trailer, and the trailer's poster is the website's own. The Adventure map and the restored attraction were captured at 1440×900 by running the game locally in headless Chromium with the repository's browser script and its `--captures` option. The code excerpt is from `play/index.html`.
