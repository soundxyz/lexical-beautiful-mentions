"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$convertToMentionNodes = exports.convertToMentionEntries = void 0;
const lexical_1 = require("lexical");
const MentionNode_1 = require("./MentionNode");
const mention_utils_1 = require("./mention-utils");
function findMentions(text, triggers, punctuation) {
    const regex = new RegExp((0, mention_utils_1.TRIGGERS)(triggers) +
        "((?:" +
        (0, mention_utils_1.VALID_CHARS)(triggers, punctuation) +
        "){1," +
        mention_utils_1.LENGTH_LIMIT +
        "})", "g");
    const matches = [];
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
        matches.push({
            value: match[0],
            index: match.index,
        });
    }
    return matches;
}
function convertToMentionEntries(text, triggers, punctuation) {
    const matches = findMentions(text, triggers, punctuation);
    const result = [];
    let lastIndex = 0;
    matches.forEach(({ value, index }) => {
        // Add text before mention
        if (index > lastIndex) {
            const textBeforeMention = text.substring(lastIndex, index);
            result.push({ type: "text", value: textBeforeMention });
        }
        // Add mention
        const triggerRegExp = triggers.find((trigger) => new RegExp(trigger).test(value));
        const match = triggerRegExp && value.match(new RegExp(triggerRegExp));
        if (!match) {
            // should never happen since we only find mentions with the given triggers
            throw new Error("No trigger found for mention");
        }
        const trigger = match[0];
        result.push({
            type: "mention",
            value: value.substring(trigger.length),
            trigger,
        });
        // Update lastIndex
        lastIndex = index + value.length;
    });
    // Add text after last mention
    if (lastIndex < text.length) {
        const textAfterMentions = text.substring(lastIndex);
        result.push({ type: "text", value: textAfterMentions });
    }
    return result;
}
exports.convertToMentionEntries = convertToMentionEntries;
/**
 * Utility function that takes a string and converts it to a list of mention
 * and text nodes.<br>
 * 🚨 Only works for mentions without spaces. Make sure to disable spaces via
 * the `allowSpaces` prop.
 */
function $convertToMentionNodes(text, triggers, punctuation = mention_utils_1.DEFAULT_PUNCTUATION) {
    const entries = convertToMentionEntries(text, triggers, punctuation);
    const nodes = [];
    for (const entry of entries) {
        if (entry.type === "text") {
            nodes.push((0, lexical_1.$createTextNode)(entry.value));
        }
        else {
            nodes.push((0, MentionNode_1.$createBeautifulMentionNode)(entry.trigger, entry.value));
        }
    }
    return nodes;
}
exports.$convertToMentionNodes = $convertToMentionNodes;
