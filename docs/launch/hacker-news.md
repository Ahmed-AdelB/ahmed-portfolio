# Hacker News Launch Submission

## Title (Show HN Format)

**Option 1 (Recommended):**

> Show HN: I built my developer portfolio with 3 AI coding assistants working together

**Option 2 (Technical Focus):**

> Show HN: Astro 5 + React 19 portfolio built with a tri-agent AI workflow

**Option 3 (Process Focus):**

> Show HN: How I orchestrated Claude, Codex, and Gemini to build my portfolio

## URL

https://ahmedalderai.com

## First Comment (Post Immediately After Submission)

```
Hey HN! I'm Ahmed, and I wanted to share a portfolio project that was as much an experiment in development workflow as it was in building a personal site.

**The Experiment:**
Instead of using a single AI assistant, I built an orchestration system that coordinates three AI models:
- Claude (Opus/Sonnet) for architecture decisions and complex reasoning
- Codex (GPT-5.2) for rapid implementation and prototyping
- Gemini (3 Pro) for large context analysis (1M token window) and verification

Each model has different strengths, so the workflow routes tasks to the most capable model for that task type.

**Why This Approach:**
I was curious whether the "ensemble" approach that works in ML could apply to AI-assisted development. The hypothesis: specialized models reviewing each other's work catches more bugs and produces better code than a single model.

**The Stack:**
- Astro 5.16 with islands architecture
- React 19 for interactive components
- Tailwind CSS 4
- Deployed on Vercel

**What I Learned:**
1. Cross-model verification is genuinely useful - different models catch different issues
2. The overhead of coordinating multiple models is significant - worth it for complex tasks, overkill for simple ones
3. Context management is the hardest part - each model has different context limits

**Features I'm particularly happy with:**
- Command palette (Cmd+K) for quick navigation
- Dark/light theme with persistent preference
- 100 Lighthouse scores across the board
- RSS feed for blog posts

The site is fully open source: [link to repo if public]

Would love feedback on both the site itself and the multi-agent workflow. Has anyone else experimented with using multiple AI models in their development process?
```

## Best Posting Times

**Optimal Windows (US Eastern Time):**

| Day       | Time        | Notes                                    |
| --------- | ----------- | ---------------------------------------- |
| Tuesday   | 9-11 AM EST | Good HN activity, less Monday backlog    |
| Wednesday | 9-11 AM EST | Peak HN engagement mid-week              |
| Thursday  | 9-11 AM EST | High engagement, before weekend slowdown |

**Avoid:**

- Mondays (backlogged from weekend)
- Fridays after 12 PM (weekend slowdown begins)
- Weekends (lower overall traffic)
- Major tech news days (Apple events, big launches, etc.)

**Time Zone Conversion:**

- 9 AM EST = 6 AM PST = 2 PM UTC = 3 PM CET

## Pre-Submission Checklist

### Site Readiness

- [ ] Site is live and accessible at https://ahmedalderai.com
- [ ] All pages load correctly (home, projects, blog, contact)
- [ ] No console errors on any page
- [ ] Mobile responsive design verified
- [ ] Dark/light theme toggle works
- [ ] Contact form functional
- [ ] RSS feed accessible at /rss.xml
- [ ] Sitemap accessible at /sitemap.xml

### Performance

- [ ] Lighthouse Performance score >= 95
- [ ] Lighthouse Accessibility score = 100
- [ ] Lighthouse Best Practices score = 100
- [ ] Lighthouse SEO score = 100
- [ ] Page load time < 3 seconds on 3G

### Content

- [ ] No placeholder text anywhere on site
- [ ] All project links work
- [ ] Blog posts have correct dates
- [ ] Images have alt text
- [ ] No typos in visible content

### HN Account Preparation

- [ ] Account has some karma (not brand new)
- [ ] No recent submissions (avoid appearing spammy)
- [ ] Ready to respond to comments for first 2 hours

## Post-Submission Actions

### Immediate (First 30 Minutes)

1. Post first comment immediately (copy from above)
2. Stay logged in and watch for questions
3. Respond thoughtfully to early comments (first replies matter most)

### First 2 Hours

- Check every 15 minutes for new comments
- Be genuine, technical, and helpful in responses
- Don't be defensive about criticism
- Acknowledge valid points

### Common Questions to Prepare For

**"Why not just use one model?"**

> Each model has different strengths. Claude excels at architecture, Codex at rapid prototyping, Gemini at large context analysis. Cross-verification catches bugs a single model might miss.

**"Isn't this overkill for a portfolio?"**

> Honestly, yes for just building a portfolio. But the real goal was testing the workflow itself. The portfolio was the proving ground.

**"What's the cost?"**

> The combined subscription cost is $420/month (Claude Max $200, ChatGPT Pro $200, Google AI Pro $20). Worth it for professional development work where quality matters.

**"Show me the code"**

> [Link to GitHub repo if public, or explain if private]

**"Performance numbers?"**

> Lighthouse 100 across all categories. First Contentful Paint under 1s. Total blocking time 0ms.

## HN Guidelines Reminders

- Don't ask for upvotes (against rules)
- Be authentic, not promotional
- Engage substantively with criticism
- Share technical details freely
- Credit others appropriately

## Alternative Submission Angles

If the tri-agent angle doesn't resonate, consider resubmitting later with:

1. **Performance Focus:**

   > Show HN: How I achieved 100 Lighthouse scores with Astro 5 and React 19

2. **Stack Focus:**

   > Show HN: Astro 5 islands + React 19 + Tailwind 4 portfolio template

3. **Accessibility Focus:**
   > Show HN: Building an accessible developer portfolio with perfect a11y scores

---

_Last updated: January 2026_
