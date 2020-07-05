# gatsby-source-yotpo-shopify

This source plugin allows you to access your Yotpo reviews and ratings through Gatsby's GraphQL queries. It first connects to a shopify storefront API to get all products. It then uses the individual [product review endpoint](https://apidocs.yotpo.com/reference#retrieve-reviews-for-a-specific-product) to query for each review. Finally the `YotpoProduct` Node gets added so it can be queried in gatsby.

This source plugin caters for a specific use case where reviews are set as both `Product` and `Site` inside the yotpo admin. If you use the [all reviews endpoint](https://apidocs.yotpo.com/reference#retrieve-all-reviews) the sku is randomly selected to be either a product sku or `site_review`. This means you can't query for all reviews, just a subset of reviews.

## Usage

```
yarn add gatsby-source-yotpo-shopify
```

Add the plugin to your `gatsby-config.js`

Add the credentials from [your store settings in Yotpo](https://yap.yotpo.com/#/header/account_settings/store_settings) and the [Shopify Storefront API](https://shopify.dev/docs/storefront-api/getting-started).
The storefront token should have the following permissions:

- Read products, variants, and collections

```
  plugins: [
    {
      resolve: 'gatsby-source-yotpo-shopify',
      options: {
      shopName: SHOPIFY_STORE_NAME,
      shopifyAccessToken: SHOPIFY_ACCESS_TOKEN,
      yotpoAppKey: YOTPO_APP_KEY,
      },
    },
  ]
```

## Querying for Data

In your page queries, you can query for data like so:

```graphql
{
  allYotpoProduct {
    nodes {
      id
      pagination
      bottomline {
        totalReview
        averageScore
        totalOrganicReviews
        organicAverageScore
        starDistribution
      }
      products {
        id
        domainKey
        name
        socialLinks
        embeddedWidgetLink
        testimonialsProductLink
        productLink
        imageUrl
      }
      reviews {
        id
        score
        votesUp
        votesDown
        content
        title
        createdAt
        verifiedBuyer
        sentiment
        productId
        imagesData {
          id
          thumbUrl
          originalUrl
        }
        user {
          userId
          socialImage
          userType
          isSocialConnected
          displayName
        }
        comment {
          id
          content
          createdAt
        }
      }
      productId
    }
  }
}
```

or for individual YotpoProduct reviews

```graphql
{
  yotpoProduct(productId: { eq: $shopifyProductId }) {
    bottomline {
      totalReview
      averageScore
    }
    reviews {
      id
      title
      content
      score
      sentiment
      votesUp
      votesDown
      createdAt
      user {
        displayName
        userType
      }
    }
    productId
  }
}
```

For a full list of fields and descriptions of each, see the [Yotpo documentation](https://apidocs.yotpo.com/reference#introduction).
