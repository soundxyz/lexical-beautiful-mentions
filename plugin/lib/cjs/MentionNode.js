"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.$isBeautifulMentionNode = exports.$createBeautifulMentionNode = exports.BeautifulMentionNode = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const lexical_1 = require("lexical");
const MentionComponent_1 = __importDefault(require("./MentionComponent"));
function convertElement(domNode) {
    const trigger = domNode.getAttribute("data-lexical-beautiful-mention-trigger");
    const value = domNode.getAttribute("data-lexical-beautiful-mention-value");
    let data = undefined;
    const dataStr = domNode.getAttribute("data-lexical-beautiful-mention-data");
    if (dataStr) {
        try {
            data = JSON.parse(dataStr);
        }
        catch (e) {
            console.warn("Failed to parse data attribute of beautiful mention node", e);
        }
    }
    if (trigger != null && value !== null) {
        const node = $createBeautifulMentionNode(trigger, value, data);
        return { node };
    }
    return null;
}
/**
 * This node is used to represent a mention used in the BeautifulMentionPlugin.
 */
class BeautifulMentionNode extends lexical_1.DecoratorNode {
    static getType() {
        return "beautifulMention";
    }
    static clone(node) {
        return new BeautifulMentionNode(node.__trigger, node.__value, node.__data, node.__key);
    }
    static importJSON(serializedNode) {
        return $createBeautifulMentionNode(serializedNode.trigger, serializedNode.value, serializedNode.data);
    }
    exportDOM() {
        const element = document.createElement("span");
        element.setAttribute("data-lexical-beautiful-mention", "true");
        element.setAttribute("data-lexical-beautiful-mention-trigger", this.__trigger);
        element.setAttribute("data-lexical-beautiful-mention-value", this.__value);
        if (this.__data) {
            element.setAttribute("data-lexical-beautiful-mention-data", JSON.stringify(this.__data));
        }
        element.textContent = this.getTextContent();
        return { element };
    }
    static importDOM() {
        return {
            span: (domNode) => {
                if (!domNode.hasAttribute("data-lexical-beautiful-mention")) {
                    return null;
                }
                return {
                    conversion: convertElement,
                    priority: 0,
                };
            },
        };
    }
    constructor(trigger, value, data, key) {
        super(key);
        this.__trigger = trigger;
        this.__value = value;
        this.__data = data;
    }
    exportJSON() {
        const data = this.__data;
        return Object.assign(Object.assign({ trigger: this.__trigger, value: this.__value }, (data ? { data } : {})), { type: "beautifulMention", version: 1 });
    }
    createDOM() {
        return document.createElement("span");
    }
    getTextContent() {
        return this.__trigger + this.__value;
    }
    updateDOM() {
        return false;
    }
    getTrigger() {
        const self = this.getLatest();
        return self.__trigger;
    }
    getValue() {
        const self = this.getLatest();
        return self.__value;
    }
    setValue(value) {
        const self = this.getWritable();
        self.__value = value;
    }
    getData() {
        const self = this.getLatest();
        return self.__data;
    }
    setData(data) {
        const self = this.getWritable();
        self.__data = data;
    }
    component() {
        return null;
    }
    decorate(_editor, config) {
        const theme = config.theme.beautifulMentions || {};
        const entry = Object.entries(theme).find(([trigger]) => new RegExp(trigger).test(this.__trigger));
        const key = entry && entry[0];
        const value = entry && entry[1];
        const className = typeof value === "string" ? value : undefined;
        const classNameFocused = className && typeof theme[key + "Focused"] === "string"
            ? theme[key + "Focused"]
            : undefined;
        const themeValues = entry && typeof value !== "string" ? value : undefined;
        return ((0, jsx_runtime_1.jsx)(MentionComponent_1.default, { nodeKey: this.getKey(), trigger: this.getTrigger(), value: this.getValue(), data: this.getData(), className: className, classNameFocused: classNameFocused, themeValues: themeValues, component: this.component() }));
    }
}
exports.BeautifulMentionNode = BeautifulMentionNode;
function $createBeautifulMentionNode(trigger, value, data) {
    const mentionNode = new BeautifulMentionNode(trigger, value, data);
    return (0, lexical_1.$applyNodeReplacement)(mentionNode);
}
exports.$createBeautifulMentionNode = $createBeautifulMentionNode;
function $isBeautifulMentionNode(node) {
    return node instanceof BeautifulMentionNode;
}
exports.$isBeautifulMentionNode = $isBeautifulMentionNode;
