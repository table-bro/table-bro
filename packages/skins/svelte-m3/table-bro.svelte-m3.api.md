# The public types of table-bro.svelte-m3

Written by `npm run check:api -- --update` from the types of the build, without their comments.

```ts
import "@table-bro/core";
import "svelte";
interface BroTagsTexts {
    empty: string;
}
export declare function setTagsTexts(texts: Partial<BroTagsTexts>): void;
export declare const m3SvelteSkinConfig: {
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
        "bro-m3-svelte-tags": string;
        "bro-m3-svelte-switch": string;
    };
};
type BroM3SvelteTooltipPosition = "above" | "right";
interface BroM3SvelteTooltipOptions {
    position?: BroM3SvelteTooltipPosition;
    host?: HTMLElement;
}
export declare function attachM3SvelteTooltip(target: HTMLElement, text: string | (() => string), options?: BroM3SvelteTooltipOptions): () => void;
export declare function withTags(options?: {
    texts?: Partial<BroTagsTexts>;
}): void;
export declare function withSwitch(): void;
export type { BroM3SvelteTooltipOptions, BroM3SvelteTooltipPosition, BroTagsTexts };
```
