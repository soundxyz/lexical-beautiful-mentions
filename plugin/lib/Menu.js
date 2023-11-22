import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $getSelection, $isRangeSelection, $isTextNode, BLUR_COMMAND, COMMAND_PRIORITY_LOW, KEY_ARROW_DOWN_COMMAND, KEY_ARROW_UP_COMMAND, KEY_ENTER_COMMAND, KEY_ESCAPE_COMMAND, KEY_TAB_COMMAND, } from "lexical";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { CAN_USE_DOM, IS_MOBILE } from "./environment";
import { getTextContent } from "./mention-utils";
const useLayoutEffectImpl = CAN_USE_DOM
    ? useLayoutEffect
    : useEffect;
export class MenuOption {
    constructor(
    /**
     * The menu item value. For example: "John".
     */
    value, 
    /**
     * The value to be displayed. Normally the same as `value` but can be
     * used to display a different value. For example: "Add 'John'".
     */
    displayValue, 
    /**
     * Additional data belonging to the option. For example: `{ id: 1 }`.
     */
    data) {
        this.value = value;
        this.displayValue = displayValue;
        this.data = data;
        this.key = !data ? value : JSON.stringify(Object.assign(Object.assign({}, data), { value }));
        this.displayValue = displayValue !== null && displayValue !== void 0 ? displayValue : value;
        this.ref = { current: null };
        this.setRefElement = this.setRefElement.bind(this);
    }
    setRefElement(element) {
        this.ref = { current: element };
    }
}
const scrollIntoViewIfNeeded = (target) => {
    const typeaheadContainerNode = document.getElementById("typeahead-menu");
    if (!typeaheadContainerNode)
        return;
    const typeaheadRect = typeaheadContainerNode.getBoundingClientRect();
    if (typeaheadRect.top + typeaheadRect.height > window.innerHeight) {
        typeaheadContainerNode.scrollIntoView({
            block: "center",
        });
    }
    if (typeaheadRect.top < 0) {
        typeaheadContainerNode.scrollIntoView({
            block: "center",
        });
    }
    target.scrollIntoView({ block: "nearest" });
};
/**
 * Walk backwards along user input and forward through entity title to try
 * and replace more of the user's text with entity.
 */
function getFullMatchOffset(documentText, entryText, offset) {
    let triggerOffset = offset;
    for (let i = triggerOffset; i <= entryText.length; i++) {
        if (documentText.substring(-i) === entryText.substring(0, i)) {
            triggerOffset = i;
        }
    }
    return triggerOffset;
}
/**
 * Split Lexical TextNode and return a new TextNode only containing matched text.
 * Common use cases include: removing the node, replacing with a new node.
 */
export function $splitNodeContainingQuery(match) {
    const selection = $getSelection();
    if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        return null;
    }
    const anchor = selection.anchor;
    if (anchor.type !== "text") {
        return null;
    }
    const anchorNode = anchor.getNode();
    if (!anchorNode.isSimpleText()) {
        return null;
    }
    const selectionOffset = anchor.offset;
    const textContent = getTextContent(anchorNode).slice(0, selectionOffset);
    const characterOffset = match.replaceableString.length;
    const queryOffset = getFullMatchOffset(textContent, match.matchingString, characterOffset);
    const startOffset = selectionOffset - queryOffset;
    if (startOffset < 0) {
        return null;
    }
    let newNode;
    if (startOffset === 0) {
        [newNode] = anchorNode.splitText(selectionOffset);
    }
    else {
        [, newNode] = anchorNode.splitText(startOffset, selectionOffset);
    }
    return newNode;
}
// Got from https://stackoverflow.com/a/42543908/2013580
export function getScrollParent(element, includeHidden) {
    let style = getComputedStyle(element);
    const excludeStaticParent = style.position === "absolute";
    const overflowRegex = includeHidden
        ? /(auto|scroll|hidden)/
        : /(auto|scroll)/;
    if (style.position === "fixed") {
        return document.body;
    }
    for (let parent = element; (parent = parent.parentElement);) {
        style = getComputedStyle(parent);
        if (excludeStaticParent && style.position === "static") {
            continue;
        }
        if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
            return parent;
        }
    }
    return document.body;
}
function isTriggerVisibleInNearestScrollContainer(targetElement, containerElement) {
    const tRect = targetElement.getBoundingClientRect();
    const cRect = containerElement.getBoundingClientRect();
    return tRect.top > cRect.top && tRect.top < cRect.bottom;
}
// Reposition the menu on scroll, window resize, and element resize.
export function useDynamicPositioning(resolution, targetElement, onReposition, onVisibilityChange, menuVisible) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        if (targetElement != null && resolution != null && menuVisible) {
            const rootElement = editor.getRootElement();
            const rootScrollParent = rootElement != null
                ? getScrollParent(rootElement, false)
                : document.body;
            let ticking = false;
            let previousIsInView = isTriggerVisibleInNearestScrollContainer(targetElement, rootScrollParent);
            const handleScroll = function () {
                if (!ticking) {
                    window.requestAnimationFrame(function () {
                        onReposition();
                        ticking = false;
                    });
                    ticking = true;
                }
                const isInView = isTriggerVisibleInNearestScrollContainer(targetElement, rootScrollParent);
                if (isInView !== previousIsInView) {
                    previousIsInView = isInView;
                    if (onVisibilityChange != null) {
                        onVisibilityChange(isInView);
                    }
                }
            };
            const resizeObserver = new ResizeObserver(onReposition);
            window.addEventListener("resize", onReposition);
            document.addEventListener("scroll", handleScroll, {
                capture: true,
                passive: true,
            });
            resizeObserver.observe(targetElement);
            return () => {
                resizeObserver.unobserve(targetElement);
                window.removeEventListener("resize", onReposition);
                document.removeEventListener("scroll", handleScroll);
            };
        }
    }, [
        targetElement,
        editor,
        onVisibilityChange,
        onReposition,
        resolution,
        menuVisible,
    ]);
}
export function Menu({ close, editor, anchorElementRef, resolution, options, menuRenderFn, onSelectOption, onSelectionChange, shouldSplitNodeWithQuery = false, onMenuVisibilityChange, }) {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const matchingString = resolution.match && resolution.match.matchingString;
    const setHighlightedIndex = useCallback((selectedIndex) => {
        setSelectedIndex(selectedIndex);
        onSelectionChange === null || onSelectionChange === void 0 ? void 0 : onSelectionChange(selectedIndex);
    }, [onSelectionChange]);
    useEffect(() => {
        if (IS_MOBILE) {
            setHighlightedIndex(null);
        }
        else {
            setHighlightedIndex(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchingString]);
    const selectOptionAndCleanUp = useCallback((selectedEntry) => {
        editor.update(() => {
            const textNodeContainingQuery = resolution.match != null && shouldSplitNodeWithQuery
                ? $splitNodeContainingQuery(resolution.match)
                : null;
            onSelectOption(selectedEntry, textNodeContainingQuery, close, resolution.match ? resolution.match.matchingString : "");
        });
    }, [editor, shouldSplitNodeWithQuery, resolution.match, onSelectOption, close]);
    const updateSelectedIndex = useCallback((index) => {
        const rootElem = editor.getRootElement();
        if (rootElem !== null) {
            rootElem.setAttribute("aria-activedescendant", "typeahead-item-" + index);
            setHighlightedIndex(index);
        }
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor]);
    useEffect(() => {
        return () => {
            const rootElem = editor.getRootElement();
            if (rootElem !== null) {
                rootElem.removeAttribute("aria-activedescendant");
            }
        };
    }, [editor]);
    useLayoutEffectImpl(() => {
        if (options === null) {
            setHighlightedIndex(null);
        }
        else if (selectedIndex === null && !IS_MOBILE) {
            updateSelectedIndex(0);
        }
    }, [options, selectedIndex, updateSelectedIndex]);
    useEffect(() => {
        return mergeRegister(editor.registerCommand(KEY_ARROW_DOWN_COMMAND, (payload) => {
            const event = payload;
            if (options !== null && options.length) {
                const currIndex = selectedIndex !== null && selectedIndex !== void 0 ? selectedIndex : -1;
                const newSelectedIndex = currIndex !== options.length - 1 ? currIndex + 1 : 0;
                updateSelectedIndex(newSelectedIndex);
                const option = options[newSelectedIndex];
                if (option.ref != null && option.ref.current) {
                    scrollIntoViewIfNeeded(option.ref.current);
                }
                event.preventDefault();
                event.stopImmediatePropagation();
            }
            return true;
        }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_ARROW_UP_COMMAND, (payload) => {
            const event = payload;
            if (options !== null && options.length) {
                const currIndex = selectedIndex !== null && selectedIndex !== void 0 ? selectedIndex : options.length;
                const newSelectedIndex = currIndex !== 0 ? currIndex - 1 : options.length - 1;
                updateSelectedIndex(newSelectedIndex);
                const option = options[newSelectedIndex];
                if (option.ref != null && option.ref.current) {
                    scrollIntoViewIfNeeded(option.ref.current);
                }
                event.preventDefault();
                event.stopImmediatePropagation();
            }
            return true;
        }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_ESCAPE_COMMAND, (payload) => {
            const event = payload;
            event.preventDefault();
            event.stopImmediatePropagation();
            close();
            return true;
        }, COMMAND_PRIORITY_LOW), editor.registerCommand(BLUR_COMMAND, (payload) => {
            const event = payload;
            event.preventDefault();
            event.stopImmediatePropagation();
            close();
            return false;
        }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_TAB_COMMAND, (payload) => {
            const event = payload;
            if (options === null ||
                selectedIndex === null ||
                options[selectedIndex] == null) {
                return false;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            selectOptionAndCleanUp(options[selectedIndex]);
            return true;
        }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_ENTER_COMMAND, (event) => {
            if (options === null ||
                selectedIndex === null ||
                options[selectedIndex] == null) {
                return false;
            }
            if (event !== null) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
            selectOptionAndCleanUp(options[selectedIndex]);
            return true;
        }, COMMAND_PRIORITY_LOW));
    }, [
        selectOptionAndCleanUp,
        close,
        editor,
        options,
        selectedIndex,
        updateSelectedIndex,
    ]);
    const listItemProps = useMemo(() => ({
        options,
        selectOptionAndCleanUp,
        selectedIndex,
        setHighlightedIndex,
    }), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectOptionAndCleanUp, selectedIndex, options]);
    const menu = menuRenderFn(anchorElementRef, listItemProps, resolution.match ? resolution.match.matchingString : "");
    useLayoutEffectImpl(() => {
        if (onMenuVisibilityChange && menu !== null && !menuVisible) {
            onMenuVisibilityChange(true);
            setMenuVisible(true);
        }
        else if (onMenuVisibilityChange && menu === null && menuVisible) {
            onMenuVisibilityChange(false);
            setMenuVisible(false);
        }
    }, [menu, menuVisible, onMenuVisibilityChange]);
    return menu;
}
export function useMenuAnchorRef(opt) {
    const { resolution, setResolution, className, menuVisible } = opt;
    const [editor] = useLexicalComposerContext();
    const anchorElementRef = useRef(document.createElement("div"));
    const positionMenu = useCallback(() => {
        const rootElement = editor.getRootElement();
        const containerDiv = anchorElementRef.current;
        const menuEle = containerDiv.firstChild;
        if (rootElement !== null && resolution !== null) {
            const { left, top, height } = resolution.getRect();
            containerDiv.style.top = `${Math.max(top + window.pageYOffset, 0)}px`;
            containerDiv.style.left = `${Math.max(left + window.pageXOffset, 0)}px`;
            containerDiv.style.height = `${height}px`;
            if (menuEle !== null) {
                const menuRect = menuEle.getBoundingClientRect();
                // const menuHeight = menuRect.height;
                const menuWidth = menuRect.width;
                const rootElementRect = rootElement.getBoundingClientRect();
                console.log(`rootElementRect`, rootElementRect);
                console.log(`resolutionRect: `, resolution.getRect());
                console.log(`rootElement offset: `, rootElement.offsetLeft);
                if (left + menuWidth > rootElementRect.right) {
                    containerDiv.style.left = `${rootElementRect.right - menuWidth + window.pageXOffset}px`;
                }
                /**
                 * We only want to render the drodpown below
                 */
                // const margin = 10;
                // if (
                //   (top + menuHeight > window.innerHeight ||
                //     top + menuHeight > rootElementRect.bottom) &&
                //   top - rootElementRect.top > menuHeight
                // ) {
                //   containerDiv.style.top = `${
                //     top - menuHeight + window.pageYOffset - (height + margin)
                //   }px`;
                // }
            }
            if (!containerDiv.isConnected) {
                if (className) {
                    containerDiv.className = className;
                }
                containerDiv.setAttribute("aria-label", "Typeahead menu");
                containerDiv.setAttribute("id", "typeahead-menu");
                containerDiv.setAttribute("role", "listbox");
                containerDiv.style.display = "block";
                containerDiv.style.position = "absolute";
                document.body.append(containerDiv);
            }
            anchorElementRef.current = containerDiv;
            rootElement.setAttribute("aria-controls", "typeahead-menu");
        }
    }, [editor, resolution, className]);
    useEffect(() => {
        const rootElement = editor.getRootElement();
        const removeMenu = () => {
            const containerDiv = anchorElementRef.current;
            if (containerDiv !== null && containerDiv.isConnected) {
                containerDiv.remove();
            }
        };
        if (resolution !== null && menuVisible) {
            positionMenu();
            return () => {
                if (rootElement !== null) {
                    rootElement.removeAttribute("aria-controls");
                }
                removeMenu();
            };
        }
        else if (!menuVisible) {
            removeMenu();
        }
    }, [editor, positionMenu, resolution, menuVisible]);
    const onVisibilityChange = useCallback((isInView) => {
        if (resolution !== null) {
            if (!isInView) {
                // setResolution(null); don't remove resolution to support scroll
            }
        }
    }, [resolution, setResolution]);
    useDynamicPositioning(resolution, anchorElementRef.current, positionMenu, onVisibilityChange, menuVisible);
    return anchorElementRef;
}
export function isSelectionOnEntityBoundary(editor, offset) {
    if (offset !== 0) {
        return false;
    }
    return editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const anchor = selection.anchor;
            const anchorNode = anchor.getNode();
            const prevSibling = anchorNode.getPreviousSibling();
            return $isTextNode(prevSibling) && prevSibling.isTextEntity();
        }
        return false;
    });
}
