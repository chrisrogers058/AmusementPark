# Amusement Park Master

A self-contained browser management game. Open `index.html` in a modern browser. Progress stays in that browser; Reset starts a new season.

## Play

Name your park before beginning (1–40 characters). The name stays with the season and appears on its entrance sign, screen headings and CSV exports. Existing unnamed saves prompt for a name without losing history.

1. **Park:** The park view, Open Park button, multi-day simulation and overhead details appear before happiness and goal charts. Open once for one day, or choose Sim 7 days, Sim 15 days, or Sim to Day 30. Simulations use your current prices, built-ride tickets and marketing selection without buying investments.
2. **Prices:** Choose Budget, Balanced or Premium. Optional custom controls set individual admission, ride and food prices. Advertising remains a separate daily decision.
3. **Build:** Construct 12 rides across Family, Thrill and Junior, or buy paths, greenery and marketing upgrades. Purchases spend cash immediately.
4. **Reports:** Review daily sales, operating expenses, overhead, repairs and financial history. Export downloads CSV.

All difficulties start with **$100** and run for **30 operating days**. Negative cash ends the season. Win by meeting both the cash and happiness targets at the end of day 30.

| Mode | Overhead multiplier | Cash target | Happiness target |
| --- | ---: | ---: | ---: |
| Easy | 1.00 | $7,500 | 65 |
| Normal | 1.12 | $5,000 | 70 |
| Expert | 1.20 | $15,000 | 85 |

Base daily overhead is $850: staff $450, maintenance $190, utilities $130, insurance $80. Each ride adds daily staff, maintenance, utility and insurance costs, scaled to its construction price. Upgrades add recurring upkeep too. Build cards show the daily increase before purchase; the Park screen has an expandable breakdown and the forecast updates after every purchase. Scheduled repairs occur every seventh day. Every ninth day, one built ride closes for maintenance with a repair charge. These rules are deterministic so runs can be compared fairly.

Higher prices reduce demand. Gate capacity grows with construction. Guest happiness changes gradually based on value, crowding, ride variety and amenities; reputation affects future demand. Premium pricing can lose money quickly. The daily forecast includes overhead and scheduled repairs; save a cash reserve before investing.

Difficulty selection applies when you press **Reset**, after confirmation. Versioned saves map the former Normal to Easy and former Expert to Normal. The retired introductory Easy also becomes Easy. Cash, assets, prices, names and historical records are retained. New seasons default to Easy. Existing history remains intact. Early saves were earned under earlier financial rules; reset for a comparable challenge.

## Goal charts and projections

The Park screen graphs every completed day's profit (left axis, USD) and happiness (right axis, 0–100). A second chart shows historical cash, projected cash and the Day 30 cash target. Chart values are also available in an expandable table.

Cash projection = current cash + mean operating profit over the latest five completed days × days remaining. Happiness extends its change across that recent window, constrained to 0–100; one day's forecast uses that day's change. Projections are estimates, exclude future investments and changing conditions, and use actual results at season end.

- **Behind schedule:** projected cash or happiness misses its target (or the park is bankrupt).
- **On track:** both targets are met, but both are not strictly exceeded.
- **Ahead of schedule:** both targets are strictly exceeded.
- Before the first completed day, the forecast waits for data.

The financial win condition remains ending cash plus happiness; the daily profit line shows operating performance rather than changing that cash goal.

## Daily marketing

Choose one daily campaign in Prices. Selecting a campaign spends nothing; opening the park charges its cost once for that day. The selection persists until changed. Reach is limited by park capacity, and marketing upgrades improve its effectiveness.

| Campaign | Daily cost | Base attendance boost |
| --- | ---: | ---: |
| Organic word of mouth (no paid advertising) | $0 | 0% |
| Neighborhood flyers | $25 | 10% |
| Social media ads | $75 | 22% |
| Local radio spots | $150 | 35% |
| Regional search ads | $300 | 55% |
| Regional video campaign | $500 | 75% |

Legacy saved budgets map down to the closest available campaign for future days (for example, $100 becomes $75). Historic spending remains unchanged. Stronger campaigns can lose money in small parks; forecasts show the tradeoff.

The park illustration now includes five ride types, gardens, a snack stand, benches, fencing and paved paths. The wheel and visitors animate, with reduced-motion support. The scene is decorative and does not purchase rides or alter the simulation.

## Development and checks

The latest operations expansion is developed in `feature/advanced-park-operations` and passes the regression workflow before merging to `main`.

```sh
npm install --no-save --package-lock=false playwright@1.56.1
npx playwright install --with-deps chromium
node tests/economy-test.cjs
node tests/browser-test.cjs
```

GitHub Actions runs the checks. Browser coverage includes every price button, category filter, all 12 construction buttons, all six upgrades, strategies, marketing, save/reload, CSV, reset, difficulty, bankruptcy, season completion, malformed saves, keyboard navigation and layouts at 390, 768 and 1366 pixels. Screenshots are uploaded as workflow artifacts. Economy checks verify reconciliation, demand, no-guest overhead, maintenance, and winning/losing season strategies.

Additional regression coverage checks forecast classifications and chart points, required names and the 40-character limit, reduced-motion behavior, recurring costs for every asset, all marketing campaigns and exact daily charges, saved selections and legacy budgets.

## Faster simulation and growing investment catalogs

Simulations stop at Day 30, bankruptcy, or a new fatal incident. Every simulated day produces its own ledger record, item sales, overhead, happiness update, save and eligible new offers; the batch does not buy anything automatically. Controls are locked while a batch runs. Closed days count toward the 30-day season.

Once all existing offers in a section are purchased, a new, more expensive offer appears, at most once per section per game day. Sections are Family rides, Thrill rides, Junior rides, park improvements (paths/greenery), and marketing infrastructure. Buying the new offer completes that section again, so another can unlock the following day. Reloading cannot duplicate offers. New rides and upgrades participate in revenue, attendance/campaign effects and recurring overhead just like original assets. The starting five paid advertising campaigns remain daily choices rather than permanent purchases.

## Fatal ride incidents

| Difficulty | Chance per open day with guests |
| --- | ---: |
| Easy | 0% |
| Normal | 0.5% (`0.005`) |
| Expert | 3% (`0.03`) |

A fatal incident closes the park for seven game days **including the incident day**. There are no guests, item sales, revenue or paid advertising charges during closure. Staff/maintenance/utilities/insurance and scheduled repairs continue. Happiness drops by 20 at the incident and by one on each subsequent closed day. Continue using the daily button or simulation controls to advance closed days. The park reopens after day seven if it has enough cash and the season has not ended. Closed days cannot trigger another incident. Previews never roll for an incident.

A new incident interrupts bulk simulation and opens the Park screen with a dark red emergency overlay. It pulses slowly, supports pausing the alert animation, and stays static under reduced-motion settings. Incident and closure state survive reload, and closure status appears in daily reports and CSV exports. Projections do not predict future random incidents. Bankruptcy or season end still stops play, even during a closure.

Additional automated coverage verifies single-day/batch equivalence, seven-/15-day/rest-of-season controls, save migration, renewable offers and duplicate prevention, exact incident probability boundaries, seven closed days and reopening, Easy immunity, closure persistence, paused/reduced-motion alerts, and desktop/mobile incident screenshots.
