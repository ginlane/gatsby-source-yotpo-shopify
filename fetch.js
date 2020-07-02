import axios from "axios";

export const getReviews = async ({ productIds, yotpoAppKey, yotpoPerPage }) => {
  const reviews = await Promise.all(
    productIds.map(async id => {
      const review = await axios.get(
        `https://api.yotpo.com/v1/widget/${yotpoAppKey}/products/${id}/reviews.json`,
        {
          params: {
            per_page: yotpoPerPage,
            page: 1
          }
        }
      );
      return { ...review.data.response, ...{ product_id: id } };
    })
  );
  return reviews;
};

export const getShopifyProducts = async ({ shopifyClient }) => {
  const shopifyResponse = await shopifyClient.request(`{
    products(first: 250) {
      edges {
        node {
          id
        }
      }
    }
  }`);

  return shopifyResponse.products;
};
