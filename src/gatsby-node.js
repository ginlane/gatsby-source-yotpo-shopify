import chalk from "chalk";
import camelCaseRecursive from "camelcase-keys-recursive";
import { createShopifyClient, createYotpoClient } from "./create-client";
import { getReviews, getShopifyProducts } from "./fetch";
import { formatMsg, decodeShopifyId, createNodeFactory } from "./utils";
import { mockYotpoResponse } from "./mock";

export const sourceNodes = async (
  { actions: { createNode }, createNodeId, createContentDigest },
  {
    shopName,
    shopifyAccessToken,
    yotpoAppKey,
    yotpoPerPage = 149,
    apiVersion = "2019-07",
    createDefaultObject = false,
  }
) => {
  if (!shopName || !shopifyAccessToken || !yotpoAppKey) {
    console.log(
      "\nMissing configurations - shopName, shopifyAccessToken and yotpoAppKey are required"
    );
    process.exit(1);
  }

  const shopifyClient = await createShopifyClient({
    shopName,
    shopifyAccessToken,
    apiVersion,
  });

  try {
    console.time(formatMsg("finished fetching shopify products"));
    const shopifyProducts = await getShopifyProducts({
      shopifyClient,
    });
    console.timeEnd(formatMsg("finished fetching shopify products"));

    const productIds = shopifyProducts.edges.map((product) =>
      decodeShopifyId(product.node.id)
    );

    console.time(formatMsg("finished fetching yotpo reviews"));
    const reviews = await getReviews({
      productIds,
      yotpoAppKey,
      yotpoPerPage,
    });
    console.timeEnd(formatMsg("finished fetching yotpo reviews"));

    createDefaultObject
      ? await createNodeFactory(
          createNode,
          createNodeId,
          createContentDigest,
          mockYotpoResponse
        )
      : await Promise.all(
          reviews.map(async (review) => {
            const camelCaseReview = camelCaseRecursive(review);
            await createNodeFactory(
              createNode,
              createNodeId,
              createContentDigest,
              camelCaseReview
            );
          })
        );
  } catch (e) {
    console.error(chalk`\n{red error} an error occurred while sourcing data`);
    throw e;
  }

  return;
};
