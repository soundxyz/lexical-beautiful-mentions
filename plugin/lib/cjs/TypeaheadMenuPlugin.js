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
exports.TypeaheadMenuPlugin = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const lexical_1 = require("lexical");
const react_1 = __importStar(require("react"));
const Menu_1 = require("./Menu");
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
        const selection = (0, lexical_1.$getSelection)();
        if (!(0, lexical_1.$isRangeSelection)(selection)) {
            return;
        }
        text = getTextUpToAnchor(selection);
    });
    return text;
}
function startTransition(callback) {
    if (react_1.default.startTransition) {
        react_1.default.startTransition(callback);
    }
    else {
        callback();
    }
}
function TypeaheadMenuPlugin({ options, onQueryChange, onSelectionChange, onSelectOption, onOpen, onClose, menuRenderFn, triggerFn, anchorClassName, }) {
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    const [resolution, setResolution] = (0, react_1.useState)(null);
    const [menuVisible, setMenuVisible] = (0, react_1.useState)(false);
    const anchorElementRef = (0, Menu_1.useMenuAnchorRef)({
        resolution,
        setResolution,
        className: anchorClassName,
        menuVisible,
    });
    const closeTypeahead = (0, react_1.useCallback)(() => {
        setResolution(null);
        if (onClose != null && resolution !== null) {
            onClose();
        }
    }, [onClose, resolution]);
    const openTypeahead = (0, react_1.useCallback)((res) => {
        setResolution(res);
        if (onOpen != null && resolution === null) {
            onOpen(res);
        }
    }, [onOpen, resolution]);
    (0, react_1.useEffect)(() => {
        if (resolution === null && menuVisible) {
            setMenuVisible(false);
        }
        const updateListener = () => {
            editor.getEditorState().read(() => {
                const range = document.createRange();
                const selection = (0, lexical_1.$getSelection)();
                const text = getQueryTextForSearch(editor);
                if (!(0, lexical_1.$isRangeSelection)(selection) ||
                    !selection.isCollapsed() ||
                    text === null ||
                    range === null) {
                    closeTypeahead();
                    return;
                }
                const match = triggerFn(text, editor);
                onQueryChange(match ? match.matchingString : null);
                if (match !== null &&
                    !(0, Menu_1.isSelectionOnEntityBoundary)(editor, match.leadOffset)) {
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
    return resolution === null || editor === null ? null : ((0, jsx_runtime_1.jsx)(Menu_1.Menu, { close: closeTypeahead, resolution: resolution, editor: editor, anchorElementRef: anchorElementRef, options: options, menuRenderFn: menuRenderFn, onSelectOption: onSelectOption, onSelectionChange: onSelectionChange, onMenuVisibilityChange: setMenuVisible, shouldSplitNodeWithQuery: true }));
}
exports.TypeaheadMenuPlugin = TypeaheadMenuPlugin;
