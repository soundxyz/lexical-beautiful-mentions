import { jsx as _jsx } from "react/jsx-runtime";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $createTextNode, $getSelection, $isRangeSelection, CLICK_COMMAND, COMMAND_PRIORITY_LOW, COMMAND_PRIORITY_NORMAL, FOCUS_COMMAND, KEY_ARROW_DOWN_COMMAND, KEY_ARROW_UP_COMMAND, KEY_BACKSPACE_COMMAND, KEY_DOWN_COMMAND, KEY_ENTER_COMMAND, KEY_ESCAPE_COMMAND, KEY_TAB_COMMAND, } from "lexical";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as ReactDOM from "react-dom";
import { $splitNodeContainingQuery, MenuOption, } from "./Menu";
import { CAN_USE_DOM, IS_MOBILE } from "./environment";
import { $insertTriggerAtSelection } from "./mention-commands";
import { useIsFocused } from "./useIsFocused";
class ComboboxOption extends MenuOption {
    constructor(itemType, value, displayValue, data = {}) {
        super(value, displayValue, data);
        this.itemType = itemType;
        this.comboboxItem = {
            itemType: itemType,
            value: value,
            displayValue: displayValue,
            data: data,
        };
        this.menuOption = new MenuOption(value, displayValue, data);
    }
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
function isCharacterKey(event) {
    return (event.key.length === 1 &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        !event.repeat);
}
export function useAnchorRef(render, comboboxAnchor, comboboxAnchorClassName) {
    const [editor] = useLexicalComposerContext();
    const [anchor, setAnchor] = useState(comboboxAnchor || null);
    const [anchorChild, setAnchorChild] = useState(null);
    useEffect(() => {
        if (comboboxAnchor) {
            setAnchor(comboboxAnchor);
            return;
        }
        return editor.registerRootListener((rootElement) => {
            if (rootElement) {
                setAnchor(rootElement.parentElement);
            }
        });
    }, [editor, comboboxAnchor]);
    useEffect(() => {
        if (!anchor) {
            return;
        }
        if (!render) {
            if (anchorChild) {
                anchorChild.remove();
                setAnchorChild(null);
            }
            return;
        }
        const { height } = anchor.getBoundingClientRect();
        const newAnchorChild = anchorChild || document.createElement("div");
        newAnchorChild.style.position = "absolute";
        newAnchorChild.style.left = "0";
        newAnchorChild.style.right = "0";
        newAnchorChild.style.paddingTop = `${height}px`;
        anchor.prepend(newAnchorChild);
        if (!anchorChild) {
            setAnchorChild(newAnchorChild);
        }
        const anchorObserver = new ResizeObserver(([entry]) => {
            newAnchorChild.style.paddingTop = `${entry.contentRect.height}px`;
        });
        anchorObserver.observe(anchor);
        setTimeout(() => {
            newAnchorChild.className = comboboxAnchorClassName || "";
        });
        return () => {
            anchorObserver.disconnect();
            anchor.removeChild(newAnchorChild);
        };
    }, [anchor, render, anchorChild, comboboxAnchorClassName]);
    return anchorChild;
}
export function checkForTriggers(text, triggers) {
    const last = text.split(/\s/).pop() || text;
    const offset = text !== last ? text.lastIndexOf(last) : 0;
    const match = triggers.some((t) => t.startsWith(last) && t !== last);
    if (match) {
        return {
            leadOffset: offset,
            matchingString: last,
            replaceableString: last,
        };
    }
    return null;
}
export function ComboboxPlugin(props) {
    const { onSelectOption, triggers, punctuation, loading, triggerFn, onQueryChange, onReset, comboboxAnchor, comboboxAnchorClassName, comboboxComponent: ComboboxComponent = "div", comboboxItemComponent: ComboboxItemComponent = "div", onComboboxOpen, onComboboxClose, onComboboxFocusChange, comboboxAdditionalItems = [], onComboboxItemSelect, } = props;
    const focused = useIsFocused();
    const [editor] = useLexicalComposerContext();
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [triggerMatch, setTriggerMatch] = useState(null);
    const [valueMatch, setValueMatch] = useState(null);
    const [triggerQueryString, setTriggerQueryString] = useState(null);
    const itemType = props.options.length === 0 ? "trigger" : "value";
    const options = useMemo(() => {
        const additionalOptions = comboboxAdditionalItems.map((opt) => new ComboboxOption("additional", opt.value, opt.displayValue, opt.data));
        if (itemType === "trigger") {
            const triggerOptions = triggers.map((trigger) => new ComboboxOption("trigger", trigger, trigger));
            if (!triggerQueryString ||
                triggerOptions.every((o) => !o.value.startsWith(triggerQueryString))) {
                return [...triggerOptions, ...additionalOptions];
            }
            return [
                ...triggerOptions.filter((o) => o.value.startsWith(triggerQueryString)),
                ...additionalOptions,
            ];
        }
        return [
            ...props.options.map((opt) => new ComboboxOption("value", opt.value, opt.displayValue, opt.data)),
            ...additionalOptions,
        ];
    }, [
        comboboxAdditionalItems,
        itemType,
        props.options,
        triggers,
        triggerQueryString,
    ]);
    const [open, setOpen] = useState(props.comboboxOpen || false);
    const anchor = useAnchorRef(open, comboboxAnchor, comboboxAnchorClassName);
    const highlightOption = useCallback((index) => {
        if (!IS_MOBILE) {
            setSelectedIndex(index);
        }
    }, []);
    const scrollIntoView = useCallback((index) => {
        var _a;
        const option = options[index];
        const el = (_a = option.ref) === null || _a === void 0 ? void 0 : _a.current;
        if (el) {
            el.scrollIntoView({ block: "nearest" });
        }
    }, [options]);
    const handleArrowKeyDown = useCallback((event, direction) => {
        if (!focused) {
            return false;
        }
        let newIndex;
        if (direction === "up") {
            if (selectedIndex === null) {
                newIndex = options.length - 1;
            }
            else if (selectedIndex === 0) {
                newIndex = null;
            }
            else {
                newIndex = selectedIndex - 1;
            }
        }
        else {
            if (selectedIndex === null) {
                newIndex = 0;
            }
            else if (selectedIndex === options.length - 1) {
                newIndex = null;
            }
            else {
                newIndex = selectedIndex + 1;
            }
        }
        highlightOption(newIndex);
        if (newIndex) {
            scrollIntoView(newIndex);
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
    }, [focused, selectedIndex, options.length, scrollIntoView, highlightOption]);
    const handleMouseEnter = useCallback((index) => {
        highlightOption(index);
        scrollIntoView(index);
    }, [scrollIntoView, highlightOption]);
    const handleMouseLeave = useCallback(() => {
        highlightOption(null);
    }, [highlightOption]);
    const handleSelectValue = useCallback((index) => {
        const option = options[index];
        onComboboxItemSelect === null || onComboboxItemSelect === void 0 ? void 0 : onComboboxItemSelect(option.comboboxItem);
        if (option.itemType === "additional") {
            return;
        }
        editor.update(() => {
            const textNode = valueMatch
                ? $splitNodeContainingQuery(valueMatch)
                : null;
            onSelectOption(option.menuOption, textNode);
        });
        setValueMatch(null);
        onQueryChange(null);
        setTriggerQueryString(null);
        highlightOption(null);
    }, [
        options,
        editor,
        onQueryChange,
        highlightOption,
        onComboboxItemSelect,
        valueMatch,
        onSelectOption,
    ]);
    const handleSelectTrigger = useCallback((index) => {
        const option = options[index];
        onComboboxItemSelect === null || onComboboxItemSelect === void 0 ? void 0 : onComboboxItemSelect(option.comboboxItem);
        if (option.itemType === "additional") {
            return;
        }
        editor.update(() => {
            const nodeToReplace = triggerMatch
                ? $splitNodeContainingQuery(triggerMatch)
                : null;
            if (nodeToReplace) {
                const textNode = $createTextNode(option.value);
                nodeToReplace.replace(textNode);
                textNode.select();
            }
            else {
                $insertTriggerAtSelection(triggers, punctuation, option.value);
            }
        });
        setTriggerMatch(null);
        setTriggerQueryString(null);
        highlightOption(0);
    }, [
        options,
        editor,
        highlightOption,
        onComboboxItemSelect,
        triggerMatch,
        triggers,
        punctuation,
    ]);
    const handleClick = useCallback((index) => {
        if (itemType === "trigger") {
            handleSelectTrigger(index);
        }
        if (itemType === "value") {
            handleSelectValue(index);
        }
    }, [itemType, handleSelectTrigger, handleSelectValue]);
    const handleKeySelect = useCallback((event) => {
        if (!focused || selectedIndex === null) {
            return false;
        }
        let handled = false;
        if (itemType === "trigger") {
            handled = true;
            handleSelectTrigger(selectedIndex);
        }
        if (itemType === "value") {
            handled = true;
            handleSelectValue(selectedIndex);
        }
        if (handled) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
        return handled;
    }, [focused, handleSelectValue, handleSelectTrigger, itemType, selectedIndex]);
    const handleBackspace = useCallback(() => {
        const text = getQueryTextForSearch(editor);
        const newText = text ? text.substring(0, text.length - 1) : undefined;
        if (!newText || !newText.trim()) {
            highlightOption(null);
        }
        return false;
    }, [editor, highlightOption]);
    const handleKeyDown = useCallback((event) => {
        setOpen(true);
        if (!isCharacterKey(event)) {
            return false;
        }
        const text = getQueryTextForSearch(editor);
        const value = text === null ? event.key : text + event.key;
        const valueTrimmed = value.trim();
        if (options.some((o) => o.displayValue.startsWith(valueTrimmed) &&
            valueTrimmed.length <= o.displayValue.length)) {
            highlightOption(0);
        }
        else if (itemType === "trigger") {
            highlightOption(null);
        }
        return false;
    }, [editor, options, itemType, highlightOption]);
    const handleFocus = useCallback(() => {
        setOpen(true);
        return false;
    }, []);
    const handleClickOutside = useCallback(() => {
        setOpen(false);
        if (!triggerQueryString) {
            setTriggerQueryString(null);
            setTriggerMatch(null);
            setValueMatch(null);
        }
        return false;
    }, [triggerQueryString]);
    useEffect(() => {
        return mergeRegister(editor.registerCommand(KEY_ARROW_DOWN_COMMAND, (event) => {
            return handleArrowKeyDown(event, "down");
        }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_ARROW_UP_COMMAND, (event) => {
            return handleArrowKeyDown(event, "up");
        }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_ENTER_COMMAND, handleKeySelect, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_TAB_COMMAND, handleKeySelect, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_BACKSPACE_COMMAND, handleBackspace, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_DOWN_COMMAND, handleKeyDown, COMMAND_PRIORITY_LOW), editor.registerCommand(FOCUS_COMMAND, handleFocus, COMMAND_PRIORITY_NORMAL), editor.registerCommand(CLICK_COMMAND, () => {
            if (!open) {
                setOpen(true);
            }
            return false;
        }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_ESCAPE_COMMAND, () => {
            setOpen(false);
            return false;
        }, COMMAND_PRIORITY_LOW));
    }, [
        editor,
        open,
        handleArrowKeyDown,
        handleKeySelect,
        handleBackspace,
        handleKeyDown,
        handleFocus,
    ]);
    useEffect(() => {
        const updateListener = () => {
            editor.getEditorState().read(() => {
                const text = getQueryTextForSearch(editor);
                // reset if no text
                if (text === null) {
                    onReset();
                    setTriggerMatch(null);
                    setValueMatch(null);
                    onQueryChange(null);
                    setTriggerQueryString(null);
                    return;
                }
                // check for triggers
                const triggerMatch = checkForTriggers(text, triggers);
                setTriggerMatch(triggerMatch);
                if (triggerMatch) {
                    setTriggerQueryString(triggerMatch.matchingString);
                    setValueMatch(null);
                    return;
                }
                // check for mentions
                const valueMatch = triggerFn(text, editor);
                setValueMatch(valueMatch);
                onQueryChange(valueMatch ? valueMatch.matchingString : null);
                if (valueMatch && valueMatch.matchingString) {
                    setTriggerQueryString(valueMatch.matchingString);
                    return;
                }
                setTriggerQueryString(null);
            });
        };
        return editor.registerUpdateListener(updateListener);
    }, [editor, triggerFn, onQueryChange, onReset, triggers]);
    useEffect(() => {
        setOpen(props.comboboxOpen || false);
    }, [props.comboboxOpen]);
    // call open/close callbacks when open state changes
    useEffect(() => {
        if (open) {
            onComboboxOpen === null || onComboboxOpen === void 0 ? void 0 : onComboboxOpen();
        }
        else {
            setSelectedIndex(null);
            onComboboxClose === null || onComboboxClose === void 0 ? void 0 : onComboboxClose();
        }
    }, [onComboboxOpen, onComboboxClose, open]);
    // call focus change callback when selected index changes
    useEffect(() => {
        if (selectedIndex !== null && !!options[selectedIndex]) {
            onComboboxFocusChange === null || onComboboxFocusChange === void 0 ? void 0 : onComboboxFocusChange(options[selectedIndex].comboboxItem);
        }
        else {
            onComboboxFocusChange === null || onComboboxFocusChange === void 0 ? void 0 : onComboboxFocusChange(null);
        }
    }, [selectedIndex, options, onComboboxFocusChange]);
    // close combobox when clicking outside
    useEffect(() => {
        if (!CAN_USE_DOM) {
            return;
        }
        const root = editor.getRootElement();
        const handleMousedown = (event) => {
            if (anchor &&
                !anchor.contains(event.target) &&
                root &&
                !root.contains(event.target)) {
                handleClickOutside();
            }
        };
        document.addEventListener("mousedown", handleMousedown);
        return () => {
            document.removeEventListener("mousedown", handleMousedown);
        };
    }, [anchor, editor, handleClickOutside]);
    if (!open || !anchor) {
        return null;
    }
    return ReactDOM.createPortal(_jsx(ComboboxComponent, { loading: loading, itemType: itemType, role: "menu", "aria-activedescendant": selectedIndex !== null && !!options[selectedIndex]
            ? options[selectedIndex].displayValue
            : "", "aria-label": "Choose trigger and value", "aria-hidden": !open, children: options.map((option, index) => (_jsx(ComboboxItemComponent, { selected: index === selectedIndex, role: "menuitem", "aria-selected": selectedIndex === index, "aria-label": `Choose ${option.value}`, item: option.comboboxItem, ref: option.setRefElement, onClick: () => handleClick(index), onMouseEnter: () => handleMouseEnter(index), onMouseLeave: handleMouseLeave, onMouseDown: (e) => e.preventDefault(), children: option.displayValue }, option.key))) }), anchor);
}
