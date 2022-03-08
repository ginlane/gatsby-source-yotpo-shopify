import { getReviews, getShopifyProducts } from './fetch'
import nock from 'nock'
import dedent from 'dedent'

describe('fetch', () => {
  describe('.getShopifyProducts', () => {
    it('gets the products', async () => {
      const mockShopifyGraphQlClient = {
        request: jest.fn(),
      }

      const shopifyResponse = {
        products: {
          pageInfo: {
            hasNextPage: false,
          },
          edges: [
            {
              node: {
                id: 'id1',
              },
              cursor: 'cursor-1',
            },
            {
              node: {
                id: 'id2',
              },
              cursor: 'cursor-2',
            },
          ],
        },
      }

      mockShopifyGraphQlClient.request.mockResolvedValue(shopifyResponse)

      const products = await getShopifyProducts({
        shopifyClient: mockShopifyGraphQlClient,
      })

      expect(products).toEqual([{ id: 'id1' }, { id: 'id2' }])

      const graphQlQuery = mockShopifyGraphQlClient.request.mock.calls[0][0]
      expect(dedent(graphQlQuery)).toEqual(
        dedent(
          `{
        products( first: 250) {
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
        ),
      )
    })

    it('gets multiple pages of products', async () => {
      const mockShopifyGraphQlClient = {
        request: jest.fn(),
      }

      const shopifyFirstPageResponse = {
        products: {
          pageInfo: {
            hasNextPage: true,
          },
          edges: [
            {
              node: {
                id: 'id1',
              },
              cursor: 'cursor-1',
            },
            {
              node: {
                id: 'id2',
              },
              cursor: 'cursor-2',
            },
          ],
        },
      }

      const shopifySecondPageResponse = {
        products: {
          pageInfo: {
            hasNextPage: false,
          },
          edges: [
            {
              node: {
                id: 'id3',
              },
              cursor: 'cursor-3',
            },
            {
              node: {
                id: 'id4',
              },
              cursor: 'cursor-4',
            },
          ],
        },
      }

      mockShopifyGraphQlClient.request
        .mockResolvedValueOnce(shopifyFirstPageResponse)
        .mockResolvedValueOnce(shopifySecondPageResponse)

      const products = await getShopifyProducts({
        shopifyClient: mockShopifyGraphQlClient,
      })

      expect(mockShopifyGraphQlClient.request).toHaveBeenCalledTimes(2)
      expect(products).toEqual([
        { id: 'id1' },
        { id: 'id2' },
        { id: 'id3' },
        { id: 'id4' },
      ])

      const firstGraphQlQuery =
        mockShopifyGraphQlClient.request.mock.calls[0][0]
      expect(dedent(firstGraphQlQuery)).toEqual(
        dedent(
          `{
        products( first: 250) {
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
        ),
      )

      const secondGraphQlQuery =
        mockShopifyGraphQlClient.request.mock.calls[1][0]
      expect(dedent(secondGraphQlQuery)).toEqual(
        dedent(
          `{
        products( first: 250, after: "cursor-2") {
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
        ),
      )
    })
  })

  describe('.getReviews', () => {
    const yotpoBaseUrl = 'https://api-cdn.yotpo.com'
    const yotpoReviewUrl = '/v1/widget/appKey/products/productId/reviews.json'

    it('gets reviews from Yotpo', async () => {
      nock(yotpoBaseUrl)
        .get(yotpoReviewUrl)
        .query({
          per_page: 100,
          page: 1,
        })
        .reply(200, {
          status: {
            code: 200,
            message: 'OK',
          },
          response: {
            pagination: {
              page: 1,
              per_page: 10,
              total: 9,
            },
            bottomline: {
              total_review: 11,
              average_score: 4.81818,
            },
            products: [{ productId: 1 }],
            product_tag: [],
            reviews: [{ reviewId: 1 }],
          },
        })

      const reviews = await getReviews({
        productIds: ['productId'],
        yotpoAppKey: 'appKey',
        yotpoPerPage: 100,
      })

      const expected = {
        bottomline: {
          total_review: 11,
          average_score: 4.81818,
        },
        products: [{ productId: 1 }],
        reviews: [{ reviewId: 1 }],
        productId: 'productId',
      }

      expect(reviews).toEqual([expected])
    })

    it('gets reviews for multiple products', async () => {
      const product1Response = {
        status: {
          code: 200,
          message: 'OK',
        },
        response: {
          pagination: {
            page: 1,
            per_page: 10,
            total: 9,
          },
          bottomline: {
            total_review: 11,
            average_score: 4.81818,
          },
          products: [{ productId: 1 }],
          product_tag: [],
          reviews: [{ reviewId: 1 }],
        },
      }

      const product2Response = {
        status: {
          code: 200,
          message: 'OK',
        },
        response: {
          pagination: {
            page: 1,
            per_page: 10,
            total: 9,
          },
          bottomline: {
            total_review: 1,
            average_score: 5,
          },
          products: [{ productId: 5 }],
          product_tag: [],
          reviews: [{ reviewId: 3 }],
        },
      }

      nock(yotpoBaseUrl)
        .get(yotpoReviewUrl)
        .query({
          per_page: 100,
          page: 1,
        })
        .reply(200, product1Response)
        .get('/v1/widget/appKey/products/otherProduct/reviews.json')
        .query({
          per_page: 100,
          page: 1,
        })
        .reply(200, product2Response)

      const reviews = await getReviews({
        productIds: ['productId', 'otherProduct'],
        yotpoAppKey: 'appKey',
        yotpoPerPage: 100,
      })

      const expected1 = {
        bottomline: {
          total_review: 11,
          average_score: 4.81818,
        },
        products: [{ productId: 1 }],
        reviews: [{ reviewId: 1 }],
        productId: 'productId',
      }

      const expected2 = {
        bottomline: {
          total_review: 1,
          average_score: 5,
        },
        products: [{ productId: 5 }],
        reviews: [{ reviewId: 3 }],
        productId: 'otherProduct',
      }

      expect(reviews).toEqual([expected1, expected2])
    })

    it('concatenates reviews from multiple pages', async () => {
      const firstPageResponse = {
        status: {
          code: 200,
          message: 'OK',
        },
        response: {
          pagination: {
            page: 1,
            per_page: 2,
            total: 6,
          },
          bottomline: {
            total_review: 11,
            average_score: 4.81818,
          },
          products: [{ productId: 1 }],
          product_tag: [],
          reviews: [{ reviewId: 1 }, { reviewId: 2 }],
        },
      }
      const secondPageResponse = {
        status: {
          code: 200,
          message: 'OK',
        },
        response: {
          pagination: {
            page: 2,
            per_page: 2,
            total: 6,
          },
          bottomline: {
            total_review: 11,
            average_score: 4.81818,
          },
          products: [{ productId: 1 }],
          product_tag: [],
          reviews: [{ reviewId: 3 }, { reviewId: 4 }],
        },
      }
      const thirdPageResponse = {
        status: {
          code: 200,
          message: 'OK',
        },
        response: {
          pagination: {
            page: 3,
            per_page: 2,
            total: 6,
          },
          bottomline: {
            total_review: 11,
            average_score: 4.81818,
          },
          products: [{ productId: 1 }],
          product_tag: [],
          reviews: [{ reviewId: 5 }, { reviewId: 6 }],
        },
      }

      nock(yotpoBaseUrl)
        .get(yotpoReviewUrl)
        .query({
          per_page: 2,
          page: 1,
        })
        .reply(200, firstPageResponse)
        .get(yotpoReviewUrl)
        .query({
          per_page: 2,
          page: 2,
        })
        .reply(200, secondPageResponse)
        .get(yotpoReviewUrl)
        .query({
          per_page: 2,
          page: 3,
        })
        .reply(200, thirdPageResponse)

      const reviewResponse = await getReviews({
        productIds: ['productId'],
        yotpoAppKey: 'appKey',
        yotpoPerPage: 2,
      })

      const expected = {
        bottomline: {
          total_review: 11,
          average_score: 4.81818,
        },
        products: [{ productId: 1 }],
        reviews: [
          { reviewId: 1 },
          { reviewId: 2 },
          { reviewId: 3 },
          { reviewId: 4 },
          { reviewId: 5 },
          { reviewId: 6 },
        ],
        productId: 'productId',
      }

      expect(reviewResponse).toEqual([expected])
    })
  })
})
