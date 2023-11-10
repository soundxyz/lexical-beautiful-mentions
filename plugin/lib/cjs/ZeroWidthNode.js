"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$isZeroWidthNode = exports.$createZeroWidthNode = exports.ZeroWidthNode = void 0;
const lexical_1 = require("lexical");
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
        // Workaround: Use a zero-width space instead of an empty string because
        // otherwise the cursor is not correctly aligned with the line height.
        super("​", key); // 🚨 contains a zero-width space (U+200B)
    }
    exportJSON() {
        return Object.assign(Object.assign({}, super.exportJSON()), { type: "zeroWidth" });
    }
    updateDOM(prevNode, dom, config) {
        return false;
    }
    static importDOM() {
        return null;
    }
    isTextEntity() {
        return true;
    }
    getTextContent() {
        return "";
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
