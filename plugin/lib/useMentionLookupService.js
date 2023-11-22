import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "./useDebounce";
export function useMentionLookupService(options) {
    const { queryString, trigger, searchDelay, items, onSearch, justSelectedAnOption, } = options;
    const debouncedQueryString = useDebounce(queryString, searchDelay);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [query, setQuery] = useState(null);
    useEffect(() => {
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
    return useMemo(() => ({ loading, results, query }), [loading, results, query]);
}
