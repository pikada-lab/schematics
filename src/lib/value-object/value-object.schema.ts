import { Path } from '@angular-devkit/core';

export interface ValueObjectOptions {
  /**
   * The name of the value object.
   */
  name: string;

  /**
   * The name of the value object's aggregate.
   */
  aggregate?: string;

  /**
   * The name of the event's context.
   */
  context?: string;

  /**
   * The path to create the value object.
   */
  path?: string;
  /**
   * The path to insert the value object declaration.
   */
  module?: Path;
  /**
   * Directive to insert declaration in module.
   */
  skipImport?: boolean;
  /**
   * Metadata name affected by declaration insertion.
   */
  metadata?: string;
  /**
   * Nest element type name
   */
  type?: string;
  /**
   * Application language.
   */
  language?: string;
  /**
   * The source root path
   */
  sourceRoot?: string;
  /**
   * Specifies if a spec file is generated.
   */
  spec?: boolean;
  /**
   * Specifies the file suffix of spec files.
   * @default "spec"
   */
  specFileSuffix?: string;
  /**
   * Flag to indicate if a directory is created.
   */
  flat?: boolean;

}