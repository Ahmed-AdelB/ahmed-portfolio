# Uptime Monitoring Setup

This document outlines the uptime monitoring configuration for ahmedalderai.com.

## Health Check Endpoint

The portfolio includes a health check endpoint for monitoring services:

```
GET https://ahmedalderai.com/api/health
```

### Response Format

```json
{
  "status": "healthy",
  "timestamp": "2024-01-03T12:00:00.000Z",
  "version": "abc1234",
  "uptime": 3600,
  "checks": [
    {
      "name": "runtime",
      "status": "pass",
      "message": "Astro runtime operational"
    },
    {
      "name": "environment",
      "status": "pass",
      "message": "Node environment available"
    }
  ]
}
```

### Status Codes

| Status | HTTP Code | Meaning |
|--------|-----------|---------|
| healthy | 200 | All systems operational |
| degraded | 200 | Some non-critical issues |
| unhealthy | 503 | Service unavailable |

---

## UptimeRobot Setup (Recommended - Free Tier)

UptimeRobot provides free monitoring with 5-minute check intervals.

### Account Setup

1. Sign up at [UptimeRobot](https://uptimerobot.com)
2. Free tier includes:
   - 50 monitors
   - 5-minute check intervals
   - Email/SMS alerts
   - Public status page

### Monitor Configuration

Create two monitors for comprehensive coverage:

#### Monitor 1: Homepage (HTTP)

| Setting | Value |
|---------|-------|
| Monitor Type | HTTP(s) |
| Friendly Name | Ahmed Portfolio - Homepage |
| URL | `https://ahmedalderai.com` |
| Monitoring Interval | 5 minutes |
| Monitor Timeout | 30 seconds |
| Keyword | (optional) `Ahmed` |

#### Monitor 2: Health Endpoint (HTTP)

| Setting | Value |
|---------|-------|
| Monitor Type | HTTP(s) |
| Friendly Name | Ahmed Portfolio - Health API |
| URL | `https://ahmedalderai.com/api/health` |
| Monitoring Interval | 5 minutes |
| Monitor Timeout | 30 seconds |
| HTTP Method | GET |

### Alert Contacts

1. Go to **My Settings** > **Alert Contacts**
2. Add email notification: your primary email
3. Optional: Add Telegram, Slack, or Discord webhook

### Status Page (Optional)

1. Go to **Status Pages** > **Add Status Page**
2. Configure:
   - Subdomain: `ahmedalderai` (becomes ahmedalderai.uptimerobot.com)
   - Or use custom domain
3. Select monitors to display
4. Customize branding

---

## Alternative Services

### Freshping (Free Tier)

[Freshping](https://www.freshworks.com/website-monitoring/) by Freshworks.

**Free tier includes:**
- 50 monitors
- 1-minute check intervals
- Multi-location checks
- Public status page

**Setup:**
1. Sign up at freshping.io
2. Add monitor with URL: `https://ahmedalderai.com`
3. Configure alert channels

### Better Uptime (Free Tier)

[Better Uptime](https://betteruptime.com/) offers modern monitoring.

**Free tier includes:**
- 10 monitors
- 3-minute intervals
- Slack/Teams integration
- Incident management

**Setup:**
1. Sign up at betteruptime.com
2. Create monitor for `https://ahmedalderai.com`
3. Create monitor for `https://ahmedalderai.com/api/health`
4. Configure on-call schedule if needed

### Uptime Kuma (Self-Hosted)

For self-hosted monitoring, [Uptime Kuma](https://github.com/louislam/uptime-kuma) is excellent.

```bash
docker run -d --restart=always -p 3001:3001 \
  -v uptime-kuma:/app/data \
  --name uptime-kuma \
  louislam/uptime-kuma:1
```

---

## Vercel Built-in Analytics

Vercel provides some monitoring out of the box:

1. **Web Analytics** - Real user monitoring
2. **Speed Insights** - Core Web Vitals
3. **Function Logs** - API endpoint monitoring

Access via: Vercel Dashboard > Project > Analytics

---

## Notification Channels

### Email (Default)

All services support email notifications. Configure your primary email as the alert recipient.

### Slack Integration

For UptimeRobot:
1. Create Slack Incoming Webhook
2. Add as alert contact in UptimeRobot
3. Select for monitors

### Discord Webhook

1. In Discord server: Server Settings > Integrations > Webhooks
2. Create webhook, copy URL
3. Add to monitoring service as webhook contact

### Telegram Bot

1. Create bot via @BotFather
2. Get chat ID from @userinfobot
3. Configure in monitoring service

---

## Incident Response

When downtime is detected:

1. **Immediate**: Check Vercel deployment status
2. **If deployment issue**: Rollback to previous deployment
3. **If DNS issue**: Verify Cloudflare/DNS settings
4. **If code issue**: Check function logs in Vercel

### Quick Checks

```bash
# Check if site is responding
curl -I https://ahmedalderai.com

# Check health endpoint
curl https://ahmedalderai.com/api/health

# Check DNS
dig ahmedalderai.com

# Check SSL certificate
openssl s_client -connect ahmedalderai.com:443 -servername ahmedalderai.com
```

---

## Recommended Configuration

For a personal portfolio, this setup provides good coverage:

| Service | Purpose | Interval |
|---------|---------|----------|
| UptimeRobot | Homepage monitoring | 5 min |
| UptimeRobot | Health API | 5 min |
| Vercel Analytics | Performance monitoring | Real-time |

**Total cost: $0/month**

---

## Status Badge (Optional)

Add uptime badge to README:

```markdown
![Uptime](https://img.shields.io/uptimerobot/ratio/m123456789-abcdef)
```

Replace `m123456789-abcdef` with your monitor ID from UptimeRobot.

---

Ahmed Adel Bakr Alderai
