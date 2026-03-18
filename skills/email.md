# Email Skill

## Provider
Gmail via Google OAuth2

## Capabilities
- Read inbox messages (metadata + body)
- Summarize email content
- Compose and send new emails
- Reply to existing threads
- Search by query, sender, date
- Mark as read, archive, trash

## Parameters
- `action`: read | send | search | archive
- `to`: recipient email (for send)
- `subject`: email subject (for send)
- `body`: email body (for send)
- `query`: search query (for search)
- `limit`: max results (default: 10)

## Constraints
- Email bodies truncated to 500 words before passing to Claude
- Send actions require explicit user confirmation
- Delete/trash actions require explicit user confirmation
- Maximum 50 emails per read request

## Auth
Google OAuth2 with scopes:
- gmail.readonly
- gmail.send
- gmail.modify
