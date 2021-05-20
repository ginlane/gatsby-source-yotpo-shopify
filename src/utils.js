import chalk from 'chalk'

export const formatMsg = (msg) =>
  chalk`\n{blue gatsby-source-yotpo-shopify} ${msg}`

export const decodeShopifyId = (base64Id) => {
  const shopifyId = Buffer.from(base64Id, 'base64').toString('binary')
  const id = shopifyId.substr(shopifyId.lastIndexOf('/') + 1)
  return id
}

export const createNodeFactory = async (
  createNode,
  createNodeId,
  createContentDigest,
  data,
) => {
  const type = 'YotpoProduct'
  await createNode({
    ...data,
    id: createNodeId(`${type}-${data.productId}`),
    parent: null,
    children: [],
    internal: {
      type: type,
      content: JSON.stringify(data),
      contentDigest: createContentDigest(data),
    },
  })
  return
}
