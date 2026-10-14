import { i18n } from "../i18n";

export function prettifyTopic(slug: string): string {
  if (!slug) return "";
  return slug
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function prettifyIndicator(name: string): string {
  if (!name) return "";
  return name
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function translateOr(key: string, fallback: string): string {
  const { t, te } = i18n.global;
  return te(key) || te(key, 'en') ? t(key) : fallback;
}

export function topicLabel(slug: string): string {
  return translateOr(`topics.${slug}`, prettifyTopic(slug));
}

export function indicatorLabel(name: string): string {
  const member = indicatorGroupOf(name);
  if (member?.suffix) {
    return i18n.global.t('indicatorWithOption', {
      indicator: indicatorLabel(member.group.base),
      option: member.group.optionLabel(member.suffix)
    });
  }
  return translateOr(`indicators.${name}`, prettifyIndicator(name));
}

export function attributeLabel(attribute: string): string {
  return translateOr(`attributes.${attribute}`, prettifyIndicator(attribute));
}

/** CORINE Land Cover level-2 class codes (e.g. "31" = Forests). */
export function landCoverClassLabel(code: string): string {
  return translateOr(`landCoverClasses.${code}`, code);
}

/**
 * Indicators the pipeline writes once per attribute/class, as
 * "<base>_<suffix>" (e.g. roads-thematic-accuracy_name), which the sidebar
 * shows as one card with a dropdown instead of one card each. A bare "<base>"
 * row, if present, is the across-all-attributes/classes variant and becomes
 * the dropdown's "All" option.
 */
export interface IndicatorGroup {
  base: string;
  // i18n key for the bare (all attributes/classes) option's label.
  allLabelKey: string;
  optionLabel: (suffix: string) => string;
  // Option selected by default. Undefined: fall back to the topic's
  // topicConfig.completenessIndicator.
  defaultIndicator?: string;
}

export const INDICATOR_GROUPS: IndicatorGroup[] = [
  { base: "attribute-completeness", allLabelKey: "indicatorGroups.allAttributes", optionLabel: attributeLabel },
  { base: "roads-thematic-accuracy", allLabelKey: "indicatorGroups.allAttributes", optionLabel: attributeLabel, defaultIndicator: "roads-thematic-accuracy_name" },
  { base: "land-cover-thematic-accuracy", allLabelKey: "indicatorGroups.allClasses", optionLabel: landCoverClassLabel, defaultIndicator: "land-cover-thematic-accuracy" }
];

/** The group an indicator belongs to, and its suffix (null for the bare "all" variant). */
export function indicatorGroupOf(indicator: string): { group: IndicatorGroup; suffix: string | null } | null {
  for (const group of INDICATOR_GROUPS) {
    if (indicator === group.base) return { group, suffix: null };
    if (indicator.startsWith(`${group.base}_`)) return { group, suffix: indicator.slice(group.base.length + 1) };
  }
  return null;
}

/** The group's base name for grouped indicators, the indicator itself otherwise. */
export function indicatorBase(indicator: string): string {
  return indicatorGroupOf(indicator)?.group.base ?? indicator;
}

// OQAPI documentation (same links as the ohsome-dashboard's indicator
// info): German pages live at the root, English ones under "en/".
const OQAPI_DOCS_URL = "https://giscience.github.io/oqapi-jupyter-book";
const DOCUMENTED_INDICATORS = new Set([
  "currentness",
  "mapping-saturation",
  "attribute-completeness",
  "user-activity",
  "building-comparison",
  "roads-thematic-accuracy",
  "land-cover-thematic-accuracy",
  "land-cover-completeness"
]);
// English pages whose slug differs from the indicator key
// (en/roads-thematic-accuracy is a 404).
const DOCS_PAGE_OVERRIDES_EN: Record<string, string> = {
  "roads-thematic-accuracy": "road-comparison"
};

/** Docs page for an indicator in the current UI language, or null if there is none (e.g. tag distribution). */
export function indicatorDocsUrl(indicator: string): string | null {
  const base = indicatorBase(indicator);
  if (!DOCUMENTED_INDICATORS.has(base)) return null;
  return i18n.global.locale.value === "de"
    ? `${OQAPI_DOCS_URL}/${base}`
    : `${OQAPI_DOCS_URL}/en/${DOCS_PAGE_OVERRIDES_EN[base] ?? base}`;
}

/** Dropdown label for one option of a group. */
export function indicatorOptionLabel(indicator: string): string {
  const member = indicatorGroupOf(indicator);
  if (!member) return indicatorLabel(indicator);
  return member.suffix ? member.group.optionLabel(member.suffix) : i18n.global.t(member.group.allLabelKey);
}

export function countryLabel(code: string, fallback: string): string {
  return translateOr(`countries.${code}`, fallback);
}

export interface TopicConfig {
  comparisonIndicator: string;
  comparisonLabel: string;
  currentnessLabel: string;
  completenessIndicator: string;
  completenessLabel: string;
  completenessFigure: string;
}

export const topicConfig: Record<string, TopicConfig> = {
  "roads": {
    comparisonIndicator: "roads-thematic-accuracy",
    comparisonLabel: "Road Completeness",
    currentnessLabel: "Road Currentness",
    completenessIndicator: "attribute-completeness_surface",
    completenessLabel: "Attribute Completeness",
    completenessFigure: "attribute-completeness_surface"
  },
  "buildings": {
    comparisonIndicator: "building-comparison",
    comparisonLabel: "Building Completeness",
    currentnessLabel: "Building Currentness",
    completenessIndicator: "user-activity",
    completenessLabel: "User Activity",
    completenessFigure: "user-activity"
  },
  "land-cover": {
    comparisonIndicator: "land-cover-thematic-accuracy",
    comparisonLabel: "Land Cover Thematic Accuracy",
    currentnessLabel: "Land Cover Currentness",
    completenessIndicator: "land-cover-completeness",
    completenessLabel: "Land Cover Completeness",
    completenessFigure: "land-cover-completeness"
  },
  // Schools/hospitals have no reference-dataset comparison indicator at all -
  // mapping-saturation (how mature the mapping is) is the closest available
  // stand-in, rather than falling back to whatever indicator happens to load
  // first (which collapsed onto "currentness", showing the same card twice).
  "schools": {
    comparisonIndicator: "mapping-saturation",
    comparisonLabel: "Mapping Saturation",
    currentnessLabel: "School Currentness",
    completenessIndicator: "attribute-completeness_name",
    completenessLabel: "Attribute Completeness",
    completenessFigure: "attribute-completeness_name"
  },
  "hospitals": {
    comparisonIndicator: "mapping-saturation",
    comparisonLabel: "Mapping Saturation",
    currentnessLabel: "Hospital Currentness",
    completenessIndicator: "attribute-completeness_emergency",
    completenessLabel: "Attribute Completeness",
    completenessFigure: "attribute-completeness_emergency"
  }
};

let currentSchoolSubTopic = "operator";

export function getCurrentSchoolSubTopic(): string {
  return currentSchoolSubTopic;
}

export function setCurrentSchoolSubTopic(subTopic: string): void {
  currentSchoolSubTopic = subTopic;
}

/**
 * Which tag-distribution grouping_key to query for a given topic (and, for
 * schools/hospitals, the currently selected sub-topic toggle). This is a query
 * parameter now, not a file-naming key - the tag-distribution parquet covers
 * every topic/grouping_key/measure combination in one file per (country, layer).
 */
export function getTagGroupingKey(topic: string): string {
  if (!topic) return "";
  const topicLower = topic.toLowerCase();

  if (topicLower.startsWith("road")) return "highway";
  if (topicLower.startsWith("building")) return "building";
  if (topicLower.startsWith("land-cover") || topicLower.startsWith("land")) return "landuse";

  if (topicLower.startsWith("school")) {
    return currentSchoolSubTopic === "isced" ? "isced:level" : "operator:type";
  }

  if (topicLower.startsWith("hospital") || topicLower.startsWith("healthcare-primary")) {
    return currentSchoolSubTopic === "isced" ? "healthcare:speciality" : "operator:type";
  }

  return "";
}

/**
 * Per-country layer names. Most countries' boundaries come from OpenStreetMap
 * (adm0/adm1/h3); Germany's come from BKG instead, with its own level names.
 * "countryLevel" is the single whole-country polygon layer (treemap, tag
 * coverage, gauge figures, and indicator descriptions all come from here,
 * independent of whichever grid layer a map is currently showing).
 * "detailLevel" is the finer sub-national layer used as the default map grid.
 * The *Label fields are i18n keys (see src/locales), not display text.
 */
export interface CountryLayers {
  countryLevel: string;
  countryLevelLabel: string;
  // Optional extra granularity between countryLevel and detailLevel - only
  // Germany has this today (Bundesländer, between the whole-country and
  // Kreis layers), so it's undefined everywhere else.
  stateLevel?: string;
  stateLevelLabel?: string;
  detailLevel: string;
  detailLevelLabel: string;
  h3Level: string;
  h3LevelLabel: string;
}

const DEFAULT_LAYERS: CountryLayers = {
  countryLevel: "adm0",
  countryLevelLabel: "layers.adm0",
  detailLevel: "adm1",
  detailLevelLabel: "layers.adm1",
  h3Level: "h3",
  h3LevelLabel: "layers.h3"
};
const COUNTRY_LAYER_OVERRIDES: Record<string, CountryLayers> = {
  DEU: {
    countryLevel: "vg2500_sta",
    countryLevelLabel: "layers.deuCountry",
    stateLevel: "vg2500_lan",
    stateLevelLabel: "layers.deuStates",
    detailLevel: "vg1000_krs",
    detailLevelLabel: "layers.deuDistricts",
    h3Level: "h3",
    h3LevelLabel: "layers.h3"
  }
};

export function getCountryLayers(code: string): CountryLayers {
  return COUNTRY_LAYER_OVERRIDES[code] || DEFAULT_LAYERS;
}

export interface BuildUrlsResult {
  pmtilesUrl: string;
  parquetUrl: string;
  tagDistributionUrl: string;
}

/**
 * Candidate data code for a country in a given UI language: German data lives
 * in a parallel "<CODE>_DE/<CODE>_DE_*" set. Whether that set actually exists
 * is checked by resolveDataCode() in dataService.ts, which falls back to the
 * plain (English) code.
 */
export function localizedDataCode(code: string, locale: string): string {
  return locale === 'de' ? `${code}_DE` : code;
}

/**
 * URLs for one (data code, layer) pair - the pmtiles file is shared across all
 * layers of a country. Takes the data code (e.g. "DEU" or "DEU_DE", see
 * resolveDataCode), not the plain country code used by getCountryLayers().
 */
export function buildUrls(dataCode: string, layer: string): BuildUrlsResult {
  return {
    pmtilesUrl: `https://hot.storage.heigit.org/heigit-hdx-public/ohsome-quality-country-reports/${dataCode}/${dataCode}_boundaries.pmtiles`,
    parquetUrl: `https://hot.storage.heigit.org/heigit-hdx-public/ohsome-quality-country-reports/${dataCode}/${dataCode}_${layer}_long.parquet`,
    tagDistributionUrl: `https://hot.storage.heigit.org/heigit-hdx-public/ohsome-quality-country-reports/${dataCode}/${dataCode}_${layer}_tag_distribution.parquet`
  };
}

/**
 * Turns an indicator description from the pipeline into HTML that's safe for
 * v-html. The descriptions carry a little markup of their own (units like
 * "km<sup>2</sup>", links like "<a href=...>F1-Score</a>") that plain {{ }}
 * interpolation would show as literal tags. Everything is escaped first, then
 * only that known markup is let back in - anything else stays escaped text
 * and is logged, so new markup from the backend shows up in the console
 * instead of silently rendering as raw tags.
 */
export function formatDescriptionHtml(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  html = html
    .replace(/&lt;(sup|sub)&gt;([^&]{1,10})&lt;\/\1&gt;/g, '<$1>$2</$1>')
    .replace(/&lt;br\s*\/?&gt;/g, '<br>')
    .replace(
      /&lt;a href=&quot;(https?:\/\/[^&\s]+)&quot;&gt;(.*?)&lt;\/a&gt;/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>'
    );

  const leftover = html.match(/&lt;\/?[a-z][\s\S]*?&gt;/gi);
  if (leftover) {
    console.warn('[formatDescriptionHtml] Unhandled markup in description:', leftover, text);
  }
  return html;
}
