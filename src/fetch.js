import axios from 'axios'
const SHOPIFY_PAGE_COUNT = 250

const makeYotpoReviewRequest = async (
  yotpoAppKey,
  productId,
  yotpoPerPage,
  page,
) => {
  return await axios.get(
    `https://api-cdn.yotpo.com/v1/widget/${yotpoAppKey}/products/${productId}/reviews.json`,
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
  let reviews
  try {
    reviews = await Promise.all(
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
  } catch (e) {
    console.log(`Error fetching Yotpo reviews: ${e.message}`)
  }
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

export const getShopifyProducts = async (shopName, token) => {
  let response = await makeShopifyProductsRequest(shopName, token)
  let edges = response.products.edges

  if (response.products.pageInfo.hasNextPage) {
    const lastProduct = edges[edges.length - 1]
    response = await makeShopifyProductsRequest(
      shopName,
      token,
      lastProduct.cursor,
    )
    edges = edges.concat(response.products.edges)
  }

  return edges.map((e) => e.node)
}

const makeShopifyProductsRequest = async (shopName, token, afterCursor) => {
  const after = afterCursor ? `, after: "${afterCursor}"` : ''
  const results = await axios.post(
    `https://${shopName}.myshopify.com/api/2019-07/graphql.json`,
    {
      query: `{
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
    },
    {
      headers: {
        'X-Shopify-Storefront-Access-Token': token,
      },
    },
  )
  return results.data.data
}
