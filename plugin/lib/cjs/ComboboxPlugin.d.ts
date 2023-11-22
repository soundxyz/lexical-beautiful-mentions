/// <reference types="react" />
import { TextNode } from "lexical";
import { BeautifulMentionsPluginProps } from "./BeautifulMentionsPluginProps";
import { MenuOption, MenuTextMatch, TriggerFn } from "./Menu";
interface ComboboxPluginProps extends Pick<BeautifulMentionsPluginProps, "comboboxOpen" | "onComboboxItemSelect" | "comboboxAdditionalItems" | "comboboxAnchor" | "comboboxAnchorClassName" | "comboboxComponent" | "comboboxItemComponent" | "onComboboxOpen" | "onComboboxClose" | "onComboboxFocusChange">, Required<Pick<BeautifulMentionsPluginProps, "punctuation">> {
    loading: boolean;
    triggerFn: TriggerFn;
    onSelectOption: (option: MenuOption, textNodeContainingQuery: TextNode | null) => void;
    onQueryChange: (matchingString: string | null) => void;
    options: MenuOption[];
    triggers: string[];
    onReset: () => void;
    creatable: boolean | string;
}
export declare function useAnchorRef(render: boolean, comboboxAnchor?: HTMLElement | null, comboboxAnchorClassName?: string): HTMLElement | null;
export declare function checkForTriggers(text: string, triggers: string[]): MenuTextMatch | null;
export declare function ComboboxPlugin(props: ComboboxPluginProps): import("react").ReactPortal | null;
export {};
