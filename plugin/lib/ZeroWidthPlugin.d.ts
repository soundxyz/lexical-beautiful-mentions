import { SerializedLexicalNode } from "lexical/LexicalNode";
export declare const ZERO_WIDTH_CHARACTER = "\u200B";
interface SerializedNode extends SerializedLexicalNode {
    children?: Array<SerializedNode>;
}
/**
 * Removes all zero-width nodes from the given node and its children.
 */
export declare function removeZeroWidthNodes<T extends SerializedNode>(node: T): T;
/**
 * This plugin serves as a patch to fix an incorrect cursor position in Safari.
 * It also ensures that the cursor is correctly aligned with the line height in
 * all browsers.
 * {@link https://github.com/facebook/lexical/issues/4487}.
 */
export declare function ZeroWidthPlugin(): null;
export {};
