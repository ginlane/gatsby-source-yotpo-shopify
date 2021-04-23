import axios from "axios";

const makeYotpoReviewRequest = async (yotpoAppKey, yotpoPerPage, id) => {
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
      const review = await makeYotpoReviewRequest(yotpoAppKey, yotpoPerPage, id)
        .catch(async (error) => {
          if (error.response.status === 400) {
            return await makeYotpoReviewRequest(yotpoAppKey, yotpoPerPage, id)
          }
        })
      return { ...review.data.response, ...{ productId: id } };
    })
  );
  return reviews;
};

const makeYotpoQuestionRequest = async(yotpoAppKey, yotpoPerPage, id) => {
  return await axios.get(
    `https://api.yotpo.com/products/${yotpoAppKey}/${id}/questions`,
    {
      params: {
        count: yotpoPerPage,
        page: 1
      }
    }
  );
}

export const getQuestions = async({ productIds, yotpoAppKey, yotpoPerPage }) => {
  const questions = await Promise.all(
    productIds.map(async id => {
      const question = await makeYotpoQuestionRequest(yotpoAppKey, yotpoPerPage, id)
        .catch(async (error) => {
          if (error.response.status === 400) {
            return await makeYotpoQuestionRequest(yotpoAppKey, yotpoPerPage, id)
          }
        })
      return { ...question.data.response, ...{ productId: id } };
    })
  );
  return questions;
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
