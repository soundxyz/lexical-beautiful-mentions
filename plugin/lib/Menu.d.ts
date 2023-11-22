import { LexicalEditor, TextNode } from "lexical";
import { MutableRefObject, ReactPortal } from "react";
import { BeautifulMentionsItemData } from "./BeautifulMentionsPluginProps";
export type MenuTextMatch = {
    leadOffset: number;
    matchingString: string;
    replaceableString: string;
};
export type MenuResolution = {
    match?: MenuTextMatch;
    getRect: () => DOMRect;
};
type UseMenuAnchorRefOptions = {
    resolution: MenuResolution | null;
    setResolution: (r: MenuResolution | null) => void;
    className?: string;
    menuVisible?: boolean;
};
export declare class MenuOption {
    /**
     * The menu item value. For example: "John".
     */
    readonly value: string;
    /**
     * The value to be displayed. Normally the same as `value` but can be
     * used to display a different value. For example: "Add 'John'".
     */
    readonly displayValue: string;
    /**
     * Additional data belonging to the option. For example: `{ id: 1 }`.
     */
    readonly data?: {
        [key: string]: BeautifulMentionsItemData;
    } | undefined;
    /**
     * Unique key to iterate over options. Equals to `data` if provided, otherwise
     * `value` is used.
     */
    readonly key: string;
    /**
     * Ref to the DOM element of the option.
     */
    ref?: MutableRefObject<HTMLElement | null>;
    constructor(
    /**
     * The menu item value. For example: "John".
     */
    value: string, 
    /**
     * The value to be displayed. Normally the same as `value` but can be
     * used to display a different value. For example: "Add 'John'".
     */
    displayValue: string, 
    /**
     * Additional data belonging to the option. For example: `{ id: 1 }`.
     */
    data?: {
        [key: string]: BeautifulMentionsItemData;
    } | undefined);
    setRefElement(element: HTMLElement | null): void;
}
export type MenuRenderFn<TOption extends MenuOption> = (anchorElementRef: MutableRefObject<HTMLElement | null>, itemProps: {
    selectedIndex: number | null;
    selectOptionAndCleanUp: (option: TOption) => void;
    setHighlightedIndex: (index: number) => void;
    options: Array<TOption>;
}, matchingString: string | null) => ReactPortal | JSX.Element | null;
/**
 * Split Lexical TextNode and return a new TextNode only containing matched text.
 * Common use cases include: removing the node, replacing with a new node.
 */
export declare function $splitNodeContainingQuery(match: MenuTextMatch): TextNode | null;
export declare function getScrollParent(element: HTMLElement, includeHidden: boolean): HTMLElement | HTMLBodyElement;
export declare function useDynamicPositioning(resolution: MenuResolution | null, targetElement: HTMLElement | null, onReposition: () => void, onVisibilityChange: (isInView: boolean) => void, menuVisible?: boolean): void;
export declare function Menu<TOption extends MenuOption>({ close, editor, anchorElementRef, resolution, options, menuRenderFn, onSelectOption, onSelectionChange, shouldSplitNodeWithQuery, onMenuVisibilityChange, }: {
    close: () => void;
    editor: LexicalEditor;
    anchorElementRef: MutableRefObject<HTMLElement>;
    resolution: MenuResolution;
    options: Array<TOption>;
    shouldSplitNodeWithQuery?: boolean;
    menuRenderFn: MenuRenderFn<TOption>;
    onSelectionChange?: (selectedIndex: number | null) => void;
    onSelectOption: (option: TOption, textNodeContainingQuery: TextNode | null, closeMenu: () => void, matchingString: string) => void;
    onMenuVisibilityChange?: (visible: boolean) => void;
}): JSX.Element | null;
export declare function useMenuAnchorRef(opt: UseMenuAnchorRefOptions): MutableRefObject<HTMLElement>;
export type TriggerFn = (text: string, editor: LexicalEditor) => MenuTextMatch | null;
export declare function isSelectionOnEntityBoundary(editor: LexicalEditor, offset: number): boolean;
export {};
