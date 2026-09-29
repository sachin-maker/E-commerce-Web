"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";

import useDebounce from "@/app/hooks/useDebounce";
import {
  useGetSearchSuggestionsQuery,
  type SearchSuggestion,
} from "@/app/store/api/searchApi";

interface SearchBoxProps {
  initialValue?: string;
}

const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_DELAY = 300;
const MAX_SUGGESTIONS = 8;
const SUGGESTIONS_ID = "search-suggestions";

export default function SearchBox({
  initialValue = "",
}: SearchBoxProps) {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const normalizedSearchTerm = searchTerm.trim();

  const debouncedSearchTerm = useDebounce(
    normalizedSearchTerm,
    DEBOUNCE_DELAY
  );

  const shouldFetchSuggestions =
    debouncedSearchTerm.length >= MIN_SEARCH_LENGTH;

  const {
    data,
    isFetching,
    isError,
  } = useGetSearchSuggestionsQuery(
    {
      q: debouncedSearchTerm,
      limit: MAX_SUGGESTIONS,
    },
    {
      skip: !shouldFetchSuggestions,
    }
  );

  /**
   * Defensive deduplication.
   *
   * Elasticsearch normally shouldn't return duplicates,
   * but the UI should remain stable if duplicates are ever returned.
   */
  const suggestions = useMemo(() => {
    const rawSuggestions = data?.suggestions ?? [];

    const seen = new Set<string>();

    return rawSuggestions.filter((suggestion) => {
      const key = suggestion.id || suggestion.title;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }, [data?.suggestions]);

  /**
   * Only show the dropdown when the user has entered
   * enough characters to perform a suggestion search.
   */
  const showDropdown =
    isOpen && normalizedSearchTerm.length >= MIN_SEARCH_LENGTH;

  const activeSuggestion =
    highlightedIndex >= 0 &&
    highlightedIndex < suggestions.length
      ? suggestions[highlightedIndex]
      : null;

  /**
   * Reset highlighted suggestion whenever the input
   * or suggestion collection changes.
   */
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [normalizedSearchTerm, suggestions.length]);

  /**
   * Close the dropdown when the search term becomes
   * too short.
   */
  useEffect(() => {
    if (!shouldFetchSuggestions) {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, [shouldFetchSuggestions]);

  /**
   * Close the dropdown when clicking/touching outside
   * the SearchBox.
   */
  useEffect(() => {
    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsidePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsidePointerDown
      );
    };
  }, []);

  /**
   * Navigate to the search results page.
   */
  const navigateToSearch = (query: string) => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      inputRef.current?.focus();
      return;
    }

    setIsOpen(false);
    setHighlightedIndex(-1);

    router.push(
      `/search?q=${encodeURIComponent(normalizedQuery)}`
    );
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (activeSuggestion) {
      navigateToSearch(activeSuggestion.title);
      return;
    }

    navigateToSearch(searchTerm);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setSearchTerm(value);

    if (value.trim().length >= MIN_SEARCH_LENGTH) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSuggestionClick = (
    suggestion: SearchSuggestion
  ) => {
    setSearchTerm(suggestion.title);
    navigateToSearch(suggestion.title);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    /*
     * Escape should always close the suggestion dropdown.
     */
    if (event.key === "Escape") {
      event.preventDefault();

      setIsOpen(false);
      setHighlightedIndex(-1);

      return;
    }

    /*
     * Don't perform keyboard navigation when there
     * are no suggestions.
     */
    if (!suggestions.length) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();

        setIsOpen(true);

        setHighlightedIndex((currentIndex) =>
          currentIndex < suggestions.length - 1
            ? currentIndex + 1
            : 0
        );

        break;

      case "ArrowUp":
        event.preventDefault();

        setIsOpen(true);

        setHighlightedIndex((currentIndex) =>
          currentIndex > 0
            ? currentIndex - 1
            : suggestions.length - 1
        );

        break;

      case "Enter":
        /*
         * If a suggestion is highlighted, selecting it
         * should navigate to that suggestion.
         *
         * Otherwise the form's onSubmit handles the
         * normal search.
         */
        if (activeSuggestion) {
          event.preventDefault();

          navigateToSearch(activeSuggestion.title);
        }

        break;

      default:
        break;
    }
  };

  const handleInputFocus = () => {
    if (
      normalizedSearchTerm.length >= MIN_SEARCH_LENGTH
    ) {
      setIsOpen(true);
    }
  };

  const getSuggestionId = (index: number) =>
    `search-suggestion-${index}`;

  return (
    <div
      ref={containerRef}
      className="search-box"
    >
      <form
        className="header-search"
        onSubmit={handleSubmit}
        role="search"
      >
        <Search
          className="header-search-icon"
          size={20}
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          type="search"
          value={searchTerm}
          onChange={handleChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls={
            showDropdown
              ? SUGGESTIONS_ID
              : undefined
          }
          aria-expanded={showDropdown}
          aria-activedescendant={
            showDropdown && activeSuggestion
              ? getSuggestionId(highlightedIndex)
              : undefined
          }
          autoComplete="off"
        />

        {isFetching && shouldFetchSuggestions && (
          <Loader2
            className="search-loading-icon"
            size={18}
            aria-hidden="true"
          />
        )}

        <button
          type="submit"
          className="header-search-button"
          aria-label="Search"
        >
          Search
        </button>
      </form>

      {showDropdown && (
        <div
          id={SUGGESTIONS_ID}
          className="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
        >
          {isFetching && suggestions.length === 0 && (
            <div
              className="search-suggestion-status"
              role="status"
              aria-live="polite"
            >
              Searching...
            </div>
          )}

          {!isFetching &&
            !isError &&
            suggestions.length === 0 && (
              <div
                className="search-suggestion-status"
                role="status"
              >
                No suggestions found
              </div>
            )}

          {isError && (
            <div
              className="search-suggestion-status"
              role="alert"
            >
              Unable to load suggestions
            </div>
          )}

          {suggestions.map((suggestion, index) => {
            const isHighlighted =
              highlightedIndex === index;

            return (
              <button
                key={
                  suggestion.id ||
                  suggestion.title
                }
                id={getSuggestionId(index)}
                type="button"
                className={`search-suggestion ${
                  isHighlighted
                    ? "search-suggestion-highlighted"
                    : ""
                }`}
                role="option"
                aria-selected={isHighlighted}
                onMouseDown={(event) => {
                  /*
                   * Prevent the input from losing focus
                   * before the click handler runs.
                   */
                  event.preventDefault();
                }}
                onClick={() =>
                  handleSuggestionClick(suggestion)
                }
              >
                <Search
                  size={16}
                  aria-hidden="true"
                />

                <span className="search-suggestion-content">
                  <span className="search-suggestion-title">
                    {suggestion.title}
                  </span>

                  {suggestion.brand && (
                    <span className="search-suggestion-meta">
                      {suggestion.brand}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}