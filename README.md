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

const compare = createBranchCompare({
  repository,
  branchMap,
  fileDetails,
  gitOpts
})
const packages = ['@x5/common-lib', '@x5/permission-lib']

const matches = compare.matchingDependencyModifications(packages)
```

Calculate uniquely impacted packages from library changes detected.

```js
const compareOpts = {
  repository,
  branchMap,
  fileDetails,
  gitOpts
}
const filePath = './sample/dependency-map.yml'
const dependencies = createDependencies({filePath, recursive: true})
const impacted = dependencies.impacted(compareOpts)

// app name is any name that is not a lib name
const appName = name => !name.includes('-lib')
const appsImpacted = impacted.filter(appName)
```
