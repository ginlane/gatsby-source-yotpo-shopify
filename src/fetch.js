import axios from 'axios'
const SHOPIFY_PAGE_COUNT = 250

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

const makeYotpoQuestionRequest = async (
  yotpoAppKey,
  productId,
  yotpoPerPage,
) => {
  return await axios.get(
    `https://api.yotpo.com/products/${yotpoAppKey}/${productId}/questions`,
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
    productIds.map(async (productId) => {
      const questionResponse = (
        await makeYotpoQuestionRequest(yotpoAppKey, productId, yotpoPerPage)
      ).data.response

      return {
        questions: questionResponse.questions,
        total_questions: questionResponse.total_questions,
        total_answers: questionResponse.total_answers,
        productId: productId,
      }
    }),
  )
  return questions
}

export const getShopifyProducts = async ({ shopifyClient }) => {
  return getAllShopifyProducts(shopifyClient)
}

const getAllShopifyProducts = async (shopifyClient) => {
  let shopifyResponse = await makeShopifyProductsRequest(shopifyClient)
  let edges = shopifyResponse.products.edges

  if (shopifyResponse.products.pageInfo.hasNextPage) {
    const lastProduct = edges[edges.length - 1]
    shopifyResponse = await makeShopifyProductsRequest(
      shopifyClient,
      lastProduct.cursor,
    )

    edges = edges.concat(shopifyResponse.products.edges)
  }

  return edges.map((e) => e.node)
}

const makeShopifyProductsRequest = async (shopifyClient, afterCursor) => {
  const after = afterCursor ? `, after: "${afterCursor}"` : ''

  return await shopifyClient.request(
    `{
    products( first: ${SHOPIFY_PAGE_COUNT}${after}) {
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          id
        }
      }
    }
  }`,
  )
}
