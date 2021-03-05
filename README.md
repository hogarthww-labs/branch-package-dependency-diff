# branch-package-dependency-diff

Generate a package dependency diff between 2 `package.json` files in 2 separate  branches

```js
import { createBranchCompare } from 'branch-package-dependency-diff'

const repository = 'https://github.labs.com/mylabs/integrator'
const branchMap = {
  compareBranch: 'release/0.2.7'
}
const fileDetails = {
  filePath: 'apps/app/collection/soft-package.json'
}
const gitOpts = {
  oauth2_token: process.env.GITHUB_AUTH_TOKEN
}

const compare = createBranchCompare(
  repository,
  branchMap,
  fileDetails,
  gitOpts
)
const packages = ['@x5/common-lib', '@x5/permission-lib']

const matches = compare.matchingDependencyModifications(packages)
```

Calculate uniquely impacted packages from library changes detected.

```js
import * as readYaml from 'read-yaml';
const dependencyMap = readYaml.sync('./sample/dependency-map.yml');
const packageNames = Object.keys(dependencyMap)

// ...
const matches = compare.matchingDependencyModifications(packageNames)

const impacted = matches.reduce((acc, name) => {
  acc.push(...dependencyMap[name])
  return acc
}, [])

const uniqueImpacted = Array.from(new Set(impacted))
```
