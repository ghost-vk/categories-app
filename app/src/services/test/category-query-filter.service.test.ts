import CategoryQueryFilterService from '../category-query-filter.service'

describe('Build category query filter', () => {
  test('Only name', () => {
    const params = { name: 'Express' }
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    expect(build).toEqual([
      null,
      {
        query: `SELECT * FROM category WHERE LOWER(name) = $1 ORDER BY created_date DESC LIMIT $2`,
        params: ['express', 2]
      }
    ])
  })

  test('Name with description', () => {
    const params = {
      name: 'Express Validator',
      description: 'Awesome tool'
    }

    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()

    expect(build).toEqual([
      null,
      {
        query: `SELECT * FROM category WHERE LOWER(name) = $1 AND LOWER(description) = $2 ORDER BY created_date DESC LIMIT $3`,
        params: ['express validator', 'awesome tool', 2]
      }
    ])
  })

  test('Active flag: 1', () => {
    const params = { active: 1 }
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    expect(build).toEqual(
      [
        null,
        {
          query: `SELECT * FROM category WHERE active = $1 ORDER BY created_date DESC LIMIT $2`,
          params: [true, 2]
        }
      ]
    )
  })

  test('Active flag: true', () => {
    const params = { active: true }
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    expect(build).toEqual(
      [
        null,
        {
          query: `SELECT * FROM category WHERE active = $1 ORDER BY created_date DESC LIMIT $2`,
          params: [true, 2]
        }
      ]
    )
  })

  test('Active flag: 0', () => {
    const params = { active: 0 }
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    expect(build).toEqual(
      [
        null,
        {
          query: `SELECT * FROM category WHERE active = $1 ORDER BY created_date DESC LIMIT $2`,
          params: [false, 2]
        }
      ]
    )
  })

  test('Active flag: false', () => {
    const params = { active: false }
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    expect(build).toEqual([
      null,
      {
        query: `SELECT * FROM category WHERE active = $1 ORDER BY created_date DESC LIMIT $2`,
        params: [false, 2]
      }
    ])
  })

  test('Passed name, description and search', () => {
    const params = {
      name: 'Silvano Diviny',
      description: 'Suspendisse potenti. In eleifend quam a odio.',
      search: 'habitasse platea'
    }
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    const searchParam = `%${params.search.toLowerCase()}%`
    expect(build).toEqual([
      null,
      {
        query: `SELECT * FROM category WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $2 OR LOWER(name) = $3 OR LOWER(description) = $4 ORDER BY created_date DESC LIMIT $5`,
        params: [
          searchParam,
          searchParam,
          params.name.toLowerCase(),
          params.description.toLowerCase(),
          2
        ]
      }
    ])
  })

  test('Replace "ё"', () => {
    const params = { search: 'Мёд' }
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    expect(build).toEqual([
      null,
      {
        query: `SELECT * FROM category WHERE REPLACE(LOWER(name), 'ё', 'е') LIKE $1 OR REPLACE(LOWER(description), 'ё', 'е') LIKE $2 ORDER BY created_date DESC LIMIT $3`,
        params: ['%мед%', '%мед%', 2]
      }
    ])
  })

  test('PageSize = 5', () => {
    const params = {
      name: 'express',
      pageSize: 5
    }
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    expect(build).toEqual([
      null,
      {
        query: `SELECT * FROM category WHERE LOWER(name) = $1 ORDER BY created_date DESC LIMIT $2`,
        params: ['express', 5]
      }
    ])
  })

  test('PageSize = 5, Page = 3', () => {
    const params = {
      name: 'express',
      pageSize: 5,
      page: 3
    }
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    expect(build).toEqual([
      null,
      {
        query: `SELECT * FROM category WHERE LOWER(name) = $1 ORDER BY created_date DESC LIMIT $2 OFFSET $3`,
        params: ['express', 5, 10]
      }
    ])
  })

  test('Sort by name (desc)', () => {
    const params = {
      name: 'express',
      sort: '-name'
    }
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    expect(build).toEqual([
      null,
      {
        query: `SELECT * FROM category WHERE LOWER(name) = $1 ORDER BY name DESC LIMIT $2`,
        params: ['express', 2]
      }
    ])
  })

  test('Sort by active (asc)', () => {
    const params = {
      name: 'express',
      sort: 'active'
    }
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    expect(build).toEqual(
      [
        null,
        {
          query: `SELECT * FROM category WHERE LOWER(name) = $1 ORDER BY active ASC LIMIT $2`,
          params: ['express', 2]
        }
      ])
  })

  test('Sort by description (asc)', () => {
    const params = {
      name: 'express',
      sort: 'description'
    }
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    expect(build).toEqual([null, {
      query: `SELECT * FROM category WHERE LOWER(name) = $1 ORDER BY description ASC LIMIT $2`,
      params: ['express', 2]
    }])
  })

  test('Empty params', () => {
    const params = {}
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    expect(build).toEqual([null, {
      query: `SELECT * FROM category ORDER BY created_date DESC LIMIT $1`,
      params: [2]
    }])
  })

  test('Undefined active flag', () => {
    const params = {
      name: 'Express',
      active: undefined
    }
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    expect(build).toEqual([{
      message: 'Error when construct query.',
      errors: ['Sort param "active" is not defined.']
    }, null])
  })

  test('Unavailable active flag', () => {
    const params = {
      name: 'Express',
      active: '000'
    }
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    expect(build).toEqual([
      {
        message: 'Error when construct query.',
        errors: [
          `Sort param "active" has unacceptable value ("000").`
        ]
      },
      null
    ])
  })

  test('Unavailable sort option', () => {
    const params = {
      name: 'Express',
      sort: '-spam'
    }
    const queryFilter = new CategoryQueryFilterService(params)
    const build = queryFilter.make()
    expect(build).toEqual([
      {
        message: 'Error when construct query.',
        errors: [`Sort by "-spam" not available.`]
      },
      null
    ])
  })
})
