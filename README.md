# gatsby-source-yotpo-shopify

This source plugin allows you to access your Yotpo reviews and ratings, and questions and answers through Gatsby's GraphQL queries. It first connects to a shopify storefront API to get all products. It uses the individual [product review endpoint](https://apidocs.yotpo.com/reference#retrieve-reviews-for-a-product) to query for each review. It then uses the [product Q&A endpoint](https://apidocs.yotpo.com/reference#retrieve-questions-and-answers-for-a-product) to query for each question along with its answers. Finally the `YotpoProduct` Node gets added so it can be queried in gatsby.

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

## Local Dev

In order to test changes to the package, you’ll need to setup a link between this repo and your app. It’s simple:

- Run `yarn build && yarn link` in this the root of this repo
- Copy the output and paste it into the root of your app’s repo

NOTE: Any changes you make here will require a `yarn build` in order to be reflected in your app.

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
      questions {
        id
        content
        createdAt
        userType
        asker {
          badges {
            description
            id
            image100
            image300
            name
          }
          id
          displayName
          email
          isSocialConnected
          score
          slug
          socialImage
        }
        sortedPublicAnswers {
          id
          content
          isStoreOwnerComment_
          votesUp
          votesDown
          createdAt
          answerer {
            id
            displayName
            isSocialConnected
            score
            slug
            socialImage
          }
        }
      }
      productId
      totalAnswers
      totalQuestions
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

or for individual YotpoProduct questions

```graphql
{
  yotpoProduct(productId: { eq: $shopifyProductId }) {
    questions {
      id
      content
      createdAt
      userType
      asker {
        badges {
          description
          id
          image100
          image300
          name
        }
        id
        displayName
        email
        isSocialConnected
        score
        slug
        socialImage
      }
      sortedPublicAnswers {
        id
        content
        isStoreOwnerComment_
        votesUp
        votesDown
        createdAt
        answerer {
          id
          displayName
          isSocialConnected
          score
          slug
          socialImage
        }
      }
    }
    productId
    totalAnswers
    totalQuestions
  }
}
```

For a full list of fields and descriptions of each, see the [Yotpo documentation](https://apidocs.yotpo.com/reference#introduction).
