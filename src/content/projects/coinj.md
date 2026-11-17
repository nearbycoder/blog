---
title: "CoinJ"
summary: "A cryptocurrency market table made with Create React App in 2018. It listed the coins from CoinCap's API with sprite-sheet icons, filtering and sorting, and highlighted rows as live trades arrived over socket.io."
role: "Creator"
createdAt: "2018-02-01"
year: "2018"
stack: ["JavaScript", "React", "Create React App", "react-virtualized", "Socket.IO", "CoinCap"]
githubLink: "https://github.com/nearbycoder/coinj"
image: "/images/projects/coinj.webp"
imageAlt: "CoinJ's page: a dark header reading Welcome to CoinJ, an empty filter box, and a table with Rank, Name, Market Cap, Price, 24hour VWAP, Available Supply, 24 Hour Volume and %24hr columns, listing Bitcoin, Ethereum, Tether, BNB, USDC, XRP, Solana and TRON with their icons."
imageCaption: "CoinJ running locally from its source. CoinCap's old API is gone, so a local stub answers the app's request with CoinGecko market data from November 17, 2026 in the old response shape, plus 24-hour VWAPs from Kraken."
featured: false
accent: "orange"
draft: false
---

CoinJ is a one-page React app that lists cryptocurrencies by market cap. It loads the market from CoinCap's API and shows each coin's market cap, price, 24-hour VWAP, supply, volume and 24-hour change in one long table, then updates prices as trades come in over a socket.io connection. You can filter the list by name or symbol and sort it by any column.

The repository holds a single commit from February 1, 2018, and it hasn't changed since. The CoinCap endpoint it reads, `https://coincap.io/front`, now answers 404 and the live trade feed is gone, so on its own the app shows an empty table today.

## How it works

When `CoinList` mounts, it fetches `https://coincap.io/front`, which returned the market as one JSON array, and numbers the coins in the order they arrive. The table is react-virtualized's `Table` inside a `WindowScroller`, so only the rows near the screen are rendered while the page scrolls normally. Market cap, price and VWAP are formatted as dollars with numeral. Supply, volume and the 24-hour change are printed just as the API sends them.

<figure><img src="/images/projects/coinj-filter.webp" alt="CoinJ with coin typed in the filter box, listing Bitcoin, Dogecoin, WhiteBIT Coin, Bitcoin Cash, Litecoin, Gram, Worldcoin, KuCoin, Filecoin and Bitcoin SV with their original ranks of 1, 13, 16, 22, 25, 31, 69, 74, 99 and 124." width="1440" height="850" loading="lazy" /><figcaption>Filtering for “coin”. Rows keep their market-cap rank. Gram, KuCoin and Bitcoin SV have no Kraken VWAP in the stub's data, so that column shows $0.</figcaption></figure>

The box above the table matches against a name like “Bitcoin BTC”, so it finds coins by name or symbol. Clicking a column header sorts the list with lodash's `orderBy`, and clicking it again reverses the order.

Each icon comes from one sprite sheet. `src/spritesheet.css` has a class for each of 663 coins, like `.sprite-bitcoin`, that picks a 25-pixel tile out of `public/spritesheet.png`. The class name is built from the coin's name, so coins renamed since 2018 (Binance Coin is now BNB, and Ripple is now XRP) and coins newer than the sheet fall back to a generic coin icon. That stylesheet is 91 KB, which is why GitHub lists the repository's main language as CSS.

<figure><img src="/images/projects/coinj-sprites.webp" alt="A grid of several hundred small cryptocurrency logos in many colors, mostly round, arranged in tight rows." width="941" height="910" loading="lazy" /><figcaption>The sprite sheet, public/spritesheet.png, shown here on white.</figcaption></figure>

Prices update live. The component opens a socket.io connection to `https://coincap.io` and listens for `trades` messages. Each message is merged into the coin with the matching symbol, and the list from before the update is kept, so the row of the coin that just traded turns teal if its price went up or red if it went down.

<figure>
  <picture><source srcset="/images/projects/coinj-code-socket-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/coinj-code-socket.webp" alt="Lines 36 to 55 of src/components/CoinList.js: componentWillMount opens a socket.io connection to https://coincap.io, listens for trades messages and merges each message into the coin whose symbol matches, saving the previous coins, then calls fetchCoins." width="1440" height="825" loading="lazy" /></picture>
  <figcaption>The live trade handler in src/components/CoinList.js.</figcaption>
</figure>

## How it's built

It's React 16.2 on Create React App (react-scripts 1.1.0), with react-virtualized 9.18 for the table, socket.io-client 2.0 for the trade feed, lodash for filtering and sorting, and numeral for the dollar amounts. Dependencies are locked with Yarn.

## Running it today

The app still installs and builds with Node 8 and Yarn 1. For the screenshots on this page, the production build ran locally and its request to `coincap.io/front` was answered by a local stub. The stub serves a snapshot of CoinGecko's top 250 coins by market cap from November 17, 2026, mapped into the old response fields, with the 24-hour VWAP from Kraken's public ticker for coins that have a US dollar market there. Coins without one have no VWAP, which the app shows as $0. The socket.io connection was blocked, since there's no feed left to connect to, so no rows change color.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by running the project locally from its source against that stub, the sprite sheet comes from the repository, and the code card shows a real source file.
