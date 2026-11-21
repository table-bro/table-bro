# The public types of table-bro.solid-suid

Written by `npm run check:api -- --update` from the types of the build, without their comments.

```ts
import "@table-bro/core";
import { Theme } from "@suid/material/styles";
import "solid-js";
export declare function suidThemeVariables(theme: Theme): string;
export declare function setSuidTheme(theme: Theme): void;
interface BroTagsTexts {
    empty: string;
}
export declare function setTagsTexts(texts: Partial<BroTagsTexts>): void;
export declare const suidSkinConfig: {
    themeAttribute: string;
    css: {
        table: {
            className: string;
            thead: {
                tr: {
                    className: string;
                    th: {
                        className: string;
                    };
                };
            };
            tbody: {
                tr: {
                    className: string;
                    td: {
                        className: string;
                    };
                };
            };
        };
        shadow: {
            className: string;
        };
    };
    components: {
        button: {
            selector: string;
            iconSelector: string;
            beforeRender: (element: Element, value: string) => void;
        };
        dropdown: {
            selector: string;
        };
        filterDrawer: {
            beforeRender: (closeButton: Element) => void;
        };
        fontIcon: {
            html: (materialIcon: string) => string;
        };
        paginator: {
            selector: string;
            css: {
                ul: {
                    className: string;
                    li: {
                        className: string;
                        a: {
                            className: string;
                        };
                    };
                };
            };
        };
        progressBar: {
            selector: string;
        };
        sortHeader: {
            selector: string;
            contentSelector: string;
            beforeRender: (element: Element, value: string) => void;
        };
        state: {
            fontIcon: true;
            states: {
                loading: [
                    string,
                    string
                ];
                "no-data": [
                    string,
                    string
                ];
                "not-found": [
                    string,
                    string
                ];
                fail: [
                    string,
                    string
                ];
            };
        };
        switch: {
            selector: string;
        };
        textEllipsis: {
            selector: string;
        };
        toolbar: {
            selector: string;
        };
        toolbarMain: {
            selector: string;
        };
        toolbarSearch: {
            beforeRender: (backButton: Element, clearButton: Element) => void;
        };
    };
    elements: {
        "bro-suid-tags": string;
        "bro-suid-switch": string;
    };
};
type BroSuidTooltipPlacement = "top" | "right";
interface BroSuidTooltipOptions {
    placement?: BroSuidTooltipPlacement;
}
export declare function attachSuidTooltip(target: Element, text: string | (() => string), options?: BroSuidTooltipOptions): () => void;
export declare function withTags(options?: {
    texts?: Partial<BroTagsTexts>;
}): void;
export declare function withSwitch(): void;
export type { BroSuidTooltipOptions, BroSuidTooltipPlacement, BroTagsTexts };
```
