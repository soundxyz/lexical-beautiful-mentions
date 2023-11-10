"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeroWidthPlugin = void 0;
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const utils_1 = require("@lexical/utils");
const lexical_1 = require("lexical");
const react_1 = __importDefault(require("react"));
const ZeroWidthNode_1 = require("./ZeroWidthNode");
/**
 * This plugin serves as a patch to fix an incorrect cursor position in Safari.
 * It also ensures that the cursor is correctly aligned with the line height in
 * all browsers.
 * {@link https://github.com/facebook/lexical/issues/4487}.
 */
function ZeroWidthPlugin() {
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    react_1.default.useEffect(() => {
        return (0, utils_1.mergeRegister)(editor.registerUpdateListener(() => {
            // add a zero-width space node at the end if the last node is a decorator node
            editor.update(() => {
                const root = (0, lexical_1.$getRoot)();
                const last = root.getLastDescendant();
                if ((0, lexical_1.$isDecoratorNode)(last)) {
                    last.insertAfter((0, ZeroWidthNode_1.$createZeroWidthNode)());
                }
            }, 
            // merge with previous history entry to allow undoing
            { tag: "history-merge" });
        }), editor.registerCommand(lexical_1.KEY_DOWN_COMMAND, (event) => {
            // prevent the unnecessary removal of the zero-width space, since this
            // would lead to the insertion of another zero-width space and thus break
            // undo with Ctrl+z
            if (event.ctrlKey || event.metaKey || event.altKey) {
                return false;
            }
            // remove the zero-width space if the user starts typing
            const selection = (0, lexical_1.$getSelection)();
            if ((0, lexical_1.$isRangeSelection)(selection)) {
                const node = selection.anchor.getNode();
                if ((0, ZeroWidthNode_1.$isZeroWidthNode)(node)) {
                    node.remove();
                }
            }
            return false;
        }, lexical_1.COMMAND_PRIORITY_HIGH), editor.registerCommand(lexical_1.SELECTION_CHANGE_COMMAND, () => {
            // select the previous node to avoid an error that occurs when the
            // user tries to insert a node directly after the zero-width space
            const selection = (0, lexical_1.$getSelection)();
            if ((0, lexical_1.$isRangeSelection)(selection)) {
                const node = selection.anchor.getNode();
                if ((0, ZeroWidthNode_1.$isZeroWidthNode)(node)) {
                    node.selectPrevious();
                }
            }
            return false;
        }, lexical_1.COMMAND_PRIORITY_HIGH));
    }, [editor]);
    return null;
}
exports.ZeroWidthPlugin = ZeroWidthPlugin;
