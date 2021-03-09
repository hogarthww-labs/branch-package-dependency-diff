# branch-package-dependency-diff

## Binary

`config.yaml` file

```yaml
dependenciesFile: ./sample/dependency-map.yml
repository: mylabs/integrator
packageFilePath: ./package.json
inverseFilter: -lib
```

Set environment variable for `GITHUB_AUTH_TOKEN`

`$ export GITHUB_AUTH_TOKEN="<token>"`

Run `dep-diff` binary

`$ ./bin/dep-diff --base https://github.labs.com  --compareBranch release/0.2.7 -c config.yaml`

## API usage

Generate a package dependency diff between 2 `package.json` files in 2 separate  branches

```js
import { createBranchCompare } from 'branch-package-dependency-diff'

const repository = 'mylabs/integrator'
const gitRemoteUrl = 'https://github.labs.com'
const branchMap = {
  compareBranch: 'release/0.2.7'
}
const fileDetails = {
  filePath: 'apps/app/collection/soft-package.json'
}
const gitOpts = {
  gitRemoteUrl,
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

The `dependency-map.yml` could look sth like this.

```yaml
lib-common:
  - lib-form-widgets
  - lib-navbar
  - lib-share
  - lib-permission
  - lib-metadata
  - lib-itemlist
  - asset
lib-form-widgets:
  - lib-navbar
  - lib-share
  - lib-metadata
  - lib-item-list
  - asset
lib-navbar:
  - admin
  - asset
lib-share:
  - asset
lib-permission:
  - lib-share
  - lib-navbar
  - admin
lib-metadata:
  - asset
lib-item-list:
  - asset
```

With `recursive` option enabled the dependencies will be resolved recursively so that we can optimize the mapping file as follows:

```yaml
lib-common:
  - lib-form-widgets
  - lib-permission
lib-form-widgets:
  - lib-navbar
  - lib-share
  - lib-metadata
  - lib-item-list
lib-navbar:
  - admin
  - asset
lib-share:
  - asset
lib-permission:
  - lib-share
  - lib-navbar
lib-metadata:
  - asset
lib-item-list:
  - asset
```
