# Amusement Park Master

A self-contained browser management game. Open `index.html` in a modern browser. Progress stays in that browser; Reset starts a new season.

## Play

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

Base daily overhead is $850: staff $450, maintenance $190, utilities $130, insurance $80. Each built ride adds $9 of daily maintenance before difficulty adjustment. Scheduled repairs occur every seventh day. Every ninth day, one built ride closes for maintenance with a repair charge. These rules are deterministic so runs can be compared fairly.

Higher prices reduce demand. Gate capacity grows with construction. Guest happiness changes gradually based on value, crowding, ride variety and amenities; reputation affects future demand. Premium pricing can lose money quickly. The daily forecast includes overhead and scheduled repairs; save a cash reserve before investing.

Difficulty selection applies when you press **Reset**, after confirmation. Existing saves migrate to Normal with happiness 70 if those fields were absent. Existing history remains intact. Early saves were earned under earlier financial rules; reset for a comparable challenge.

## Development and checks

The five features are stacked in separate branches: `feature/visual-dashboard`, `feature/pricing-strategies`, `feature/operating-costs`, `feature/guest-satisfaction`, and `feature/difficulty-goals`. Each branch has its own browser check; later branches include earlier features.

```sh
npm install --no-save --package-lock=false playwright@1.56.1
npx playwright install --with-deps chromium
node tests/economy-test.cjs
node tests/browser-test.cjs
```

GitHub Actions runs the checks. Browser coverage includes every price button, category filter, all 12 construction buttons, all six upgrades, strategies, marketing, save/reload, CSV, reset, difficulty, bankruptcy, season completion, malformed saves, keyboard navigation and layouts at 390, 768 and 1366 pixels. Screenshots are uploaded as workflow artifacts. Economy checks verify reconciliation, demand, no-guest overhead, maintenance, and winning/losing season strategies.
