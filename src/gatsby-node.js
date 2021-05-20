import chalk from 'chalk'
import camelCaseRecursive from 'camelcase-keys-recursive'
import { createShopifyClient } from './create-client'
import { getReviews, getQuestions, getShopifyProducts } from './fetch'
import { formatMsg, decodeShopifyId, createNodeFactory } from './utils'
import { mockYotpoResponse } from './mock'

export const sourceNodes = async (
  { actions: { createNode }, createNodeId, createContentDigest },
  {
    shopName,
    shopifyAccessToken,
    yotpoAppKey,
    yotpoPerPage = 149,
    apiVersion = '2019-07',
    createDefaultObject = false,
  },
) => {
  if (!shopName || !shopifyAccessToken || !yotpoAppKey) {
    console.log(
      '\nMissing configurations - shopName, shopifyAccessToken and yotpoAppKey are required',
    )
    process.exit(1)
  }

  const shopifyClient = await createShopifyClient({
    shopName,
    shopifyAccessToken,
    apiVersion,
  })

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
    console.time(formatMsg('started fetching shopify products'))
    const shopifyProducts = await getShopifyProducts({
      shopifyClient,
    })
    console.timeEnd(formatMsg('finished fetching shopify products'))

    const productIds = shopifyProducts.map((product) =>
      decodeShopifyId(product.id),
    )

    console.time(formatMsg('started fetching yotpo reviews'))
    const reviews = await getReviews({
      productIds,
      yotpoAppKey,
      yotpoPerPage,
    })
    console.timeEnd(formatMsg('finished fetching yotpo reviews'))

    console.time(formatMsg('started fetching yotpo questions'))
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
