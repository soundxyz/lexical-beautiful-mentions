"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMentionLookupService = void 0;
const react_1 = require("react");
const useDebounce_1 = require("./useDebounce");
function useMentionLookupService(options) {
    const { queryString, trigger, searchDelay, items, onSearch, justSelectedAnOption, } = options;
    const debouncedQueryString = (0, useDebounce_1.useDebounce)(queryString, searchDelay);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [results, setResults] = (0, react_1.useState)([]);
    const [query, setQuery] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (trigger === null || debouncedQueryString === null) {
            setResults([]);
            setQuery(null);
            return;
        }
        if (items) {
            const mentions = items &&
                Object.entries(items).find(([key]) => {
                    return new RegExp(key).test(trigger);
                });
            if (!mentions) {
                return;
            }
            const result = !debouncedQueryString
                ? [...mentions[1]]
                : mentions[1].filter((item) => {
                    const value = typeof item === "string" ? item : item.value;
                    return value
                        .toLowerCase()
                        .includes(debouncedQueryString.toLowerCase());
                });
            setResults(result);
            setQuery(debouncedQueryString);
            return;
        }
        if (onSearch) {
            setLoading(true);
            setQuery(debouncedQueryString);
            onSearch(trigger, (justSelectedAnOption === null || justSelectedAnOption === void 0 ? void 0 : justSelectedAnOption.current) ? "" : debouncedQueryString)
                .then(setResults)
                .finally(() => setLoading(false));
            if (justSelectedAnOption === null || justSelectedAnOption === void 0 ? void 0 : justSelectedAnOption.current) {
                justSelectedAnOption.current = false;
            }
            return;
        }
    }, [debouncedQueryString, items, onSearch, trigger, justSelectedAnOption]);
    return (0, react_1.useMemo)(() => ({ loading, results, query }), [loading, results, query]);
}
exports.useMentionLookupService = useMentionLookupService;
