import { join, Path, PathFragment } from '@angular-devkit/core';
import { DirEntry, Tree } from '@angular-devkit/schematics';

export interface AggregateFindOptions {
  aggregate?: string;
  path: Path;
  kind?: string;
}

export class AggregateFinder {
  constructor(private tree: Tree) {
  }

  public find(options: AggregateFindOptions): Path | null {
    const generatedDirectoryPath: Path = join(options.path, '..');
    const generatedDirectory: DirEntry = this.tree.getDir(
      generatedDirectoryPath,
    );
    return this.findIn(generatedDirectory, options);
  }

  private findIn(directory: DirEntry, options: AggregateFindOptions): Path | null {
    if (!directory) {
      return null;
    }
    const aggregateFilename: PathFragment = directory.subfiles.find(filename =>
      filename === `${options.aggregate}.ts`,
    );
    return aggregateFilename !== undefined
      ? join(directory.path, aggregateFilename.valueOf())
      : null;
  }
}
