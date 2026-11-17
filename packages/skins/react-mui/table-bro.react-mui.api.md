# The public types of table-bro.react-mui

Written by `npm run check:api -- --update` from the types of the build, without their comments.

```ts
import "@table-bro/core";
import { Theme } from "@mui/material/styles";
import "react";
export declare function setMuiTheme(theme: Theme): void;
interface BroTagsTexts {
    empty: string;
}
export declare function setTagsTexts(texts: Partial<BroTagsTexts>): void;
export declare const muiSkinConfig: {
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
        filterDrawer: {
            beforeRender: (closeButton: Element) => void;
        };
        fontIcon: {
            html: (materialIcon: string) => string;
        };
        paginator: {
            selector: string;
            inputsAsProperties: true;
        };
        progressBar: {
            selector: string;
        };
        sortHeader: {
            selector: string;
            contentSelector: string;
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
        "bro-mui-tags": string;
        "bro-mui-switch": string;
    };
};
export declare function withTags(options?: {
    texts?: Partial<BroTagsTexts>;
}): void;
export declare function withSwitch(): void;
export type { BroTagsTexts };
```
