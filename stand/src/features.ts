import type {BroFilters, BroRow} from '@table-bro/core';

/** A row of the Features table. */
export interface StandFeature extends BroRow {
  featureName: string;
  category: string[];
  done: boolean;
}

export interface FeatureCustomFilters {
  /** A part of the feature name. */
  featureName?: string;
  /** One of the categories of the feature. */
  category?: string;
  /** With false, without the features that work with server-side data loading; with true, all of them. */
  serverSide?: boolean;
}

export type FeatureFilters = BroFilters<StandFeature, FeatureCustomFilters>;

/** The categories of the filters. */
export const featureCategories: string[] = ['Basics', 'Design', 'Details', 'Filtering'];

/** The rows of the Features table: the names hold markup. */
export const features: StandFeature[] = [
  {category: ['Basics'], featureName: 'Fixed row height', done: true},
  {category: ['Basics'], featureName: 'Fixed column width', done: true},
  {category: ['Basics'], featureName: 'Auto-detected column width', done: true},
  {category: ['Basics', 'Tooltip'], featureName: 'Truncated text with hover tooltips', done: true},
  {category: ['Basics'], featureName: 'Animated pagination <small class="text-body-secondary">(including server-side data)</small>', done: true},
  {category: ['Basics'], featureName: 'Animated page size change <small class="text-body-secondary">(including server-side data)</small>', done: true},
  {category: ['Basics', 'States'], featureName: 'Animated table states <small class="text-body-secondary">(including server-side data)</small>', done: true},
  {category: ['Design', 'CSS'], featureName: 'Supports CSS styling of <code>&lsaquo;table&rsaquo;</code>', done: true},
  {category: ['Design', 'Custom content'], featureName: 'Custom content in tables using <code>Custom Elements</code>', done: true},
  {category: ['Design', 'Shadows'], featureName: 'Shadows', done: true},
  {category: ['Design', 'Dark', 'Light'], featureName: 'Dark/Light mode', done: true},
  {category: ['Design', 'M3', 'M2'], featureName: 'Material design', done: true},
  {category: ['Design', 'Bootstrap 5, 4, 3'], featureName: 'Bootstrap design', done: true},
  {category: ['Details', 'Expansion Panels'], featureName: 'Island Details <small class="text-body-secondary">as Expansion Panels (including server-side data)</small>', done: true},
  {category: ['Details'], featureName: 'Default Details <small class="text-body-secondary">as a regular row below (including server-side data)</small>', done: true},
  {category: ['Details', 'Dynamic height'], featureName: 'Dynamically computed Details-height on render', done: true},
  {category: ['Filtering', 'Sorting', 'Search'], featureName: 'Toolbar with Search <small class="text-body-secondary">(including server-side data)</small>', done: true},
  {category: ['Filtering', 'Sorting', 'Custom filters'], featureName: 'Custom user filters <small class="text-body-secondary">(including server-side data)</small>', done: true},
  {category: ['Filtering', 'Sorting', 'Custom rules'], featureName: 'Custom sorting rules <small class="text-body-secondary">(including server-side data)</small>', done: true}
];

/** The feature names hold markup; the filters look at their text. */
function toText(html: string): string {
  const div: HTMLDivElement = document.createElement('div');

  div.innerHTML = html;

  return div.textContent || '';
}

/**
 * The features that match the search and the filters: the rule of the emulated server and of the local mode alike.
 * @param rows - the features
 * @param filters - the search of the toolbar and the filters of the drawer
 */
export function filterFeatures(rows: StandFeature[], filters: FeatureFilters | undefined): StandFeature[] {
  const {search, featureName, category, serverSide} = filters ?? {};
  const includes = (feature: StandFeature, text: string) => toText(feature.featureName).toLowerCase().includes(text.toLowerCase());

  return rows.filter(feature => {
    return (!search || includes(feature, search))
      && (!featureName || includes(feature, featureName))
      && (!category || feature.category.includes(category))
      && (serverSide !== false || !includes(feature, 'server-side'));
  });
}
