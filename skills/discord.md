# Discord Skill

## Provider
discord.js

## Capabilities
- Register and respond to slash commands
- Execute tasks via the Runr agent API
- Post results to the channel where command was invoked
- Handle deferred replies for long-running tasks

## Slash Commands
- `/task command:<description>` — Run any task
- `/emails` — Summarize recent emails
- `/events` — List upcoming calendar events
- `/browse url:<url>` — Browse and summarize a webpage
- `/status` — Check agent status

## Constraints
- Bot must be started separately (Railway or long-running process)
- Discord responses limited to 2000 characters
- Long responses are truncated with "..."
- Slash commands auto-registered on bot startup

## Auth
Requires DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID
Bot must be invited to server with `applications.commands` scope
