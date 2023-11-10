import { $createTextNode, $isParagraphNode, $isTextNode, $nodesOfType, createCommand, } from "lexical";
import { $getSelectionInfo, $selectEnd, getNextSibling, getPreviousSibling, } from "./mention-utils";
import { $createBeautifulMentionNode, BeautifulMentionNode, } from "./MentionNode";
export const INSERT_MENTION_COMMAND = createCommand("INSERT_MENTION_COMMAND");
export const REMOVE_MENTIONS_COMMAND = createCommand("REMOVE_MENTIONS_COMMAND");
export const RENAME_MENTIONS_COMMAND = createCommand("RENAME_MENTIONS_COMMAND");
export const OPEN_MENTION_MENU_COMMAND = createCommand("OPEN_MENTION_MENU_COMMAND");
export function $insertTriggerAtSelection(triggers, punctuation, trigger) {
    return $insertMentionOrTrigger(triggers, punctuation, trigger);
}
export function $insertMentionAtSelection(triggers, punctuation, trigger, value) {
    return $insertMentionOrTrigger(triggers, punctuation, trigger, value);
}
function $insertMentionOrTrigger(triggers, punctuation, trigger, value) {
    const selectionInfo = $getSelectionInfo(triggers, punctuation);
    if (!selectionInfo) {
        return false;
    }
    const { node, offset, selection, wordCharBeforeCursor, wordCharAfterCursor, cursorAtStartOfNode, cursorAtEndOfNode, prevNode, nextNode, } = selectionInfo;
    // Insert a mention node or a text node with the trigger to open the mention menu.
    const mentionNode = value
        ? $createBeautifulMentionNode(trigger, value)
        : $createTextNode(trigger);
    // Insert a mention with a leading space if the node at the cursor is not a text node.
    if (!($isParagraphNode(node) && offset === 0) && !$isTextNode(node)) {
        selection.insertNodes([$createTextNode(" "), mentionNode]);
        return true;
    }
    let spaceNode = null;
    const nodes = [];
    if (wordCharBeforeCursor ||
        (cursorAtStartOfNode && prevNode !== null && !$isTextNode(prevNode))) {
        nodes.push($createTextNode(" "));
    }
    nodes.push(mentionNode);
    if (wordCharAfterCursor ||
        (cursorAtEndOfNode && nextNode !== null && !$isTextNode(nextNode))) {
        spaceNode = $createTextNode(" ");
        nodes.push(spaceNode);
    }
    selection.insertNodes(nodes);
    if (nodes.length > 1) {
        if ($isTextNode(mentionNode)) {
            mentionNode.select();
        }
        else if (spaceNode) {
            spaceNode.selectPrevious();
        }
    }
    return true;
}
export function $removeMention(trigger, value, focus = true) {
    let removed = false;
    let prev = null;
    let next = null;
    const mentions = $nodesOfType(BeautifulMentionNode);
    for (const mention of mentions) {
        const sameTrigger = mention.getTrigger() === trigger;
        const sameValue = mention.getValue() === value;
        if (sameTrigger && (sameValue || !value)) {
            prev = getPreviousSibling(mention);
            next = getNextSibling(mention);
            mention.remove();
            removed = true;
            // Prevent double spaces
            if ((prev === null || prev === void 0 ? void 0 : prev.getTextContent().endsWith(" ")) &&
                (next === null || next === void 0 ? void 0 : next.getTextContent().startsWith(" "))) {
                prev.setTextContent(prev.getTextContent().slice(0, -1));
            }
            // Remove trailing space
            if (next === null &&
                $isTextNode(prev) &&
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
export function $renameMention(trigger, newValue, value, focus = true) {
    const mentions = $nodesOfType(BeautifulMentionNode);
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
        const prev = getPreviousSibling(renamedMention);
        const next = getNextSibling(renamedMention);
        focusEditor(prev, next);
        if (next && $isTextNode(next)) {
            next.select(0, 0);
        }
        else {
            $selectEnd();
        }
    }
    return renamedMention !== null;
}
function focusEditor(prev, next) {
    if (next && $isTextNode(next)) {
        next.select(0, 0);
    }
    else if (prev && $isTextNode(prev)) {
        prev.select();
    }
    else {
        $selectEnd();
    }
}
