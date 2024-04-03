class APIFeatures {
  //pass in the Tour.find() and the req.query
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  //1) Filter
  filter() {
    let queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((ele) => delete queryObj[ele]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|gte)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  //2) Sort
  sort() {
    if (!this.queryString.sort) {
      this.query = this.query.sort("-createdAt");
      return this;
    }
    let fields = this.queryString.sort.split(",").join(" ");
    this.query = this.query.sort(fields);
    return this;
  }
  //3) Limit: query.select()
  limit() {
    if (this.queryString.fields) {
      let fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
      return this;
    }
    return this;
  }
  //4) Pagination
  pagination() {
    if (this.queryString.page) {
      let limit = this.queryString.limit * 1 || 5;
      let page = this.queryString.page * 1; //page = 2 => 6-10
      let skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
      return this;
    }
    return this;
  }
}

module.exports = APIFeatures;
