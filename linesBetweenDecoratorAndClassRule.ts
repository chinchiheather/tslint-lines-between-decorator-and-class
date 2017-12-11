import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = 'no new lines allowed between decorator and class';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    console.log(JSON.stringify(this.getOptions()));
    return this.applyWithWalker(
      new NoLinesBetweenDecoratorAndClassWalker(sourceFile, this.getOptions())
    );
  }
}

class NoLinesBetweenDecoratorAndClassWalker extends Lint.RuleWalker {
  public visitClassDeclaration(node: ts.ClassDeclaration) {
    const sourceFile = this.getSourceFile();

    const start = node.getStart();
    const end = node.getEnd();
    const text = node.getText();

    const firstChar = text.charAt(0);
    if (firstChar === '@') {
      // locate last char of decorator
      const endOfDecorator = start + text.indexOf('})') + 2;

      const lineStartPositions = <any>sourceFile.getLineStarts();
      const nextLine = lineStartPositions.findIndex((startPos, idx) =>
        startPos > endOfDecorator || idx === lineStartPositions.length - 1
      );

      if (lineStartPositions[nextLine] === lineStartPositions[nextLine + 1] - 1) {
        this.addFailure(this.createFailure(lineStartPositions[nextLine], end, Rule.FAILURE_STRING));
      }
    }

    super.visitClassDeclaration(node);
  }
}
