import axios from 'axios'

const makeYotpoReviewRequest = async (
  yotpoAppKey,
  productId,
  yotpoPerPage,
  page,
) => {
  return await axios.get(
    `https://api.yotpo.com/v1/widget/${yotpoAppKey}/products/${productId}/reviews.json`,
    {
      params: {
        per_page: yotpoPerPage,
        page,
      },
    },
  )
}

const getProductReviews = async (
  yotpoAppKey,
  productId,
  yotpoPerPage,
  pageNumber = 1,
) => {
  const productReviews = (
    await makeYotpoReviewRequest(
      yotpoAppKey,
      productId,
      yotpoPerPage,
      pageNumber,
    )
  ).data.response
  const pagination = productReviews.pagination

  if (pagination.page * pagination.per_page < pagination.total) {
    const remainingPages = await getProductReviews(
      yotpoAppKey,
      productId,
      yotpoPerPage,
      pageNumber + 1,
    )

    productReviews.reviews = productReviews.reviews.concat(
      remainingPages.reviews,
    )
  }

  return {
    bottomline: productReviews.bottomline,
    products: productReviews.products,
    reviews: productReviews.reviews,
  }
}

export const getReviews = async ({ productIds, yotpoAppKey, yotpoPerPage }) => {
  const reviews = await Promise.all(
    productIds.map(async (productId) => {
      const productReviews = await getProductReviews(
        yotpoAppKey,
        productId,
        yotpoPerPage,
      )

      return {
        ...productReviews,
        productId: productId,
      }
    }),
  )
  return reviews
}

const makeYotpoQuestionRequest = async (yotpoAppKey, yotpoPerPage, id) => {
  return await axios.get(
    `https://api.yotpo.com/products/${yotpoAppKey}/${id}/questions`,
    {
      params: {
        count: yotpoPerPage,
        page: 1,
      },
    },
  )
}

export const getQuestions = async ({
  productIds,
  yotpoAppKey,
  yotpoPerPage,
}) => {
  const questions = await Promise.all(
    productIds.map(async (id) => {
      const question = await makeYotpoQuestionRequest(
        yotpoAppKey,
        yotpoPerPage,
        id,
      )

      return { ...question.data.response, ...{ productId: id } }
    }),
  )
  return questions
}

export const getShopifyProducts = async ({ shopifyClient }) => {
  const shopifyResponse = await shopifyClient.request(`{
    products(first: 250) {
      edges {
        node {
          id
        }
      }
    }
  }`)

  return shopifyResponse.products
}
