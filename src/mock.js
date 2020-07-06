export const mockYotpoResponse = {
  pagination: {
    page: 1,
    perPage: 150,
    total: 1,
  },
  bottomline: {
    totalReview: 1,
    averageScore: 4.90385,
    totalOrganicReviews: 0,
    organicAverageScore: 0,
    starDistribution: {
      _1: 0,
      _2: 0,
      _3: 0,
      _4: 0,
      _5: 1,
    },
  },
  products: [
    {
      id: 1,
      domainKey: "1",
      name: "test",
      socialLinks: {
        linkedin: "",
        facebook: "",
        twitter: "",
        googleOauth2: "",
      },
      embeddedWidgetLink: "",
      testimonialsProductLink: "",
      productLink: "",
      imageUrl: "",
    },
  ],
  reviews: [
    {
      id: 1,
      score: 5,
      votesUp: 0,
      votesDown: 0,
      content: "test",
      title: "test",
      createdAt: "2020-06-29T10:26:41.000Z",
      verifiedBuyer: true,
      sentiment: 0.951626,
      productId: 1,
      imagesData: [
        {
          id: 1,
          thumbUrl: "test",
          originalUrl: "test",
        },
      ],
      user: {
        userId: 1,
        socialImage: "test",
        userType: "test",
        isSocialConnected: 0,
        displayName: "test",
      },
      comment: {
        id: 1,
        content: "test",
        createdAt: "2020-06-29T10:26:41.000Z",
      },
    },
  ],
  productId: "mock",
};
