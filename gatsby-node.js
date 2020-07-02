import chalk from "chalk";
import { createShopifyClient, createYotpoClient } from "./create-client";
import { getReviews, getShopifyProducts } from "./fetch";
import { formatMsg, decodeShopifyId } from "./utils";

export const sourceNodes = async (
  { actions: { createNode, touchNode }, createNodeId, createContentDigest },
  {
    shopName,
    shopifyAccessToken,
    yotpoAppKey,
    yotpoPerPage = 150,
    apiVersion = "2019-07"
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
    apiVersion
  });

  try {
    console.time(formatMsg("finished fetching shopify products"));
    const shopifyProducts = await getShopifyProducts({
      shopifyClient
    });
    console.timeEnd(formatMsg("finished fetching shopify products"));

    const productIds = shopifyProducts.edges.map(product =>
      decodeShopifyId(product.node.id)
    );

    console.time(formatMsg("finished fetching yotpo reviews"));
    const reviews = await getReviews({
      productIds,
      yotpoAppKey,
      yotpoPerPage
    });
    console.timeEnd(formatMsg("finished fetching yotpo reviews"));

    const type = "Yotpo_Reviews";

    await Promise.all(
      reviews.map(async review => {
        await createNode({
          ...review,
          id: createNodeId(`${type}-${review.product_id}`),
          parent: null,
          children: [],
          internal: {
            type: type,
            content: JSON.stringify(review),
            contentDigest: createContentDigest(review)
          }
        });
      })
    );
  } catch (e) {
    console.error(chalk`\n{red error} an error occurred while sourcing data`);
    throw e;
  }

  return;
};
