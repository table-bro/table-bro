# The public types of table-bro.bootstrap

Written by `npm run check:api -- --update` from the types of the build, without their comments.

```ts
import { BroCellElement, BroCol, BroConfiguredElement, BroHTMLElement, BroResolvedConfig, BroRow, BroView } from "@table-bro/core";
export declare const bootstrapSkinConfig: {
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
            css: {
                button: {
                    className: string;
                };
            };
        };
        filterDrawer: {
            beforeRender: (closeButton: Element) => void;
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
            afterRender: (element: Element, value: string) => () => void;
        };
        state: {
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
            css: {
                div: {
                    className: string;
                    input: {
                        className: string;
                    };
                };
            };
        };
        textEllipsis: {
            selector: string;
            afterRender: (element: Element, value: string) => () => void;
        };
        toolbar: {
            selector: string;
            css: {
                nav: {
                    className: string;
                    div: {
                        className: string;
                    };
                };
            };
        };
        toolbarMain: {
            selector: string;
            css: {
                toolbarTitle: {
                    className: string;
                };
                navbarCollapse: {
                    className: string;
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
            beforeRender: (searchButton: Element, value: string) => void;
        };
        toolbarSearch: {
            beforeRender: (backButton: Element, clearButton: Element) => void;
        };
    };
    elements: {
        "bro-bs-tags": string;
        "bro-switch": string;
    };
};
declare abstract class BroTagsComponent extends BroHTMLElement implements BroView, BroCellElement, BroConfiguredElement {
    template(): string;
    row?: BroRow;
    col?: BroCol;
    config?: BroResolvedConfig;
    items: string[];
    private fitting?;
    private rendered;
    render(): void;
    protected abstract readonly tagHTML: string;
    connectedCallback(): void;
    disconnectedCallback(): void;
}
export declare class BroBootstrapTagsComponent extends BroTagsComponent {
    protected readonly tagHTML: string;
}
export declare class BroSwitchComponent extends BroHTMLElement implements BroView, BroConfiguredElement {
    template(): string;
    config: BroResolvedConfig;
    col?: BroCol;
    checked: string | null;
    private css;
    private rendered;
    events(): void;
    render(): void;
    connectedCallback(): void;
}
export declare function withSwitch(): void;
interface BroBootstrapClasses {
    Tooltip: {
        getOrCreateInstance(element: Element, config: {
            title: string;
            placement?: "auto" | "top" | "bottom" | "left" | "right";
        }): BroBootstrapInstance;
    };
    Dropdown: new (toggle: Element) => BroBootstrapInstance;
}
interface BroBootstrapInstance {
    dispose(): void;
}
export declare function useBootstrap(bootstrap: BroBootstrapClasses): void;
export declare function withTags(): void;
export type { BroBootstrapClasses, BroBootstrapInstance };
```
