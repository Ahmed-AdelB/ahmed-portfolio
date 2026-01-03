# Calendly Integration Setup Guide

This guide explains how to set up and customize the Calendly integration for coffee chats and meetings on the portfolio.

## Prerequisites

- A Calendly account (free or paid)
- Access to the portfolio codebase

## Step 1: Create a Calendly Account

1. Go to [calendly.com](https://calendly.com) and sign up for an account
2. Complete the onboarding process to set up your availability

## Step 2: Create an Event Type for Coffee Chats

1. From your Calendly dashboard, click **Create** > **Event Type**
2. Choose **One-on-One** as the event type
3. Configure the event:
   - **Event name**: "Coffee Chat" (or your preferred name)
   - **Duration**: 30 minutes (recommended for coffee chats)
   - **Location**: Choose your preferred meeting platform (Google Meet, Zoom, etc.)
   - **Description**: Add a brief description of what the meeting is for

4. Set your **Availability**:
   - Define your available hours
   - Set buffer time between meetings (recommended: 15 minutes)
   - Set minimum scheduling notice (recommended: 24 hours)

5. Click **Save & Close**

## Step 3: Get Your Calendly URL

1. From your Calendly dashboard, click on the event type you created
2. Copy the **Scheduling Link** (e.g., `https://calendly.com/yourusername/coffee-chat`)

## Step 4: Update the Portfolio Configuration

Update the Calendly URL in the contact pages:

### English Contact Page

File: `src/pages/contact.astro`

```astro
// Update this line with your actual Calendly URL
const CALENDLY_URL = 'https://calendly.com/yourusername/coffee-chat';
```

### Arabic Contact Page

File: `src/pages/ar/contact.astro`

```astro
// Update this line with your actual Calendly URL
const CALENDLY_URL = 'https://calendly.com/yourusername/coffee-chat';
```

## CalendlyEmbed Component Usage

The `CalendlyEmbed` component supports two display modes:

### Inline Mode (Default)

Embeds the full scheduling widget directly in the page:

```tsx
<CalendlyEmbed
  client:load
  url="https://calendly.com/yourusername/coffee-chat"
  mode="inline"
  height={400}
  primaryColor="10b981"
/>
```

### Popup Mode

Shows a button that opens Calendly in a popup modal:

```tsx
<CalendlyEmbed
  client:load
  url="https://calendly.com/yourusername/coffee-chat"
  mode="popup"
  buttonText="Schedule a Coffee Chat"
/>
```

## Component Props Reference

| Prop              | Type                | Default              | Description                             |
| ----------------- | ------------------- | -------------------- | --------------------------------------- |
| `url`             | string              | (required)           | Your Calendly scheduling URL            |
| `mode`            | 'inline' \| 'popup' | 'inline'             | Display mode                            |
| `height`          | number              | 400                  | Height of inline widget (px)            |
| `minWidth`        | number              | 320                  | Minimum width of inline widget (px)     |
| `buttonText`      | string              | 'Schedule a Meeting' | Button text for popup mode              |
| `className`       | string              | -                    | Custom CSS class for container          |
| `hideBranding`    | boolean             | false                | Hide Calendly branding                  |
| `prefillName`     | string              | -                    | Pre-fill invitee name                   |
| `prefillEmail`    | string              | -                    | Pre-fill invitee email                  |
| `primaryColor`    | string              | -                    | Widget primary color (hex without #)    |
| `textColor`       | string              | -                    | Widget text color (hex without #)       |
| `backgroundColor` | string              | -                    | Widget background color (hex without #) |

## Customization Examples

### Match Portfolio Theme

```tsx
<CalendlyEmbed
  client:load
  url="https://calendly.com/yourusername/meeting"
  primaryColor="10b981" // Emerald-500
  textColor="1f2937" // Gray-800
  backgroundColor="f9fafb" // Gray-50
/>
```

### Pre-fill User Information

Useful when the user is already logged in:

```tsx
<CalendlyEmbed
  client:load
  url="https://calendly.com/yourusername/meeting"
  prefillName={user.name}
  prefillEmail={user.email}
/>
```

## Calendly Account Settings

### Recommended Settings

1. **Notifications**: Enable email confirmations and reminders
2. **Branding**: Add your logo and customize colors to match your portfolio
3. **Questions**: Add a custom question asking about the meeting agenda
4. **Workflows**: Set up automatic follow-up emails

### Integration with Calendar

Connect your Google Calendar or Outlook to:

- Automatically check for conflicts
- Add booked events to your calendar
- Send calendar invites to invitees

## Troubleshooting

### Widget Not Loading

1. Check browser console for errors
2. Ensure the Calendly URL is correct and publicly accessible
3. Verify there are no ad blockers interfering

### Popup Not Opening

1. Check if popup blockers are enabled
2. Ensure the Calendly script has loaded (check Network tab)
3. The component falls back to opening in a new tab if popup fails

### Styling Issues

1. The widget respects the `primaryColor` prop for theming
2. For more advanced customization, use Calendly's embed settings in your dashboard
3. Dark mode is automatically detected based on your portfolio's theme

## Security Considerations

- The Calendly widget is loaded from Calendly's CDN (`assets.calendly.com`)
- No sensitive data is stored locally
- All booking data is managed by Calendly's infrastructure
- Consider enabling Calendly's spam protection features

## Support

- [Calendly Help Center](https://help.calendly.com/)
- [Calendly Developer Docs](https://developer.calendly.com/)
- [Widget Embedding Guide](https://help.calendly.com/hc/en-us/articles/223147027-Embed-options-overview)
