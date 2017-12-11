import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
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
      const endOfDecorator = start + text.indexOf('})') + 2;

      const lineStartPositions = <any>sourceFile.getLineStarts();
      const nextLineIdx = lineStartPositions.findIndex((startPos, idx) =>
        startPos > endOfDecorator || idx === lineStartPositions.length - 1
      );

      let numNewLines = 0;
      let lineIdx = nextLineIdx;
      while (true) {
        if (lineStartPositions[lineIdx] === lineStartPositions[++lineIdx] - 1) {
          numNewLines++;
        } else {
          break;
        }
      }

      const targetNewLines = this.getOptions()[0];
      if (numNewLines !== targetNewLines) {
        this.addFailure(this.createFailure(lineStartPositions[nextLineIdx], end,
          `need ${targetNewLines} new lines between decorator and class`));
      }
    }

    super.visitClassDeclaration(node);
  }
}
