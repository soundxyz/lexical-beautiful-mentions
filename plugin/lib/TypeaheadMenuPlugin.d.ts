/// <reference types="react" />
import { TextNode } from "lexical";
import { MenuOption, MenuRenderFn, MenuResolution, TriggerFn } from "./Menu";
export type TypeaheadMenuPluginProps<TOption extends MenuOption> = {
    onQueryChange: (matchingString: string | null) => void;
    onSelectionChange?: (selectedIndex: number | null) => void;
    onSelectOption: (option: TOption, textNodeContainingQuery: TextNode | null, closeMenu: () => void, matchingString: string) => void;
    options: Array<TOption>;
    menuRenderFn: MenuRenderFn<TOption>;
    triggerFn: TriggerFn;
    onOpen?: (resolution: MenuResolution) => void;
    onClose?: () => void;
    anchorClassName?: string;
};
export declare function TypeaheadMenuPlugin<TOption extends MenuOption>({ options, onQueryChange, onSelectionChange, onSelectOption, onOpen, onClose, menuRenderFn, triggerFn, anchorClassName, }: TypeaheadMenuPluginProps<TOption>): JSX.Element | null;
