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
    this.validateRule(node);
    super.visitClassDeclaration(node);
  }

  private validateRule(node: ts.ClassDeclaration) {
    const sourceFile = this.getSourceFile();
    const start = node.getStart();
    const end = node.getEnd();
    const text = node.getText();

    if (text.charAt(0) === '@') {
      const endOfDecorator = start + text.indexOf(')') + 1;

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

      const diff = numNewLines - this.getOptions()[0];
      if (diff !== 0) {
        let fixedText: string;
        if (diff > 0) {
          // too many new lines, cut some out
          fixedText = sourceFile.getText().substring(start, endOfDecorator);
          fixedText += sourceFile.getText().substring(endOfDecorator + diff);
        } else {
          // not enough new lines, add some in
          fixedText = sourceFile.getText().substring(start, endOfDecorator);
          fixedText += Array(Math.abs(diff)).fill('\n').join('');
          fixedText += sourceFile.getText().substring(endOfDecorator);
        }

        this.failRule(start, end, fixedText, lineStartPositions[nextLineIdx]);
      }
    }
  }

  private failRule(start: number, end: number, fixedText: string, lineNo: number) {
    const replacement = new Lint.Replacement(start, end, fixedText);
    // handle both tslint v4 & v5
    let fix: any;
    if (typeof Lint['Fix'] === 'undefined') {
      fix = replacement;
    } else {
      fix = new Lint['Fix']('lines-between-decorator-and-class', [replacement]);
    }

    this.addFailure(
      this.createFailure(
        lineNo, end, `need ${this.getOptions()[0]} new lines between decorator and class`, fix
      )
    );
  }
}
