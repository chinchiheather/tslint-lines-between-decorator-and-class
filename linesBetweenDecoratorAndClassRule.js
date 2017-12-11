"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new NoLinesBetweenDecoratorAndClassWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var NoLinesBetweenDecoratorAndClassWalker = (function (_super) {
    __extends(NoLinesBetweenDecoratorAndClassWalker, _super);
    function NoLinesBetweenDecoratorAndClassWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoLinesBetweenDecoratorAndClassWalker.prototype.visitClassDeclaration = function (node) {
        this.validateRule(node);
        _super.prototype.visitClassDeclaration.call(this, node);
    };
    NoLinesBetweenDecoratorAndClassWalker.prototype.validateRule = function (node) {
        var sourceFile = this.getSourceFile();
        var start = node.getStart();
        var end = node.getEnd();
        var text = node.getText();
        if (text.charAt(0) === '@') {
            var endOfDecorator_1 = start + text.indexOf(')') + 1;
            var lineStartPositions_1 = sourceFile.getLineStarts();
            var nextLineIdx = lineStartPositions_1.findIndex(function (startPos, idx) {
                return startPos > endOfDecorator_1 || idx === lineStartPositions_1.length - 1;
            });
            var numNewLines = 0;
            var lineIdx = nextLineIdx;
            while (true) {
                if (lineStartPositions_1[lineIdx] === lineStartPositions_1[++lineIdx] - 1) {
                    numNewLines++;
                }
                else {
                    break;
                }
            }
            var diff = numNewLines - this.getOptions()[0];
            if (diff !== 0) {
                var fixedText = void 0;
                if (diff > 0) {
                    // too many new lines, cut some out
                    fixedText = sourceFile.getText().substring(start, endOfDecorator_1);
                    fixedText += sourceFile.getText().substring(endOfDecorator_1 + diff);
                }
                else {
                    // not enough new lines, add some in
                    fixedText = sourceFile.getText().substring(start, endOfDecorator_1);
                    fixedText += Array(Math.abs(diff)).fill('\n').join('');
                    fixedText += sourceFile.getText().substring(endOfDecorator_1);
                }
                this.failRule(start, end, fixedText, lineStartPositions_1[nextLineIdx]);
            }
        }
    };
    NoLinesBetweenDecoratorAndClassWalker.prototype.failRule = function (start, end, fixedText, lineNo) {
        var replacement = new Lint.Replacement(start, end, fixedText);
        // handle both tslint v4 & v5
        var fix;
        if (typeof Lint['Fix'] === 'undefined') {
            fix = replacement;
        }
        else {
            fix = new Lint['Fix']('lines-between-decorator-and-class', [replacement]);
        }
        this.addFailure(this.createFailure(lineNo, end, "need " + this.getOptions()[0] + " new lines between decorator and class", fix));
    };
    return NoLinesBetweenDecoratorAndClassWalker;
}(Lint.RuleWalker));
