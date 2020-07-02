# gatsby-source-yotpo-shopify

This plugin allows you to access your Yotpo reviews and ratings through Gatsby's GraphQL queries.

## Usage

```
yarn add gatsby-source-yotpo-shopify
```

Add the plugin to your `gatsby-config.js`

Add the credentials from [your store settings in Yotpo](https://yap.yotpo.com/#/header/account_settings/store_settings) and the [Shopify Storefront API][shopify-storefront-api].
The storefront token should have the following permissions:

- Read products, variants, and collections

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

## Querying for Data

In your page queries, you can query for data like so:

```graphql
{
  reviews: allYotpoReviews {
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
      reviews: {
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

For a full list of fields and descriptions of each, see the [Yotpo documentation](https://apidocs.yotpo.com/reference#introduction).
