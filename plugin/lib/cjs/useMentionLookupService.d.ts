import { MutableRefObject } from "react";
import { BeautifulMentionsItem } from "./BeautifulMentionsPluginProps";
interface MentionsLookupServiceOptions {
    queryString: string | null;
    trigger: string | null;
    searchDelay?: number;
    items?: Record<string, BeautifulMentionsItem[]>;
    onSearch?: (trigger: string, queryString?: string | null) => Promise<BeautifulMentionsItem[]>;
    justSelectedAnOption?: MutableRefObject<boolean>;
}
export declare function useMentionLookupService(options: MentionsLookupServiceOptions): {
    loading: boolean;
    results: BeautifulMentionsItem[];
    query: string | null;
};
export {};
