import { HasMentions, InsertMention, OpenMentionMenu, RemoveMentions, RenameMentions } from "./mention-commands";
/**
 * Hook that provides access to the BeautifulMentionsPlugin. It allows you to insert,
 * remove and rename mentions from outside the editor.
 */
export declare function useBeautifulMentions(): {
    getMentions: () => {
        trigger: string;
        value: string;
        data: {
            [p: string]: import("./BeautifulMentionsPluginProps").BeautifulMentionsItemData;
        } | undefined;
    }[];
    insertMention: (options: InsertMention) => boolean;
    removeMentions: (options: RemoveMentions) => boolean;
    renameMentions: (options: RenameMentions) => boolean;
    hasMentions: ({ value, trigger }: HasMentions) => boolean;
    openMentionMenu: (options: OpenMentionMenu) => boolean;
};
