# Telegram Skill

## Provider
Telegraf.js (Telegram Bot API)

## Capabilities
- Receive text commands from authorized users
- Execute tasks via the Runr agent API
- Return formatted results to user
- Handle multi-step conversations

## Commands
- `/start` — Show help and available commands
- `/task <description>` — Run any task
- `/emails` — Summarize recent emails
- `/events` — List upcoming calendar events
- `/browse <url>` — Browse and summarize a webpage
- `/status` — Check agent status
- Plain text messages are treated as task commands

## Constraints
- Bot must be started separately (Railway or long-running process)
- Responses are plain text (no markdown rendering in Telegram)
- Long responses may be truncated

## Auth
Requires TELEGRAM_BOT_TOKEN from BotFather
