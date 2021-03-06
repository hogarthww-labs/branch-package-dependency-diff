import * as path from 'path'

import * as GitFileDownloader from 'git-file-downloader-v2';

import { ComparePackages } from './compare-dep';

export interface IBranchMap {
  master?: string
  compareBranch: string
}

export interface IFileDetails {
  filePath?: string
  folderPath?: string
}

export interface IBranchCompare {
  repository: string
  branchMap: IBranchMap
  fileDetails?: IFileDetails
  gitOpts?: any
}


export const createBranchCompare = (opts: IBranchCompare) => {
  return new BranchCompare(opts)
}

export class BranchCompare {
  repository: string
  fileMap: any = {}
  branchMap = {
    master: 'master'
  }
  filePath = 'package.json'
  gitOpts: any = {}
  provider = 'github'
  gitRemoteUrl: string

  constructor(opts: IBranchCompare) {
    const { repository, branchMap, fileDetails, gitOpts } = opts
    const { folderPath } = fileDetails
    let { filePath } = fileDetails
    this.repository = repository
    this.branchMap = {
      ...this.branchMap,
      ...branchMap
    }
    if (folderPath && !filePath) {
      filePath = path.join(folderPath, 'package.json')
    }
    this.filePath = filePath
    this.gitOpts = gitOpts || {}
    this.provider = gitOpts.provider || this.provider
    this.gitRemoteUrl = gitOpts.gitRemoteUrl || this.gitRemoteUrl
  }

  matchingDependencyModifications(...names: string[]) {
    return this.modifiedPackages.filter(name => names.includes(name))
  }

  get modifiedPackages() {
    return this.createComparePackages(this.fileMap).compare()
  }

  createComparePackages(fileMap: any) {
    return new ComparePackages(fileMap['master'], fileMap['compareBranch'])
  }

  setPackageFiles = async () => {
    await this.setFile('master')
    await this.setFile('compareBranch')
  }

  setFile = async (name) => {
    const result = await this.getFile({
      branch: this.branchMap[name]
    })
    if (result === '') {
      console.error('error retrieving master file')
      process.exit(1)
    }
    this.fileMap[name] = result
    return this
  }

  validate(opts) {
    if (!opts.branch) {
      throw new Error("getFile: Missing branch option")
    }
  }


  getFile = async (opts: any = {}) => {
    const { repository } = this
    const branch = opts.branch
    const gitOpts = this.gitOpts
    const provider = opts.provider || this.provider
    const getOpts = {
      repository,
      branch,
      provider,
      ...gitOpts,
      ...opts
    }
    this.validate(getOpts)
    return await this.downloadFileFromGit(getOpts)
  }

  createDownloader = (opts) => {
    const downloader = new GitFileDownloader(opts);
    opts.provider === 'github' && downloader.setGithubRawBaseUrl(opts.gitRemoteUrl)
    opts.provider === 'gitlab' && downloader.setGitlabRawBaseUrl(opts.gitRemoteUrl)
    return downloader
  }


  downloadFileFromGit = async (opts = {}): Promise<string>  => {
    const downloader = this.createDownloader({
        output: '.',
        ...opts,
    });
    try {
      return await downloader.run()
    } catch (err) {
      console.error(err);
      return ''
    }
  }
}


