import type { SerializedLexicalNode, Spread } from "lexical";
import { DecoratorNode, LexicalEditor, type DOMConversionOutput, type EditorConfig, type LexicalNode, type NodeKey } from "lexical";
import React, { ElementType } from "react";
import { BeautifulMentionComponentProps, BeautifulMentionsItemData } from "./BeautifulMentionsPluginProps";
export type SerializedBeautifulMentionNode = Spread<{
    trigger: string;
    value: string;
    data?: {
        [p: string]: BeautifulMentionsItemData;
    };
}, SerializedLexicalNode>;
declare function convertElement(domNode: HTMLElement): DOMConversionOutput | null;
/**
 * This node is used to represent a mention used in the BeautifulMentionPlugin.
 */
export declare class BeautifulMentionNode extends DecoratorNode<React.JSX.Element> {
    __trigger: string;
    __value: string;
    __data?: {
        [p: string]: BeautifulMentionsItemData;
    };
    static getType(): string;
    static clone(node: BeautifulMentionNode): BeautifulMentionNode;
    static importJSON(serializedNode: SerializedBeautifulMentionNode): BeautifulMentionNode;
    exportDOM(): {
        element: HTMLSpanElement;
    };
    static importDOM(): {
        span: (domNode: HTMLElement) => {
            conversion: typeof convertElement;
            priority: number;
        } | null;
    };
    constructor(trigger: string, value: string, data?: {
        [p: string]: BeautifulMentionsItemData;
    }, key?: NodeKey);
    exportJSON(): SerializedBeautifulMentionNode;
    createDOM(): HTMLSpanElement;
    getTextContent(): string;
    updateDOM(): boolean;
    getTrigger(): string;
    getValue(): string;
    setValue(value: string): void;
    getData(): {
        [p: string]: BeautifulMentionsItemData;
    } | undefined;
    setData(data?: {
        [p: string]: BeautifulMentionsItemData;
    }): void;
    component(): ElementType<BeautifulMentionComponentProps> | null;
    decorate(_editor: LexicalEditor, config: EditorConfig): import("react/jsx-runtime").JSX.Element;
}
export declare function $createBeautifulMentionNode(trigger: string, value: string, data?: {
    [p: string]: BeautifulMentionsItemData;
}): BeautifulMentionNode;
export declare function $isBeautifulMentionNode(node: LexicalNode | null | undefined): node is BeautifulMentionNode;
export {};
