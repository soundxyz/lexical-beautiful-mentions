"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSelectionOnEntityBoundary = exports.useMenuAnchorRef = exports.Menu = exports.useDynamicPositioning = exports.getScrollParent = exports.$splitNodeContainingQuery = exports.MenuOption = void 0;
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const utils_1 = require("@lexical/utils");
const lexical_1 = require("lexical");
const react_1 = require("react");
const environment_1 = require("./environment");
const useLayoutEffectImpl = environment_1.CAN_USE_DOM
    ? react_1.useLayoutEffect
    : react_1.useEffect;
class MenuOption {
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
exports.MenuOption = MenuOption;
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
function $splitNodeContainingQuery(match) {
    const selection = (0, lexical_1.$getSelection)();
    if (!(0, lexical_1.$isRangeSelection)(selection) || !selection.isCollapsed()) {
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
    const textContent = anchorNode.getTextContent().slice(0, selectionOffset);
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
exports.$splitNodeContainingQuery = $splitNodeContainingQuery;
// Got from https://stackoverflow.com/a/42543908/2013580
function getScrollParent(element, includeHidden) {
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
exports.getScrollParent = getScrollParent;
function isTriggerVisibleInNearestScrollContainer(targetElement, containerElement) {
    const tRect = targetElement.getBoundingClientRect();
    const cRect = containerElement.getBoundingClientRect();
    return tRect.top > cRect.top && tRect.top < cRect.bottom;
}
// Reposition the menu on scroll, window resize, and element resize.
function useDynamicPositioning(resolution, targetElement, onReposition, onVisibilityChange, menuVisible) {
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    (0, react_1.useEffect)(() => {
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
exports.useDynamicPositioning = useDynamicPositioning;
function Menu({ close, editor, anchorElementRef, resolution, options, menuRenderFn, onSelectOption, onSelectionChange, shouldSplitNodeWithQuery = false, onMenuVisibilityChange, }) {
    const [selectedIndex, setSelectedIndex] = (0, react_1.useState)(null);
    const [menuVisible, setMenuVisible] = (0, react_1.useState)(false);
    const matchingString = resolution.match && resolution.match.matchingString;
    const setHighlightedIndex = (0, react_1.useCallback)((selectedIndex) => {
        setSelectedIndex(selectedIndex);
        onSelectionChange === null || onSelectionChange === void 0 ? void 0 : onSelectionChange(selectedIndex);
    }, [onSelectionChange]);
    (0, react_1.useEffect)(() => {
        if (environment_1.IS_MOBILE) {
            setHighlightedIndex(null);
        }
        else {
            setHighlightedIndex(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchingString]);
    const selectOptionAndCleanUp = (0, react_1.useCallback)((selectedEntry) => {
        editor.update(() => {
            const textNodeContainingQuery = resolution.match != null && shouldSplitNodeWithQuery
                ? $splitNodeContainingQuery(resolution.match)
                : null;
            onSelectOption(selectedEntry, textNodeContainingQuery, close, resolution.match ? resolution.match.matchingString : "");
        });
    }, [editor, shouldSplitNodeWithQuery, resolution.match, onSelectOption, close]);
    const updateSelectedIndex = (0, react_1.useCallback)((index) => {
        const rootElem = editor.getRootElement();
        if (rootElem !== null) {
            rootElem.setAttribute("aria-activedescendant", "typeahead-item-" + index);
            setHighlightedIndex(index);
        }
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor]);
    (0, react_1.useEffect)(() => {
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
        else if (selectedIndex === null && !environment_1.IS_MOBILE) {
            updateSelectedIndex(0);
        }
    }, [options, selectedIndex, updateSelectedIndex]);
    (0, react_1.useEffect)(() => {
        return (0, utils_1.mergeRegister)(editor.registerCommand(lexical_1.KEY_ARROW_DOWN_COMMAND, (payload) => {
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
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_ARROW_UP_COMMAND, (payload) => {
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
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_ESCAPE_COMMAND, (payload) => {
            const event = payload;
            event.preventDefault();
            event.stopImmediatePropagation();
            close();
            return true;
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.BLUR_COMMAND, (payload) => {
            const event = payload;
            event.preventDefault();
            event.stopImmediatePropagation();
            close();
            return false;
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_TAB_COMMAND, (payload) => {
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
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_ENTER_COMMAND, (event) => {
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
        }, lexical_1.COMMAND_PRIORITY_LOW));
    }, [
        selectOptionAndCleanUp,
        close,
        editor,
        options,
        selectedIndex,
        updateSelectedIndex,
    ]);
    const listItemProps = (0, react_1.useMemo)(() => ({
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
exports.Menu = Menu;
function findAnchorElement(className) {
    if (!className) {
        return null;
    }
    else {
        const anchorElements = document.getElementsByClassName(className);
        if (anchorElements.length) {
            return anchorElements[0];
        }
        else {
            console.log(`couldn't find anchor (initially): ${className}`);
            return null;
        }
    }
}
function useMenuAnchorRef(opt) {
    const { resolution, setResolution, className, menuVisible, menuContainerClassName } = opt;
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    const anchorElementRef = (0, react_1.useRef)(document.createElement('div'));
    const positionMenu = (0, react_1.useCallback)(() => {
        const rootElement = editor.getRootElement();
        const renderingContainer = findAnchorElement(menuContainerClassName) || document.body;
        const containerDiv = anchorElementRef.current;
        const menuEle = containerDiv.firstChild;
        if (rootElement !== null && resolution !== null) {
            const { left, top, height } = resolution.getRect();
            containerDiv.style.top = `${top - renderingContainer.offsetTop + window.pageYOffset}px`;
            containerDiv.style.left = `${left - renderingContainer.offsetLeft + window.pageXOffset}px`;
            containerDiv.style.height = `${height}px`;
            if (menuEle !== null) {
                const menuRect = menuEle.getBoundingClientRect();
                const menuHeight = menuRect.height;
                const menuWidth = menuRect.width;
                const rootElementRect = rootElement.getBoundingClientRect();
                if (left + menuWidth > rootElementRect.right) {
                    containerDiv.style.left = `${rootElementRect.right - menuWidth + window.pageXOffset}px`;
                }
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
                renderingContainer.append(containerDiv);
            }
            anchorElementRef.current = containerDiv;
            rootElement.setAttribute("aria-controls", "typeahead-menu");
        }
    }, [editor, resolution, menuContainerClassName, className]);
    (0, react_1.useEffect)(() => {
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
    const onVisibilityChange = (0, react_1.useCallback)((isInView) => {
        if (resolution !== null) {
            if (!isInView) {
                setResolution(null);
            }
        }
    }, [resolution, setResolution]);
    useDynamicPositioning(resolution, anchorElementRef.current, positionMenu, onVisibilityChange, menuVisible);
    return anchorElementRef;
}
exports.useMenuAnchorRef = useMenuAnchorRef;
function isSelectionOnEntityBoundary(editor, offset) {
    if (offset !== 0) {
        return false;
    }
    return editor.getEditorState().read(() => {
        const selection = (0, lexical_1.$getSelection)();
        if ((0, lexical_1.$isRangeSelection)(selection)) {
            const anchor = selection.anchor;
            const anchorNode = anchor.getNode();
            const prevSibling = anchorNode.getPreviousSibling();
            return (0, lexical_1.$isTextNode)(prevSibling) && prevSibling.isTextEntity();
        }
        return false;
    });
}
exports.isSelectionOnEntityBoundary = isSelectionOnEntityBoundary;
