# Email Forwarding Setup Guide

This guide provides comprehensive instructions for setting up email forwarding for `contact@ahmedaderai.dev` (or your custom domain) to route messages to your personal email address.

## Table of Contents

- [Overview](#overview)
- [Option 1: Cloudflare Email Routing (Recommended)](#option-1-cloudflare-email-routing-recommended)
- [Option 2: ImprovMX](#option-2-improvmx)
- [Option 3: ForwardEmail.net](#option-3-forwardemailnet)
- [Option 4: Namecheap Email Forwarding](#option-4-namecheap-email-forwarding)
- [DNS Records for Email Deliverability](#dns-records-for-email-deliverability)
- [Testing Your Setup](#testing-your-setup)
- [Troubleshooting](#troubleshooting)

---

## Overview

Email forwarding allows you to receive emails sent to `contact@yourdomain.com` in your existing personal email inbox (e.g., Gmail). This is ideal for portfolio sites where you don't need a full email hosting solution.

**Current Setup:**

- **Contact Form:** Uses [Formspree](https://formspree.io) to handle form submissions
- **Direct Email:** Forward `contact@ahmedaderai.dev` to personal Gmail
- **Destination:** `ahmedalderai25@gmail.com`

---

## Option 1: Cloudflare Email Routing (Recommended)

Cloudflare offers free email routing if your domain uses Cloudflare DNS.

### Prerequisites

- Domain DNS managed by Cloudflare
- Cloudflare account (free tier works)

### Setup Steps

1. **Log in to Cloudflare Dashboard**
   - Navigate to your domain
   - Go to **Email** > **Email Routing**

2. **Enable Email Routing**
   - Click "Get Started" or "Enable Email Routing"
   - Cloudflare will prompt you to add required MX records

3. **Add Destination Address**
   - Click "Add destination address"
   - Enter your personal email: `ahmedalderai25@gmail.com`
   - Verify by clicking the link sent to that address

4. **Create Routing Rules**
   - Click "Create address"
   - Custom address: `contact`
   - Action: "Send to an email"
   - Destination: Select your verified destination
   - Click "Save"

5. **Verify DNS Records**
   Cloudflare automatically adds these records:

   | Type | Name | Content                                      | Priority |
   | ---- | ---- | -------------------------------------------- | -------- |
   | MX   | @    | `route1.mx.cloudflare.net`                   | 69       |
   | MX   | @    | `route2.mx.cloudflare.net`                   | 2        |
   | MX   | @    | `route3.mx.cloudflare.net`                   | 49       |
   | TXT  | @    | `v=spf1 include:_spf.mx.cloudflare.net ~all` | -        |

### Catch-All Option

To forward ALL emails (any-address@yourdomain.com):

- Go to **Email Routing** > **Routing rules**
- Enable "Catch-all address"
- Select your destination email

---

## Option 2: ImprovMX

[ImprovMX](https://improvmx.com/) is a popular free email forwarding service.

### Setup Steps

1. **Sign Up at ImprovMX**
   - Go to [improvmx.com](https://improvmx.com/)
   - Enter your domain: `ahmedaderai.dev`
   - Enter forwarding destination: `ahmedalderai25@gmail.com`

2. **Add DNS Records**
   Add these records to your domain's DNS:

   | Type | Name | Value                                  | Priority |
   | ---- | ---- | -------------------------------------- | -------- |
   | MX   | @    | `mx1.improvmx.com`                     | 10       |
   | MX   | @    | `mx2.improvmx.com`                     | 20       |
   | TXT  | @    | `v=spf1 include:spf.improvmx.com ~all` | -        |

3. **Verify Domain**
   - Return to ImprovMX dashboard
   - Click "Check DNS" to verify records

4. **Create Aliases (Free Tier)**
   Free tier allows up to 25 aliases:
   - `contact@ahmedaderai.dev` -> `ahmedalderai25@gmail.com`
   - `hello@ahmedaderai.dev` -> `ahmedalderai25@gmail.com`

### Limitations (Free Tier)

- 25 email aliases
- 500 emails/day
- 10MB attachment limit

---

## Option 3: ForwardEmail.net

[ForwardEmail.net](https://forwardemail.net/) is a free, open-source email forwarding service.

### Setup Steps

1. **Add DNS Records**

   | Type | Name | Value                                      | Priority |
   | ---- | ---- | ------------------------------------------ | -------- |
   | MX   | @    | `mx1.forwardemail.net`                     | 10       |
   | MX   | @    | `mx2.forwardemail.net`                     | 20       |
   | TXT  | @    | `forward-email=ahmedalderai25@gmail.com`   | -        |
   | TXT  | @    | `v=spf1 include:spf.forwardemail.net ~all` | -        |

2. **For Specific Address Forwarding**
   To forward only `contact@`:

   ```
   TXT @ forward-email=contact:ahmedalderai25@gmail.com
   ```

3. **Verify Setup**
   ```bash
   dig MX ahmedaderai.dev +short
   # Expected:
   # 10 mx1.forwardemail.net.
   # 20 mx2.forwardemail.net.
   ```

---

## Option 4: Namecheap Email Forwarding

If your domain is registered with Namecheap, they offer built-in email forwarding.

### Setup Steps

1. **Log in to Namecheap**
   - Go to Domain List > Manage your domain

2. **Navigate to Email Forwarding**
   - Click on "Email Forwarding" in the left sidebar

3. **Add Forwarding Rule**
   - Alias: `contact`
   - Forward to: `ahmedalderai25@gmail.com`
   - Click "Add New Email Forwarder"

4. **DNS Auto-Configuration**
   Namecheap automatically configures MX records when using their email forwarding.

---

## DNS Records for Email Deliverability

To ensure emails from your domain don't land in spam, configure these additional records:

### SPF Record (Sender Policy Framework)

Prevents email spoofing by specifying which servers can send email for your domain.

```
TXT @ v=spf1 include:_spf.google.com include:spf.improvmx.com ~all
```

**Note:** Adjust `include:` based on your email provider.

### DKIM Record (DomainKeys Identified Mail)

DKIM adds a digital signature to outgoing emails. Most forwarding services handle this automatically.

**For ImprovMX:**

```
TXT @ improvmx._domainkey.improvmx.com
```

**For Cloudflare:**
DKIM is automatically configured when using Email Routing.

### DMARC Record (Domain-based Message Authentication)

Tells receiving servers what to do with emails that fail SPF/DKIM checks.

```
TXT _dmarc v=DMARC1; p=none; rua=mailto:ahmedalderai25@gmail.com
```

**DMARC Policies:**

- `p=none` - Monitor only, don't reject
- `p=quarantine` - Send to spam folder
- `p=reject` - Block completely

**Recommended:** Start with `p=none` to monitor, then gradually increase strictness.

### Complete DNS Record Example

For a domain using Cloudflare Email Routing:

| Type | Name    | Value                                                   | TTL  |
| ---- | ------- | ------------------------------------------------------- | ---- |
| MX   | @       | `route1.mx.cloudflare.net`                              | Auto |
| MX   | @       | `route2.mx.cloudflare.net`                              | Auto |
| MX   | @       | `route3.mx.cloudflare.net`                              | Auto |
| TXT  | @       | `v=spf1 include:_spf.mx.cloudflare.net ~all`            | Auto |
| TXT  | \_dmarc | `v=DMARC1; p=none; rua=mailto:ahmedalderai25@gmail.com` | Auto |

---

## Testing Your Setup

### 1. Verify MX Records

```bash
# Check MX records
dig MX ahmedaderai.dev +short

# Expected output (for Cloudflare):
# 69 route1.mx.cloudflare.net.
# 2 route2.mx.cloudflare.net.
# 49 route3.mx.cloudflare.net.
```

### 2. Verify SPF Record

```bash
dig TXT ahmedaderai.dev +short | grep spf

# Expected: "v=spf1 include:..."
```

### 3. Verify DMARC Record

```bash
dig TXT _dmarc.ahmedaderai.dev +short

# Expected: "v=DMARC1; p=none; ..."
```

### 4. Send Test Email

1. Open a different email account (not your forwarding destination)
2. Compose an email to `contact@ahmedaderai.dev`
3. Subject: "Email Forwarding Test"
4. Send the email
5. Check your personal inbox (`ahmedalderai25@gmail.com`)
6. Verify:
   - Email arrives within a few minutes
   - Check spam folder if not in inbox
   - Verify sender address is preserved

### 5. Use Online Tools

- [MXToolbox](https://mxtoolbox.com/) - Check MX, SPF, DMARC records
- [Mail Tester](https://www.mail-tester.com/) - Check email deliverability
- [DMARC Analyzer](https://www.dmarcanalyzer.com/) - Analyze DMARC reports

---

## Troubleshooting

### Emails Not Arriving

1. **Check DNS Propagation**
   - DNS changes can take up to 24-48 hours
   - Use [whatsmydns.net](https://www.whatsmydns.net/) to check propagation

2. **Check Spam Folder**
   - First emails often land in spam until domain builds reputation

3. **Verify Destination Email**
   - Ensure the forwarding destination is correctly verified
   - Check for typos in email address

4. **Check Service Dashboard**
   - Log into your email forwarding service
   - Check logs for delivery failures

### Emails Going to Spam

1. **Add SPF Record**
   - Ensures receiving servers trust your email origin

2. **Configure DKIM**
   - Adds cryptographic signature for authenticity

3. **Set Up DMARC**
   - Start with `p=none` to avoid blocking legitimate emails

4. **Build Domain Reputation**
   - New domains may be flagged initially
   - Reputation improves over time with legitimate email traffic

### Bounce Messages

Common causes:

- **Invalid destination:** Verify forwarding email address
- **Mailbox full:** Check destination inbox storage
- **Rate limiting:** Free tiers have daily limits

---

## Integration with Contact Form

The portfolio contact form uses Formspree for form submissions. Formspree sends notification emails directly to your configured email address, independent of domain email forwarding.

**Current Formspree Configuration:**

- Form endpoint: `https://formspree.io/f/xpwzgkdl`
- Notifications sent to: Account email on Formspree

**To update Formspree notification email:**

1. Log in to [Formspree Dashboard](https://formspree.io/)
2. Select your form
3. Go to Settings > Email
4. Update notification email to `contact@ahmedaderai.dev` (once forwarding is set up)

---

## Summary

| Provider     | Best For                  | Cost      | Setup Difficulty |
| ------------ | ------------------------- | --------- | ---------------- |
| Cloudflare   | Domains on Cloudflare DNS | Free      | Easy             |
| ImprovMX     | Quick setup, reliable     | Free/Paid | Easy             |
| ForwardEmail | Open source, privacy      | Free      | Medium           |
| Namecheap    | Namecheap domains         | Included  | Easy             |

**Recommended Setup:**

1. Use Cloudflare Email Routing (if domain uses Cloudflare DNS)
2. Configure SPF, DKIM, and DMARC for deliverability
3. Test thoroughly before relying on it for important communications
4. Monitor DMARC reports for first 2 weeks

---

**Last Updated:** January 2026

Author: Ahmed Adel Bakr Alderai
