// Recommendations plugin — complete self-contained entry point.
// Import from here instead of the individual sub-modules.

export {
  enableRecommendations,
  setRecommendationFeeds,
  setRecommendationCategorySuggester,
  getRecommendationCategorySuggester,
  useRecommendationsStore,
} from "./state";
export type { RecommendationFeed, ItemSuggestion, SuggesterFn } from "./state";
export { RecommendationsPanel } from "./RecommendationsPanel";
export {
  ALGORITHMS,
  ALGORITHM_BY_ID,
  FALLBACK_OPTIONS,
  MAX_STACK,
  defaultLogic,
  readLogic,
  isProductAware,
  productSlotCount,
  toLegacyShape,
  nextVtproduct,
} from "./logic";
export type {
  RecommendationsLogic,
  RecommendationFilters,
  StackEntry,
  AlgorithmDefinition,
  AlgorithmParamSpec,
  FallbackId,
  RecommendationMode,
} from "./logic";
