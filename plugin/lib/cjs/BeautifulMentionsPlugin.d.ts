import { BeautifulMentionsPluginProps } from "./BeautifulMentionsPluginProps";
import { MenuTextMatch } from "./Menu";
export declare function checkForMentions(text: string, triggers: string[], punctuation: string, allowSpaces: boolean): MenuTextMatch | null;
/**
 * A plugin that adds mentions to the lexical editor.
 */
export declare function BeautifulMentionsPlugin(props: BeautifulMentionsPluginProps): import("react/jsx-runtime").JSX.Element | null;
