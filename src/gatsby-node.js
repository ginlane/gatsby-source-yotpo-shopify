import chalk from 'chalk'
import camelCaseRecursive from 'camelcase-keys-recursive'
import { getReviews, getQuestions, getShopifyProducts } from './fetch'
import { formatMsg, decodeShopifyId, createNodeFactory } from './utils'
import { mockYotpoResponse } from './mock'

export const createSchemaCustomization = async (
  { actions: { createNode }, createNodeId, createContentDigest },
  {
    shopName,
    shopifyAccessToken: token,
    yotpoAppKey,
    yotpoPerPage = 149,
    apiVersion = '2019-07',
    createDefaultObject = false,
    appendDefaultObject = false,
  },
) => {
  if (!shopName || !token || !yotpoAppKey) {
    console.log(
      '\nMissing configurations - shopName, shopifyAccessToken and yotpoAppKey are required',
    )
    process.exit(1)
  }

  if (createDefaultObject) {
    await createNodeFactory(
      createNode,
      createNodeId,
      createContentDigest,
      mockYotpoResponse,
    )
    console.log('created mock object')
    return
  }
  try {
    console.time(formatMsg('finished fetching shopify products'))
    const shopifyProducts = await getShopifyProducts(shopName, token)
    console.timeEnd(formatMsg('finished fetching shopify products'))

    const productIds = shopifyProducts.map((product) =>
      decodeShopifyId(product.id),
    )

    console.time(formatMsg('finished fetching yotpo reviews'))
    const reviews = await getReviews({
      productIds,
      yotpoAppKey,
      yotpoPerPage,
    })
    console.timeEnd(formatMsg('finished fetching yotpo reviews'))

    if (appendDefaultObject) {
      reviews.push({
        productId: mockYotpoResponse.productId,
        bottomLine: mockYotpoResponse.bottomline,
        reviews: mockYotpoResponse.reviews,
        products: mockYotpoResponse.products,
      })
      console.log('appended mock reviews')
    }

    console.time(formatMsg('finished fetching yotpo questions'))
    const questions = await getQuestions({
      productIds,
      yotpoAppKey,
      yotpoPerPage,
    })
    console.timeEnd(formatMsg('finished fetching yotpo questions'))

    let mergedData = reviews.map((review) => {
      const question = questions.find(
        (question) => question.productId === review.productId,
      )
      return {
        ...review,
        ...question,
      }
    })
    const mergedProductIds = mergedData.map((data) => data.productId)

    const leftoverQuestions = questions.filter(
      (question) => !mergedProductIds.includes(question.productId),
    )
    mergedData = mergedData.concat(leftoverQuestions)

    await Promise.all(
      mergedData.map(async (data) => {
        const camelCaseData = camelCaseRecursive(data)
        await createNodeFactory(
          createNode,
          createNodeId,
          createContentDigest,
          camelCaseData,
        )
      }),
    )
  } catch (e) {
    console.error(chalk`\n{red error} an error occurred while sourcing data`)
    throw e
  }

  return
}
