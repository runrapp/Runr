# Calendar Skill

## Provider
Google Calendar via Google OAuth2

## Capabilities
- List upcoming events for a date range
- Create new events with full details
- Update existing event properties
- Delete events
- Detect scheduling conflicts
- Send calendar invitations to attendees

## Parameters
- `action`: list | create | update | delete
- `summary`: event title
- `start`: ISO datetime for event start
- `end`: ISO datetime for event end
- `location`: event location (optional)
- `attendees`: array of email addresses (optional)
- `description`: event description (optional)
- `days`: number of days to look ahead (for list, default: 7)

## Constraints
- Delete actions require explicit user confirmation
- Events with attendees will send invitations on create
- Time zone defaults to UTC unless specified

## Auth
Google OAuth2 with scopes:
- calendar.readonly
- calendar.events
