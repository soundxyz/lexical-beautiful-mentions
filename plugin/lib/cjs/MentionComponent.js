"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const useLexicalNodeSelection_1 = require("@lexical/react/useLexicalNodeSelection");
const utils_1 = require("@lexical/utils");
const lexical_1 = require("lexical");
const react_1 = __importStar(require("react"));
const MentionNode_1 = require("./MentionNode");
const environment_1 = require("./environment");
const mention_utils_1 = require("./mention-utils");
function BeautifulMentionComponent(props) {
    const { value, trigger, data, className, classNameFocused, themeValues, nodeKey, component: Component, } = props;
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    const [isSelected, setSelected, clearSelection] = (0, useLexicalNodeSelection_1.useLexicalNodeSelection)(nodeKey);
    const [selection, setSelection] = (0, react_1.useState)(null);
    const isFocused = (0, lexical_1.$isNodeSelection)(selection) && isSelected;
    const ref = react_1.default.useRef(null);
    const mention = trigger + value;
    const finalClasses = (0, react_1.useMemo)(() => {
        if (className) {
            const classes = [className];
            if (isFocused && classNameFocused) {
                classes.push(classNameFocused);
            }
            return classes.join(" ").trim() || undefined;
        }
        return "";
    }, [isFocused, className, classNameFocused]);
    const onDelete = (0, react_1.useCallback)((payload) => {
        if (isSelected && (0, lexical_1.$isNodeSelection)((0, lexical_1.$getSelection)())) {
            payload.preventDefault();
            const node = (0, lexical_1.$getNodeByKey)(nodeKey);
            if ((0, MentionNode_1.$isBeautifulMentionNode)(node)) {
                node.remove();
            }
        }
        return false;
    }, [isSelected, nodeKey]);
    const onArrowLeftPress = (0, react_1.useCallback)((event) => {
        const node = (0, lexical_1.$getNodeByKey)(nodeKey);
        if (!node || !node.isSelected()) {
            return false;
        }
        let handled = false;
        const nodeToSelect = (0, mention_utils_1.getPreviousSibling)(node);
        if ((0, lexical_1.$isElementNode)(nodeToSelect)) {
            nodeToSelect.selectEnd();
            handled = true;
        }
        if ((0, lexical_1.$isTextNode)(nodeToSelect)) {
            nodeToSelect.select();
            handled = true;
        }
        if ((0, lexical_1.$isDecoratorNode)(nodeToSelect)) {
            nodeToSelect.selectNext();
            handled = true;
        }
        if (nodeToSelect === null) {
            node.selectPrevious();
            handled = true;
        }
        if (handled) {
            event.preventDefault();
        }
        return handled;
    }, [nodeKey]);
    const onArrowRightPress = (0, react_1.useCallback)((event) => {
        const node = (0, lexical_1.$getNodeByKey)(nodeKey);
        if (!node || !node.isSelected()) {
            return false;
        }
        let handled = false;
        const nodeToSelect = (0, mention_utils_1.getNextSibling)(node);
        if ((0, lexical_1.$isElementNode)(nodeToSelect)) {
            nodeToSelect.selectStart();
            handled = true;
        }
        if ((0, lexical_1.$isTextNode)(nodeToSelect)) {
            nodeToSelect.select(0, 0);
            handled = true;
        }
        if ((0, lexical_1.$isDecoratorNode)(nodeToSelect)) {
            nodeToSelect.selectPrevious();
            handled = true;
        }
        if (nodeToSelect === null) {
            node.selectNext();
            handled = true;
        }
        if (handled) {
            event.preventDefault();
        }
        return handled;
    }, [nodeKey]);
    const onClick = (0, react_1.useCallback)((event) => {
        var _a;
        if (event.target === ref.current ||
            ((_a = ref.current) === null || _a === void 0 ? void 0 : _a.contains(event.target))) {
            if (!event.shiftKey) {
                clearSelection();
            }
            setSelected(!isSelected);
            return true;
        }
        return false;
    }, [isSelected, clearSelection, setSelected]);
    const onBlur = (0, react_1.useCallback)(() => {
        if (isFocused) {
            (0, lexical_1.$setSelection)(null);
            return true;
        }
        return false;
    }, [isFocused]);
    // Make sure that the focus is removed when clicking next to the mention
    const onSelectionChange = (0, react_1.useCallback)(() => {
        if (environment_1.IS_IOS && isSelected) {
            setSelected(false);
            return true;
        }
        return false;
    }, [isSelected, setSelected]);
    react_1.default.useEffect(() => {
        let isMounted = true;
        const unregister = (0, utils_1.mergeRegister)(editor.registerUpdateListener(({ editorState }) => {
            if (isMounted) {
                setSelection(editorState.read(() => (0, lexical_1.$getSelection)()));
            }
        }), editor.registerCommand(lexical_1.CLICK_COMMAND, onClick, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_DELETE_COMMAND, onDelete, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_BACKSPACE_COMMAND, onDelete, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_ARROW_LEFT_COMMAND, onArrowLeftPress, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_ARROW_RIGHT_COMMAND, onArrowRightPress, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.BLUR_COMMAND, onBlur, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.SELECTION_CHANGE_COMMAND, onSelectionChange, lexical_1.COMMAND_PRIORITY_LOW));
        return () => {
            isMounted = false;
            unregister();
        };
    }, [
        editor,
        onArrowLeftPress,
        onArrowRightPress,
        onClick,
        onBlur,
        onDelete,
        onSelectionChange,
    ]);
    if (Component) {
        return ((0, jsx_runtime_1.jsx)(Component, { ref: ref, trigger: trigger, value: value, data: data, className: finalClasses, "data-beautiful-mention": mention, children: mention }));
    }
    if (themeValues) {
        return ((0, jsx_runtime_1.jsxs)("span", { ref: ref, className: isFocused && !!themeValues.containerFocused
                ? themeValues.containerFocused
                : themeValues.container, "data-beautiful-mention": mention, children: [(0, jsx_runtime_1.jsx)("span", { className: themeValues.trigger, children: trigger }), (0, jsx_runtime_1.jsx)("span", { className: themeValues.value, children: value })] }));
    }
    return ((0, jsx_runtime_1.jsx)("span", { ref: ref, className: finalClasses, "data-beautiful-mention": mention, children: mention }));
}
exports.default = BeautifulMentionComponent;
