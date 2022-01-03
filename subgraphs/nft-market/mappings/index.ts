/* eslint-disable prefer-const */
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Collection, NFT, AskOrder, Transaction, User } from "../generated/schema";
import {
  AskCancel,
  AskNew,
  AskUpdate,
  CollectionClose,
  CollectionNew,
  CollectionUpdate,
  RevenueClaim,
  Trade,
} from "../generated/ERC721NFTMarketV1/ERC721NFTMarketV1";
import { toBigDecimal } from "./utils";
import { updateCollectionDayData, updateMarketPlaceDayData } from "./utils/dayUpdates";
import { fetchName, fetchSymbol, fetchTokenURI } from "./utils/erc721";

// Constants
let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// BigNumber-like references
let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);
let ZERO_BD = BigDecimal.fromString("0");

/**
 * COLLECTION(S)
 */

export function handleCollectionNew(event: CollectionNew): void {
  let collection = Collection.load(event.params.collection.toHex());
  if (collection === null) {
    collection = new Collection(event.params.collection.toHex());
    collection.name = fetchName(event.params.collection);
    collection.symbol = fetchSymbol(event.params.collection);
    collection.active = true;
    collection.totalTrades = ZERO_BI;
    collection.totalVolumeMATIC = ZERO_BD;
    collection.numberTokensListed = ZERO_BI;
    collection.creatorAddress = event.params.creator;
    collection.tradingFee = toBigDecimal(event.params.tradingFee, 2);
    collection.creatorFee = toBigDecimal(event.params.creatorFee, 2);
    collection.whitelistChecker = event.params.whitelistChecker;
    collection.save();
  }
  collection.active = true;
  collection.creatorAddress = event.params.creator;
  collection.tradingFee = toBigDecimal(event.params.tradingFee, 2);
  collection.creatorFee = toBigDecimal(event.params.creatorFee, 2);
  collection.whitelistChecker = event.params.whitelistChecker;
  collection.save();
}

export function handleCollectionClose(event: CollectionClose): void {
  let collection = Collection.load(event.params.collection.toHex());
  if (collection !== null) {
    collection.active = false;
    collection.save();
  }
}

export function handleCollectionUpdate(event: CollectionUpdate): void {
  let collection = Collection.load(event.params.collection.toHex());
  if (collection !== null) {
    collection.creatorAddress = event.params.creator;
    collection.tradingFee = toBigDecimal(event.params.tradingFee, 2);
    collection.creatorFee = toBigDecimal(event.params.creatorFee, 2);
    collection.whitelistChecker = event.params.whitelistChecker;
    collection.save();
  }
}

/**
 * ASK ORDERS
 */

export function handleAskNew(event: AskNew): void {
  let user = User.load(event.params.seller.toHex());
  if (user === null) {
    user = new User(event.params.seller.toHex());
    user.numberTokensListed = ONE_BI;
    user.numberTokensPurchased = ZERO_BI;
    user.numberTokensSold = ZERO_BI;
    user.totalVolumeInMATICTokensPurchased = ZERO_BD;
    user.totalVolumeInMATICTokensSold = ZERO_BD;
    user.totalFeesCollectedInMATIC = ZERO_BD;
    user.averageTokenPriceInMATICPurchased = ZERO_BD;
    user.averageTokenPriceInMATICSold = ZERO_BD;
    user.save();
  }
  user.numberTokensListed = user.numberTokensListed.plus(ONE_BI);
  user.save();

  let collection = Collection.load(event.params.collection.toHex());
  collection.numberTokensListed = collection.numberTokensListed.plus(ONE_BI);
  collection.save();

  let token = NFT.load(event.params.collection.toHex() + "-" + event.params.tokenId.toString());
  if (token === null) {
    token = new NFT(event.params.collection.toHex() + "-" + event.params.tokenId.toString());
    token.tokenId = event.params.tokenId;
    token.collection = collection.id;
    token.metadataUrl = fetchTokenURI(event.params.collection, event.params.tokenId);
    token.updatedAt = event.block.timestamp;
    token.currentAskPrice = toBigDecimal(event.params.askPrice, 18);
    token.currentSeller = event.params.seller.toHex();
    token.latestTradedPriceInMATIC = ZERO_BD;
    token.tradeVolumeMATIC = ZERO_BD;
    token.totalTrades = ZERO_BI;
    token.isTradable = true;
    token.save();
  }
  token.updatedAt = event.block.timestamp;
  token.currentAskPrice = toBigDecimal(event.params.askPrice, 18);
  token.currentSeller = event.params.seller.toHex();
  token.isTradable = true;
  token.save();

  let order = new AskOrder(event.transaction.hash.toHex());
  order.block = event.block.number;
  order.timestamp = event.block.timestamp;
  order.collection = collection.id;
  order.nft = token.id;
  order.orderType = "New";
  order.askPrice = toBigDecimal(event.params.askPrice, 18);
  order.seller = user.id;
  order.save();
}

export function handleAskCancel(event: AskCancel): void {
  let user = User.load(event.params.seller.toHex());
  if (user !== null) {
    user.numberTokensListed = user.numberTokensListed.minus(ONE_BI);
    user.save();
  }

  let collection = Collection.load(event.params.collection.toHex());
  if (collection != null) {
    collection.numberTokensListed = collection.numberTokensListed.minus(ONE_BI);
    collection.save();
  }

  let token = NFT.load(event.params.collection.toHex() + "-" + event.params.tokenId.toString());
  if (token !== null) {
    token.currentSeller = ZERO_ADDRESS;
    token.updatedAt = event.block.timestamp;
    token.currentAskPrice = ZERO_BD;
    token.isTradable = false;
    token.save();
  }

  if (token !== null && collection !== null) {
    let order = new AskOrder(event.transaction.hash.toHex());
    order.block = event.block.number;
    order.timestamp = event.block.timestamp;
    order.collection = collection.id;
    order.nft = token.id;
    order.orderType = "Cancel";
    order.askPrice = toBigDecimal(ZERO_BI, 18);
    order.seller = event.params.seller.toHex();
    order.save();
  }
}

export function handleAskUpdate(event: AskUpdate): void {
  let token = NFT.load(event.params.collection.toHex() + "-" + event.params.tokenId.toString());
  if (token !== null) {
    token.updatedAt = event.block.timestamp;
    token.currentAskPrice = toBigDecimal(event.params.askPrice, 18);
    token.save();

    let order = new AskOrder(event.transaction.hash.toHex());
    order.block = event.block.number;
    order.timestamp = event.block.timestamp;
    order.collection = token.collection;
    order.nft = token.id;
    order.orderType = "Modify";
    order.askPrice = toBigDecimal(event.params.askPrice, 18);
    order.seller = event.params.seller.toHex();
    order.save();
  }
}

/**
 * BUY ORDERS
 */

export function handleTrade(event: Trade): void {
  // 1. Buyer
  let buyer = User.load(event.params.buyer.toHex());

  // Buyer may not exist
  if (buyer === null) {
    buyer = new User(event.params.buyer.toHex());
    buyer.numberTokensListed = ZERO_BI;
    buyer.numberTokensPurchased = ONE_BI; // 1 token purchased
    buyer.numberTokensSold = ZERO_BI;
    buyer.totalVolumeInMATICTokensPurchased = toBigDecimal(event.params.askPrice, 18);
    buyer.totalVolumeInMATICTokensSold = ZERO_BD;
    buyer.totalFeesCollectedInMATIC = ZERO_BD;
    buyer.averageTokenPriceInMATICPurchased = buyer.totalVolumeInMATICTokensPurchased;
    buyer.averageTokenPriceInMATICSold = ZERO_BD;
  } else {
    buyer.numberTokensPurchased = buyer.numberTokensPurchased.plus(ONE_BI);
    buyer.totalVolumeInMATICTokensPurchased = buyer.totalVolumeInMATICTokensPurchased.plus(
      toBigDecimal(event.params.askPrice, 18)
    );

    buyer.averageTokenPriceInMATICPurchased = buyer.totalVolumeInMATICTokensPurchased.div(
      buyer.numberTokensPurchased.toBigDecimal()
    );
  }

  // 2. Seller
  let seller = User.load(event.params.seller.toHex());

  seller.numberTokensSold = seller.numberTokensSold.plus(ONE_BI);
  seller.numberTokensListed = seller.numberTokensListed.minus(ONE_BI);
  seller.totalVolumeInMATICTokensSold = seller.totalVolumeInMATICTokensSold.plus(
    toBigDecimal(event.params.netPrice, 18)
  );
  seller.averageTokenPriceInMATICSold = seller.totalVolumeInMATICTokensSold.div(seller.numberTokensSold.toBigDecimal());

  // 3. Collection
  let collection = Collection.load(event.params.collection.toHex());
  if (collection !== null) {
    collection.totalTrades = collection.totalTrades.plus(ONE_BI);
    collection.totalVolumeMATIC = collection.totalVolumeMATIC.plus(toBigDecimal(event.params.askPrice, 18));
    collection.numberTokensListed = collection.numberTokensListed.minus(ONE_BI);
    collection.save();
  }

  // 4. NFT
  let tokenConcatId = event.params.collection.toHex() + "-" + event.params.tokenId.toString();
  let token = NFT.load(tokenConcatId);

  token.latestTradedPriceInMATIC = toBigDecimal(event.params.askPrice, 18);
  token.tradeVolumeMATIC = token.tradeVolumeMATIC.plus(token.latestTradedPriceInMATIC);
  token.updatedAt = event.block.timestamp;
  token.totalTrades = token.totalTrades.plus(ONE_BI);
  token.currentAskPrice = ZERO_BD;
  token.currentSeller = ZERO_ADDRESS;
  token.isTradable = false;

  // 5. Transaction
  let transaction = new Transaction(event.transaction.hash.toHex());

  transaction.block = event.block.number;
  transaction.timestamp = event.block.timestamp;
  transaction.collection = event.params.collection.toHex();
  transaction.nft = event.params.collection.toHex() + "-" + event.params.tokenId.toString();
  transaction.askPrice = toBigDecimal(event.params.askPrice, 18);
  transaction.netPrice = toBigDecimal(event.params.netPrice, 18);

  transaction.buyer = event.params.buyer.toHex();
  transaction.seller = event.params.seller.toHex();

  transaction.withMATIC = event.params.withMATIC;

  transaction.save();
  buyer.save();
  seller.save();
  token.save();

  updateCollectionDayData(event.params.collection, toBigDecimal(event.params.askPrice, 18), event);
  updateMarketPlaceDayData(toBigDecimal(event.params.askPrice, 18), event);
}

/**
 * ROYALTIES
 */

export function handleRevenueClaim(event: RevenueClaim): void {
  let user = User.load(event.params.claimer.toHex());
  if (user === null) {
    user = new User(event.params.claimer.toHex());
    user.numberTokensListed = ZERO_BI;
    user.numberTokensPurchased = ZERO_BI;
    user.numberTokensSold = ZERO_BI;
    user.totalVolumeInMATICTokensPurchased = ZERO_BD;
    user.totalVolumeInMATICTokensSold = ZERO_BD;
    user.totalFeesCollectedInMATIC = ZERO_BD;
    user.averageTokenPriceInMATICPurchased = ZERO_BD;
    user.averageTokenPriceInMATICSold = ZERO_BD;
    user.save();
  }
  user.totalFeesCollectedInMATIC = user.totalFeesCollectedInMATIC.plus(toBigDecimal(event.params.amount, 18));
  user.save();
}
