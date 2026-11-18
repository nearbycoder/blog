---
title: "Wildlight: The Asterra League"
summary: "A creature-collecting RPG for the browser: choose a field partner, follow nine trails through ten habitats, solve eight gym puzzles and catch from 300 species, switching partners at the right moment to turn a resisted hit into a relay. The whole game is one 14.7 MB HTML file that embeds its art atlases, draws with Canvas 2D and synthesizes its music."
role: "Creator"
genre: "Creature-collecting RPG"
platforms: ["Web"]
engine: "Custom Canvas 2D"
year: "2026"
createdAt: "2026-11-18T01:03:34Z"
stack:
  [
    "JavaScript",
    "Canvas2D",
    "Web Audio API",
    "Node.js",
    "Headless Chrome",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/wildlight/play/"
githubLink: "https://github.com/nearbycoder/wildlight"
featured: false
accent: "emerald"
draft: false
image: "/images/games/wildlight.webp"
imageAlt: "Spriglet, a brown fawn with two green leaf ears seen from behind, faces a wild Gravlet, a small round violet rock creature, in a golden meadow above a turquoise bay, with a red and white lighthouse on the far cliff under a sunset sky, health and energy panels for both, and a row of move buttons below."
imageCaption: "The guided first battle with the meadow Gravlet, drawn with the higher-detail art on a 4K screen. A 3840×2160 capture from the repository's verification folder, reduced to 1440 wide."
demoVideos:
  - src: "https://nearbycoder.github.io/wildlight/assets/site/asterra-tour.mp4"
    title: "Wildlight gameplay tour"
    caption: "The 32-second gameplay tour from the game's website, with sound: the game's own soundtrack. It opens on the title screen, picks Spriglet as a field partner, meets Oriel in Brinewick Village, weakens and catches the meadow Gravlet with a Lumen Capsule, tunes the three field chimes on Thistlebend Walk and turns a valve in the Glassleaf House puzzle. In a League battle with Marina, Inklingel sets a Tide field against Torhorn, Brambleap switches in, resists Inklingel's Foam Needle and charges a relay, and Marina sends out Rillcrest. It ends in the vane garden sanctuary and a battle with a wild Altavane on the Cirrus Steps. It's 1120×630 at 15 fps and is served from the game's website."
    poster: "/images/games/wildlight-trailer-poster.webp"
    original: "https://github.com/nearbycoder/wildlight/blob/main/assets/site/asterra-tour.mp4"
---

Wildlight: The Asterra League is a creature-collecting RPG that plays in the browser. Across Asterra, creatures carry a natural energy called Wildlight that has always changed with the seasons, and the Stilllight Society has been holding it steady with silver stakes and a regulator under the observatory dome; even Brinewick's lighthouse is stuck on its first flash. As a new field researcher, you choose a partner and catch your first creature in the meadow, then follow nine trails through ten habitats and earn eight League badges on the way to setting the observatory's rings turning again. The Asterra Championship opens after the story, with ten legendary sanctuaries and a Field Atlas of 300 species to finish at your own pace.

Battles are turn-based, and every opponent shows its next move before you pick yours. Switch in a partner that resists it and, if it survives the hit, it charges a relay: three energy at once and 25% more power on its next successful attack. The whole game is one 14.7 MB HTML file, most of it two embedded art atlases, drawn with Canvas 2D and with all of its music and sound synthesized by the Web Audio API. It plays with a keyboard, a mouse or touch, runs offline, and saves in the browser.

<figure>
  <img src="/images/games/wildlight-brinewick.webp" alt="Brinewick Village from above: a red-roofed lodge and a blue-roofed field lab among trees, Researcher Oriel in a tan hat under a gold exclamation marker, the researcher and Lio on the dirt paths, a small violet creature among flowers at the lower left, a pier with a rowboat, and a red and white lighthouse on an islet in the turquoise sea, with a Meet Oriel objective at the top left." width="1360" height="900" loading="lazy" />
  <figcaption>Brinewick Village, where the expedition starts. Oriel waits outside the field lab, and the meadow Gravlet sits among the flowers at the lower left.</figcaption>
</figure>

## Brinewick and a field partner

Oriel keeps three partners at the field lab, and you can preview each before choosing: Spriglet, a leaf-eared Grove fawn that heals through long fights; Cindillo, a Flame armadillo with heavy armor; and Puddlepip, a quick Tide shorebird. The two families you don't pick turn up in the wild later. Lio, your rival, raises the starter whose element has the edge on yours and comes back for a battle after every badge.

<figure>
  <img src="/images/games/wildlight-partners.webp" alt="A Choose your field partner window over a pixel-art lab with a telescope and a window onto the lighthouse: three cards show Spriglet, a leaf-eared fawn, Cindillo, a rust-red armadillo, and Puddlepip, a round blue shorebird, each with its element, its role and a note on its moves, above a Choose Spriglet button." width="1360" height="900" loading="lazy" />
  <figcaption>Choosing a field partner in the field lab.</figcaption>
</figure>

Your first job is the Gravlet in the west meadow: bring it to 60% health or less and a Lumen Capsule is a sure catch, with the odds shown on the capsule button. After that lesson, creatures that are weakened or suffering a condition are easier to catch, evolved and legendary ones are harder, Tide Capsules work twice as well on the coast and the canals, and Dusk Capsules twice as well on a creature with a condition. Creatures evolve in four ways: by level, with a Growth Stone, through friendship built in battle, or by visiting their home habitat at the right level. Each town's red-roofed recovery lodge heals the party and raises each member to at least level three plus two per badge, restocks capsules and tonics, and lets you relearn moves for free.

## Trails, tracks and chimes

Nine walking routes link the ten towns, from Thistlebend Walk between Brinewick and Briarbrook to the Meridian Approach below the observatory. Wild creatures aren't hidden in tall grass. They stand in the open, and you walk up to one to meet it, or pick a species at a town's survey spot and follow a gold marker to its tracks. Each trail also has a field notebook at a fork and three chimes on a side path. The notebook's clue gives the order (on Thistlebend Walk, "Roots drink first. The brook carries their song up to the bough."), each chime has its own inscription so the puzzle works with the sound off, and when all three are in tune a creature answers nearby.

<figure>
  <img src="/images/games/wildlight-chimes.webp" alt="Thistlebend Walk from above: a sandy trail forks through dense forest, three glowing chime posts stand along the side path, the researcher and a deer partner stand among them beside a small gray creature, Oriel in a tan hat waits on the trail below, other creatures dot the path, and a prompt at the bottom left reads Ring Bough chime." width="1120" height="630" loading="lazy" />
  <figcaption>Thistlebend Walk, with its three chimes in tune and Spinchime beside them. From the game's website.</figcaption>
</figure>

## Battles and the relay

Battles are one on one. Every move belongs to one of twelve elements, from Flame, Tide and Grove to Spirit, Radiance and Shadow, and each element has the same nine kinds of move, from a strike that costs nothing and a quick strike that goes first to a guard, a condition, a field that strengthens that element for four turns, and a heal: 108 moves in all. Moves spend energy from a bar of 12 that refills by one a turn, or by five if you rest. A strong matchup does 1.6 times the damage and a resisted one 0.65 times. The conditions are Scorch, which burns a little health each turn, Drowse, which can make a creature miss its cue, and Snare, which slows it down. The opponent always decides first. The console says what it's preparing ("Inklingel prepares a Tide attack"), and the Switch menu marks which partners would resist it. Switch to one of them, and if it survives the hit it charges a relay: three energy and 25% more power on its next successful attack. Trainers switch too, and a swap into a resisted hit charges a relay for their side as well.

<figure>
  <img src="/images/games/wildlight-relay.webp" alt="A battle in a blue-lit aquarium hall: Torhorn, a gray boulder-like creature with green horns seen from behind, faces Inklingel, a pink and blue ray, under floating Tide field text, with panels for both, a message that Inklingel prepares a Tide attack and to switch to a resistance for a relay, and four Stone and Alloy moves below, two of them marked Resisted." width="1120" height="630" loading="lazy" />
  <figcaption>A League battle with Marina beneath the Tideglass aquarium tanks. Inklingel's Rain Choir has set a Tide field, and the console suggests switching to a resistance. From the game's website.</figcaption>
</figure>

## Eight gyms

The eight towns between Brinewick and the observatory each have a gym, and each gym starts with a puzzle room: rotate the irrigation valves in Fern's Glassleaf House, set the water level to line up the walkways in Marina's Tide Gallery, ride the conveyors to light two kilns in Calder's Crown Kiln, set the relays in Iona's Relay Tower, push fossil cases onto pressure plates in Petra's Fossil Hall, slide across ice to turn the mirrors in Soren's Northglass Dome, switch the lamps in Nyra's Lantern Theatre to reveal bridges and doors, and touch Solenne's stars in order in the Star Garden. Each room is an 11×5 grid. An aide battles you next, then the leader, whose team grows from Fern's lone Brambleap to five creatures for Nyra and Solenne. Each badge brings a piece of field equipment, such as vine shears, a skiff or a lantern, that opens the side trail to a sanctuary.

<figure>
  <img src="/images/games/wildlight-crown-kiln.webp" alt="The Crown Kiln puzzle: a grid of orange clay tiles with conveyor arrows running right and left, two numbered kilns, a locked gate marked A and green exit stairs, the researcher at the start, and instructions to light both kilns, in front of a dim foundry backdrop." width="1360" height="900" loading="lazy" />
  <figcaption>Calder's Crown Kiln in Cindermill: light both kilns, riding the conveyors between landings.</figcaption>
</figure>

## Sanctuaries and the championship

Each habitat's sanctuary holds one of ten legendary creatures, from Terravale, Pelagoria and Altavane to Orreryon and Asterquill. A shrine's inscription describes a rite (in the sleeping orchard, "Loosen the bed, give it rain, then let the sun in."), and doing its three steps in order brings the guardian out. Orreryon's shrine opens only after the story, and Asterquill's once you've recorded 200 species. With all eight badges, you take the seals into the Meridian Observatory and release the Stilllight regulator, a battle against the three creatures trapped in its rings. The Asterra Championship follows, with five matches against four specialists (Lysa of the Shoals, Quarrymaster Renn, Vesper Adept Vio and Skywarden Aven) and Champion Senna, and your party rests between rounds. Once the regulator is released, the gym leaders also take rematches with stronger teams.

<div class="project-media-gallery">
  <figure><img src="/images/games/wildlight-sanctuary.webp" alt="The sleeping orchard sanctuary from above: a ring of forest around a sandy clearing, the researcher and a deer partner at a flower-covered arch on a small green rise, and Vernalith, a moss-green deer with blossoms on its antlers, under a gold exclamation marker at the right, with a Find Vernalith objective at the top left." width="1360" height="900" loading="lazy" /><figcaption>The sleeping orchard, Briarwood's sanctuary, where Vernalith waits.</figcaption></figure>
  <figure><img src="/images/games/wildlight-championship.webp" alt="The Asterra Championship roster over a painting of a sunlit hall of pillars and banners: Lysa of the Shoals marked Next, then Quarrymaster Renn, Vesper Adept Vio, Skywarden Aven and Champion Senna marked Waiting, each with a pixel portrait and a specialty, above a Challenge Lysa of the Shoals button." width="1360" height="900" loading="lazy" /><figcaption>The championship roster at the Meridian Observatory.</figcaption></figure>
</div>

## Keyboard, mouse or touch

You walk with WASD or the arrow keys, interact with E or Enter, open the menu with Escape, the region map with M and the party with Tab, and pick moves in battle with 1 to 4; the walking, interact, map and party keys can be rebound. A click or tap on the ground walks you there along a path the game finds around obstacles, and clicking a person or creature walks you over to talk or meet it. Touch screens and narrow windows get a directional pad and an interaction button. Settings has full screen, reduced motion, battle and text speed, music and effects volumes, and Artwork detail, and sound starts muted. The game saves in the browser at lodges, after battles and at story milestones, and a backup file can be exported and imported on another device.

## One file, two atlases

`play/index.html` is the whole game: 13,023 lines and 14.7 MB, with no libraries. About 14.2 MB of that is two WebP atlases stored as base64 data URLs, which `assets/art/embed.mjs` writes into the file. The standard atlas is a 2048×3468 lossless image with 773 named cells, including front and rear battle art for all 300 species, 26 portraits with matching overworld figures, terrain, props, 30 battle backdrops and the title panorama; the detail atlas holds the same cells at twice the density. The rest is about 1,860 lines of CSS and 9,500 lines of JavaScript, and the only outside requests are two Google Fonts, which the game can do without.

Scenes are laid out in game pixels (the overworld is 384×224) and drawn without smoothing. With Artwork detail on Auto, a large or high-DPI display decodes the detail atlas and draws scenes at two to four times the density, with the camera, movement and hitboxes on the same grid; Classic keeps the original pixels. The code adds the motion on Canvas 2D: creatures bob through idle poses, footsteps kick up dust, surf glints along the shore, each element has its own impact effect in battle, and after the story Brinewick's lighthouse beam sweeps the bay again. The title logo is drawn from hand-coded pixel letters, and the menus and battle console are HTML laid over the canvas.

<figure>
  <img src="/images/games/wildlight-species.webp" alt="A grid of the first 100 creatures on alternating cream columns, each labeled with its number and name, from 1 Spriglet, 2 Brambleap and 3 Verdantler to 100 Oozip, including foxes, owls, bats, frogs, fish, mushrooms, moths and armored beasts." width="1000" height="950" loading="lazy" />
  <figcaption>Species 001 to 100: the front battle art from the embedded atlas, made with ImageGen, laid out by the verifier as one of its six sprite sheets.</figcaption>
</figure>

Each habitat has its own 16-step melody and tempo, battles switch to one of four themes, and every species has a call of a few quick tones, pitched from its place in the catalog and patterned by its body type. On every load, before the title appears, the game checks its own catalog: 300 uniquely named species in 60 three-stage, 40 two-stage and 40 single-stage families, 108 uniquely named moves, a 12×12 element chart, every League team, and an atlas cell for every picture it needs.

<figure>
  <img src="/images/games/wildlight-arenas.webp" alt="Thirty painted battle backdrops in a five-column grid, each labeled: the ten habitats from Brinewick Shore to Meridian Ruins, the eight gyms labeled with their leaders and towns, the ten shrines from the fault cairn to the feather archive, the Stilllight regulator and the Asterra Championship." width="1035" height="622" loading="lazy" />
  <figcaption>All 30 battle backdrops, made with ImageGen, as the verifier lays them out from the atlas: ten habitats, eight gyms, ten shrines, the regulator and the championship.</figcaption>
</figure>

## The website

The repository's root is the game's website, published by GitHub Pages. It opens on the title panorama, Spriglet and Verdantler above Brinewick's harbor with the observatory under an aurora, then continues as an expedition journal: the region, with the gameplay tour and habitat postcards; the starter families in all nine forms; evolution studies and front and rear views; battles; the badge case, with each leader's puzzle floor; and illustrated controls. Play here swaps the game into the page in an iframe, Shift and Escape jump back to the controls, and Download for offline play saves `play/index.html` as `wildlight.html`.

## How it was made

The art notes in `assets/art/README.md` say the built-in ImageGen tool produced all of the source sheets: both battle views of every species, the portraits and overworld figures, the player's walking cycle, terrain, props, the battle backdrops, the title panorama and the indoor scenes. The prompts for both illustration passes are kept in the repository, in that README and in `full-art-prompts.md`, and the rear-view sheets used the finished fronts as references, so the two views keep the same anatomy and colors. The game's own code composes and animates that art on Canvas with live movement, effects and puzzle states, and it synthesizes all of the music and sound. The `contest` folder holds notes prepared for GitHub Game Off 2026, whose theme is SHIFT; they present the relay switch as the game's use of the theme and say Wildlight was developed with Codex assistance.

The repository's 11 commits are all dated November 17, 2026. After an initial commit with a README and an icon, the game, its website, the verifier and its screenshots arrive together, and the nine commits that follow rework the website, rebuild the opening, reillustrate Asterra, complete the creature and scene artwork, adapt rendering for large and high-DPI displays, polish fieldwork and battles, prepare the Game Off notes, and refine touch routes and sanctuary navigation.

`verification/verify.mjs`, a Node script of about 1,400 lines, starts Chrome or Chromium headless with a throwaway profile and drives it over the DevTools protocol. According to the README, it plays through the tutorial and the first field notebook with keyboard and pointer input, solves all eight gym rooms, battles the leaders, and finishes the observatory and the championship, then uses controlled capture rolls to exercise every family, evolution method and legendary shrine in one save. Other checks cover the nine chime loops, the ten sanctuaries, relay timing, touch input, saving, and screens from phones to 4K and ultrawide. It also proves with a breadth-first search that every gym room can be solved from its starting state, and it refreshes the screenshots and sheets in `verification/` that supply most of the images here.

## Play it

Play it in your browser at [nearbycoder.github.io/wildlight/play](https://nearbycoder.github.io/wildlight/play/), or start from the website at [nearbycoder.github.io/wildlight](https://nearbycoder.github.io/wildlight/), which can also run it inside the page. There's nothing to install. The website's Download for offline play link saves the same single file, which runs from disk; to continue a web expedition offline, export a backup first and import it there. Sound is off until you turn it on in Settings. Wildlight's repository was created on GitHub within a minute of three others on November 18, 2026 (UTC), each a browser game with its own GitHub Pages site: [Starlight Carnival](/games/starlight-carnival), [Dusk Rush ’64](/games/dusk-rush-64) and [Veilbound](/games/veilbound).

[Browse the source on GitHub](https://github.com/nearbycoder/wildlight). The creation date shown here is the GitHub repository's UTC creation date. The Marina battle and Thistlebend Walk screenshots come from the website's `assets/site` folder, whose gameplay screenshots the art notes say were captured from the game; the other screenshots and both sheets come from the repository's `verification` folder, written by the browser verifier. The 4K capture is reduced to 1440 wide, and the sheets are the verifier's layouts of the ImageGen art in the embedded atlas. The gameplay tour streams from the game's website, and its poster is the website's own 384×224 poster frame, enlarged three times with nearest-neighbor scaling.
