import * as readYaml from 'read-yaml';

import { BranchCompare, createBranchCompare } from './get-file';

export const createDependencies = (filePath: string) => {
  new Dependencies(filePath)
}

export class Dependencies {
  map: any = {}
  opts: any = {}
  recursive: boolean
  filePath: string
  _compare: BranchCompare

  constructor(opts: any = {}) {
    this.opts = opts
    this.filePath = opts.filePath
    this.recursive = !!opts.recursive
    this.read()
  }

  read = (filePath = this.filePath) => {
    this.map = readYaml.sync(filePath);
    return this
  }

  get packageNames() {
    return Object.keys(this.map)
  }

  compare(opts = this.opts) {
    return createBranchCompare(opts)
  }


  comparePackageNames(opts: any) {
    return this.compare(opts).matchingDependencyModifications(...this.packageNames)
  }

  recursiveDependenciesFor(name: string, result = []): any[] {
    const dependencies = this.map[name]
    if (dependencies.length === 0) return result

    let visited = []
    const allDeps = dependencies.reduce((acc, name) => {
      if (!visited.includes(name)) {
        const deps = this.recursiveDependenciesFor(name).flat()
        visited.push(deps)
        visited = this.unique(visited)
        acc.push(deps)
      }
      return acc
    }, [])
    return this.unique(allDeps)
  }

  dependenciesFor(name: string) {
    return this.map[name]
  }

  unique(arr) {
    return Array.from(new Set(arr))
  }

  // override with: recursiveDependenciesFor
  impactedFor(name: string) {
    return this.recursive ? this.recursiveDependenciesFor(name) : this.dependenciesFor(name)
  }

  impacted(opts: any) {
    const matches = this.comparePackageNames(opts)
    const impacted = matches.reduce((acc, name) => {
      const dependencies = this.impactedFor(name).flat()
      acc.push(...dependencies)
      return acc
    }, [])
    return this.unique(impacted)
  }
}

