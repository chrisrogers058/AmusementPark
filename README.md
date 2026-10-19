# Amusement Park Master

A self-contained browser management game. Open `index.html` in a modern browser. Progress stays in that browser; Reset starts a new season.

## Play

Name your park before beginning (1–40 characters). The name stays with the season and appears on its entrance sign, screen headings and CSV exports. Existing unnamed saves prompt for a name without losing history.

1. **Park:** See cash, happiness, weather and projected operating costs. Open the park once to advance one game day.
2. **Prices:** Choose Budget, Balanced or Premium. Optional custom controls set individual admission, ride and food prices. Advertising remains a separate daily decision.
3. **Build:** Construct 12 rides across Family, Thrill and Junior, or buy paths, greenery and marketing upgrades. Purchases spend cash immediately.
4. **Reports:** Review daily sales, operating expenses, overhead, repairs and financial history. Export downloads CSV.

All difficulties start with **$100** and run for **30 operating days**. Negative cash ends the season. Win by meeting both the cash and happiness targets at the end of day 30.

| Mode | Overhead multiplier | Cash target | Happiness target |
| --- | ---: | ---: | ---: |
| Easy | 0.70 | $10,000 | 60 |
| Normal | 1.00 | $7,500 | 65 |
| Expert | 1.12 | $5,000 | 70 |

Base daily overhead is $850: staff $450, maintenance $190, utilities $130, insurance $80. Each ride adds daily staff, maintenance, utility and insurance costs, scaled to its construction price. Upgrades add recurring upkeep too. Build cards show the daily increase before purchase; the Park screen has an expandable breakdown and the forecast updates after every purchase. Scheduled repairs occur every seventh day. Every ninth day, one built ride closes for maintenance with a repair charge. These rules are deterministic so runs can be compared fairly.

Higher prices reduce demand. Gate capacity grows with construction. Guest happiness changes gradually based on value, crowding, ride variety and amenities; reputation affects future demand. Premium pricing can lose money quickly. The daily forecast includes overhead and scheduled repairs; save a cash reserve before investing.

Difficulty selection applies when you press **Reset**, after confirmation. Existing saves migrate to Normal with happiness 70 if those fields were absent. Existing history remains intact. Early saves were earned under earlier financial rules; reset for a comparable challenge.

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

The latest five features are stacked in separate branches: `feature/goal-progress-chart`, `feature/park-scenery`, `feature/park-names`, `feature/scaling-overhead`, and `feature/marketing-packages`. Each branch has its own browser check; later branches include earlier features.

```sh
npm install --no-save --package-lock=false playwright@1.56.1
npx playwright install --with-deps chromium
node tests/economy-test.cjs
node tests/browser-test.cjs
```

GitHub Actions runs the checks. Browser coverage includes every price button, category filter, all 12 construction buttons, all six upgrades, strategies, marketing, save/reload, CSV, reset, difficulty, bankruptcy, season completion, malformed saves, keyboard navigation and layouts at 390, 768 and 1366 pixels. Screenshots are uploaded as workflow artifacts. Economy checks verify reconciliation, demand, no-guest overhead, maintenance, and winning/losing season strategies.

Additional regression coverage checks forecast classifications and chart points, required names and the 40-character limit, reduced-motion behavior, recurring costs for every asset, all marketing campaigns and exact daily charges, saved selections and legacy budgets.
