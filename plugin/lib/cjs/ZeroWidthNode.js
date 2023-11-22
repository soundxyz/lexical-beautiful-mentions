"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$isZeroWidthNode = exports.$createZeroWidthNode = exports.ZeroWidthNode = void 0;
const lexical_1 = require("lexical");
const ZeroWidthPlugin_1 = require("./ZeroWidthPlugin");
/* eslint @typescript-eslint/no-unused-vars: "off" */
class ZeroWidthNode extends lexical_1.TextNode {
    static getType() {
        return "zeroWidth";
    }
    static clone(node) {
        return new ZeroWidthNode(node.__key);
    }
    static importJSON(_) {
        return $createZeroWidthNode();
    }
    constructor(key) {
        super(ZeroWidthPlugin_1.ZERO_WIDTH_CHARACTER, key);
    }
    exportJSON() {
        return Object.assign(Object.assign({}, super.exportJSON()), { type: "zeroWidth" });
    }
    updateDOM() {
        return false;
    }
    static importDOM() {
        return null;
    }
    isTextEntity() {
        return true;
    }
    getTextContent() {
        // Must be a non-empty string, otherwise nodes inserted via `$insertNodes`
        // are not at the correct position.
        // 🚨 Don't forget to remove the spaces when exporting to JSON.
        // You can use the `removeZeroWidthNodes` function for this.
        return ZeroWidthPlugin_1.ZERO_WIDTH_CHARACTER;
    }
}
exports.ZeroWidthNode = ZeroWidthNode;
function $createZeroWidthNode() {
    const zeroWidthNode = new ZeroWidthNode();
    // Prevents that a space that is inserted by the user is deleted again
    // directly after the input.
    zeroWidthNode.setMode("segmented");
    return (0, lexical_1.$applyNodeReplacement)(zeroWidthNode);
}
exports.$createZeroWidthNode = $createZeroWidthNode;
function $isZeroWidthNode(node) {
    return node instanceof ZeroWidthNode;
}
exports.$isZeroWidthNode = $isZeroWidthNode;
