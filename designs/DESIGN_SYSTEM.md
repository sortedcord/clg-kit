# CLG Kit Design System

**Status:** Authoritative design direction for the polish pass  
**Version:** 1.0  
**Reference inputs:** `designs/37400450.png`, `designs/37400451.png`  
**Companion tokens:** `designs/design-tokens.json`

This document translates the reference artwork into a coherent product system for CLG Kit. It is not a screen-copying brief. The references contain a fictional brand, fictional data, a side drawer, chat, and marketing-only compositions; those are not requirements. What matters is the underlying visual grammar and how it improves CLG Kit’s real timetable and attendance workflows.

When this document conflicts with one-off styles in the current app, this document wins.

---

## 1. Executive direction

CLG Kit should feel like a **bright, editorial student utility**: calm enough for everyday planning, energetic enough to feel contemporary, and direct enough to make schedule and attendance decisions at a glance.

The visual identity has five anchors:

1. **Deep navy typography** instead of black or purple-gray.
2. **Cobalt blue** for brand structure, primary actions, selected navigation, and key analytics.
3. **Coral orange** for temporal focus: the selected date, “now,” deadlines, and high-attention moments that are not destructive.
4. **Pale sky and subject pastels** for grouping dense information without heavy borders or shadows.
5. **Large geometric type, rounded blocks, and disciplined whitespace** to make schedules feel editorial rather than spreadsheet-like.

The app must not look like a generic lavender productivity template. The current purple palette, small uppercase-heavy hierarchy, and repeated floating white cards should be replaced by this clearer cobalt/coral/sky system.

### One-sentence design thesis

> CLG Kit turns dense college logistics into a bright, chronological, glanceable daily plan.

---

## 2. What the reference designs are actually doing

### 2.1 Composition and hierarchy

The references use large headings, oversized feature areas, and deliberately uneven card proportions. Small data cards sit next to one dominant analytical card. The result is lively without becoming chaotic because every region has a clear visual owner.

**Translation for CLG Kit:**

- Every screen gets one dominant headline or feature region, not a wall of equal-weight cards.
- Primary information is shown at large scale: date, next class, attendance percentage, or subject name.
- Secondary information is quieter and grouped using pale surfaces.
- Tertiary metadata uses smaller type and icons, but never becomes illegible.
- Prefer one strong module plus supporting content over four identical dashboard tiles.

### 2.2 Color behavior

The references use color by role, not as decoration:

- Cobalt holds primary analytical or brand content.
- Coral marks the selected date, progress, or urgent/high-energy regions.
- Pale sky creates context zones such as calendars and navigation.
- Periwinkle, aqua, and lilac distinguish schedule blocks.
- White creates breathing room.
- Navy unifies all text.

The gray-blue visible behind the rotated phones (`#E6EBF4`) is presentation artwork, not the main in-app background.

### 2.3 Typography

The typography is a modern geometric grotesk with compact bold headings, clean lowercase forms, and strong numerals. Headings are large and confident; body text is simple and unstyled. The design rarely needs ornamental typography because scale and weight create the character.

### 2.4 Shape and depth

- Corners are soft and generous, usually in the 16–28 range.
- Depth comes primarily from color adjacency and overlap, not shadow.
- Full-color cards and pale blocks are mostly borderless.
- Shadows appear only where an element truly floats, such as a menu or sheet.

### 2.5 Schedule-specific patterns

The schedule is treated as a chronological canvas:

- Time remains on a stable rail.
- Classes appear as large tinted blocks.
- Class type, room, title, and time have obvious visual order.
- A coral line and marker communicate the current time.
- Pastel colors identify subjects; they do not communicate attendance state.

### 2.6 What must not be copied

Do not reproduce:

- The “studly.” identity or wordmark.
- The reference names, course names, percentages, avatars, or copy.
- The side drawer simply because it appears in the artwork.
- Chat or tasks unless they become real CLG Kit product features.
- Rotated devices, clipped mockups, or the presentation backdrop inside the app.
- Charts that are not backed by real data.
- Decorative diagonal hatching without a defined meaning.

---

## 3. Product personality

### Desired qualities

- Bright
- Capable
- Direct
- Youthful, not childish
- Organized, not clinical
- Confident, not loud
- Friendly, not cute

### Avoid

- Generic purple SaaS styling
- Glassmorphism
- Gradients as decoration
- Thick shadows on every card
- Excessive uppercase labels
- Neon status colors
- Tiny dashboard text
- Cartoon mascots
- Fake analytics
- Dead controls that only open placeholder alerts

---

## 4. Non-negotiable design rules

1. Use the semantic tokens in `designs/design-tokens.json`; do not add screen-local hex colors without extending the token set.
2. Use **Manrope** throughout the product.
3. Use navy (`#061430`) for primary text; do not use pure black.
4. Use cobalt for primary interaction. Coral is not the default CTA color.
5. Use coral for temporal focus and emphasis, not for destructive actions.
6. Use the dedicated danger red for errors, deletion, and absence warnings.
7. Default cards are flat. Add shadows only to floating menus, popovers, and modal sheets.
8. Use one dominant accent per component.
9. Subject color identifies a subject and must remain stable across screens.
10. Attendance state must use a label or icon in addition to color.
11. Minimum interactive target is 44 × 44.
12. Body text must not be smaller than 13; 11 is reserved for short captions.
13. Use sentence case for user-facing labels and headings.
14. Do not display an insight such as “On track” or “Looking good” unless it is calculated from real data.
15. Do not expose a feature as a polished primary affordance until the flow is implemented.

---

## 5. Color system

### 5.1 Brand anchors

These anchors are sampled or closely adapted from the reference images.

| Token | Hex | Role |
|---|---:|---|
| Ink | `#061430` | Primary text, icons, dark identity |
| Cobalt | `#0559FA` | Primary actions, active navigation, core analytics |
| Cobalt pressed | `#0047D5` | Pressed/active cobalt state |
| Cobalt soft | `#E7F0FF` | Tonal button, selected supporting surface |
| Coral | `#FF7A4F` | Selected date, current-time marker, deadlines, energetic emphasis |
| Coral soft | `#FFE9E1` | Coral chip or contextual highlight |
| Sky | `#D5F2FF` | Calendar context, overview panel, navigation grouping |
| Sky soft | `#F0FAFF` | Subtle schedule surface, information panel |

### 5.2 Neutral colors

| Token | Hex | Role |
|---|---:|---|
| Canvas | `#F7F9FC` | Default screen background |
| Surface | `#FFFFFF` | Primary cards, sheets, input surfaces |
| Surface subtle | `#F0F4F8` | Quiet control tracks and grouped list regions |
| Text primary | `#061430` | Headings and primary values |
| Text secondary | `#4E6078` | Body copy and secondary values |
| Text muted | `#68788F` | Metadata and captions; minimum AA on white |
| Text disabled | `#9AA8B8` | Disabled-only text; never for necessary information |
| Border | `#DDE5EE` | Inputs and white cards on canvas |
| Divider | `#E9EEF4` | Internal list separation |
| Scrim | `rgba(6,20,48,0.46)` | Modal backdrop |

### 5.3 Semantic colors

Coral and danger are deliberately different. Coral means **focus/now/priority**. Danger means **error/destructive/attendance risk**.

| State | Solid | Text | Soft surface |
|---|---:|---:|---:|
| Success | `#168A63` | `#117A57` | `#DDF5EC` |
| Warning | `#F0B44D` | `#8A5900` | `#FFF4CE` |
| Danger | `#CF4038` | `#A82E2A` | `#FFE9E7` |
| Neutral | `#68788F` | `#4E6078` | `#EDF1F5` |

### 5.4 Subject palette

A subject owns one stable pair: a pale surface and a darker accent. The surface fills schedule blocks; the accent is used for a small bar, icon, initials, or progress segment.

| Name | Surface | Accent |
|---|---:|---:|
| Ocean | `#BFD5FF` | `#0559FA` |
| Aqua | `#DDF7FA` | `#167F96` |
| Lilac | `#FDF0FF` | `#9B4BA4` |
| Sun | `#FFF3C4` | `#8A6400` |
| Mint | `#DDF5EC` | `#117A57` |
| Peach | `#FFE5D9` | `#B95230` |

Assignment must be deterministic and persisted. A blue Mathematics class must remain blue on Today, Timetable, Attendance, and Subject Details. Never change its subject color because the user was absent; add a danger status indicator instead.

### 5.5 Color usage ratio

A typical screen should be approximately:

- 60–70% canvas and white
- 15–25% pale sky or subject pastels
- 8–12% cobalt
- 3–6% coral
- Semantic colors only when the state requires them

This preserves the reference’s brightness without turning every region into a competing color block.

### 5.6 Contrast rules

- White on cobalt has sufficient contrast and is the standard primary-button pairing.
- Navy on coral is preferred. White on coral is insufficient for normal-sized text.
- Navy is used on sky and all subject pastels.
- Do not place cobalt text on cobalt or subject accent text on a similarly saturated fill.
- Muted text must use at least `#68788F` on white for normal-sized copy.
- Charts and status indicators must include text, a pattern, or an icon; color alone is insufficient.

---

## 6. Typography

### 6.1 Font decision: Manrope

**Manrope** is the sole product font family.

Why it fits:

- It captures the reference’s geometric, modern, student-friendly tone.
- Its bold weights create expressive editorial headings.
- Its numerals are clear for dates, times, attendance percentages, and room numbers.
- It remains readable at mobile body sizes.
- It is open and practical to ship across iOS, Android, and web.

Use real font files for weights 400, 500, 600, 700, and 800. Do not rely on synthetic bolding. Platform fallback is `system-ui` only while fonts are loading or in exceptional environments.

### 6.2 Type scale

| Style | Size / line | Weight | Letter spacing | Typical use |
|---|---:|---:|---:|---|
| Display | 40 / 44 | 800 | -1.2 | Rare feature statement or onboarding hero |
| Heading 1 | 32 / 38 | 800 | -0.8 | Main screen title or greeting |
| Heading 2 | 24 / 30 | 700 | -0.4 | Major section or attendance value context |
| Heading 3 | 20 / 26 | 700 | -0.2 | Section heading, event title |
| Title | 17 / 23 | 700 | 0 | Card title, app-bar title |
| Body | 15 / 22 | 400 | 0 | Main copy, form values |
| Body small | 13 / 19 | 400 | 0 | Supporting copy and metadata |
| Label | 12 / 16 | 600 | 0.1 | Button, chip, compact control |
| Caption | 11 / 15 | 500 | 0.1 | Short secondary metadata only |

### 6.3 Typography rules

- Main screen titles use Heading 1 and should not be preceded by a redundant uppercase kicker on every screen.
- Use one line of Heading 1 whenever possible; allow two lines when the content is the hero.
- Use Heading 3 for class names in spacious event blocks; Title in compact lists.
- Use tabular numerals for time columns, percentages, dates, and counters.
- Keep body lines to roughly 40–65 characters on tablet/web.
- Do not put long paragraphs in centered text.
- Use 800 for major values, 700 for headings, 600 for controls, and 400/500 for reading text.
- Avoid 8–10 point labels from the artwork. The marketing render is larger than a real device and those sizes do not meet production readability needs.
- Uppercase is allowed only for very short metadata labels when it improves scanning. It is not the default voice.

---

## 7. Layout and spacing

### 7.1 Base grid

Use a 4-point base grid, with 8-point rhythm for most layout.

Approved spacing values:

`2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

Avoid arbitrary values unless needed for optical alignment.

### 7.2 Screen frame

- Standard phone gutter: 20.
- Large phone/tablet gutter: 24.
- Maximum readable content width: 560.
- Center the main column on tablet and web.
- Respect safe areas; visual backgrounds may bleed, content may not.
- Standard section gap: 32.
- Heading-to-content gap: 12–16.
- Card-to-card gap: 12.
- Bottom scroll padding must clear the tab bar or home indicator by at least 24.

### 7.3 Density

The reference is spacious but data-rich. Preserve both qualities:

- Use large containers for primary schedule events.
- Use compact rows for history and settings.
- Do not turn every piece of metadata into a separate chip.
- Keep no more than three hierarchy levels inside one card.
- Give the most urgent or time-sensitive information the most area, not merely the brightest color.

### 7.4 Responsive behavior

- **Narrow phones below 360:** preserve 20-point gutters where possible; allow metric groups to wrap; keep touch targets unchanged.
- **Standard phones:** one main column. Two-column layouts are allowed only for compact metrics.
- **Large phones/foldables:** increase gutters, not type indiscriminately.
- **Tablet/web:** center a maximum 560-point daily-flow column. A secondary detail pane may be added only when it provides real utility.
- Never stretch schedule cards edge-to-edge across a desktop viewport.

---

## 8. Shape, borders, and elevation

### 8.1 Corner radii

| Token | Radius | Use |
|---|---:|---|
| Small | 8 | Badges, tiny chips |
| Control | 12 | Inputs, icon buttons, compact controls |
| Card | 16 | Standard cards and list groups |
| Feature | 20 | Hero cards, large schedule events |
| Sheet | 28 | Bottom sheets and large modal surfaces |
| Pill | 999 | Status pills only |

Avoid mixing three different radii within one compact component.

### 8.2 Borders

- Inputs and white cards on canvas: 1-point `border`.
- Internal list separation: 1-point `divider`.
- Keyboard/focus state: 2-point cobalt.
- Subject accent bar: 4 points.
- Tinted cards generally need no border.
- Dashed borders are reserved for explicit “add new” drop zones or placeholders, not normal buttons.

### 8.3 Shadows

The default shadow is none.

Use the floating shadow only for:

- Menus and popovers
- Date pickers that float above content
- Modal sheets when separation from the scrim needs reinforcement
- Dragged items

Standard content cards must use surface contrast or a hairline border, not elevation. This is a major change from the current app’s repeated card shadows.

---

## 9. Iconography

Continue with Ionicons for consistency and implementation efficiency.

- Default icon size: 20.
- Compact icon: 16.
- Prominent icon: 24.
- Standard icon button: 44 × 44.
- Standard icon container: 40 × 40 with 12 radius.
- Use outline icons for inactive/navigation/supporting actions.
- Filled icons are acceptable for selected bottom-tab items and strong state confirmation.
- Keep icons navy, cobalt, or semantic. Avoid arbitrary multicolor iconography.
- Every icon-only control needs an accessibility label.
- Do not mix Ionicons with unrelated icon families on the same screen.

---

## 10. Navigation and app shell

### 10.1 Navigation model

The reference side drawer is not appropriate for CLG Kit’s three high-frequency destinations. Retain bottom navigation for:

1. Today
2. Timetable
3. Attendance

Account and Settings remain secondary destinations behind the profile/avatar entry point.

### 10.2 Bottom tab bar

- White surface with a subtle top divider.
- Height: 68 plus safe area.
- Active icon/label: cobalt.
- Inactive icon/label: muted navy.
- Icon: 22; label: 11/15 medium or semibold.
- No heavy shadow.
- Keep labels visible; icons alone reduce clarity.
- Avoid a floating oversized center action because all three destinations have equal structural importance.

### 10.3 Top app bar

- Minimum height: 56 excluding safe area.
- Back/action targets: 44 × 44.
- Screen title: Heading 1 for root tabs, Title for pushed detail screens.
- Root screen headers may pair a small date/context line with a Heading 1 greeting or title.
- Use at most two right-side actions. Overflow belongs in a menu.
- Avatar is 40–44 with 14–16 radius or circular if a real photo is used.

---

## 11. Core component specifications

### 11.1 Buttons

#### Primary

- Cobalt fill, white label.
- Height: 52.
- Radius: 14.
- Horizontal padding: 18.
- Label: 14–15 semibold/bold.
- Optional leading or trailing 18-point icon.
- Pressed: cobalt pressed plus 0.98 scale.
- Disabled: soft neutral fill with disabled text; no opacity-only state.

#### Secondary tonal

- Cobalt soft or sky fill.
- Navy or cobalt label depending on contrast.
- Same geometry as primary.
- Use for non-primary actions such as date selection or edit.

#### Ghost

- Transparent background.
- Cobalt or navy label.
- Use for back, cancel, and tertiary actions.

#### Destructive

- Danger solid only for final destructive confirmation.
- Danger soft for the initial delete/remove action.
- Never use coral for delete.

#### Icon button

- 44 × 44 touch target.
- Visible background may be 40 × 40.
- 12 radius.
- Soft sky/cobalt surface for prominent actions; transparent for low-priority toolbar actions.

### 11.2 Cards

#### Standard card

- White surface.
- Radius: 16.
- Padding: 16.
- Border: 1 point when placed on canvas.
- No shadow.

#### Tinted card

- Sky, cobalt soft, coral soft, or subject surface.
- Radius: 16–20.
- Padding: 16–20.
- No border and no shadow.
- Navy text unless the card is cobalt.

#### Feature card

- Cobalt or sky.
- Radius: 20.
- Padding: 20.
- One prominent value or action.
- Do not fill it with multiple unrelated metrics.

### 11.3 Week/date selector

This is a signature CLG Kit component.

- Place the week in a sky context panel or a clearly bounded sky strip.
- Each day target is at least 44 wide and 56–64 tall.
- Weekday caption: 11–12 medium.
- Date number: 18–20 bold.
- Selected day: coral fill with navy text.
- Today when not selected: cobalt outline or cobalt dot.
- Selected and today may show both coral fill and a small cobalt dot.
- Disabled/out-of-range dates use muted text but remain legible.
- “Selected date,” “today,” and “has attendance issue” must be visually distinct states.
- Do not color every day by attendance result; that overloads the date selector. Put attendance detail in the agenda or a small status marker with a legend.

### 11.4 Schedule timeline

- Fixed time rail: 48–56 wide.
- Time: 12–13 semibold with tabular numerals.
- Event block: subject pastel surface, 16–20 radius, minimum height 88.
- Event padding: 16.
- Class type or subject code: 11–12 medium.
- Class name: 18–20 bold.
- Time range and room: 12–13 secondary.
- Room uses a 16-point location icon only when space allows.
- Event blocks do not need a shadow.
- Use the subject accent as a 4-point edge, small icon, or metadata accent if stronger identification is needed.
- A current-time indicator uses coral: a 2-point line plus a small triangle/dot and an explicit time label.
- Overlapping events must render side by side or show a conflict indicator; never silently overlap text.

#### Class state overlays

Subject color remains the base identity. State is layered on top:

- **Upcoming / not marked:** normal subject card plus “Not marked” action.
- **In progress:** coral “Now” badge and current-time line.
- **Attended:** success icon + `Attended`; optionally reduce saturation after the day has passed.
- **Absent:** danger icon + `Absent`; do not turn the whole subject card red.
- **Cancelled:** neutral label, reduced contrast, and optional meaningful diagonal pattern. If diagonal hatching is used anywhere, it must mean cancelled/tentative consistently.

### 11.5 Attendance summary

- Use one dominant attendance hero, not several equal cards.
- Percentage: 32–40 extrabold with tabular numerals.
- Ring: 96–120 with an 8–10 stroke.
- Always show a textual interpretation and the underlying attended/held count.
- Ring color may follow risk state:
  - On/above threshold: cobalt ring plus success status chip.
  - Near threshold: warning ring/status.
  - Below threshold: danger ring/status.
- Do not use green as the entire hero background; green is a status, not the brand.
- “On track” must be derived from the actual configured threshold and current totals.
- With zero classes, show `No attendance yet`, not `0%` with a negative status.

### 11.6 Subject list item

- Height is content-driven; target 72–88.
- Use a subject-color initials block or 4-point accent.
- Show name, code, attended/held count, and percentage.
- Progress track: 6–8 high.
- Percentage is text, not color-only.
- At-risk subjects may add a danger label; their stable subject color remains visible.
- Use dividers in a grouped white list or individual tinted rows. Do not put a shadow on every item.

### 11.7 Progress bars and charts

- Track: neutral subtle or low-opacity white.
- Bar height: 6–8 for rows; 10–12 for feature analytics.
- Minimum visible segment: 3 points, but preserve true numeric labels.
- No gradients, 3D, unexplained animation, or unlabeled axes.
- Cobalt is the default data series.
- Coral represents a highlighted day, missed target, or current focus only when the legend explains it.
- Subject comparisons may use subject accent colors if labels are present.

### 11.8 Inputs

- Height: 52.
- Radius: 12.
- White fill.
- 1-point border.
- Horizontal padding: 14–16.
- Input text: Body.
- Label: 12 semibold in sentence case, 8 points above input.
- Placeholder: muted, but optional instructions must not exist only as placeholder text.
- Focus: 2-point cobalt.
- Error: danger border, error icon where useful, and explanatory text below.
- Disabled/read-only states must look distinct.
- Use the correct keyboard and locale-aware time/date pickers instead of requiring raw `HH:mm` text when practical.

### 11.9 Chips and status pills

- Minimum height: 32; selection chips should be 36–40.
- Radius: 8–999 depending on compactness.
- Horizontal padding: 10–12.
- Label: 12 semibold.
- Selection chip: cobalt fill/white text.
- Status chip: semantic soft fill + semantic text + optional icon.
- Avoid more than five visible chips in one row; use wrapping or a picker.

### 11.10 Bottom sheets

- Top radii: 28.
- Surface: white or canvas, not translucent glass.
- Scrim: navy at 46%.
- Handle: 36 × 4.
- Padding: 20, plus safe-area bottom.
- Title: 20/26 bold.
- Primary action: full-width at bottom.
- Keyboard must not cover active fields or the CTA.
- Swipe-to-dismiss must not discard entered data without warning when meaningful work is present.

### 11.11 Empty, loading, and error states

#### Empty

- Compact, contextual, and actionable.
- Use one 40–48 icon container, a 17-point title, and one short body sentence.
- Show one relevant action at most.
- Example: `No classes today` / `Enjoy the break, or add a one-off class.`

#### Loading

- Preserve layout with skeletons where possible.
- Use a spinner only for a focused blocking action.
- Do not flash an empty state while data is loading.

#### Error

- Explain what failed and what the user can do.
- Keep entered form data after save failures.
- Offer retry for recoverable fetch failures.
- Use an inline banner or toast before resorting to a blocking alert.

### 11.12 Toasts and undo

Attendance marking is frequent and easy to tap incorrectly. After marking attended/absent/cancelled:

- Update optimistically.
- Show a short confirmation toast.
- Provide `Undo` for several seconds.
- If persistence fails, restore the prior state and explain the failure.

---

## 12. Screen-level UX blueprints

These are hierarchy guides, not pixel-for-pixel wireframes.

### 12.1 Today

**Primary question:** What do I need to do next?

Recommended order:

1. Current date/context and personalized Heading 1.
2. Signature week selector.
3. Conditional attendance insight only when real and useful.
4. Agenda heading with class count and one clear Add action.
5. Chronological timeline.
6. Empty or end-of-day message.

Guidelines:

- The next/in-progress class gets the strongest emphasis.
- Past classes remain visible but visually quieter.
- Attendance actions stay on the relevant class, not in a detached global control.
- Do not permanently show a generic “attendance is looking good” banner.
- Preserve the selected date when returning from subject details.
- `Today` is a shortcut, not a competing primary button when the selected date is already today.

### 12.2 Timetable

**Primary question:** What is my recurring schedule?

Recommended order:

1. Heading 1 and edit action.
2. Week/day navigation.
3. Selected day and recurring schedule.
4. Add recurring class.
5. Import/scan as a secondary tool.
6. Brief explanation of effective-date behavior where relevant.

Guidelines:

- Do not place a non-functional scan card above the actual timetable.
- Clearly separate recurring timetable edits from one-off day changes.
- Show start and end times, not start time alone.
- Make conflicts and recess gaps explicit.
- If timetable import is unavailable, hide it or label it as coming soon; do not simulate it with a placeholder alert.

### 12.3 Attendance

**Primary question:** Am I safe, and which subject needs attention?

Recommended order:

1. Heading 1.
2. Overall attendance hero.
3. Held / attended / missed totals.
4. Subject breakdown, with at-risk subjects first or clearly marked.
5. Attendance history entry point when implemented.

Guidelines:

- Show `attended / held` next to percentages.
- Cancelled classes are excluded and this rule should be available through concise help.
- Zero data is not a failing 0% state.
- Avoid celebratory language if the percentage is merely above threshold by a fragile margin.
- Do not expose “View attendance history” as a finished control if it only opens an informational alert.

### 12.4 Subject details

**Primary question:** What is happening in this subject?

Recommended order:

1. Compact app bar.
2. Subject-tinted hero with name, code, short name, and percentage.
3. Attendance decision summary and totals.
4. Recent classes/history.
5. Edit action through a sheet or focused edit state.

Guidelines:

- Use the subject’s stable pastel surface, not an alpha-generated color that may be muddy or inaccessible.
- Attendance status uses semantic indicators layered over subject identity.
- Long subject names may wrap to two lines.
- Show dates in a human, locale-aware format rather than raw API strings.

### 12.5 Add class

**Primary question:** Can I add the correct class quickly and confidently?

Recommended order:

1. Title and one-line explanation of recurring vs one-off.
2. Subject picker.
3. Date/day context.
4. Start and end time.
5. Room.
6. Full-width confirmation.

Guidelines:

- Prefer subject rows or accessible chips with both short name and enough identifying information.
- Auto-calculate end time from default duration but keep it editable.
- Use a time picker where possible.
- Warn about overlap before saving.
- Preserve values after validation errors.

### 12.6 Onboarding

**Primary question:** What minimum information gets me to a useful schedule?

- Keep the two-step structure.
- Use the Display or Heading 1 style once per step.
- Explain why each requested field matters.
- Required and optional fields must be explicit.
- Let users add subjects in a compact repeatable list.
- Keep Skip visible when subjects are optional.
- Progress indicators should indicate `1 of 2` in accessible text, not bars alone.
- Do not front-load features or fake examples beyond helpful placeholders.

### 12.7 Account and settings

- Use compact grouped lists instead of a collection of elevated cards.
- Show actual saved profile values; use clear empty labels such as `Not added`.
- Editing profile should be a real flow before the button is emphasized.
- Settings changes should save predictably: either auto-save with feedback or use one explicit Save pattern, not both without explanation.
- Use native switches for binary settings and time/duration pickers for values.

---

## 13. Interaction states

Every interactive component needs:

- Default
- Pressed
- Focused, including keyboard/web focus
- Disabled
- Loading where applicable
- Error where applicable

### Pressed behavior

- Buttons/cards: scale to 0.98 over 100–160 ms.
- Use color change in addition to scale.
- Do not animate layout for a simple press.

### Selection behavior

- Selected navigation: cobalt.
- Selected date: coral.
- Selected form choice: cobalt.
- Checked/completed state: success.

Selection colors differ by context on purpose. Do not flatten every selection into one visual treatment.

### Destructive behavior

- Require confirmation for deleting a subject or recurring timetable item.
- Removing a one-off class may use Undo instead of a confirmation dialog.
- State the consequence in concrete language.

---

## 14. Motion and haptics

Motion should make state changes understandable, not decorate the interface.

### Durations

- Micro feedback: 100 ms.
- Press and simple transitions: 160 ms.
- Standard content transition: 220 ms.
- Sheet/large emphasized transition: 320 ms.

### Recommended motion

- Bottom sheet slides with a fading scrim.
- Attendance ring animates only when first loaded or materially changed.
- Agenda updates cross-fade or use a short layout transition.
- Current-time line moves only on minute updates without attention-grabbing animation.
- Respect reduced-motion settings; replace transforms with fades or immediate changes.

### Haptics

Use sparingly:

- Light selection haptic for date selection.
- Success haptic after attendance is saved.
- Warning haptic before a destructive confirmation.
- No haptic on every scroll, tab render, or decorative animation.

---

## 15. Content design

### 15.1 Terminology

Use these terms consistently:

- **Subject:** an academic unit such as Data Structures.
- **Class:** one scheduled occurrence of a subject.
- **Timetable:** the recurring weekly schedule.
- **Attendance:** the attended/absent record for held classes.
- **Programme:** the student’s overall degree/programme.
- **Session:** internal/API language only; avoid in product copy.

Attendance labels:

- Not marked
- Attended
- Absent
- Cancelled

### 15.2 Voice

- Direct and calm.
- Short sentences.
- Action before explanation.
- Specific rather than promotional.
- Encouraging only when supported by data.

Good:

- `No classes today`
- `You need to attend the next 2 classes to reach 75%.`
- `This change starts tomorrow. Past attendance will not change.`
- `Couldn’t save attendance. Try again.`

Avoid:

- `Awesome! You’re crushing it!`
- `Your attendance is looking good` when no calculation supports it.
- `An unexpected error occurred.`
- Long policy text embedded in a yellow card on every visit.

### 15.3 Formatting

- Use sentence case.
- Format dates and times according to locale.
- Use an en dash for ranges: `9:00–10:00`.
- Use centered dots for compact metadata: `CS201 · Room B204`.
- Do not manually uppercase user content such as subject names.
- Truncate codes and rooms before class names; the class name is the meaningful content.

---

## 16. Accessibility

The reference aesthetic must be adapted, not reproduced at the expense of usability.

- Normal text contrast: at least 4.5:1.
- Large text contrast: at least 3:1.
- Interactive target: at least 44 × 44.
- Support font scaling without clipping essential content.
- Do not disable font scaling for timetable metadata.
- At 200% text size, cards may grow vertically; do not fix heights around text.
- Every status uses text or an icon as well as color.
- Charts expose a textual summary to screen readers.
- Icon-only controls have accessible names and state.
- Weekday buttons announce full day, date, selected state, and today state.
- Attendance controls announce the subject/class and resulting state.
- Focus order follows visual order.
- Scrims trap focus within modal content on web.
- Respect reduced motion and increased contrast where available.
- Avoid horizontal-only swipe interactions without visible buttons.

---

## 17. Localization and data resilience

- Expect long subject names, room names, college names, and translated labels.
- Avoid fixed-width text containers except the time rail.
- Use locale-aware date/time formatters.
- Support both 12-hour and 24-hour time.
- Do not derive initials from Latin-only assumptions without a fallback.
- Never use a percentage without guarding against zero held classes.
- Loading, empty, offline, partial-data, and API-error states must be distinct.
- Cache or preserve the last useful schedule where product logic allows; do not replace useful content with a blank screen during a transient error.

---

## 18. Implementation guidance for the polish pass

The next implementation pass should establish shared primitives before restyling individual screens.

Recommended primitive inventory:

- `Screen`
- `AppText`
- `AppHeader`
- `Button`
- `IconButton`
- `Card`
- `Badge` / `StatusPill`
- `WeekStrip`
- `ScheduleEventCard`
- `CurrentTimeIndicator`
- `AttendanceRing`
- `ProgressBar`
- `SubjectBadge`
- `FormField`
- `EmptyState`
- `InlineBanner`
- `BottomSheet`
- `Toast`

Engineering rules:

1. Centralize tokens; screen files must not carry their own color systems.
2. Load Manrope once at the root and map named text variants.
3. Replace ad-hoc `fontWeight`/`fontSize` pairs with typography variants.
4. Replace arbitrary alpha-string subject colors with explicit accessible subject surface/accent pairs.
5. Keep semantic state colors independent of subject colors.
6. Avoid fixed-height containers around user text.
7. Use one shared shadow only for truly floating elements.
8. Use shared pressed, disabled, focus, and loading states.
9. Add visual regression screenshots for Today, Timetable, Attendance, Subject Details, onboarding, empty states, and a populated schedule.
10. Do not implement partial dark mode. The first polish pass is a coherent light theme. Add dark mode only as a separately specified token layer.

---

## 19. Design QA checklist

### Foundations

- [ ] Manrope is loaded and no screen uses an unrelated font.
- [ ] There are no legacy purple primary colors.
- [ ] Primary text is navy, not black or purple-gray.
- [ ] Cobalt is the primary action color.
- [ ] Coral is used for time/focus, not delete/error.
- [ ] Subject colors are stable across screens.
- [ ] No necessary normal text uses a low-contrast muted color.

### Layout

- [ ] Phone gutters are consistent.
- [ ] Section rhythm uses the approved spacing scale.
- [ ] Text can grow without clipping.
- [ ] Tablet/web content is width-constrained.
- [ ] Bottom content clears navigation and safe areas.

### Components

- [ ] Touch targets are at least 44 × 44.
- [ ] Default cards are flat.
- [ ] Only floating surfaces use shadow.
- [ ] Inputs have focus/error/disabled states.
- [ ] Buttons have pressed/loading/disabled states.
- [ ] Empty, loading, and error states are distinct.

### Timetable and attendance

- [ ] Today, selected date, and attendance issue states are distinguishable.
- [ ] Schedule blocks show start/end time and room where available.
- [ ] Current time uses the coral indicator.
- [ ] Subject identity does not change with attendance status.
- [ ] Attendance status includes text/icon, not color alone.
- [ ] Zero attendance data is not shown as a failing 0%.
- [ ] Insights are calculated from real data.

### UX integrity

- [ ] No primary affordance ends in placeholder-only content.
- [ ] Destructive actions confirm or offer Undo.
- [ ] Save failures preserve user input.
- [ ] Terminology uses subject/class/timetable consistently.
- [ ] Dates and times are locale-aware.
- [ ] Screen-reader labels describe icon-only controls and selection state.

---

## 20. Final decision register

| Decision | Chosen direction |
|---|---|
| Font | Manrope, weights 400–800 |
| Primary text | Navy `#061430` |
| Primary brand/action | Cobalt `#0559FA` |
| Temporal focus | Coral `#FF7A4F` |
| Context surface | Sky `#D5F2FF` |
| Main background | Cool canvas `#F7F9FC` with white surfaces |
| Subject treatment | Stable pastel surface + accessible accent pair |
| Corner language | 12 controls, 16 cards, 20 feature cards, 28 sheets |
| Elevation | Flat by default; floating overlays only |
| Grid | 4-point base, 8-point rhythm |
| Navigation | Three labeled bottom tabs; profile for secondary destinations |
| Theme scope | Coherent light theme first; no partial automatic dark mode |
| Voice | Direct, calm, sentence case, data-grounded |

This system preserves the reference artwork’s strongest qualities—confidence, color clarity, editorial scale, and schedule-first organization—while making them appropriate, accessible, and specific to CLG Kit.
