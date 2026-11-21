---
title: "ICE RIOT"
summary: "An original arcade hockey game for up to eight players, in the spirit of the mid-90s 3D arcade hockey cabinets: 3-on-3 with turbo, flaming power shots, power checks that bring out an ambulance, fights and instant replays. The gameplay is C++ on Unreal Engine 5.9, scripts generate every model, animation and sound, and the browser version is Unreal's own WebAssembly and WebGPU export of the same game."
role: "Creator"
genre: "Arcade hockey"
platforms: ["macOS", "Web"]
engine: "Unreal Engine 5.9"
year: "2026"
createdAt: "2026-11-21T06:06:49Z"
stack:
  [
    "Unreal Engine 5",
    "C++",
    "WebAssembly",
    "WebGPU",
    "Emscripten",
    "Blender",
    "Python",
    "NumPy",
    "GitHub Actions",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/ice-riot/play/"
download: "https://github.com/nearbycoder/ice-riot/releases/latest"
githubLink: "https://github.com/nearbycoder/ice-riot"
featured: false
accent: "sky"
draft: false
image: "/images/games/ice-riot.webp"
imageAlt: "A goal in the desktop game: Northport Narwhals number 7, in a teal jersey, stands in front of the Brimstone Inferno net after scoring, with the goalie in red and white sprawled by the post, GOAL! in big white letters outlined in teal, LINDQVIST #7, ASSIST: OKAFOR under it, and the scoreboard at NPT 1, BRM 1 with 0:32 left in period 1."
imageCaption: "A goal for the Northport Narwhals, one of the website's screenshots of the desktop game."
demoVideos:
  - src: "https://nearbycoder.github.io/ice-riot/media/trailer.mp4"
    title: "Gameplay trailer"
    caption: "The website's 59-second trailer, rendered in the engine at a fixed 30 frames per second, with the title music. The Glacier Bay Yetis and the Bayou Brawlers face off at center ice, LeBlanc of the Brawlers beats Sorokin of the Yetis in a fight while the ambulance drives along the far boards, and play goes on with saves and a power shot before it fades out on the center-ice logo. It's 720p and served from the game's website."
    poster: "/images/games/ice-riot-trailer-poster.webp"
    original: "https://github.com/nearbycoder/ice-riot/blob/main/site/media/trailer.mp4"
---

ICE RIOT is an original, over-the-top arcade hockey game for up to eight players, inspired by the 3D arcade hockey cabinets of the mid-90s and their Nintendo 64 ports: fast 3-on-3, turbo, flaming power shots, bone-rattling power checks, fights, hat tricks and instant replays. Its design notes were researched from the period's instruction manual and reviews, and the README says every team, player, logo, sponsor and announcer line is fictional. The code is under the MIT License, and the fonts, Anton and Barlow Semi Condensed, are under the SIL Open Font License.

The game is C++ on Unreal Engine 5.9, with no Blueprints, and Python scripts in Blender 5.3 generate every model, texture, rig and animation. Every sound is synthesized, and the announcer is macOS's speech synthesizer run through a simulated arena PA. The browser version isn't a port: it's Unreal's own WebAssembly and WebGPU export of the same game, and there's a Mac app too.

## Three on three, rules optional

Each side has three skaters and a computer goalie, or four skaters with the Team size option, and the game switches to 4-on-4 when either side has more than three humans. Games are three periods of 1, 1.5, 2, 2.5, 3 or 5 minutes, two by default, and a tie goes to sudden-death overtime, in periods three quarters as long, but at least a minute, until someone scores.

Arcade rules, the default, have no icing, no offside and no penalties, so hooking and tripping are fair game. Pro rules call icing when a team at even strength or better sends the puck from its own half across the far goal line, wide of the net, and offside when an attacker is more than 45 centimeters over the blue line as the puck crosses it. Icing brings a face-off in the offending team's own end, and offside one in the neutral zone. Under Pro rules, a trip is penalized 75 percent of the time and a hook 22 percent, and the offender sits for an eighth of the period length, but at least 12 seconds, which makes it 15 seconds with two-minute periods. A power-play goal ends the penalty early.

## Turbo, fire and hits

Holding Turbo raises a skater's top speed by 42 percent and acceleration by 60 percent. A full meter lasts 2.5 seconds, starts refilling 0.55 seconds after you let go and takes about four seconds to fill again, and for a human player the colored ring under the skater doubles as the meter. Tap Shoot for a wrist shot, or hold it to charge a slap shot. Shoot with Turbo is a power shot: it needs and uses 45 percent of the meter, the puck catches fire and leaves a streak, and if it goes in, the net bursts into flames and the goalie is blown back into it. Shoot and Pass together send a give-and-go pass, which the teammate one-times the moment it arrives if they're in a scoring spot, and pressing Shoot as a pass comes to you winds up your own one-timer. With the puck, Switch spins into a deke and Hook leaves a drop pass. When a computer teammate has the puck, Pass calls for it and Shoot tells them to shoot.

On defense, Shoot checks and Pass pokes at the puck. With Turbo, Shoot becomes a power check for 30 percent of the meter, Pass a diving poke for 20 and Hook a trip for 15. A power check launches the victim, sends their helmet and stick flying, shakes the screen and rattles the glass, and the game's 3D ambulance drives the length of the rink along the far boards.

<div class="project-media-gallery">
  <figure><img src="/images/games/ice-riot-powershot.webp" alt="A Glacier Bay Yetis and Northport Narwhals game at 1-1 with 1:48 left in period 1, seen from the broadcast camera: a flaming orange streak runs from the slot toward the Narwhals' net past a cluster of skaters in pale blue and teal, with POWER SHOT! in the ticker at the bottom left and a Slapshot Soda ad on the ice." width="1280" height="720" loading="lazy" /><figcaption>A power shot's flaming streak.</figcaption></figure>
  <figure><img src="/images/games/ice-riot-replay.webp" alt="The instant replay of a goal, from a low angle beside the net: a kneeling goalie in white and black beside the post and a skater in white standing by the boards, with a cheering crowd behind the glass, GOAL: #41 RIVERA, ASSIST: DONOVAN in the top corner and PRESS SHOOT TO SKIP along the bottom." width="1280" height="720" loading="lazy" /><figcaption>An instant replay of a goal.</figcaption></figure>
</div>

## Fights, hat tricks and power saves

Every check adds to the victim's anger meter, a power check most of all, and players with higher fight ratings anger faster, while hooks, steals and hard bumps add a little. When a player with a full meter is checked, there's a 60 percent chance the two drop the gloves, though never within 40 seconds of the last fight and never with a goalie. In a fight, Shoot punches, Pass jabs, Hook grabs and stuns for a moment, Turbo with Shoot throws an uppercut, and Switch blocks, which takes most of the sting out of everything but a grab. The first skater knocked out loses and heads to the dressing room, and the next skater from the team's roster of six takes their place. The winner gets 15 seconds of RAGE, free power shots, and their whole team gets a full turbo meter. If neither goes down in 22 seconds, the linesmen break it up, and fights can be turned off.

A player's third goal of the game is a hat trick: hats rain onto the ice, and the scorer goes BLAZING, with a fire trail, 5 percent more speed, and shots that fly 10 percent faster, more accurately and on fire. The scorer of a team's third goal in a row goes BLAZING too. Each time the other team answers with a goal, there's an even chance the fire goes out. Goalies have their own streak: every save charges a goalie's glow, by 13 percent or by 30 for a power shot, and the charge fades by 2 percent a second. At full charge, the goalie glows and stops the next shot on target 98 percent of the time, which the game calls a BRICK WALL!

<div class="project-media-gallery">
  <figure><img src="/images/games/ice-riot-fight.webp" alt="A fight in the desktop game: Okafor, number 44 of the Northport Narwhals in teal, and Kowal of the Brimstone Inferno in red trade blows beside the net as the referee watches, under FIGHT! OKAFOR vs KOWAL, with each fighter's health bar at the bottom, the fight controls along the bottom edge and the scoreboard at NPT 0, BRM 0 with 1:14 left." width="1280" height="720" loading="lazy" /><figcaption>A fight in the desktop game.</figcaption></figure>
  <figure><img src="/images/games/ice-riot-web-fight.webp" alt="A fight in the browser version: Nakamura, number 13 of the Neon Coast Vipers in pink and purple, squares up to Sorokin of the Glacier Bay Yetis in light blue while a teammate and the referee look on, with gloves and sticks on the ice, with both health bars at the bottom and the browser page's key hints across the top, over the scoreboard." width="1280" height="720" loading="lazy" /><figcaption>A fight in the browser version.</figcaption></figure>
</div>

## How a save is decided

The moment a shot leaves the stick, the game works out whether it's on target, and if it is, rolls whether the goalie stops it, so the save is decided before the puck gets there, unless a deflection, the post or the boards change its path. A goalie rated 6 starts at 88 percent, and every rating point is worth 3 more or less. Distance adds up to 25 points for long shots or takes off up to 15 for close ones, and a fast shot takes off up to 12.5. A one-timer costs the goalie 16 points and a power shot 10, while a wrist shot gives the goalie 2. A rebound within 1.2 seconds, while the goalie is still making the first save, takes off 15, a deke or a combo 6, a goalie out of position up to 30, the top corner 5, and a goalie who's down 40. Difficulty helps the goalies against human shooters and hurts them against the computer as it rises, catch-up helps a trailing team, and the result always ends up between 12 and 94 percent, or 98 for a glowing goalie.

<figure>
  <picture><source srcset="/images/games/ice-riot-saves-code-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/games/ice-riot-saves-code.webp" alt="C++ source, lines 649 to 683 of Source/IceRiot/Private/IRGameplay.cpp: the save chance P starts at 0.88 plus 0.03 for each point of the goalie's rating above 6, then adds the distance term, clamped between -0.15 and 0.25, and subtracts half the speed term, clamped between -0.1 and 0.25. A switch on the shot kind subtracts 0.16 for a one-timer and 0.10 for a power shot and adds 0.02 for a wrist shot. A rebound within 1.2 seconds while the goalie is saving subtracts 0.15, a spin or combo 0.06, being out of position up to 0.3, the top corner 0.05 and a downed goalie 0.4. Outside attract mode, difficulty adds 0.035 per level above Medium for human shooters and subtracts 0.03 per level above Medium for the computer's, catch-up moves it by 0.02 per goal of deficit beyond the first, up to 0.06, and P is clamped between 0.12 and 0.94, or set to 0.98 when the goalie's glow is full. A random roll below P marks the save, which is a glove catch 55 percent of the time on a high shot that isn't a power shot." width="1440" height="1473" loading="lazy" /></picture>
  <figcaption>The save roll in <code>IRGameplay.cpp</code>, made the moment the shot is released.</figcaption>
</figure>

## Up to eight players

Two players can share the keyboard, one on W A S D with J, K, L, I and U, and the other on the arrow keys with comma, period, slash, semicolon and apostrophe or the number pad, and gamepads join in any mix, up to eight humans. On the join screen, everyone presses Shoot to join and picks a side, and the computer fills the rest of each team. Exhibition takes one to eight players. Tournament is an arcade ladder for up to four against the seven other teams, easiest first, where a loss means a rematch and beating them all brings a champions' celebration with 60 hats. Practice puts one skater against a goalie and resets the puck at a new spot after every attempt. Behind the title screen and the menus, the computer plays a game of its own, like a cabinet's attract mode.

The computer's skaters, goalies and fighters make every decision through the same intent structure as a human's pad, with support positions, open passing lanes and shot quality, and they scale over five difficulties, from Very Easy to Very Hard. Catch-up, which can be turned off, gives a team that trails by two or more goals slightly faster skaters and better odds on both ends of a shot. There are six cameras, Broadcast, High Broadcast, Overhead, End Zone, Close Action and Blimp, and four codes typed on the menus: BIGHEAD, TINY, ALLSTAR, which unlocks the Riot All-Stars and the Pixel Pushers, and FRENZY, which makes checks build anger three times as fast and lets fights come 8 seconds apart instead of 40.

<div class="project-media-gallery">
  <figure><img src="/images/games/ice-riot-title.webp" alt="The title screen: the ICE RIOT logo in icy blue and fiery orange letters with ARCADE HOCKEY MAYHEM on a red ribbon, ARCADE HOCKEY, UP TO 8 PLAYERS, and a PRESS START button over a dimmed view of the arena and its crowd." width="1280" height="720" loading="lazy" /><figcaption>The title screen.</figcaption></figure>
  <figure><img src="/images/games/ice-riot-join.webp" alt="The Exhibition join screen: under HOME, P1 on KEYBOARD WASD and P3 on AUTOPILOT, and under AWAY, P2 on KEYBOARD ARROWS, with empty PRESS SHOOT TO JOIN slots and the note 0 gamepads detected, up to 8 players, 7-8 players play 4-on-4." width="1280" height="720" loading="lazy" /><figcaption>The join screen, with a test autopilot as player three.</figcaption></figure>
  <figure><img src="/images/games/ice-riot-teams.webp" alt="The Choose your teams screen: the Neon Coast Vipers, four stars, with their stars Castillo and Nakamura, picked by P1 on the home side against the Glacier Bay Yetis, three stars, with Eklund and Harlan, for the computer, each with bars for speed, shooting, checking, hands and goalie." width="1280" height="720" loading="lazy" /><figcaption>Choosing teams.</figcaption></figure>
</div>

The eight teams are the Northport Narwhals, the Brimstone Inferno, the Glacier Bay Yetis, the Steel Valley Hammers, the Bayou Brawlers, the Neon Coast Vipers, the Timber Ridge Grizzlies and the Rocket City Comets. Each has six skaters and a goalie, with ratings from 1 to 10.

<figure>
  <img src="/images/games/ice-riot-crests.webp" alt="The eight team crests in two rows: a narwhal over waves for Northport, a horned fireball for the Inferno, a roaring yeti for the Yetis, crossed sledgehammers for the Hammers, an alligator for the Bayou Brawlers, a pink snake for the Vipers, a bear over pine trees for the Grizzlies, and a comet orbiting a planet for Rocket City." width="1440" height="720" loading="lazy" />
  <figcaption>The team crests, drawn by <code>gen_branding.py</code>.</figcaption>
</figure>

## Built from code

`Blender/gen_character.py` builds the skater and the goalie on one shared skeleton, along with the helmet, glove and stick that fly off in hits and fights. `gen_anims.py` authors all 48 animation clips as keyed pose parameters, solved with inverse kinematics on every frame. `gen_rink.py` makes the ice markings, the boards and glass, the nets, the goal light and the puck, and `gen_arena.py` makes the seating bowl, suites, benches, penalty boxes, banners, the center-hung jumbotron and a crowd of about 8,200 fans in one mesh that bob harder as the crowd gets excited. `gen_branding.py` draws the crests, the rafter banners, the logo and 16 fictional sponsor ads, and `gen_props.py` makes the hat-trick hats, the ambulance, an ice resurfacer that laps the rink between periods and the 3D title logo.

<div class="project-media-gallery">
  <figure><img src="/images/games/ice-riot-arena.webp" alt="The generated arena rendered in Blender from high in a corner: the rink in the middle of a bowl packed with thousands of blocky fans in bright colors, ribbon boards around the seating and a jumbotron hanging over center ice." width="1440" height="810" loading="lazy" /><figcaption>The arena, rendered in Blender.</figcaption></figure>
  <figure><img src="/images/games/ice-riot-skater.webp" alt="A generated skater in Blender on a gray background, in an A-pose holding a stick, wearing the Northport Narwhals' teal and navy jersey with a navy helmet and a clear visor." width="1440" height="960" loading="lazy" /><figcaption>A skater, rendered in Blender.</figcaption></figure>
</div>

`Tools/gen_audio.py` makes all 173 sounds. It synthesizes 105 of them with NumPy: 77 effects, 14 crowd beds, reactions and organ stingers, 9 menu sounds and five music tracks, built from Karplus-Strong guitars and bass, an FM electric piano, a drawbar organ through a rotary speaker and a synthesized rock kit. The other 68 are announcer lines, spoken by macOS's `say` command with the Daniel voice, converted with `afconvert` and run through a simulated PA chain. The seeds are fixed, so a rerun reproduces the same files, apart from the announcer, which depends on the installed voice.

The game itself is 9,956 lines of C++ in 34 files in `Source/IceRiot`: the skating and puck physics, the rules, the AI, the six cameras, the replay buffer, which keeps seven seconds at 30 frames a second and plays a goal back at about half speed, and a HUD and menus drawn on Unreal's canvas.

## The browser version

The Play button opens the same C++ game, built by `Tools/package.sh web` for Unreal's Wasm platform with Emscripten 6.0.10. The Pages workflow takes the browser build from a release's `IceRiot-Web.zip` and deploys it next to the website. It needs WebGPU, so it runs in desktop Chrome and Edge or Safari 26 and later, and in a browser without WebGPU, the website's Play buttons open a notice with the Mac download and a Try anyway link. In the capture for this page, the loader timed a few test draws, picked Unreal's mobile deferred renderer on WebGPU and ran the engine with worker threads, and the page reloads itself once under a service worker to get the isolation that threads need. A first visit downloads about 94 MB, or 193 MB uncompressed, most of it a 133 MB WebAssembly binary and 59 MB of cooked game content.

<figure>
  <img src="/images/games/ice-riot-web-replay.webp" alt="The replay of a Glacier Bay goal in the browser version, from a low angle: the Neon Coast Vipers' goalie in pink and purple reaches across the crease with the puck in midair beside the net, with fans cheering behind the glass, GOAL: #33 HARLAN in the top corner and PRESS SHOOT TO SKIP along the bottom." width="1280" height="720" loading="lazy" />
  <figcaption>The replay of a goal in the browser version.</figcaption>
</figure>

## How it was made

The repository has 18 commits, made in under three hours. The first holds a README stub and the icon, and the other 17, which add the game, the rules, the art pipeline, the website, the trailer and the packaging and release scripts, are all co-authored by Claude. The README and the website say every model, texture, animation and sound comes from scripts. The README calls the teams, players, logos, sponsors and announcer lines fictional, and the website calls them original works made for the project.

## Play it

Play [in your browser](https://nearbycoder.github.io/ice-riot/play/), or start from [the website](https://nearbycoder.github.io/ice-riot/), which has the features, modes, teams and controls. Press Enter on the title screen, pick Exhibition, press Shoot to join, then Enter to choose teams. Player one skates with W A S D, shoots or checks with J or Space, passes or pokes with K, turbos with L or Left Shift, switches or dekes with I, hooks or drops a pass with U, changes the camera with C and pauses with Esc. Player two uses the arrow keys with comma, period, slash, semicolon and apostrophe, or Numpad 1 to 5.

[Download the Mac app](https://github.com/nearbycoder/ice-riot/releases/latest) from the latest release. It's signed ad hoc, not notarized, so the first launch needs Open Anyway in System Settings, under Privacy & Security. Building it takes macOS with Xcode, a source build of Unreal Engine 5.9 at `~/UnrealEngine`, Blender 5.3 and Git LFS, and the web build also needs Emscripten 6.0.10. The scripts in `Tools` regenerate the art and audio, import them, compile the game and package `IceRiot.app` or the browser build.

[Browse the source on GitHub](https://github.com/nearbycoder/ice-riot). The creation date shown here is the GitHub repository's UTC creation date. The cover and the power shot, replay, fight, title, join and team selection pictures are the website's screenshots of the desktop game, the arena and skater pictures are the website's Blender renders, and the crest sheet is the website's copy of the preview that `gen_branding.py` draws. All of them were shrunk with Lanczos resampling. The browser fight and replay were captured for this page from the live browser version in headless Chromium on Linux with an AMD Radeon 8060S, with the game's `-irwatch` switch passed through the page's `window.ueExtraArgs` hook so that the computer played both sides. The trailer and its poster are the website's own, and the code excerpt is from `IRGameplay.cpp`.
