"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$renameMention = exports.$removeMention = exports.$insertMentionAtSelection = exports.$insertTriggerAtSelection = exports.OPEN_MENTION_MENU_COMMAND = exports.RENAME_MENTIONS_COMMAND = exports.REMOVE_MENTIONS_COMMAND = exports.INSERT_MENTION_COMMAND = void 0;
const lexical_1 = require("lexical");
const mention_utils_1 = require("./mention-utils");
const MentionNode_1 = require("./MentionNode");
exports.INSERT_MENTION_COMMAND = (0, lexical_1.createCommand)("INSERT_MENTION_COMMAND");
exports.REMOVE_MENTIONS_COMMAND = (0, lexical_1.createCommand)("REMOVE_MENTIONS_COMMAND");
exports.RENAME_MENTIONS_COMMAND = (0, lexical_1.createCommand)("RENAME_MENTIONS_COMMAND");
exports.OPEN_MENTION_MENU_COMMAND = (0, lexical_1.createCommand)("OPEN_MENTION_MENU_COMMAND");
function $insertTriggerAtSelection(triggers, punctuation, trigger) {
    return $insertMentionOrTrigger(triggers, punctuation, trigger);
}
exports.$insertTriggerAtSelection = $insertTriggerAtSelection;
function $insertMentionAtSelection(triggers, punctuation, trigger, value) {
    return $insertMentionOrTrigger(triggers, punctuation, trigger, value);
}
exports.$insertMentionAtSelection = $insertMentionAtSelection;
function $insertMentionOrTrigger(triggers, punctuation, trigger, value) {
    const selectionInfo = (0, mention_utils_1.$getSelectionInfo)(triggers, punctuation);
    if (!selectionInfo) {
        return false;
    }
    const { node, offset, selection, wordCharBeforeCursor, wordCharAfterCursor, cursorAtStartOfNode, cursorAtEndOfNode, prevNode, nextNode, } = selectionInfo;
    // Insert a mention node or a text node with the trigger to open the mention menu.
    const mentionNode = value
        ? (0, MentionNode_1.$createBeautifulMentionNode)(trigger, value)
        : (0, lexical_1.$createTextNode)(trigger);
    // Insert a mention with a leading space if the node at the cursor is not a text node.
    if (!((0, lexical_1.$isParagraphNode)(node) && offset === 0) && !(0, lexical_1.$isTextNode)(node)) {
        selection.insertNodes([(0, lexical_1.$createTextNode)(" "), mentionNode]);
        return true;
    }
    let spaceNode = null;
    const nodes = [];
    if (wordCharBeforeCursor ||
        (cursorAtStartOfNode && prevNode !== null && !(0, lexical_1.$isTextNode)(prevNode))) {
        nodes.push((0, lexical_1.$createTextNode)(" "));
    }
    nodes.push(mentionNode);
    if (wordCharAfterCursor ||
        (cursorAtEndOfNode && nextNode !== null && !(0, lexical_1.$isTextNode)(nextNode))) {
        spaceNode = (0, lexical_1.$createTextNode)(" ");
        nodes.push(spaceNode);
    }
    selection.insertNodes(nodes);
    if (nodes.length > 1) {
        if ((0, lexical_1.$isTextNode)(mentionNode)) {
            mentionNode.select();
        }
        else if (spaceNode) {
            spaceNode.selectPrevious();
        }
    }
    return true;
}
function $removeMention(trigger, value, focus = true) {
    let removed = false;
    let prev = null;
    let next = null;
    const mentions = (0, lexical_1.$nodesOfType)(MentionNode_1.BeautifulMentionNode);
    for (const mention of mentions) {
        const sameTrigger = mention.getTrigger() === trigger;
        const sameValue = mention.getValue() === value;
        if (sameTrigger && (sameValue || !value)) {
            prev = (0, mention_utils_1.getPreviousSibling)(mention);
            next = (0, mention_utils_1.getNextSibling)(mention);
            mention.remove();
            removed = true;
            // Prevent double spaces
            if ((prev === null || prev === void 0 ? void 0 : prev.getTextContent().endsWith(" ")) &&
                (next === null || next === void 0 ? void 0 : next.getTextContent().startsWith(" "))) {
                prev.setTextContent(prev.getTextContent().slice(0, -1));
            }
            // Remove trailing space
            if (next === null &&
                (0, lexical_1.$isTextNode)(prev) &&
                prev.getTextContent().endsWith(" ")) {
                prev.setTextContent(prev.getTextContent().trimEnd());
            }
        }
    }
    if (removed && focus) {
        focusEditor(prev, next);
    }
    return removed;
}
exports.$removeMention = $removeMention;
function $renameMention(trigger, newValue, value, focus = true) {
    const mentions = (0, lexical_1.$nodesOfType)(MentionNode_1.BeautifulMentionNode);
    let renamedMention = null;
    for (const mention of mentions) {
        const sameTrigger = mention.getTrigger() === trigger;
        const sameValue = mention.getValue() === value;
        if (sameTrigger && (sameValue || !value)) {
            renamedMention = mention;
            mention.setValue(newValue);
        }
    }
    if (renamedMention && focus) {
        const prev = (0, mention_utils_1.getPreviousSibling)(renamedMention);
        const next = (0, mention_utils_1.getNextSibling)(renamedMention);
        focusEditor(prev, next);
        if (next && (0, lexical_1.$isTextNode)(next)) {
            next.select(0, 0);
        }
        else {
            (0, mention_utils_1.$selectEnd)();
        }
    }
    return renamedMention !== null;
}
exports.$renameMention = $renameMention;
function focusEditor(prev, next) {
    if (next && (0, lexical_1.$isTextNode)(next)) {
        next.select(0, 0);
    }
    else if (prev && (0, lexical_1.$isTextNode)(prev)) {
        prev.select();
    }
    else {
        (0, mention_utils_1.$selectEnd)();
    }
}
