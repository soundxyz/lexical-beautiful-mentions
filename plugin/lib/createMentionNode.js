import { BeautifulMentionNode, } from "./MentionNode";
export let CustomBeautifulMentionNode;
/**
 * Instead of using the default `BeautifulMentionNode` class, you can
 * extend it and use the mention component of your choice.
 */
export function createBeautifulMentionNode(mentionComponent) {
    CustomBeautifulMentionNode = generateClass(mentionComponent);
    return [
        CustomBeautifulMentionNode,
        {
            replace: BeautifulMentionNode,
            with: (node) => {
                return new CustomBeautifulMentionNode(node.getTrigger(), node.getValue(), node.getData());
            },
        },
    ];
}
function generateClass(mentionComponent) {
    return class CustomBeautifulMentionNode extends BeautifulMentionNode {
        static getType() {
            return "custom-beautifulMention";
        }
        static clone(node) {
            return new CustomBeautifulMentionNode(node.__trigger, node.__value, node.__data, node.__key);
        }
        static importJSON(serializedNode) {
            return new CustomBeautifulMentionNode(serializedNode.trigger, serializedNode.value, serializedNode.data);
        }
        exportJSON() {
            const data = this.__data;
            return Object.assign(Object.assign({ trigger: this.__trigger, value: this.__value }, (data ? { data } : {})), { type: "custom-beautifulMention", version: 1 });
        }
        component() {
            return mentionComponent;
        }
        decorate(editor, config) {
            return super.decorate(editor, config);
        }
    };
}
