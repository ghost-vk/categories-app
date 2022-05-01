import { acceptedParams } from '@src/types/accepted-params'
import { queryBuild } from '@src/types/query-build'

// type ErrorMessages = string[]

type CombinationFlag = 'AND ' | 'OR '

class CategoryQueryFilterService {
  private filterParams: acceptedParams
  query: string = 'SELECT * FROM category'
  queryParamsIndex: number = 1
  nameDescriptionCombinationFlag: CombinationFlag = 'AND '
  conditions: string[] = []
  queryParams: any[] = []
  pageSize: number = 2
  errors: string[] = []

  constructor(queryParams: acceptedParams) {
    this.filterParams = queryParams
  }

  public make(): queryBuild {
    this.handleSearch()
    this.handleName()
    this.handleDescription()
    this.handleActiveParam()
    this.joinConditions()
    this.handleSort()
    this.handlePageSize()
    this.handleCurrentPage()

    return this.getResult()
  }

  private getResult(): queryBuild {
    if (this.hasErrors()) {
      return [
        this.getErrors(),
        null
      ]
    }

    return [
      null,
      {
        query: this.query,
        params: this.queryParams
      }
    ]
  }

  private hasErrors() {
    return this.errors.length > 0
  }

  private getErrors() {
    return {
      message: 'Error when construct query.',
      errors: this.errors
    }
  }

  private incrementIndex(): void {
    this.queryParamsIndex += 1
  }

  private addCondition(condition: string): void {
    this.conditions.push(condition)
  }

  private addQueryParam(param: any): void {
    this.queryParams.push(param)
  }

  private addError(message: string) {
    this.errors.push(message)
  }

  public hasConditions() {
    return this.conditions.length > 0
  }

  private hasEE(lowerQueryParam: string) {
    return /[её]/.test(lowerQueryParam)
  }

  private replaceQueryParamWithEE(lowerQueryParam: string): string {
    return lowerQueryParam.replace(/ё/g, 'е')
  }

  private replaceConditionWithEE(condition: string): string {
    return `REPLACE(${condition}, 'ё', 'е')`
  }

  private handleSearch(): void {
    if (!this.filterParams.search) return

    this.nameDescriptionCombinationFlag = 'OR '

    let searchParam = this.filterParams.search.toLowerCase()
    let nameCondition = 'LOWER(name)'
    let descriptionCondition = 'LOWER(description)'

    if (this.hasEE(this.filterParams.search)) {
      searchParam = this.replaceQueryParamWithEE(searchParam)
      nameCondition = this.replaceConditionWithEE(nameCondition)
      descriptionCondition = this.replaceConditionWithEE(descriptionCondition)
    }

    this.addCondition(`${nameCondition} LIKE $${this.queryParamsIndex}`)
    this.addQueryParam(`%${searchParam}%`)
    this.incrementIndex()

    this.addCondition(`OR ${descriptionCondition} LIKE $${this.queryParamsIndex}`)
    this.addQueryParam(`%${searchParam}%`)
    this.incrementIndex()
  }

  private handleName(): void {
    if (!this.filterParams.name) return

    let start = this.hasConditions() ? 'OR ' : ''

    let nameParam = this.filterParams.name.toLowerCase()
    let nameCondition = 'LOWER(name)'

    if (this.hasEE(nameParam)) {
      nameParam = this.replaceQueryParamWithEE(nameParam)
      nameCondition = this.replaceConditionWithEE(nameCondition)
    }

    this.addCondition(`${start}${nameCondition} = $${this.queryParamsIndex}`)
    this.addQueryParam(nameParam)
    this.incrementIndex()
  }

  private handleDescription(): void {
    if (!this.filterParams.description) return

    const start = this.hasConditions() ? this.nameDescriptionCombinationFlag : ''

    let descParam = this.filterParams.description.toLowerCase()
    let descriptionCondition = 'LOWER(description)'

    if (this.hasEE(descParam)) {
      descParam = this.replaceQueryParamWithEE(descParam)
      descriptionCondition = this.replaceConditionWithEE(descriptionCondition)
    }

    this.addCondition(`${start}${descriptionCondition} = $${this.queryParamsIndex}`)
    this.addQueryParam(descParam)
    this.incrementIndex()
  }

  private getActiveFlag(statement: string): boolean | null {
    const activeFlag = ['1', 'true'].includes(statement)
      ? true
      : ['0', 'false'].includes(statement)
        ? false
        : null

    return activeFlag
  }

  private handleActiveParam(): void {
    if (!this.filterParams.hasOwnProperty('active')) return

    const activeParamToString = this.filterParams.active?.toString().toLowerCase()

    if (!activeParamToString) {
      return this.addError('Sort param "active" is not defined.')
    }

    const activeFlag = this.getActiveFlag(activeParamToString)

    if (activeFlag === null) {
      return this.addError(
        `Sort param "active" has unacceptable value ("${this.filterParams.active}").`
      )
    }

    let start = this.hasConditions() ? 'AND ' : ''
    this.addCondition(`${start}active = $${this.queryParamsIndex}`)
    this.addQueryParam(activeFlag)
    this.incrementIndex()
  }

  private joinConditions(): void {
    if (!this.hasConditions()) return

    this.query += ' WHERE '
    this.query += this.conditions.join(' ')
  }

  private handleSort(): void {
    if (!this.filterParams.sort) {
      this.query += ' ORDER BY created_date DESC'
      return
    }

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

    if (!availableSortOptions.includes(this.filterParams.sort)) {
      this.addError(`Sort by "${this.filterParams.sort}" not available.`)
    }

    const orderDirection = this.filterParams.sort.startsWith('-') ? 'DESC' : 'ASC'
    let sortParam = this.filterParams.sort.replace('-', '')
    sortParam = sortParam !== 'createdDate' ? sortParam : 'created_date'

    this.query += ` ORDER BY ${sortParam} ${orderDirection}`
  }

  private handlePageSize(): void {
    const pageSizeNum = Number(this.filterParams.pageSize)
    if (pageSizeNum > 2) {
      this.pageSize = pageSizeNum
    }

    this.query += ` LIMIT $${this.queryParamsIndex}`
    this.addQueryParam(this.pageSize)
    this.incrementIndex()
  }

  private handleCurrentPage(): void {
    if (!this.filterParams.page) return

    const offset = (Number(this.filterParams.page) - 1) * this.pageSize

    if (offset > 0) {
      this.query += ` OFFSET $${this.queryParamsIndex}`
      this.addQueryParam(offset)
      this.incrementIndex()
    }
  }
}

export default CategoryQueryFilterService
