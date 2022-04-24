import { acceptedParams } from '@src/types/accepted-params'
import { queryBuild } from '@src/types/query-build'

export const buildCategoryQueryFilter = (queryParams: acceptedParams): queryBuild | string => {
  let queryResult = 'SELECT * FROM category'

  const conditions = []
  const params = []
  let idx = 1
  let nameDescCombinationFlag = 'AND '

  if (queryParams.search) {
    nameDescCombinationFlag = 'OR '

    let searchParam = queryParams.search.toLowerCase()
    let name = 'LOWER(name)'
    let description = 'LOWER(description)'

    if (/[её]/.test(queryParams.search)) {
      searchParam = searchParam.replace(/ё/g, 'е')
      name = "REPLACE(LOWER(name), 'ё', 'е')"
      description = "REPLACE(LOWER(description), 'ё', 'е')"
    }

    conditions.push(`${name} LIKE $${idx}`)
    params.push(`%${searchParam}%`)
    idx += 1

    conditions.push(`OR ${description} LIKE $${idx}`)
    params.push(`%${searchParam}%`)
    idx += 1
  }

  if (queryParams.name) {
    let start = conditions.length > 0 ? 'OR ' : ''

    let nameParam = queryParams.name.toLowerCase()
    let name = 'LOWER(name)'
    if (/[её]/.test(queryParams.name)) {
      nameParam = nameParam.replace(/ё/g, 'е')
      name = "REPLACE(LOWER(name), 'ё', 'е')"
    }

    conditions.push(`${start}${name} = $${idx}`)
    params.push(nameParam)
    idx += 1
  }

  if (queryParams.description) {
    let start = conditions.length > 0 ? nameDescCombinationFlag : ''

    let descParam = queryParams.description.toLowerCase()
    let description = 'LOWER(description)'
    if (/[её]/.test(queryParams.description)) {
      descParam = descParam.replace(/ё/g, 'е')
      description = "REPLACE(LOWER(description), 'ё', 'е')"
    }

    conditions.push(`${start}${description} = $${idx}`)
    params.push(descParam)
    idx +=1
  }

  if (queryParams.hasOwnProperty('active')) {
    const activeParamToString = queryParams.active?.toString().toLowerCase()

    if (!activeParamToString) return 'Sort param "active" is not defined.'

    const activeFlag = ['1', 'true'].includes(activeParamToString)
      ? true
      : ['0', 'false'].includes(activeParamToString)
        ? false
        : null

    if (activeFlag !== null) {
      let start = conditions.length > 0 ? 'AND ' : ''
      conditions.push(`${start}active = $${idx}`)
      params.push(activeFlag)
      idx +=1
    } else {
      return `Sort param "active" has unacceptable value (${queryParams.active}).`
    }
  }

  if (conditions.length > 0) {
    queryResult += ' WHERE '
    queryResult += conditions.join(' ')
  }

  if (queryParams.sort) {
    const availableSortOptions = [
      'name',
      '-name',
      'description',
      '-description',
      'active',
      '-active',
      'createdDate',
      '-createdDate'
    ]

    if (!availableSortOptions.includes(queryParams.sort)) {
      throw new Error(`Sort by '${queryParams.sort}' not available`)
    }

    const direction = queryParams.sort.startsWith('-') ? 'DESC' : 'ASC'
    let sortParam = queryParams.sort.replace('-', '')
    sortParam = sortParam !== 'createdDate' ? sortParam : 'created_date'

    queryResult += ' COLLATE "C"'
    queryResult += ` ORDER BY ${sortParam} ${direction}`
  } else {
    queryResult += ' ORDER BY created_date DESC'
  }

  const pageSize = Number(queryParams.pageSize) > 0 ? queryParams.pageSize : 2
  queryResult += ` LIMIT $${idx}`
  params.push(pageSize)
  idx += 1

  if (queryParams.page) {
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 2
    const offset = (Number(queryParams.page) - 1) * pageSize

    if (offset > 0) {
      queryResult += ` OFFSET $${idx}`
      params.push(offset)
      // idx += 1
    }
  }

  return {
    query: queryResult,
    params
  }
}
