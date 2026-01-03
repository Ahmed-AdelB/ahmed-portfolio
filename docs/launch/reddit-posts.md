# Reddit Launch Posts

Templates for posting portfolio launch across relevant subreddits.

---

## Pre-Posting Checklist

- [ ] Account has sufficient karma for each subreddit
- [ ] Read and understand each subreddit's rules
- [ ] Portfolio is fully deployed and tested
- [ ] All links are working (GitHub, live site, blog posts)
- [ ] Prepared to respond to comments within first 2 hours

---

## r/webdev

**Subreddit Rules Compliance:**
- Showoff Saturday required for portfolio posts
- No self-promotion outside designated threads
- Must be ready to discuss technical implementation

**Karma Requirement:** ~50+ comment karma recommended

**Best Time to Post:** Saturday 9-11 AM EST (Showoff Saturday thread)

### Title
```
[Showoff Saturday] Built my developer portfolio with Astro 5, React 19, and Tailwind CSS 4
```

### Body
```
Hey r/webdev!

I finally launched my developer portfolio after months of on-and-off work, and wanted to share the technical decisions I made.

**Live Site:** [Link]
**GitHub:** [Link]

## Tech Stack

- **Astro 5** - Static-first with islands architecture for optimal performance
- **React 19** - Interactive components using the new compiler features
- **Tailwind CSS 4** - Utility-first styling with the new oxide engine
- **TypeScript** - End-to-end type safety

## Features I'm Proud Of

1. **Terminal Mode** - A full terminal interface easter egg (try Ctrl+K or the command palette). Built with cmdk and custom command parsing.

2. **100 Lighthouse Score** - Optimized for Core Web Vitals with:
   - Static generation for all routes
   - Optimized fonts (JetBrains Mono + Space Grotesk)
   - Minimal JS shipped to client

3. **Automated Testing** - Playwright E2E tests running in CI across Chrome, Firefox, Safari, and Edge

4. **Content Collections** - Blog posts in MDX with type-safe frontmatter, contributions tracked as JSON

## Challenges

- Getting React 19 to play nicely with Astro's hydration model took some debugging
- Tailwind CSS 4's new configuration format required migration from v3
- Implementing the terminal mode without bloating bundle size

Happy to discuss any technical decisions or answer questions about the stack!
```

---

## r/Python

**Subreddit Rules Compliance:**
- No pure self-promotion; must provide value
- Project showcase in comments or as discussion
- Focus on Python contribution, not portfolio

**Karma Requirement:** ~100+ recommended for posts

**Best Time to Post:** Tuesday-Thursday 10 AM - 2 PM EST

### Title
```
Contributed a fix to pip's dependency resolution - my first contribution to a major Python tool
```

### Body
```
I recently had my first PR merged into pip (the package manager we all use daily), and I wanted to share the experience for anyone thinking about contributing to Python's core tooling.

**The PR:** https://github.com/pypa/pip/pull/12446

## The Problem

I discovered an edge case where dependency resolution would fail for editable installs when using `pyproject.toml` configuration. This affected developers using the modern Python packaging standards.

## The Fix

The issue was in how pip handled editable installs differently from regular installs during the dependency resolution phase. My fix ensures consistent handling regardless of install mode.

- **+150 lines / -45 lines** of changes
- Included comprehensive test coverage
- Worked with pip maintainers through several review cycles

## What I Learned

1. **pip's codebase is surprisingly approachable** - Good documentation and helpful maintainers
2. **Tests are everything** - The pip team won't merge without thorough test coverage
3. **Patience pays off** - Review cycles for major projects take time, but the feedback is invaluable

## My Background

I'm a backend developer focused on Python and security. I've documented this contribution (and others to poetry and click) on my portfolio: [Link]

Has anyone else here contributed to pip or other PyPA tools? Would love to hear about your experiences!
```

---

## r/cscareerquestions

**Subreddit Rules Compliance:**
- Career-focused discussion only
- No pure portfolio showcase posts
- Frame as seeking advice or sharing lessons

**Karma Requirement:** ~50+ recommended

**Best Time to Post:** Monday-Wednesday 9 AM - 12 PM EST

### Title
```
After 3 years as a backend dev, I built a portfolio site. Here's what I wish I knew earlier about showcasing work.
```

### Body
```
I've been a backend developer for about 3 years now, and I finally got around to building a proper portfolio site. Not here to just show it off - I wanted to share some realizations I had about what actually matters when presenting your work.

## What I Changed My Mind About

**1. Don't just list technologies - show problem-solving**

My first draft was basically a resume with links. Boring. What actually makes hiring managers stop scrolling is seeing HOW you approached problems, not just what tools you used.

**2. Open source contributions are underrated**

I had contributions to pip, poetry, and click sitting in my GitHub with no visibility. Now I highlight these because they show:
- I can navigate unfamiliar codebases
- I can work with remote teams asynchronously
- I can get code through rigorous review processes

**3. The blog isn't for the reader - it's proof you can communicate**

I wrote a few technical posts (on supply chain security, LLM security). Even if no one reads them, they demonstrate I can explain complex topics clearly.

## What Actually Matters

Based on conversations with hiring managers and looking at what gets attention:

- **Deployed projects** > GitHub repos alone
- **Contributions to known projects** > personal projects
- **Technical writing** > just code
- **Solving real problems** > tutorial clones

## The Site

If curious: [Link]

Built with Astro + React. Happy to share the GitHub if anyone wants to fork it as a template.

**Question for the sub:** What have you found actually moves the needle when showcasing your work? Are portfolios even worth it in 2025?
```

---

## r/sideproject

**Subreddit Rules Compliance:**
- Building in public encouraged
- Share journey, not just end result
- Engage with community feedback

**Karma Requirement:** ~25+ (more lenient community)

**Best Time to Post:** Weekend mornings or Tuesday evenings EST

### Title
```
Launched my developer portfolio after months of scope creep - here's the journey
```

### Body
```
Finally shipped! My developer portfolio is live after what was supposed to be a "quick weekend project."

**Live:** [Link]
**Code:** [Link]

## The Journey

**Month 1 (The Plan)**
- "I'll just use a template and customize it"
- Picked Astro because I wanted to try something new

**Month 2 (The Scope Creep)**
- "What if I add a terminal mode easter egg?"
- "This blog section needs MDX support"
- "Let me integrate my GitHub contributions automatically"

**Month 3 (The Polish)**
- Cross-browser testing revealed so many edge cases
- Accessibility audit with Playwright + axe-core
- Performance optimization rabbit hole

## What's In It

- **Portfolio** - Projects and open source contributions
- **Blog** - Technical writing on security topics
- **Terminal Mode** - Hidden command-line interface (Ctrl+K)
- **Resume** - Printable, web-native resume page

## Tech Stack

- Astro 5 + React 19
- Tailwind CSS 4
- TypeScript everywhere
- Playwright for E2E testing
- GitHub Actions CI/CD

## Lessons Learned

1. **Set a launch date and stick to it** - Scope creep is real
2. **"Good enough" is better than "perfect but not shipped"**
3. **The last 10% takes 90% of the time** (cross-browser testing alone...)

## What's Next

- Add more blog content
- Integrate more contribution data
- Maybe add a dark/light toggle animation

Would love feedback from the community! What would you add to a developer portfolio?
```

---

## Posting Schedule

| Subreddit | Day | Time (EST) | Notes |
|-----------|-----|------------|-------|
| r/sideproject | Saturday | 10 AM | Most lenient, good for initial feedback |
| r/webdev | Saturday | 11 AM | Showoff Saturday thread |
| r/cscareerquestions | Monday | 10 AM | Career-focused framing |
| r/Python | Tuesday | 11 AM | Focus on pip contribution |

## Response Strategy

1. **First 2 hours are critical** - Respond to every comment quickly
2. **Be humble** - Accept criticism gracefully
3. **Add value** - If someone asks a technical question, give a thorough answer
4. **Avoid defensiveness** - Reddit can be harsh; take it constructively

## Karma Building (If Needed)

If account karma is low:
1. Comment helpfully on posts for 1-2 weeks before posting
2. Answer questions in each subreddit you plan to post in
3. Avoid commenting just to build karma - add genuine value

---

## Notes

- Adjust links before posting (replace [Link] with actual URLs)
- Monitor each post for at least 4 hours after posting
- Cross-post sparingly to avoid spam perception
- Wait 2-3 days between major subreddit posts
