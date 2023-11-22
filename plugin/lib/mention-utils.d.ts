import { LexicalNode } from "lexical";
import { BeautifulMentionsPluginProps } from "./BeautifulMentionsPluginProps";
export declare const DEFAULT_PUNCTUATION = "\\.,\\*\\?\\$\\|#{}\\(\\)\\^\\[\\]\\\\/!%'\"~=<>_:;";
export declare const TRIGGERS: (triggers: string[]) => string;
export declare const VALID_CHARS: (triggers: string[], punctuation: string) => string;
export declare const LENGTH_LIMIT = 75;
export declare function isWordChar(char: string, triggers: string[], punctuation: string): boolean;
export declare function $getSelectionInfo(triggers: string[], punctuation: string): {
    node: LexicalNode;
    offset: number;
    isTextNode: boolean;
    textContent: string;
    selection: import("lexical").RangeSelection;
    prevNode: LexicalNode | null;
    nextNode: LexicalNode | null;
    cursorAtStartOfNode: boolean;
    cursorAtEndOfNode: boolean;
    wordCharBeforeCursor: boolean;
    wordCharAfterCursor: boolean;
    spaceBeforeCursor: boolean;
    spaceAfterCursor: boolean;
} | undefined;
export declare function getNextSibling(node: LexicalNode): LexicalNode | null;
export declare function getPreviousSibling(node: LexicalNode): LexicalNode | null;
export declare function getCreatableProp(creatable: BeautifulMentionsPluginProps["creatable"], trigger: string | null): string | boolean;
export declare function getMenuItemLimitProp(menuItemLimit: BeautifulMentionsPluginProps["menuItemLimit"], trigger: string | null): number | false;
export declare function $selectEnd(): void;