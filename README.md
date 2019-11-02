# Azure Function: Slack Event Push API -> Azure Storage Queue

Sets up an HTTP POST API; the message body will then be added to an Azure Storage Queue for downstream processing.
Includes signature verification. Messages can optionally be filtered from a single channel.

## Quick Deploy to Azure

[![Deploy to Azure](http://azuredeploy.net/deploybutton.svg)](https://azuredeploy.net/)

## Application settings

- **Storage** - Azure Storage Account Connection String for the Queue.
- **Slack-specific** - Verification secrect (mandatory), Channel id (optional)
