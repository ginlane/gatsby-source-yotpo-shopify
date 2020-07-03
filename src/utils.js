import chalk from "chalk";

export const formatMsg = msg =>
  chalk`\n{blue gatsby-source-yotpo-shopify} ${msg}`;

export const decodeShopifyId = base64Id => {
  const shopifyId = Buffer.from(base64Id, "base64").toString("binary");
  const id = shopifyId.substr(shopifyId.lastIndexOf("/") + 1);
  return id;
};
