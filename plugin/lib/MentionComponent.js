import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import { $getNodeByKey, $getSelection, $isDecoratorNode, $isElementNode, $isNodeSelection, $isTextNode, $setSelection, BLUR_COMMAND, CLICK_COMMAND, COMMAND_PRIORITY_LOW, KEY_ARROW_LEFT_COMMAND, KEY_ARROW_RIGHT_COMMAND, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND, SELECTION_CHANGE_COMMAND, } from "lexical";
import React, { useCallback, useMemo, useState } from "react";
import { $isBeautifulMentionNode } from "./MentionNode";
import { IS_IOS } from "./environment";
import { getNextSibling, getPreviousSibling } from "./mention-utils";
export default function BeautifulMentionComponent(props) {
    const { value, trigger, data, className, classNameFocused, themeValues, nodeKey, component: Component, } = props;
    const [editor] = useLexicalComposerContext();
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const [selection, setSelection] = useState(null);
    const isFocused = $isNodeSelection(selection) && isSelected;
    const ref = React.useRef(null);
    const mention = trigger + value;
    const finalClasses = useMemo(() => {
        if (className) {
            const classes = [className];
            if (isFocused && classNameFocused) {
                classes.push(classNameFocused);
            }
            return classes.join(" ").trim() || undefined;
        }
        return "";
    }, [isFocused, className, classNameFocused]);
    const onDelete = useCallback((payload) => {
        if (isSelected && $isNodeSelection($getSelection())) {
            payload.preventDefault();
            const node = $getNodeByKey(nodeKey);
            if ($isBeautifulMentionNode(node)) {
                node.remove();
            }
        }
        return false;
    }, [isSelected, nodeKey]);
    const onArrowLeftPress = useCallback((event) => {
        const node = $getNodeByKey(nodeKey);
        if (!node || !node.isSelected()) {
            return false;
        }
        let handled = false;
        const nodeToSelect = getPreviousSibling(node);
        if ($isElementNode(nodeToSelect)) {
            nodeToSelect.selectEnd();
            handled = true;
        }
        if ($isTextNode(nodeToSelect)) {
            nodeToSelect.select();
            handled = true;
        }
        if ($isDecoratorNode(nodeToSelect)) {
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
    const onArrowRightPress = useCallback((event) => {
        const node = $getNodeByKey(nodeKey);
        if (!node || !node.isSelected()) {
            return false;
        }
        let handled = false;
        const nodeToSelect = getNextSibling(node);
        if ($isElementNode(nodeToSelect)) {
            nodeToSelect.selectStart();
            handled = true;
        }
        if ($isTextNode(nodeToSelect)) {
            nodeToSelect.select(0, 0);
            handled = true;
        }
        if ($isDecoratorNode(nodeToSelect)) {
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
    const onClick = useCallback((event) => {
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
    const onBlur = useCallback(() => {
        if (isFocused) {
            $setSelection(null);
            return true;
        }
        return false;
    }, [isFocused]);
    // Make sure that the focus is removed when clicking next to the mention
    const onSelectionChange = useCallback(() => {
        if (IS_IOS && isSelected) {
            setSelected(false);
            return true;
        }
        return false;
    }, [isSelected, setSelected]);
    React.useEffect(() => {
        let isMounted = true;
        const unregister = mergeRegister(editor.registerUpdateListener(({ editorState }) => {
            if (isMounted) {
                setSelection(editorState.read(() => $getSelection()));
            }
        }), editor.registerCommand(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_ARROW_LEFT_COMMAND, onArrowLeftPress, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_ARROW_RIGHT_COMMAND, onArrowRightPress, COMMAND_PRIORITY_LOW), editor.registerCommand(BLUR_COMMAND, onBlur, COMMAND_PRIORITY_LOW), editor.registerCommand(SELECTION_CHANGE_COMMAND, onSelectionChange, COMMAND_PRIORITY_LOW));
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
        return (_jsx(Component, { ref: ref, trigger: trigger, value: value, data: data, className: finalClasses, "data-beautiful-mention": mention, children: mention }));
    }
    if (themeValues) {
        return (_jsxs("span", { ref: ref, className: isFocused && !!themeValues.containerFocused
                ? themeValues.containerFocused
                : themeValues.container, "data-beautiful-mention": mention, children: [_jsx("span", { className: themeValues.trigger, children: trigger }), _jsx("span", { className: themeValues.value, children: value })] }));
    }
    return (_jsx("span", { ref: ref, className: finalClasses, "data-beautiful-mention": mention, children: mention }));
}
