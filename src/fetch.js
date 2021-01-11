import axios from "axios";

const makeYotpoRequest = async (yotpoAppKey, yotpoPerPage, id) => {
  return await axios.get(
    `https://api.yotpo.com/v1/widget/${yotpoAppKey}/products/${id}/reviews.json`,
    {
      params: {
        per_page: yotpoPerPage,
        page: 1
      }
    }
  );
}

export const getReviews = async ({ productIds, yotpoAppKey, yotpoPerPage }) => {
  const reviews = await Promise.all(
    productIds.map(async id => {
      const review = await makeYotpoRequest(yotpoAppKey, yotpoPerPage, id)
        .catch(error => {
          if (error.response.status === 400) {
            return await makeYotpoRequest(yotpoAppKey, yotpoPerPage, id)
          }
        })
      return { ...review.data.response, ...{ productId: id } };
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
