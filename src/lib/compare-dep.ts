import * as depDiff from 'dependency-diff'

export class ComparePackages {
  constructor(public masterPackage: string, public branchPackage: string) {
  }

  compare = () => {
    const { editedDeps } = this
    return editedDeps.map(dep => dep.name)
  }

  get editedDeps() {
    return this.dependencyOperations.filter(dep => dep.operation === 'edit')
  }

  get dependencyOperations() {
    const { masterPackage, branchPackage } = this
    return depDiff().left(masterPackage).right(branchPackage).toObject()
  }
}


