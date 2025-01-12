import { jsx as _jsx } from "react/jsx-runtime";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, } from "lexical";
import React, { useCallback, useEffect, useState } from "react";
import { Menu, isSelectionOnEntityBoundary, useMenuAnchorRef, } from "./Menu";
function getTextUpToAnchor(selection) {
    const anchor = selection.anchor;
    if (anchor.type !== "text") {
        return null;
    }
    const anchorNode = anchor.getNode();
    if (!anchorNode.isSimpleText()) {
        return null;
    }
    const anchorOffset = anchor.offset;
    return anchorNode.getTextContent().slice(0, anchorOffset);
}
function tryToPositionRange(leadOffset, range) {
    const domSelection = window.getSelection();
    if (domSelection === null || !domSelection.isCollapsed) {
        return false;
    }
    const anchorNode = domSelection.anchorNode;
    const startOffset = leadOffset;
    const endOffset = domSelection.anchorOffset;
    if (anchorNode == null || endOffset == null) {
        return false;
    }
    try {
        range.setStart(anchorNode, startOffset);
        range.setEnd(anchorNode, endOffset);
    }
    catch (error) {
        return false;
    }
    return true;
}
function getQueryTextForSearch(editor) {
    let text = null;
    editor.getEditorState().read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
            return;
        }
        text = getTextUpToAnchor(selection);
    });
    return text;
}
function startTransition(callback) {
    if (React.startTransition) {
        React.startTransition(callback);
    }
    else {
        callback();
    }
}
export function TypeaheadMenuPlugin({ options, onQueryChange, onSelectionChange, onSelectOption, onOpen, onClose, menuRenderFn, triggerFn, anchorClassName, menuContainerClassName }) {
    const [editor] = useLexicalComposerContext();
    const [resolution, setResolution] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const anchorElementRef = useMenuAnchorRef({
        resolution,
        setResolution,
        className: anchorClassName,
        menuContainerClassName,
        menuVisible,
    });
    const closeTypeahead = useCallback(() => {
        setResolution(null);
        if (onClose != null && resolution !== null) {
            onClose();
        }
    }, [onClose, resolution]);
    const openTypeahead = useCallback((res) => {
        setResolution(res);
        if (onOpen != null && resolution === null) {
            onOpen(res);
        }
    }, [onOpen, resolution]);
    useEffect(() => {
        if (resolution === null && menuVisible) {
            setMenuVisible(false);
        }
        const updateListener = () => {
            editor.getEditorState().read(() => {
                const range = document.createRange();
                const selection = $getSelection();
                const text = getQueryTextForSearch(editor);
                if (!$isRangeSelection(selection) ||
                    !selection.isCollapsed() ||
                    text === null ||
                    range === null) {
                    closeTypeahead();
                    return;
                }
                const match = triggerFn(text, editor);
                onQueryChange(match ? match.matchingString : null);
                if (match !== null &&
                    !isSelectionOnEntityBoundary(editor, match.leadOffset)) {
                    const isRangePositioned = tryToPositionRange(match.leadOffset, range);
                    if (isRangePositioned !== null) {
                        startTransition(() => openTypeahead({
                            getRect: () => range.getBoundingClientRect(),
                            match,
                        }));
                        return;
                    }
                }
                closeTypeahead();
            });
        };
        const removeUpdateListener = editor.registerUpdateListener(updateListener);
        return () => {
            removeUpdateListener();
        };
    }, [
        editor,
        triggerFn,
        onQueryChange,
        resolution,
        closeTypeahead,
        openTypeahead,
        menuVisible,
        setMenuVisible,
    ]);
    return resolution === null || editor === null ? null : (_jsx(Menu, { close: closeTypeahead, resolution: resolution, editor: editor, anchorElementRef: anchorElementRef, options: options, menuRenderFn: menuRenderFn, onSelectOption: onSelectOption, onSelectionChange: onSelectionChange, onMenuVisibilityChange: setMenuVisible, shouldSplitNodeWithQuery: true }));
}
