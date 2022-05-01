type queryBuildError = {
  message: string,
  errors: string[]
} | null

type queryBuildResult = {
  query: string,
  params: any[]
} | null

export type queryBuild = [
  queryBuildError,
  queryBuildResult
]
