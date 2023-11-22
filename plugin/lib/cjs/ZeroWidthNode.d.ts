import { DOMConversionMap, TextNode, type LexicalNode, type NodeKey, type SerializedTextNode } from "lexical";
export type SerializedZeroWidthNode = SerializedTextNode;
export declare class ZeroWidthNode extends TextNode {
    static getType(): string;
    static clone(node: ZeroWidthNode): ZeroWidthNode;
    static importJSON(_: SerializedZeroWidthNode): ZeroWidthNode;
    constructor(key?: NodeKey);
    exportJSON(): SerializedZeroWidthNode;
    updateDOM(): boolean;
    static importDOM(): DOMConversionMap | null;
    isTextEntity(): boolean;
    getTextContent(): string;
}
export declare function $createZeroWidthNode(): ZeroWidthNode;
export declare function $isZeroWidthNode(node: LexicalNode | null | undefined): node is ZeroWidthNode;
