import { LexicalCommand } from "lexical";
export interface InsertMention {
    /**
     * The trigger that was used to insert the mention.
     */
    trigger: string;
    /**
     * The value to insert after the trigger.
     */
    value: string;
    /**
     * Whether to focus the editor after inserting the mention.
     * @default true
     */
    focus?: boolean;
}
export interface RemoveMentions {
    /**
     * The trigger to search for when removing mentions.
     */
    trigger: string;
    /**
     * An optional value to search for when removing mentions.
     */
    value?: string;
    /**
     * Whether to focus the editor after removing the mention.
     * @default true
     */
    focus?: boolean;
}
export interface RenameMentions {
    /**
     * The trigger to search for when renaming mentions.
     */
    trigger: string;
    /**
     * The new value to replace the old value with.
     */
    newValue: string;
    /**
     * An optional value to search for when renaming mentions.
     */
    value?: string;
    /**
     * Whether to focus the editor after renaming the mention.
     * @default true
     */
    focus?: boolean;
}
export interface HasMentions {
    /**
     * The trigger to search for when checking for mentions.
     */
    trigger: string;
    /**
     * An optional value to search for when checking for mentions.
     */
    value?: string;
}
export interface OpenMentionMenu {
    /**
     * The trigger to insert when opening the mention menu.
     */
    trigger: string;
}
export declare const INSERT_MENTION_COMMAND: LexicalCommand<InsertMention>;
export declare const REMOVE_MENTIONS_COMMAND: LexicalCommand<RemoveMentions>;
export declare const RENAME_MENTIONS_COMMAND: LexicalCommand<RenameMentions>;
export declare const OPEN_MENTION_MENU_COMMAND: LexicalCommand<OpenMentionMenu>;
export declare function $insertTriggerAtSelection(triggers: string[], punctuation: string, trigger: string): boolean;
export declare function $insertMentionAtSelection(triggers: string[], punctuation: string, trigger: string, value: string): boolean;
export declare function $removeMention(trigger: string, value?: string, focus?: boolean): boolean;
export declare function $renameMention(trigger: string, newValue: string, value?: string, focus?: boolean): boolean;
