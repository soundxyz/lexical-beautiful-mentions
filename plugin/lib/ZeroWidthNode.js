import { $applyNodeReplacement, TextNode, } from "lexical";
import { ZERO_WIDTH_CHARACTER } from "./ZeroWidthPlugin";
/* eslint @typescript-eslint/no-unused-vars: "off" */
export class ZeroWidthNode extends TextNode {
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
        super(ZERO_WIDTH_CHARACTER, key);
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
        return ZERO_WIDTH_CHARACTER;
    }
}
export function $createZeroWidthNode() {
    const zeroWidthNode = new ZeroWidthNode();
    // Prevents that a space that is inserted by the user is deleted again
    // directly after the input.
    zeroWidthNode.setMode("segmented");
    return $applyNodeReplacement(zeroWidthNode);
}
export function $isZeroWidthNode(node) {
    return node instanceof ZeroWidthNode;
}
