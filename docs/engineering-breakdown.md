# Technical Breakdown & Performance Optimization of a Time-Critical Wedding Web App

**Role:** Solo full-stack / front-end engineer  
**Surface:** Guest-facing digital invitation — **interactive on mobile and desktop**  
**Origin:** Built as a replacement after the contracted invitation vendor hit blocking issues  
**Schedule:** Nights after a full-time day job + weekends — invitation had to be **ready at least 2 weeks before the ceremony**  
**Constraint class:** Hard calendar deadline — send/share readiness, not “polish until the wedding day”  
**Stack:** Next.js 15 · React 19 · Tailwind CSS 4 · Framer Motion · Firebase (Admin + locked client)

---

## 1. Overview & Constraints

This was not a greenfield experiment or a portfolio side project started at leisure. It started as an **operational recovery**: the invitation vendor we had relied on ran into problems late enough that waiting was no longer an option. The product had to work on the day guests opened the link — **as a fully interactive experience on both phones and desktops**, mostly under real guest conditions (mid-range Android, older iPhones on cellular, plus laptops opened from WhatsApp).

“Interactive” here meant more than a static landing page: openable cover, scroll-driven story stacks, lightbox gallery, countdown, maps/calendar actions, RSVP + guestbook, and invite-type-specific sections with motion and layout that stayed coherent across breakpoints, not a mobile mockup that merely stretches on desktop.

### Origin & schedule

| Factor          | Reality                                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Trigger**     | Vendor invitation pipeline failed / blocked; owning the stack became the only reliable path.                               |
| **Calendar**    | The invite had to be **production-ready at latest ~2 weeks before the ceremony** so links could go out to guests in time.  |
| **Capacity**    | Engineering happened **after office hours and on weekends** — not as a full-time sprint.                                   |
| **Consequence** | Every feature had to justify its night-hour cost. Backend choices (especially Firebase) had to be simple to operate alone. |

That schedule shaped architecture as much as performance did: prefer managed services, small surface area, and decisions that could be finished in a single evening without leaving half-wired infrastructure. “Ready 2 weeks before” meant the hard stop was **invite distribution**, not ceremony day itself — after that, only critical fixes were acceptable.

### Hard constraints

| Constraint                                   | Implication                                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Vendor fallback**                          | No luxury of a long discovery phase — replace the broken invite path with something we control.                                 |
| **Non-negotiable ship date**                 | Ready **≥2 weeks before the ceremony** for guest distribution. No sliding the send window.                                      |
| **Part-time build window**                   | Nights + weekends only; design for incremental nightly progress, not multi-day uninterrupted focus.                             |
| **Mobile-majority traffic, dual-surface UX** | Budgets and touch targets set for ~390px first; desktop got a deliberate second layout (e.g. Story), not a stretched phone UI.  |
| **Interactive end-to-end**                   | Cover, parallax/story, gallery lightbox, RSVP/guestbook, and chrome (menu, audio, scroll-top) had to work on touch and pointer. |
| **Perceived polish**                         | Guests expect a “premium invitation,” not a CRUD form with pretty fonts.                                                        |
| **Personalization + durable data**           | Signed invite links, RSVP, guestbook — with Firebase as the system of record, without exposing Firestore to the browser.        |
| **Solo delivery**                            | Architecture had to stay small enough for one engineer to reason about under time pressure.                                     |

### Performance targets (pragmatic, not academic)

I did not chase Lighthouse vanity scores in isolation. Targets were framed around **guest-felt latency**:

1. **First meaningful paint** of the cover / gate in under ~2–3s on a mid-tier 4G connection once assets were cached or compressed.
2. **Scroll & section transitions at ~60fps** on Safari iOS — the hardest client in the stack.
3. **No main-thread stalls** during scroll caused by image decode storms, heavy `filter: blur`, or layout thrashing.
4. **Open → content** transition that felt intentional (`startTransition` + short loader), not blocked by the full gallery.

The engineering posture was explicit: **done and smooth on phones > theoretically perfect architecture.**

---

## 2. Architecture & Tech Stack

### High-level shape

```
Browser (React client)          Next.js (App Router)           Firebase
─────────────────────          ─────────────────────          ────────
Cover / sections UI     ←→     /api/guest | rsvp | guestbook  → Admin SDK
Framer Motion layers           HMAC invite verification        Firestore (rules: deny all client)
Lazy gallery + story           Origin / App Check guards
Audio + scroll chrome          Env-driven wedding config
```

### Why this stack

- **Next.js 15 (App Router)** — Server Components for gallery filesystem reads (`getGalleryImages`), API routes as the only trusted boundary for guest data, straightforward Vercel deploy under deadline.
- **React 19** — Used `startTransition` for the “open invitation” state flip so the chrome update did not compete with audio start and section mount work.
- **Tailwind CSS 4** — Fast iteration on a dense visual system (navy / royal blue editorial look) without maintaining a separate design-token build.
- **Framer Motion** — Scroll-linked transforms (`useScroll` + `useTransform`), `whileInView` entrances, and `AnimatePresence` for cover / menu / lightbox. Chosen over CSS-only parallax because scroll-driven story stacks needed coordinated multi-layer motion.
- **Firebase Admin + locked Firestore rules** — Guest documents are never readable/writable from the public web SDK. HMAC-signed `?g=&k=` links + Next.js APIs replaced “put the API key in the client and hope.”

### Firebase: connection & data storage (day-one design, not an afterthought)

Because this replaced a vendor system, **guest identity, RSVP, and guestbook could not live only in the UI**. They needed a durable store that one person could stand up in evenings without running a custom database ops stack.

**Why Firebase / Firestore**

- Managed persistence with a clear security rules surface — important when the only ops person is also writing React at 11pm.
- Fast path to CRUD for guests + responses without provisioning Postgres, migrations, and hosting for a one-event product.
- Admin SDK from Next.js API routes keeps secrets and writes server-side; the browser never talks to guest collections directly.

**Data model (conceptual)**

| Collection / concern  | Purpose                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`guests`**          | Invitees imported from CSV (name, title, invite type). Document ID is the invite `g` param. Holds RSVP status, attending count, wish text, timestamps. |
| **`guest_responses`** | Public guestbook wall entries keyed by guest id (message + display fields). Separated so the wall can be shaped independently of private RSVP fields.  |
| **Invite tokens**     | Not stored as plaintext secrets in Firestore — HMAC over guest id (`INVITE_HMAC_SECRET`) so links stay personal without a second token table.          |

**Connection path**

```
CSV → npm run guests (Admin SDK) → Firestore guests
Guest opens /?g=&k= → Next.js /api/guest (verify HMAC) → return guest profile
RSVP / wish submit → /api/rsvp (+ guestbook write) → Admin SDK update
Client Firebase config → App Check / analytics only; Firestore rules deny all client R/W
```

Design principle under part-time capacity: **one trusted write path**, one import/export CLI, and rules that fail closed. That avoided a class of “I left a test rule open on Friday night” failures.

### Config as product surface

Wedding copy, venues, RSVP close date, and optional gift accounts live in `NEXT_PUBLIC_*` env vars, centralized in `src/config.ts`. That kept the repo reusable as a template while private data stayed out of git history — important when the same codebase had to be cleaned for public / portfolio use without rewriting guest-facing UX.

### Section composition (OCP-friendly)

Invitation sections are declared in a single registry (`invitationSections.tsx`): visibility predicates (e.g. story / dress code by invite type, gifts only when bank env is set), then rendered from `App`. Adding a section is a data change, not a rewrite of the page shell.

---

## 3. Motion Engineering & UI Performance

Motion was a **product requirement**, not decoration — and it had to feel intentional on **both** interaction models: thumb-driven mobile scroll and mouse/trackpad desktop browsing. Guests move through cover → quotes → profiles → story stack → gallery → countdown → details → RSVP. Every animation that looked “expensive” had to be cheap on the compositor, while layout and gesture affordances stayed correct on each surface.

### 3.1 Prefer compositor properties

Parallax and scroll ornaments (gallery background type, section separators, story chapter stacks) animate **`transform` and `opacity` only**, with `will-change-transform` on layers that move every frame. Layout properties (`top`, `height`, `margin`) were avoided on the scroll path.

Framer Motion’s `useScroll` / `useTransform` map scroll progress → translate ranges (e.g. horizontal type drift, ornament `y` ±20px). Those style updates stay on the GPU when they resolve to transforms.

### 3.2 Safari-specific blur budget

Large animated blurs are a known Safari main-thread / GPU cost. The aurora cover background:

- Caps animated blur lower on mobile (`blur-[6px]` vs `md:blur-[8px]`).
- Uses **lighter static glow blurs on mobile** (`blur-[40px]` / `48px`) and reserves `100px+` glows for `md:`.
- Hides an extra ambient blob on small screens entirely.
- **Pauses aurora animation** once the invitation is opened (`pauseAnimation`) so guests are not paying for an off-screen decorative loop while scrolling content.

### 3.3 Images: decode less, decode later

Several concrete anti-jank choices:

| Technique                                    | Why                                                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **WebP + Sharp pipeline in `npm run build`** | Cap long edges (portraits ~800px, others ~1200px), quality ~72 — mobile decode cost drops sharply.                                    |
| **`loading="lazy"` + `decoding="async"`**    | Gallery and portraits do not block first paint.                                                                                       |
| **Opacity fade-in, not CSS blur-up**         | Comment in code is intentional: _“no CSS filter blur — janks Safari.”_ Placeholder is a gradient pulse; real image fades via opacity. |
| **Aspect-ratio reserved boxes**              | Server reads dimensions with `image-size` so masonry cells don’t reflow when images resolve.                                          |
| **Loader photo set is tiny**                 | Flipbook uses 3 story frames only. Preloading the full gallery on iPhone stalled Safari before first paint.                           |
| **Warm only next loader frames**             | Invitation loader pre-decodes the next couple frames, not the entire set.                                                             |

### 3.4 Scroll listeners stay passive

Chrome utilities (`useShowScrollTop`, story resize handler) attach with `{ passive: true }`. Body scroll is locked only while the cover is closed — then unlocked so native scrolling stays the source of truth (better than hijacking scroll with JS for “smoothness”).

### 3.5 Motion budget discipline

- **`viewport={{ once: true }}`** on section entrances — animate in once, never re-trigger on reverse scroll.
- Stagger delays kept short (`0.05s` steps in gallery).
- Cover open uses a single composed transform (scale / rotate / y) rather than nested layout animations.
- Story is split into **mobile vs desktop implementations** after a passive resize check — different scroll-stack physics and composition (stacked cards vs. wider editorial columns), same content. That kept interactivity strong on both surfaces without forcing a one-size-fits-all motion path that compromises phones or wastes desktop space.
- Gallery masonry + lightbox, RSVP forms, and nav chrome use **touch-friendly targets** (`min-touch`) while still supporting hover states where they add clarity on desktop.

### 3.6 React concurrency for “open invitation”

Opening the invite both starts audio and mounts the full section tree. The open state update is wrapped in `startTransition` so React can treat the large UI reveal as interruptible work rather than a single blocking commit.

---

## 4. AI-Accelerated Build Pipeline

Delivery velocity mattered as much as frame rate — especially when the only available hours were **post-work evenings and weekends**. The build used an **AI-assisted loop** with a human owning architecture, taste, and production judgment, so a night session could move from blank file to reviewable diff without burning the next weekend on boilerplate.

### How AI was actually used

1. **Scaffolding & pattern lift**  
   Aurora-style backgrounds, editorial section headers, and motion primitives inspired by modern component galleries (e.g. 21st.dev-class patterns) were adapted quickly, then stripped down for mobile cost (blur budgets, pause-on-open).

2. **Boilerplate compression**  
   Guest import/export CLI, HMAC helpers, Firestore Admin wiring, and API route skeletons were generated and then hardened (origin checks, App Check headers, deny-all rules).

3. **Targeted refactoring**  
   Large components were split along product seams (Cover, Story mobile/desktop, Gallery lazy image, section registry) with AI proposing diffs and the engineer rejecting anything that increased scroll-path work.

4. **Device-specific debugging**  
   Safari jank hypotheses (“is it blur?”, “is it image decode?”, “is the loader too heavy?”) were explored with AI as a rubber duck, then validated on real iPhones — code comments document the wins that survived that process.

5. **History / privacy hygiene under deadline**  
   Near ship, AI assisted a **history rewrite**: atomic commits, removal of personal media/secrets from the public tree, env-driven gifts/parking, while preserving guest UX. Force-push was an explicit ops decision after local backup.

### What AI was _not_ allowed to own

- Security model (HMAC, Firestore lock-down, referrer policy).
- Performance acceptance on real devices.
- Product prioritization (what ships vs. what waits).
- Visual credit and brand-facing copy decisions.

The productive pattern was: **AI for draft velocity, engineer for merge criteria.**

---

## 5. Trade-offs & Engineering Pragmatism

### Prioritized (guest-facing, day-of)

- Recover from the vendor failure with a stack we fully controlled.
- Cover → scroll narrative → RSVP / guestbook path backed by Firebase — interactive on phone and desktop.
- Signed personal links + general invite behavior that fails closed on bad tokens / network errors (distinct gate states, retry).
- Mobile scroll smoothness and image weight, without treating desktop as an afterthought (dedicated Story layout, hover affordances where useful).
- Env-driven configuration so venue/account changes do not require code deploys of private data.
- Guest CSV import/export CLI — operable in short evening sessions without a custom admin UI.

### Deprioritized (consciously)

| Cut / deferred                                       | Rationale                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| Waiting on the vendor to recover                     | Calendar risk higher than building ourselves under a ≤2-weeks-before-ceremony readiness cut.    |
| Perfect Lighthouse / unused CSS purity               | Guests feel jank and broken RSVP; they do not feel unused Tailwind bytes.       |
| Full gallery preload “for smoothness”                | Opposite effect on iPhone — decode storm before paint.                          |
| Client-side Firestore for “simpler” RSVP             | Faster to code in a weeknight, unacceptable once the invite URL was shareable.  |
| Self-hosted DB / custom CMS                          | Ops overhead does not fit nights-and-weekends capacity for a one-event product. |
| Heavy glassmorphism / multi-layer shadows everywhere | Looks premium in Figma; taxes Safari during scroll.                             |
| Exhaustive invite-type edge cases                    | Covered physical / livestream / both / special; exotic combinations deferred.   |
| Perfect atomic history from day one                  | History was cleaned late as a batch once the product worked.                    |

### Explicit pragmatism statement

> If a change improved the guest’s first 30 seconds on a phone, it shipped.  
> If it only improved developer elegance without touching that path, it waited.

That rule kept scope under control when AI made it _easy_ to keep building.

---

## 6. Performance Metrics & Key Outcomes

### Measured / observed outcomes

_(Values below reflect engineering targets and device testing notes under deadline conditions — treat as operational outcomes, not a formal lab study.)_

| Area                      | Outcome                                                                                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mobile scroll**         | Story parallax + gallery masonry remained usable at ~60fps on tested iPhones after blur/decode cuts; pre-fix Safari showed visible hitching on cover aurora + gallery open.                   |
| **Desktop interactivity** | Wider Story composition, hover-enhanced gallery controls, and pointer-friendly chrome; same RSVP/guestbook flows as mobile without a separate “lite” product.                                 |
| **Image payload**         | Build-time WebP resize/compress kept portraits and gallery tiles in the tens–low hundreds of KB range instead of multi-MB originals.                                                          |
| **Loader strategy**       | Sub-second minimum flipbook (~800ms) + 3 light frames avoided “stuck on loading” perception without decoding the gallery.                                                                     |
| **Security / data**       | Client Firestore access denied by rules; guest/RSVP/guestbook only via HMAC-verified APIs; Firebase as durable store for invitees and responses.                                              |
| **Delivery**              | Full invitation UX (motion, personalization, RSVP, guestbook, guest CLI) shipped under a **≤2-weeks-before-ceremony** readiness deadline, built in nights + weekends after a vendor failure, by a solo engineer with an AI-accelerated loop. |
| **Maintainability**       | Post-ship cleanup: atomic public history, no personal media in repo, credit preserved, config externalized.                                                                                   |

### What I would measure more formally next time

- Field RUM: LCP / INP on real invite opens (CrUX or custom beacons).
- Scroll FPS traces on a fixed iPhone SE / mid Android matrix during Story + Gallery.
- RSVP success rate and p95 API latency on the ceremony weekend.

Under this deadline, **device feel + functional RSVP** were the acceptance tests.

---

## Closing

This project was a compressed case study in **senior front-end judgment under recovery conditions**: replace a failing vendor path in nights and weekends; ship a motion-rich, **interactive mobile and desktop** invitation that was **ready at least two weeks before the ceremony** for guest distribution; design Firebase connectivity and storage so guest/RSVP data stays durable and locked down; use AI to multiply throughput without surrendering architecture; and cut anything that does not help a guest open the invite and RSVP without friction.

The durable skill was not any single library — it was knowing **which milliseconds guests feel**, **which data must survive a refresh**, and refusing to spend scarce after-hours schedule on the rest.
