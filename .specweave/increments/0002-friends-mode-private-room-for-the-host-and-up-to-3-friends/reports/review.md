# Review: 0002 friends mode

Fresh-context review by a separate agent on November 12, 2026, of `git diff build/fable...e150415 -- src tools vite.config.ts`, read-only. It confirmed that damage is applied once, that signaling rooms are freed when the host leaves, that delivery stays in order on a healthy link, and that hooks, hurt scaling, match authority and traffic are restored on leaving.

## Findings and what was done (commit `30c6919`)

| # | Finding | Severity | Outcome |
|---|---|---|---|
| 1 | A car stays kinematic for good when its remote driver dies or the car is wrecked | High | Fixed: every fixed step hands a network-driven body back once no live remote player drives it |
| 2 | Bodies of friends stay alive and in play after leaving a room, into single player | High | Fixed: they are parked like bots between rounds (not alive, out of play, hidden); the room test checks it |
| 3 | One event lost on a dead data channel stalls the link | Medium-high | Fixed: events go over the data channel and the relay, and the sequence number drops the twin |
| 4 | A guest who reloads looks frozen to others for seconds (clock restarted) | Medium | Fixed: a sender clock that jumps back resets the buffer; the host resets that player's buffer on rejoin |
| 5 | Resume brings back players who left mid-round | Medium | Fixed: resume lists only players still in the room |
| 6 | A malformed upgrade URL crashes the signaling server | Medium | Fixed: the URL parse is guarded |
| 7 | Vehicle damage and vehicle placement are not synced | Medium | Not fixed, documented in `docs/friends-mode.md` as a known limit |
| 8 | Two guest tabs in one profile share a token and steal each other's slot | Medium | Fixed: a token only reclaims a slot that is away |
| 9 | A guest who leaves on purpose can show as away for 30 s | Low | Fixed by 3: the goodbye also goes through the signaling socket, ahead of the server's leave notice |
| 10 | Loot can be taken twice | Low | Not fixed, documented |
| 11 | The host's "Play again" after dying restarts a round others are still playing | Low | Fixed: it does nothing until the round is over |

After the fixes: friends tests 4 of 4, full suite 45 of 45 (`reports/verify.md`).
