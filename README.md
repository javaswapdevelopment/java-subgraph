# JavaSwap Subgraph

TheGraph exposes a GraphQL endpoint to query the events and entities within the Polygon Chain and JavaSwap ecosystem.

Currently, there are multiple subgraphs, but additional subgraphs can be added to this repo:

1. **[Blocks](https://thegraph.com/legacy-explorer/subgraph/javaswap/blocks)**: Tracks all blocks on Polygon Chain.

2. **[Exchange](https://javaswap.medium.com/javaswap-info-relaunch-in-partnership-with-150-000-bounty-winner-streamingfast-f7892559d388)**: Tracks all JavaSwap Exchange data with price, volume, liquidity, ...

3. **[Farm Auctions](https://thegraph.com/legacy-explorer/subgraph/javaswap/farm-auctions)**: Tracks all JavaSwap Farm Auctions with auctions and bids.

4. **[Lottery](https://thegraph.com/legacy-explorer/subgraph/javaswap/lottery)**: Tracks all JavaSwap Lottery with rounds, draws and tickets.

5. **[Pairs](https://thegraph.com/legacy-explorer/subgraph/javaswap/pairs)**: Tracks all JavaSwap Pairs and Tokens.

6. **[Prediction (v1)](https://thegraph.com/legacy-explorer/subgraph/javaswap/prediction)**: Tracks all JavaSwap Prediction (v1) with market, rounds, and bets.

7. **[Prediction (v2)](https://thegraph.com/legacy-explorer/subgraph/javaswap/prediction-v2)**: Tracks all JavaSwap Prediction (v2) with market, rounds, and bets.

8. **[Profile](https://thegraph.com/legacy-explorer/subgraph/javaswap/profile)**: Tracks all JavaSwap Profile with teams, users, points and campaigns.

9. **[SmartChef](https://thegraph.com/legacy-explorer/subgraph/javaswap/smartchef)**: Tracks all JavaSwap SmartChef (a.k.a. Espresso Pools) with tokens and rewards.

10. **[Timelock](https://thegraph.com/legacy-explorer/subgraph/javaswap/timelock)**: Tracks all JavaSwap Timelock queued, executed, and cancelled transactions.

11. **[Trading Competition (v1)](https://thegraph.com/legacy-explorer/subgraph/javaswap/trading-competition-v1)**: Tracks all metrics for the Easter Battle (April 07—14, 2021).

## v1

To access subgraphs related to JavaSwap v1 ecosystem ([article](https://javaswap.medium.com/the-great-migration-vote-4093cb3edf23)), use [`v1`](https://github.com/javaswapdevelopment/java-subgraph/tree/v1) branch.

## To setup and deploy

For any of the subgraph: `blocks` as `[subgraph]`

1. Run the `cd subgraphs/[subgraph]` command to move to the subgraph directory.

2. Run the `yarn codegen` command to prepare the TypeScript sources for the GraphQL (generated/*).

3. Run the `yarn build` command to build the subgraph, and check compilation errors before deploying.

4. Run `graph auth --product hosted-service '<ACCESS_TOKEN>'`

5. Deploy via `yarn deploy`.
