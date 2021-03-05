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

export const createBranchCompare = (repository: string, branchMap: IBranchMap, fileDetails: IFileDetails = {}, gitOpts = {}) => {
  return new BranchCompare(repository, branchMap, fileDetails, gitOpts)
}

export class BranchCompare {
  fileMap: any = {}
  branchMap = {
    master: 'master'
  }
  filePath = 'package.json'
  gitOpts: any = {}

  constructor(public repository: string, branchMap: IBranchMap, fileDetails: IFileDetails = {}, gitOpts: any = {}) {
    const { folderPath } = fileDetails
    let { filePath } = fileDetails
    this.branchMap = {
      ...this.branchMap,
      ...branchMap
    }
    if (folderPath && !filePath) {
      filePath = path.join(folderPath, 'package.json')
    }
    this.filePath = filePath
    this.gitOpts = gitOpts
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

  getFile = async (opts: any = {}) => {
    const { repository } = this
    const branch = opts.branch
    const gitOpts = this.gitOpts
    const provider = 'github'
    if (!branch) {
      throw new Error("getFile: Missing branch option")
    }
    const getOpts = {
      repository,
      branch,
      provider,
      ...gitOpts,
      ...opts
    }
    return await getFile(getOpts)
  }
}

/**
 *
 * @returns file
 */
export const getFile = async (opts = {}): Promise<string>  => {
  const downloader = new GitFileDownloader({
      output: '.',
      ...opts,
  });
  try {
    return await downloader.run()
  } catch (err) {
    console.error(err);
    return ''
  }
};
