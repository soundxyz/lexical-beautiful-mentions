"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$selectEnd = exports.getMenuItemLimitProp = exports.getCreatableProp = exports.getPreviousSibling = exports.getNextSibling = exports.$getSelectionInfo = exports.isWordChar = exports.LENGTH_LIMIT = exports.VALID_CHARS = exports.TRIGGERS = exports.DEFAULT_PUNCTUATION = void 0;
const lexical_1 = require("lexical");
exports.DEFAULT_PUNCTUATION = "\\.,\\*\\?\\$\\|#{}\\(\\)\\^\\[\\]\\\\/!%'\"~=<>_:;";
// Strings that can trigger the mention menu.
const TRIGGERS = (triggers) => "(?:" + triggers.join("|") + ")";
exports.TRIGGERS = TRIGGERS;
// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = (triggers, punctuation) => "(?!" + triggers.join("|") + ")[^\\s" + punctuation + "]";
exports.VALID_CHARS = VALID_CHARS;
exports.LENGTH_LIMIT = 75;
function isWordChar(char, triggers, punctuation) {
    return new RegExp((0, exports.VALID_CHARS)(triggers, punctuation)).test(char);
}
exports.isWordChar = isWordChar;
function $getSelectionInfo(triggers, punctuation) {
    const selection = (0, lexical_1.$getSelection)();
    if (!selection || !(0, lexical_1.$isRangeSelection)(selection)) {
        return;
    }
    const anchor = selection.anchor;
    const focus = selection.focus;
    const nodes = selection.getNodes();
    if (anchor.key !== focus.key ||
        anchor.offset !== focus.offset ||
        nodes.length === 0) {
        return;
    }
    const [node] = nodes;
    const isTextNode = (0, lexical_1.$isTextNode)(node) && node.isSimpleText();
    const offset = anchor.type === "text" ? anchor.offset : 0;
    const textContent = node.getTextContent();
    const cursorAtStartOfNode = offset === 0;
    const cursorAtEndOfNode = textContent.length === offset;
    const charBeforeCursor = textContent.charAt(offset - 1);
    const charAfterCursor = textContent.charAt(offset);
    const wordCharBeforeCursor = isWordChar(charBeforeCursor, triggers, punctuation);
    const wordCharAfterCursor = isWordChar(charAfterCursor, triggers, punctuation);
    const spaceBeforeCursor = /\s/.test(charBeforeCursor);
    const spaceAfterCursor = /\s/.test(charAfterCursor);
    const prevNode = getPreviousSibling(node);
    const nextNode = getNextSibling(node);
    return {
        node,
        offset,
        isTextNode,
        textContent,
        selection,
        prevNode,
        nextNode,
        cursorAtStartOfNode,
        cursorAtEndOfNode,
        wordCharBeforeCursor,
        wordCharAfterCursor,
        spaceBeforeCursor,
        spaceAfterCursor,
    };
}
exports.$getSelectionInfo = $getSelectionInfo;
function getNextSibling(node) {
    let nextSibling = node.getNextSibling();
    while (nextSibling !== null && nextSibling.getType() === "zeroWidth") {
        nextSibling = nextSibling.getNextSibling();
    }
    return nextSibling;
}
exports.getNextSibling = getNextSibling;
function getPreviousSibling(node) {
    let previousSibling = node.getPreviousSibling();
    while (previousSibling !== null &&
        previousSibling.getType() === "zeroWidth") {
        previousSibling = previousSibling.getPreviousSibling();
    }
    return previousSibling;
}
exports.getPreviousSibling = getPreviousSibling;
function getCreatableProp(creatable, trigger) {
    if (typeof creatable === "string" || typeof creatable === "boolean") {
        return creatable;
    }
    if (trigger === null) {
        return false;
    }
    if (typeof creatable === "object") {
        return creatable[trigger];
    }
    return false;
}
exports.getCreatableProp = getCreatableProp;
function getMenuItemLimitProp(menuItemLimit, trigger) {
    if (typeof menuItemLimit === "number" || menuItemLimit === false) {
        return menuItemLimit;
    }
    if (typeof menuItemLimit === "undefined") {
        return 5;
    }
    if (trigger === null) {
        return false;
    }
    if (typeof menuItemLimit === "object") {
        return menuItemLimit[trigger];
    }
    return 5;
}
exports.getMenuItemLimitProp = getMenuItemLimitProp;
function getLastNode(root) {
    const descendant = root.getLastDescendant();
    if ((0, lexical_1.$isElementNode)(descendant) || (0, lexical_1.$isTextNode)(descendant)) {
        return descendant;
    }
    if ((0, lexical_1.$isDecoratorNode)(descendant)) {
        return descendant.getParent();
    }
    return root;
}
function $selectEnd() {
    const root = (0, lexical_1.$getRoot)();
    const lastNode = getLastNode(root);
    const key = lastNode && lastNode.getKey();
    const offset = (0, lexical_1.$isElementNode)(lastNode)
        ? lastNode.getChildrenSize()
        : (0, lexical_1.$isTextNode)(lastNode)
            ? lastNode.getTextContent().length
            : 0;
    const type = (0, lexical_1.$isElementNode)(lastNode) ? "element" : "text";
    if (key) {
        const newSelection = (0, lexical_1.$createRangeSelection)();
        newSelection.anchor.set(key, offset, type);
        newSelection.focus.set(key, offset, type);
        (0, lexical_1.$setSelection)(newSelection);
    }
}
exports.$selectEnd = $selectEnd;
