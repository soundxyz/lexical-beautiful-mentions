import { NodeKey } from "lexical";
import { ElementType } from "react";
import { BeautifulMentionComponentProps as CustomBeautifulMentionComponentProps } from "./BeautifulMentionsPluginProps";
import { MentionNodeDataValue } from "./MentionNode";
import { BeautifulMentionsThemeValues } from "./theme";
interface BeautifulMentionComponentProps {
    nodeKey: NodeKey;
    trigger: string;
    value: string;
    data?: {
        [p: string]: MentionNodeDataValue;
    };
    component?: ElementType<CustomBeautifulMentionComponentProps> | null;
    className?: string;
    classNameFocused?: string;
    themeValues?: BeautifulMentionsThemeValues;
}
export default function BeautifulMentionComponent(props: BeautifulMentionComponentProps): import("react/jsx-runtime").JSX.Element;
export {};
