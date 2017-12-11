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
        var sourceFile = this.getSourceFile();
        var start = node.getStart();
        var end = node.getEnd();
        var text = node.getText();
        var firstChar = text.charAt(0);
        if (firstChar === '@') {
            var endOfDecorator_1 = start + text.indexOf('})') + 2;
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
            var targetNewLines = this.getOptions()[0];
            if (numNewLines !== targetNewLines) {
                this.addFailure(this.createFailure(lineStartPositions_1[nextLineIdx], end, "need " + targetNewLines + " new lines between decorator and class"));
            }
        }
        _super.prototype.visitClassDeclaration.call(this, node);
    };
    return NoLinesBetweenDecoratorAndClassWalker;
}(Lint.RuleWalker));
