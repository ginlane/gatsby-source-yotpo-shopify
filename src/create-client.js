import { GraphQLClient } from 'graphql-request'

export const createShopifyClient = ({
  shopName,
  shopifyAccessToken,
  apiVersion,
}) => {
  let url
  if (shopName.includes(`.`)) {
    url = `https://${shopName}/api/${apiVersion}/graphql.json`
  } else {
    url = `https://${shopName}.myshopify.com/api/${apiVersion}/graphql.json`
  }
  return new GraphQLClient(url, {
    headers: {
      'X-Shopify-Storefront-Access-Token': shopifyAccessToken,
    },
  })
}
