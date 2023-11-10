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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeautifulMentionsPlugin = exports.checkForMentions = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const utils_1 = require("@lexical/utils");
const lexical_1 = require("lexical");
const react_1 = __importStar(require("react"));
const ReactDOM = __importStar(require("react-dom"));
const ComboboxPlugin_1 = require("./ComboboxPlugin");
const MentionNode_1 = require("./MentionNode");
const Menu_1 = require("./Menu");
const TypeaheadMenuPlugin_1 = require("./TypeaheadMenuPlugin");
const environment_1 = require("./environment");
const mention_commands_1 = require("./mention-commands");
const mention_utils_1 = require("./mention-utils");
const useIsFocused_1 = require("./useIsFocused");
const useMentionLookupService_1 = require("./useMentionLookupService");
class MentionOption extends Menu_1.MenuOption {
    constructor(
    /**
     * The trigger that was used to open the menu.
     */
    trigger, value, displayValue, data) {
        super(value, displayValue, data);
        this.trigger = trigger;
        this.menuItem = {
            trigger,
            value,
            displayValue,
            data,
        };
    }
}
// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS = (punctuation) => "(?:" +
    "\\.[ |$]|" + // E.g. "r. " in "Mr. Smith"
    "\\s|" + // E.g. " " in "Josh Duck"
    "[" +
    punctuation +
    "]|" + // E.g. "-' in "Salier-Hellendag"
    ")";
// Regex used to trigger the mention menu.
function createMentionsRegex(triggers, punctuation, allowSpaces) {
    return new RegExp("(^|\\s|\\()(" +
        (0, mention_utils_1.TRIGGERS)(triggers) +
        "((?:" +
        (0, mention_utils_1.VALID_CHARS)(triggers, punctuation) +
        (allowSpaces ? VALID_JOINS(punctuation) : "") +
        "){0," +
        mention_utils_1.LENGTH_LIMIT +
        "})" +
        ")$");
}
function checkForMentions(text, triggers, punctuation, allowSpaces) {
    const match = createMentionsRegex(triggers, punctuation, allowSpaces).exec(text);
    if (match !== null) {
        // The strategy ignores leading whitespace, but we need to know its
        // length to add it to the leadOffset
        const maybeLeadingWhitespace = match[1];
        const matchingStringWithTrigger = match[2];
        const matchingString = match[3];
        if (matchingStringWithTrigger.length >= 1) {
            return {
                leadOffset: match.index + maybeLeadingWhitespace.length,
                matchingString: matchingString,
                replaceableString: matchingStringWithTrigger,
            };
        }
    }
    return null;
}
exports.checkForMentions = checkForMentions;
/**
 * A plugin that adds mentions to the lexical editor.
 */
function BeautifulMentionsPlugin(props) {
    const { items, onSearch, searchDelay = props.onSearch ? 250 : 0, allowSpaces = true, insertOnBlur = true, menuComponent: MenuComponent = "ul", menuItemComponent: MenuItemComponent = "li", menuAnchorClassName, showMentionsOnDelete, showCurrentMentionsAsSuggestions = true, mentionEnclosure, onMenuOpen, onMenuClose, onMenuItemSelect, punctuation = mention_utils_1.DEFAULT_PUNCTUATION, } = props;
    const justSelectedAnOption = (0, react_1.useRef)(false);
    const isEditorFocused = (0, useIsFocused_1.useIsFocused)();
    const triggers = (0, react_1.useMemo)(() => props.triggers || Object.keys(items || {}), [props.triggers, items]);
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    const [queryString, setQueryString] = (0, react_1.useState)(null);
    const [trigger, setTrigger] = (0, react_1.useState)(null);
    const { results, loading, query } = (0, useMentionLookupService_1.useMentionLookupService)({
        queryString,
        searchDelay,
        trigger,
        items,
        onSearch,
        justSelectedAnOption,
    });
    const [selectedMenuIndex, setSelectedMenuIndex] = (0, react_1.useState)(null);
    const [oldSelection, setOldSelection] = (0, react_1.useState)(null);
    const creatable = (0, mention_utils_1.getCreatableProp)(props.creatable, trigger);
    const menuItemLimit = (0, mention_utils_1.getMenuItemLimitProp)(props.menuItemLimit, trigger);
    const options = (0, react_1.useMemo)(() => {
        if (!trigger) {
            return [];
        }
        // Add options from the lookup service
        let opt = results.map((result) => {
            if (typeof result === "string") {
                return new MentionOption(trigger, result, result);
            }
            else {
                const { value } = result, data = __rest(result, ["value"]);
                return new MentionOption(trigger, value, value, data);
            }
        });
        // limit the number of menu items
        if (menuItemLimit !== false && menuItemLimit > 0) {
            opt = opt.slice(0, menuItemLimit);
        }
        // Add mentions from the editor. When a search function is provided, wait for the
        // delayed search to prevent flickering.
        const readyToAddCurrentMentions = !onSearch || (!loading && query !== null);
        if (readyToAddCurrentMentions && showCurrentMentionsAsSuggestions) {
            editor.getEditorState().read(() => {
                const mentions = (0, lexical_1.$nodesOfType)(MentionNode_1.BeautifulMentionNode);
                for (const mention of mentions) {
                    const value = mention.getValue();
                    const data = mention.getData();
                    // only add the mention if it's not already in the list
                    if (mention.getTrigger() === trigger &&
                        (query === null || mention.getValue().startsWith(query)) &&
                        opt.every((o) => o.value !== value)) {
                        opt.push(new MentionOption(trigger, value, value, data));
                    }
                }
            });
        }
        // Add option to create a new mention
        if (query && opt.every((o) => o.displayValue !== query)) {
            const displayValue = typeof creatable === "string"
                ? creatable.replace("{{name}}", query)
                : typeof creatable === "undefined" || creatable
                    ? `Add "${query}"`
                    : undefined;
            if (displayValue) {
                opt.push(new MentionOption(trigger, query, displayValue));
            }
        }
        return opt;
    }, [
        results,
        onSearch,
        loading,
        query,
        editor,
        trigger,
        creatable,
        menuItemLimit,
        showCurrentMentionsAsSuggestions,
    ]);
    const open = isEditorFocused && (!!options.length || loading);
    const handleClose = (0, react_1.useCallback)(() => {
        setTrigger(null);
    }, []);
    const handleSelectOption = (0, react_1.useCallback)((selectedOption, nodeToReplace, closeMenu) => {
        editor.update(() => {
            if (!trigger) {
                return;
            }
            const newMention = !!creatable && selectedOption.value !== selectedOption.displayValue;
            const value = newMention && mentionEnclosure && /\s/.test(selectedOption.value)
                ? // if the value has spaces, wrap it in the enclosure
                    mentionEnclosure + selectedOption.value + mentionEnclosure
                : selectedOption.value;
            const mentionNode = (0, MentionNode_1.$createBeautifulMentionNode)(trigger, value, selectedOption.data);
            if (nodeToReplace) {
                nodeToReplace.replace(mentionNode);
            }
            closeMenu === null || closeMenu === void 0 ? void 0 : closeMenu();
            justSelectedAnOption.current = true;
        });
    }, [editor, trigger, creatable, mentionEnclosure]);
    const handleSelectMenuItem = (0, react_1.useCallback)((selectedOption, nodeToReplace, closeMenu) => {
        if (!trigger) {
            return;
        }
        onMenuItemSelect === null || onMenuItemSelect === void 0 ? void 0 : onMenuItemSelect({
            trigger,
            value: selectedOption.value,
            displayValue: selectedOption.displayValue,
            data: selectedOption.data,
        });
        handleSelectOption(selectedOption, nodeToReplace, closeMenu);
    }, [handleSelectOption, onMenuItemSelect, trigger]);
    const checkForMentionMatch = (0, react_1.useCallback)((text) => {
        // Don't show the menu if the next character is a word character
        const selectionInfo = (0, mention_utils_1.$getSelectionInfo)(triggers, punctuation);
        if ((selectionInfo === null || selectionInfo === void 0 ? void 0 : selectionInfo.isTextNode) && selectionInfo.wordCharAfterCursor) {
            return null;
        }
        const queryMatch = checkForMentions(text, triggers, punctuation, allowSpaces);
        if (queryMatch) {
            const { replaceableString, matchingString } = queryMatch;
            const index = replaceableString.lastIndexOf(matchingString);
            const trigger = index === -1
                ? replaceableString
                : replaceableString.substring(0, index) +
                    replaceableString.substring(index + matchingString.length);
            setTrigger(trigger || null);
            if (queryMatch.replaceableString) {
                return queryMatch;
            }
        }
        else {
            setTrigger(null);
        }
        return null;
    }, [allowSpaces, punctuation, triggers]);
    const convertTextToMention = (0, react_1.useCallback)(() => {
        let option = selectedMenuIndex !== null ? options[selectedMenuIndex] : undefined;
        const newMention = options.find((o) => o.value !== o.displayValue);
        if (newMention && (environment_1.IS_MOBILE || option === null)) {
            option = newMention;
        }
        if (!option) {
            return false;
        }
        const selectionInfo = (0, mention_utils_1.$getSelectionInfo)(triggers, punctuation);
        if (!trigger || !selectionInfo || !selectionInfo.isTextNode) {
            return false;
        }
        const node = selectionInfo.node;
        const textContent = node.getTextContent();
        const queryMatch = checkForMentions(textContent, triggers, punctuation, false);
        if (queryMatch === null) {
            return false;
        }
        const textEndIndex = textContent.search(new RegExp(`${queryMatch.replaceableString}\\s?$`));
        if (textEndIndex === -1) {
            return false;
        }
        const mentionNode = (0, MentionNode_1.$createBeautifulMentionNode)(trigger, option.value, option.data);
        node.setTextContent(textContent.substring(0, textEndIndex));
        node.insertAfter(mentionNode);
        mentionNode.selectNext();
        return true;
    }, [options, punctuation, selectedMenuIndex, trigger, triggers]);
    const setSelection = (0, react_1.useCallback)(() => {
        const selection = (0, lexical_1.$getSelection)();
        if (!selection && oldSelection) {
            (0, lexical_1.$setSelection)(oldSelection);
        }
        else if (!selection) {
            (0, mention_utils_1.$selectEnd)();
        }
        if (oldSelection) {
            setOldSelection(null);
        }
    }, [oldSelection]);
    const archiveSelection = (0, react_1.useCallback)(() => {
        const selection = (0, lexical_1.$getSelection)();
        if (selection) {
            setOldSelection(selection);
            (0, lexical_1.$setSelection)(null);
        }
    }, []);
    const handleDeleteMention = (0, react_1.useCallback)((event) => {
        if (!showMentionsOnDelete) {
            return false;
        }
        const selectionInfo = (0, mention_utils_1.$getSelectionInfo)(triggers, punctuation);
        if (selectionInfo) {
            const { node, prevNode, offset } = selectionInfo;
            const mentionNode = (0, MentionNode_1.$isBeautifulMentionNode)(node)
                ? node
                : (0, MentionNode_1.$isBeautifulMentionNode)(prevNode) && offset === 0
                    ? prevNode
                    : null;
            if (mentionNode) {
                const trigger = mentionNode.getTrigger();
                mentionNode.replace((0, lexical_1.$createTextNode)(trigger));
                event.preventDefault();
                return true;
            }
        }
        return false;
    }, [showMentionsOnDelete, triggers, punctuation]);
    const handleKeyDown = (0, react_1.useCallback)((event) => {
        const { key, metaKey, ctrlKey } = event;
        const simpleKey = key.length === 1;
        const isTrigger = triggers.some((trigger) => key === trigger);
        const wordChar = (0, mention_utils_1.isWordChar)(key, triggers, punctuation);
        const selectionInfo = (0, mention_utils_1.$getSelectionInfo)(triggers, punctuation);
        if (!simpleKey ||
            (!wordChar && !isTrigger) ||
            !selectionInfo ||
            metaKey ||
            ctrlKey) {
            return false;
        }
        const { node, offset, isTextNode, textContent, prevNode, nextNode, wordCharAfterCursor, cursorAtStartOfNode, cursorAtEndOfNode, } = selectionInfo;
        if (isTextNode &&
            cursorAtStartOfNode &&
            (0, MentionNode_1.$isBeautifulMentionNode)(prevNode)) {
            node.insertBefore((0, lexical_1.$createTextNode)(" "));
        }
        if (isTextNode &&
            cursorAtEndOfNode &&
            (0, MentionNode_1.$isBeautifulMentionNode)(nextNode)) {
            node.insertAfter((0, lexical_1.$createTextNode)(" "));
        }
        if (isTextNode && isTrigger && wordCharAfterCursor) {
            const content = textContent.substring(0, offset) +
                " " +
                textContent.substring(offset);
            node.setTextContent(content);
        }
        if ((0, MentionNode_1.$isBeautifulMentionNode)(node) && nextNode === null) {
            node.insertAfter((0, lexical_1.$createTextNode)(" "));
        }
        return false;
    }, [punctuation, triggers]);
    react_1.default.useEffect(() => {
        return (0, utils_1.mergeRegister)(editor.registerCommand(lexical_1.KEY_DOWN_COMMAND, handleKeyDown, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_BACKSPACE_COMMAND, handleDeleteMention, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.BLUR_COMMAND, () => {
            if (insertOnBlur) {
                return convertTextToMention();
            }
            return false;
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_SPACE_COMMAND, () => {
            if (!allowSpaces && creatable) {
                return convertTextToMention();
            }
            else {
                return false;
            }
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(mention_commands_1.INSERT_MENTION_COMMAND, ({ trigger, value, focus = true }) => {
            setSelection();
            const inserted = (0, mention_commands_1.$insertMentionAtSelection)(triggers, punctuation, trigger, value);
            if (!focus) {
                archiveSelection();
            }
            return inserted;
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(mention_commands_1.REMOVE_MENTIONS_COMMAND, ({ trigger, value, focus }) => {
            const removed = (0, mention_commands_1.$removeMention)(trigger, value, focus);
            if (removed && !focus) {
                archiveSelection();
            }
            return removed;
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(mention_commands_1.RENAME_MENTIONS_COMMAND, ({ trigger, newValue, value, focus }) => {
            const renamed = (0, mention_commands_1.$renameMention)(trigger, newValue, value, focus);
            if (renamed && !focus) {
                archiveSelection();
            }
            return renamed;
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(mention_commands_1.OPEN_MENTION_MENU_COMMAND, ({ trigger }) => {
            setSelection();
            return (0, mention_commands_1.$insertTriggerAtSelection)(triggers, punctuation, trigger);
        }, lexical_1.COMMAND_PRIORITY_LOW));
    }, [
        editor,
        triggers,
        punctuation,
        allowSpaces,
        insertOnBlur,
        creatable,
        isEditorFocused,
        convertTextToMention,
        setSelection,
        archiveSelection,
        handleKeyDown,
        handleDeleteMention,
    ]);
    (0, react_1.useEffect)(() => {
        if (open) {
            onMenuOpen === null || onMenuOpen === void 0 ? void 0 : onMenuOpen();
        }
        else {
            onMenuClose === null || onMenuClose === void 0 ? void 0 : onMenuClose();
        }
    }, [onMenuOpen, onMenuClose, open]);
    if (!environment_1.CAN_USE_DOM) {
        return null;
    }
    if (props.combobox) {
        return ((0, jsx_runtime_1.jsx)(ComboboxPlugin_1.ComboboxPlugin, { options: options, loading: loading, onQueryChange: setQueryString, onSelectOption: handleSelectOption, onReset: () => setTrigger(null), triggerFn: checkForMentionMatch, triggers: triggers, punctuation: punctuation, creatable: creatable, comboboxOpen: props.comboboxOpen, comboboxAnchor: props.comboboxAnchor, comboboxAnchorClassName: props.comboboxAnchorClassName, comboboxComponent: props.comboboxComponent, comboboxItemComponent: props.comboboxItemComponent, comboboxAdditionalItems: props.comboboxAdditionalItems, onComboboxOpen: props.onComboboxOpen, onComboboxClose: props.onComboboxClose, onComboboxFocusChange: props.onComboboxFocusChange, onComboboxItemSelect: props.onComboboxItemSelect }));
    }
    return ((0, jsx_runtime_1.jsx)(TypeaheadMenuPlugin_1.TypeaheadMenuPlugin, { onQueryChange: setQueryString, onSelectOption: handleSelectMenuItem, onSelectionChange: setSelectedMenuIndex, triggerFn: checkForMentionMatch, options: options, anchorClassName: menuAnchorClassName, onClose: handleClose, menuRenderFn: (anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => anchorElementRef.current && (options.length > 0 || loading)
            ? ReactDOM.createPortal((0, jsx_runtime_1.jsx)(MenuComponent, { loading: loading, role: "menu", "aria-label": "Choose a mention", "aria-hidden": !open, "aria-activedescendant": selectedIndex !== null && !!options[selectedIndex]
                    ? options[selectedIndex].displayValue
                    : "", children: options.map((option, i) => ((0, jsx_runtime_1.jsx)(MenuItemComponent, Object.assign({ tabIndex: -1, selected: selectedIndex === i, ref: option.setRefElement, role: "menuitem", "aria-selected": selectedIndex === i, "aria-label": `Choose ${option.value}`, item: option.menuItem, itemValue: option.value, label: option.displayValue }, option.data, { onClick: () => {
                        setHighlightedIndex(i);
                        selectOptionAndCleanUp(option);
                    }, onMouseDown: (event) => {
                        event.preventDefault();
                    }, onMouseEnter: () => {
                        setHighlightedIndex(i);
                    }, children: option.displayValue }), option.key))) }), anchorElementRef.current)
            : null }));
}
exports.BeautifulMentionsPlugin = BeautifulMentionsPlugin;
