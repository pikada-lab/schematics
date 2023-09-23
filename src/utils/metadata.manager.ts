import {
  ArrayLiteralExpression,
  CallExpression, ClassDeclaration, ClassElement,
  createSourceFile,
  Decorator,
  Expression,
  Identifier, IfStatement,
  Node,
  NodeArray,
  ObjectLiteralElement,
  ObjectLiteralExpression,
  PropertyAssignment,
  ScriptTarget,
  SourceFile,
  StringLiteral,
  SyntaxKind,
} from 'typescript';
import { DeclarationOptions } from './module.declarator';
import { Result } from './result';

export class MetadataManager {
  constructor(private content: string) {}

  public getContent() {
    return this.content;
  }

  /**
   * Добавляет в метод процесс класса агрегата необходимые вызовы метода
   */
  public insertCommandToProcess(
    metadata: string,
    symbol: string,
  ): Result<string> {
    const source: SourceFile = createSourceFile(
      'filename.ts',
      this.content,
      ScriptTarget.ES2017,
    );
    const members = this.getClassDeclaration(source);
    const methodResult = this.getMethod(source, members, 'process');
    const blockResult = this.getContextBlock(source, methodResult);
    const resultCheck = this.checkHasClass(source, blockResult, symbol);
    const ifStatement = this.getIfStatement(source, resultCheck);
    return this.setStatementIf(source, ifStatement, symbol)
  }

  public insertProcessFunction(
    metadata: string,
    symbol: string,
    staticOptions?: DeclarationOptions['staticOptions'],
  ): Result<string> {
    const source: SourceFile = createSourceFile(
      'filename.ts',
      this.content,
      ScriptTarget.ES2017,
    );
    const members = this.getClassDeclaration(source);
    const methodResult = this.getMethod(source, members, 'process');
    const resultCheck = this.checkHasMethod(source, methodResult, members, 'process' + symbol);
    return this.setMethodProcess(source, resultCheck, symbol, staticOptions)
  }


  private setStatementIf(source: SourceFile, node: Result<IfStatement[]>, symbol: string): Result<string> {
    if (node.isFailure) {
      return Result.reFailure(node);
    }
    const options = {
      prevStart: false,
      nextEnd: false,
    }
    if (node.value.length === 0) {
      options.prevStart = true;
      options.nextEnd = true;
    }
    const position = node.value[0].getStart(source);
    this.content = [
      this.content.substring(0, position),
      (options?.prevStart ? '\n    ' : ''),
      `if (command instanceOf ${symbol}) {\n      return this.process${symbol}(command);\n    }\n  `,
      (options?.nextEnd ? '' : '  '),
      this.content.substring(position)
    ].join('');
    return Result.success(this.content);
  }

  private setMethodProcess(source: SourceFile, node: Result<ClassElement>, symbol: string,  staticOptions?: DeclarationOptions['staticOptions']): Result<string> {
    if (node.isFailure) {
      return Result.reFailure(node);
    }
    const position = node.value.end;
    this.content = [
      this.content.substring(0, position),
      `\n    private process${symbol}(command: ${symbol}): Result<${staticOptions.name}Event[]> {\n    \n    // Business logic\n    return Result.success([]);\n}\n`,
      this.content.substring(position)
    ].join('');
    return Result.success(this.content);
  }

  private checkHasClass(source: SourceFile, resultContextBlock: Result<Node>, symbol: string):  Result<Node>  {
    if (resultContextBlock.isFailure) {
      return Result.reFailure(resultContextBlock);
    }
    const contextBlock = resultContextBlock.value;
    const hasClass = contextBlock.getChildren(source).filter(r =>  r.kind === SyntaxKind.ExpressionStatement).map(r => r.getText(source)).some(className => className === symbol);
    if (hasClass) {
     return Result.failure('Уже содержит класс');
    }
    return resultContextBlock;
  }

  private checkHasMethod(source: SourceFile, resultContextBlock: Result<ClassElement>, members: ClassDeclaration[], symbol: string):  Result<ClassElement>  {
    if (resultContextBlock.isFailure) {
      return Result.reFailure(resultContextBlock);
    }
    const nodeProcess = this.getMethod(source, members, symbol);
    if (!nodeProcess.isFailure) {
      return Result.failure('Метод уже добавлен: ' + symbol);
    }
    return resultContextBlock;
  }

  private getClassDeclaration(source: SourceFile): ClassDeclaration[] {
    return this.getSourceNodes(source).filter(
      (node) =>
        node.kind === SyntaxKind.ClassDeclaration
    ) as ClassDeclaration[];
  }

  private getMethod(source: SourceFile, nodes: ClassDeclaration[], method: string): Result<ClassElement> {
    const nodeProcess: ClassElement | undefined = nodes.find((r) => r.members.some(r => r.name?.getText(source) === method))?.members?.find(r => r.name?.getText(source) === method)
    if (!nodeProcess) {
      return Result.failure('Нет метода: ' + method);
    }
    return Result.success(nodeProcess);
  }

  private getContextBlock(source: SourceFile, methodResult: Result<ClassElement>): Result<Node> {
    if (methodResult.isFailure) {
      return Result.reFailure(methodResult);
    }
    const method = methodResult.value;
    const nodeBlock: Node | undefined = method.getChildren(source).find(r => r.kind === SyntaxKind.Block);
    if (!nodeBlock) {
      return Result.failure('Нет тела функции');
    }
    const contextBlock: Node | undefined = nodeBlock.getChildren(source).find(r => r.kind === SyntaxKind.SyntaxList);
    if (!contextBlock) {
      return Result.failure('Нет внутреннего кода');
    }
    return Result.success(contextBlock);
  }

  getIfStatement(source: SourceFile, resultContextBlock: Result<Node>): Result<IfStatement[]> {
    if (resultContextBlock.isFailure) {
      return Result.reFailure(resultContextBlock);
    }
    const ifStatements: IfStatement[] = resultContextBlock.value.getChildren(source).filter(r => r.kind === SyntaxKind.IfStatement) as IfStatement[];
    return Result.success(ifStatements);
  }

  public insert(
    metadata: string,
    symbol: string,
    staticOptions?: DeclarationOptions['staticOptions'],
  ): string | undefined {
    const source: SourceFile = createSourceFile(
      'filename.ts',
      this.content,
      ScriptTarget.ES2017,
    );
    const decoratorNodes: Node[] = this.getDecoratorMetadata(source, '@Module');
    const node: Node = decoratorNodes[0];
    // If there is no occurrence of `@Module` decorator, nothing will be inserted
    if (!node) {
      return;
    }
    const matchingProperties: ObjectLiteralElement[] = (
      node as ObjectLiteralExpression
    ).properties
      .filter((prop) => prop.kind === SyntaxKind.PropertyAssignment)
      .filter((prop: PropertyAssignment) => {
        const name = prop.name;
        switch (name.kind) {
          case SyntaxKind.Identifier:
            return (name as Identifier).getText(source) === metadata;
          case SyntaxKind.StringLiteral:
            return (name as StringLiteral).text === metadata;
          default:
            return false;
        }
      });

    symbol = this.mergeSymbolAndExpr(symbol, staticOptions);
    const addBlankLinesIfDynamic = () => {
      symbol = staticOptions ? this.addBlankLines(symbol) : symbol;
    };
    if (matchingProperties.length === 0) {
      const expr = node as ObjectLiteralExpression;
      if (expr.properties.length === 0) {
        addBlankLinesIfDynamic();
        return this.insertMetadataToEmptyModuleDecorator(
          expr,
          metadata,
          symbol,
        );
      } else {
        addBlankLinesIfDynamic();
        return this.insertNewMetadataToDecorator(
          expr,
          source,
          metadata,
          symbol,
        );
      }
    } else {
      return this.insertSymbolToMetadata(
        source,
        matchingProperties,
        symbol,
        staticOptions,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getDecoratorMetadata(source: SourceFile, identifier: string): Node[] {
    return this.getSourceNodes(source)
      .filter(
        (node) =>
          node.kind === SyntaxKind.Decorator &&
          (node as Decorator).expression.kind === SyntaxKind.CallExpression,
      )
      .map((node) => (node as Decorator).expression as CallExpression)
      .filter(
        (expr) =>
          expr.arguments[0] &&
          expr.arguments[0].kind === SyntaxKind.ObjectLiteralExpression,
      )
      .map((expr) => expr.arguments[0] as ObjectLiteralExpression);
  }

  private getSourceNodes(sourceFile: SourceFile): Node[] {
    const nodes: Node[] = [sourceFile];
    const result = [];
    while (nodes.length > 0) {
      const node = nodes.shift();
      if (node) {
        result.push(node);
        if (node.getChildCount(sourceFile) >= 0) {
          nodes.unshift(...node.getChildren());
        }
      }
    }
    return result;
  }

  private insertMetadataToEmptyModuleDecorator(
    expr: ObjectLiteralExpression,
    metadata: string,
    symbol: string,
  ): string {
    const position = expr.getEnd() - 1;
    const toInsert = `  ${metadata}: [${symbol}]`;
    return this.content.split('').reduce((content, char, index) => {
      if (index === position) {
        return `${content}\n${toInsert}\n${char}`;
      } else {
        return `${content}${char}`;
      }
    }, '');
  }

  private insertNewMetadataToDecorator(
    expr: ObjectLiteralExpression,
    source: SourceFile,
    metadata: string,
    symbol: string,
  ): string {
    const node = expr.properties[expr.properties.length - 1];
    const position = node.getEnd();
    const text = node.getFullText(source);
    const matches = text.match(/^\r?\n\s*/);
    let toInsert: string;
    if (matches) {
      toInsert = `,${matches[0]}${metadata}: [${symbol}]`;
    } else {
      toInsert = `, ${metadata}: [${symbol}]`;
    }
    return this.content.split('').reduce((content, char, index) => {
      if (index === position) {
        return `${content}${toInsert}${char}`;
      } else {
        return `${content}${char}`;
      }
    }, '');
  }

  private insertSymbolToMetadata(
    source: SourceFile,
    matchingProperties: ObjectLiteralElement[],
    symbol: string,
    staticOptions?: DeclarationOptions['staticOptions'],
  ): string {
    const assignment = matchingProperties[0] as PropertyAssignment;
    let node: Node | NodeArray<Expression>;
    const arrLiteral = assignment.initializer as ArrayLiteralExpression;
    if (!arrLiteral.elements) {
      // "imports" is not an array but rather function/constant
      return this.content;
    }
    if (arrLiteral.elements.length === 0) {
      node = arrLiteral;
    } else {
      node = arrLiteral.elements;
    }
    if (Array.isArray(node)) {
      const nodeArray = node as unknown as Node[];
      const symbolsArray = nodeArray.map((childNode) =>
        childNode.getText(source),
      );
      if (symbolsArray.includes(symbol)) {
        return this.content;
      }
      node = node[node.length - 1];
    }
    let toInsert: string;
    let position = (node as Node).getEnd();

    if ((node as Node).kind === SyntaxKind.ArrayLiteralExpression) {
      position--;
      toInsert = staticOptions ? this.addBlankLines(symbol) : `${symbol}`;
    } else {
      const text = (node as Node).getFullText(source);
      const itemSeparator = ( 
        text.match(/^\r?\n(\r?)\s+/) ||
        text.match(/^\r?\n/) ||
        ' '
      )[0];
      toInsert = `,${itemSeparator}${symbol}`;
    }
    return this.content.split('').reduce((content, char, index) => {
      if (index === position) {
        return `${content}${toInsert}${char}`;
      } else {
        return `${content}${char}`;
      }
    }, '');
  }

  private mergeSymbolAndExpr(
    symbol: string,
    staticOptions?: DeclarationOptions['staticOptions'],
  ): string {
    if (!staticOptions) {
      return symbol;
    }
    const spacing = 6;
    let options = JSON.stringify(staticOptions.value, null, spacing);
    options = options.replace(/\"([^(\")"]+)\":/g, '$1:');
    options = options.replace(/\"/g, `'`);
    options = options.slice(0, options.length - 1) + '    }';
    symbol += `.${staticOptions.name}(${options})`;
    return symbol;
  }

  private addBlankLines(expr: string): string {
    return `\n    ${expr}\n  `;
  }
}
