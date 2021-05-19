import { getReviews } from './fetch'
import nock from 'nock'
import { mockYotpoReviewResponse } from '../testData'
import v8 from 'v8'

const deepClone = obj => {
  return v8.deserialize(v8.serialize(obj));
};

describe('fetch', () => {
  describe('.getReviews', () => {
    const yotpoBaseUrl = 'https://api.yotpo.com'
    const yotpoReviewUrl = '/v1/widget/appKey/products/productId/reviews.json'

    it('gets reviews from Yotpo', async () => {
      nock(yotpoBaseUrl)
        .get(yotpoReviewUrl)
        .query({
          per_page: 100,
          page: 1
        })
        .reply(200, mockYotpoReviewResponse)

      const reviews = await getReviews({productIds: ['productId'], yotpoAppKey: 'appKey', yotpoPerPage: 100})

      const expected = {
        products: mockYotpoReviewResponse.response.products,
        reviews: mockYotpoReviewResponse.response.reviews,
        bottomline: mockYotpoReviewResponse.response.bottomline,
        productId: 'productId'
      }

      expect(reviews).toEqual([expected])
    })

    it('concatenates reviews from multiple pages', async () => {
      const firstPageResponse = deepClone(mockYotpoReviewResponse)
      const secondPageResponse = deepClone(mockYotpoReviewResponse)
      const thirdPageResponse = deepClone(mockYotpoReviewResponse)
      const expectedReviews = [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}]

      firstPageResponse.response.pagination = {
        "page": 1,
        "per_page": 2,
        "total": 6
      }

      firstPageResponse.response.reviews = [ {id: 1}, {id: 2} ]

      secondPageResponse.response.pagination = {
        "page": 2,
        "per_page": 2,
        "total": 6
      }
      secondPageResponse.response.reviews = [ {id: 3}, {id: 4} ]

      thirdPageResponse.response.pagination = {
        "page": 3,
        "per_page": 2,
        "total": 6
      }
      thirdPageResponse.response.reviews = [ {id: 5}, {id: 6} ]

      nock(yotpoBaseUrl)
        .get(yotpoReviewUrl)
        .query({
          per_page: 2,
          page: 1
        })
        .reply(200, firstPageResponse)

      nock(yotpoBaseUrl)
      .get(yotpoReviewUrl)
      .query({
        per_page: 2,
        page: 2
      })
      .reply(200, secondPageResponse)

      nock(yotpoBaseUrl)
      .get(yotpoReviewUrl)
      .query({
        per_page: 2,
        page: 3
      })
      .reply(200, thirdPageResponse)

      const reviewResponse = await getReviews({productIds: ['productId'], yotpoAppKey: 'appKey', yotpoPerPage: 2})

      const expected = {
        products: mockYotpoReviewResponse.response.products,
        reviews: expectedReviews,
        bottomline: mockYotpoReviewResponse.response.bottomline,
        productId: 'productId'
      }

      expect(reviewResponse).toEqual([expected])
    })
  })
})