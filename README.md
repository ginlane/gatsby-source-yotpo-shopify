# gatsby-source-yotpo-shopify

This source plugin allows you to access your Yotpo reviews and ratings through Gatsby's GraphQL queries. It first connects to a shopify storefront API to get all products. It then uses the individual [product review endpoint](https://apidocs.yotpo.com/reference#retrieve-reviews-for-a-specific-product) to query for each review. It then gets added as a `YotpoProduct` Node in gatsby.

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
        total_review
        average_score
        total_organic_reviews
        organic_average_score
        star_distribution
      }
      products {
        id
        domain_key
        name
        social_links
        embedded_widget_link
        testimonials_product_link
        product_link
        image_url
      }
      reviews {
        id
        score
        votes_up
        votes_down
        content
        title
        created_at
        verified_buyer
        sentiment
        product_id
        images_data {
          id
          thumb_url
          original_url
        }
        user {
          user_id
          social_image
          user_type
          is_social_connected
          display_name
        }
        comment {
          id
          content
          created_at
        }
      }
      product_id
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
