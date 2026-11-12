# Friends mode: private room for the host and up to 3 friends

## Problem

EYEWALL is single player only: one human against bots. Increment 0001 closed with a multiplayer evaluation (`docs/multiplayer-evaluation.md`) whose long-term plan is a paid, server-authoritative Colyseus room. The user wants the cheap first step now: a private room where the host and 1 to 3 friends play together from a shared link, with the host's browser running the match and no paid servers.

## Scope

In:

- A **Friends** entry on the title screen: create a room, get a 4-letter code and an invite link (`?room=CODE`), see who has joined, start the round (host only).
- Joining from the link or by typing the code; up to 4 players per room.
- Peer-to-peer WebRTC data channels in a star around the host (guest to host only), with free signaling: a small WebSocket signaling endpoint built into the Vite dev and preview servers (`/signal`) and runnable on its own (`node tools/signal-server.mjs`). When a data channel cannot open, the same socket relays the traffic, so a room still works.
- A friends round: everyone spawns on foot at spread points around a chosen start, carrying the same kit, no bots and no storm. Last one standing wins and every player sees the same result.
- Remote players are full characters with animation and their weapon in hand, interpolated about 100 ms behind from 20 Hz state messages.
- Shooting: tracers, muzzle flash and sound of remote shots; hits are claimed by the shooter and decided by the host (health, armor, deaths, kills and the match end are host-authoritative).
- Vehicles: getting in and out is granted by the host (one occupant per seat); the driver's browser simulates the vehicle and the others show it moving.
- Leave and rejoin: a player who closes the tab is shown as away for 30 seconds and can reopen the link to take their slot back with their health and position; after that they are out of the round. When the host leaves, the room closes for everyone with a message.
- Single player unchanged.

Out:

- A public signaling deployment, TURN relays, accounts, matchmaking, more than 4 players.
- Bots, the storm, the seaplane drop and loot syncing in a friends round (each browser keeps its own loot; containers and pickups are not shared). Vehicle damage, grenades' explosions on other screens, traffic cars (each browser runs its own) and anti-cheat.

## Acceptance Criteria

- [ ] AC-01: The title screen offers Friends. Creating a room shows a 4-letter code, a copyable invite link and the player list; a second browser that opens the link (or types the code) appears in both lists within 10 seconds, and a fifth player is refused with a message.
- [ ] AC-02: After the host starts the round, each browser shows every other player as a moving, animated character; a remote player's position on another screen is within 1.5 m of where they are after they stop moving, and within 4 m while running.
- [ ] AC-03: A shot by one player that hits another lowers the target's health by the same amount on every screen, shows a tracer on the other screen, and a kill shows in every kill feed; when one player is left, every browser shows the same winner.
- [ ] AC-04: A player drives a car; the others see the car and its driver move to within 3 m of the driver's own position, and a second player cannot take the occupied driver's seat.
- [ ] AC-05: A guest who closes the page and reopens the invite link within 30 seconds is back in the same round with the health they left with; the others saw them as away meanwhile. A guest who leaves for good is counted out of the round; when the host leaves, guests see that the room closed.
- [ ] AC-06: Single player is unchanged: the existing browser suite still passes and the High preset frame-rate gate still holds.

## Approach

**Topology (deviates from the evaluation, on the user's instruction).** The evaluation recommends a dedicated server and rejects "relay with one player as host" because the host can cheat and the match dies with the host's tab. For a private room of friends both costs are acceptable and the server bill is zero, so this increment uses the host's browser as the authority. The evaluation's later phases still apply if public rooms are ever wanted.

**Transport.** `src/net/signal.ts` speaks a tiny JSON protocol to `/signal` (create, join, signal, relay, leave). `src/net/transport.ts` opens one `RTCPeerConnection` per guest at the host with two data channels: `events` (reliable, ordered) and `state` (unordered, no retransmits). Public STUN (`stun:stun.l.google.com:19302`) helps across networks and needs no account. After 6 seconds without an open channel the pair falls back to relaying through the signaling socket. The signaling code lives in `tools/signal-core.mjs` and is mounted by a Vite plugin on the dev and preview servers and by `tools/signal-server.mjs` alone.

**Authority.** Each browser simulates its own character and the vehicle it drives, exactly as in single player, and sends state at 20 Hz. The host relays everyone's state to everyone. Damage is claimed by whoever caused it (the shooter, or the victim for falls and drowning) and applied only by the host, which validates it (alive, in range, capped at the weapon's most damaging shot) and broadcasts the result as absolute health and armor. Heals and armor are sent as `used` events the host applies too. The host alone decides the end of the round.

**Hooks in the game (small and inert in single player).** `Character.remote` skips the motor and takes its pose from the network; `Game.hurtGate` lets the net layer route damage; `Game.events` gains `seat` (someone got in or out of a vehicle); `Vehicle.remoteDriven` makes a body kinematic and follows the network; `Game.playAgain` lets the result card return to the room. `Match.startFriends` and `Match.finishWith` run a round without drop, storm or bots.

**Interpolation.** Each state message carries the sender's clock. Receivers keep a 1 s buffer per player and vehicle and render 100 ms behind the newest estimate of the sender's clock, extrapolating at most 200 ms.

**Risks.** Two headless browsers on one integrated GPU render slowly; the friends tests use small viewports and do not measure frame rate. WebRTC between two contexts of one headless Chromium may not gather candidates; the relay fallback keeps the room working and the test reports which transport ran.

**Free signaling for a public build.** GitHub Pages serves files only, so a published build needs a signaling endpoint somewhere. `tools/signal-server.mjs` runs on any machine with Node (a LAN host, a free-tier VM); the client takes `?signal=wss://host/signal`. Nothing is deployed in this increment.

## Decisions

### Asked
- D-01 Topology → WebRTC peer-to-peer with the host's browser as authority, free signaling, no paid servers (user, in the task).
### Defaulted (change any before sw-do)
- D-02 Movement is simulated by its owner and trusted by the host; damage, deaths and the match end are host-authoritative. Reversible: the host could simulate guests from inputs later.
- D-03 A friends round has no bots, storm or drop; spawns are spread around a start point the host picks.
- D-04 Signaling is a local WebSocket endpoint on the dev and preview servers; no third-party broker is used by default.
### Open
- none

## Tasks

### T-01 Signaling endpoint and peer transport
- AC: AC-01 | Files: tools/signal-core.mjs, tools/signal-server.mjs, vite.config.ts, src/net/signal.ts, src/net/transport.ts, src/net/protocol.ts, package.json | Test: flock /tmp/eyewall-gpu.lock npx playwright test friends -g "room"

### T-02 Friends room UI: create, invite link, join, player list, room full
- AC: AC-01 | Files: src/ui/friends.ts, src/ui/friends.css, src/ui/shell.ts, src/main.ts, src/net/session.ts | Test: flock /tmp/eyewall-gpu.lock npx playwright test friends -g "room"

### T-03 Game hooks for remote players, damage routing, seats and the result card
- AC: AC-06 | Files: src/character/character.ts, src/game.ts, src/gameplay/match.ts, src/vehicles/vehicle.ts, src/ui/aftermath.ts, src/core/debug.ts | Test: flock /tmp/eyewall-gpu.lock npm test

### T-04 Friends round: start, state sync and interpolation of remote players
- AC: AC-02 | Files: src/net/session.ts, src/net/remote.ts, src/net/interp.ts, tests/e2e/friends.spec.ts | Test: flock /tmp/eyewall-gpu.lock npx playwright test friends -g "move"

### T-05 Shots, host-decided hits, kill feed and shared match end
- AC: AC-03 | Files: src/net/session.ts, src/gameplay/combat.ts, tests/e2e/friends.spec.ts | Test: flock /tmp/eyewall-gpu.lock npx playwright test friends -g "hit"

### T-06 Vehicles: seat grants and the driver's simulation shown to others
- AC: AC-04 | Files: src/net/session.ts, src/net/remote.ts, tests/e2e/friends.spec.ts | Test: flock /tmp/eyewall-gpu.lock npx playwright test friends -g "car"

### T-07 Leave, away and rejoin; host leaving closes the room
- AC: AC-05 | Files: src/net/session.ts, src/net/transport.ts, tools/signal-core.mjs, tests/e2e/friends.spec.ts | Test: flock /tmp/eyewall-gpu.lock npx playwright test friends -g "rejoin"

### T-08 How to play with friends, screenshot, full suite and frame-rate gate
- AC: AC-06 | Files: docs/friends-mode.md, docs/img/friends-room.png, README.md | Test: flock /tmp/eyewall-gpu.lock npm test

### T-09 Verify and close 0002
- AC: AC-06 | Files: .specweave/increments/0002-friends-mode-private-room-for-the-host-and-up-to-3-friends/spec.md | Test: specweave verify 0002-friends-mode-private-room-for-the-host-and-up-to-3-friends
