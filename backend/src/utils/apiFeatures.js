// Reusable class for search, filter, sort, paginate — used in product listing
class ApiFeatures {
  constructor(prismaModel, queryString) {
    this.model = prismaModel;
    this.query = queryString;
    this.where = {};
    this.options = {};
  }

  search() {
    if (this.query.keyword) {
      this.where.OR = [
        { name:        { contains: this.query.keyword, mode: 'insensitive' } },
        { description: { contains: this.query.keyword, mode: 'insensitive' } },
      ];
    }
    return this;
  }

  filter() {
    const { minPrice, maxPrice, categoryId, rating } = this.query;
    if (minPrice || maxPrice) {
      this.where.price = {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) }),
      };
    }
    if (categoryId) this.where.categoryId = categoryId;
    if (rating)     this.where.rating = { gte: parseFloat(rating) };
    this.where.isActive = true;
    return this;
  }

  sort() {
    const sortMap = {
      price_asc:   { price: 'asc' },
      price_desc:  { price: 'desc' },
      rating_desc: { rating: 'desc' },
      newest:      { createdAt: 'desc' },
    };
    this.options.orderBy = sortMap[this.query.sort] ?? { createdAt: 'desc' };
    return this;
  }

  paginate() {
    const page  = parseInt(this.query.page)  || 1;
    const limit = parseInt(this.query.limit) || 12;
    this.options.skip = (page - 1) * limit;
    this.options.take = limit;
    this.currentPage = page;
    this.limit = limit;
    return this;
  }

  async execute() {
    const [data, total] = await Promise.all([
      this.model.findMany({
        where: this.where,
        ...this.options,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images:   { where: { isPrimary: true }, take: 1 },
        },
      }),
      this.model.count({ where: this.where }),
    ]);

    return {
      data,
      total,
      page:       this.currentPage,
      limit:      this.limit,
      totalPages: Math.ceil(total / this.limit),
    };
  }
}

module.exports = ApiFeatures;