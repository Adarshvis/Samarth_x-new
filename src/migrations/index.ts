import * as migration_20260407_060924_add_feature_cards_layout from './20260407_060924_add_feature_cards_layout';
import * as migration_20260407_063000_cleanup_invalid_header_child_pages from './20260407_063000_cleanup_invalid_header_child_pages';
import * as migration_20260407_115828 from './20260407_115828';
import * as migration_20260408_010000_add_flexible_row_card_blocks from './20260408_010000_add_flexible_row_card_blocks';
import * as migration_20260408_020000_add_flex_buttons_subblock from './20260408_020000_add_flex_buttons_subblock';
import * as migration_20260408_030000_add_flex_dashboard_mock_subblock from './20260408_030000_add_flex_dashboard_mock_subblock';
import * as migration_20260408_040000_update_flex_dashboard_mock_typography from './20260408_040000_update_flex_dashboard_mock_typography';
import * as migration_20260408_050000_cleanup_invalid_page_relationships from './20260408_050000_cleanup_invalid_page_relationships';
import * as migration_20260408_060000_update_flex_dashboard_mock_badge_animations from './20260408_060000_update_flex_dashboard_mock_badge_animations';
import * as migration_20260408_070000_convert_flex_feature_cards_text_to_richtext from './20260408_070000_convert_flex_feature_cards_text_to_richtext';
import * as migration_20260408_080000_add_highlight_cards_style_controls from './20260408_080000_add_highlight_cards_style_controls';
import * as migration_20260408_090000_add_dashboard_mock_layout_variant from './20260408_090000_add_dashboard_mock_layout_variant';
import * as migration_20260416_010000_add_analytics_dashboard from './20260416_010000_add_analytics_dashboard';
import * as migration_20260423_070302_add_career_posting_fields from './20260423_070302_add_career_posting_fields';
import * as migration_20260714_010000_add_connected_hero from './20260714_010000_add_connected_hero';
import * as migration_20260714_020000_connected_hero_light from './20260714_020000_connected_hero_light';
import * as migration_20260714_030000_add_statistics_impact_spotlight from './20260714_030000_add_statistics_impact_spotlight';
import * as migration_20260714_040000_add_statistics_leaflet from './20260714_040000_add_statistics_leaflet';
import * as migration_20260714_050000_add_feature_cards_role_layout from './20260714_050000_add_feature_cards_role_layout';

export const migrations = [
  {
    up: migration_20260407_060924_add_feature_cards_layout.up,
    down: migration_20260407_060924_add_feature_cards_layout.down,
    name: '20260407_060924_add_feature_cards_layout',
  },
  {
    up: migration_20260407_063000_cleanup_invalid_header_child_pages.up,
    down: migration_20260407_063000_cleanup_invalid_header_child_pages.down,
    name: '20260407_063000_cleanup_invalid_header_child_pages',
  },
  {
    up: migration_20260407_115828.up,
    down: migration_20260407_115828.down,
    name: '20260407_115828',
  },
  {
    up: migration_20260408_010000_add_flexible_row_card_blocks.up,
    down: migration_20260408_010000_add_flexible_row_card_blocks.down,
    name: '20260408_010000_add_flexible_row_card_blocks',
  },
  {
    up: migration_20260408_020000_add_flex_buttons_subblock.up,
    down: migration_20260408_020000_add_flex_buttons_subblock.down,
    name: '20260408_020000_add_flex_buttons_subblock',
  },
  {
    up: migration_20260408_030000_add_flex_dashboard_mock_subblock.up,
    down: migration_20260408_030000_add_flex_dashboard_mock_subblock.down,
    name: '20260408_030000_add_flex_dashboard_mock_subblock',
  },
  {
    up: migration_20260408_040000_update_flex_dashboard_mock_typography.up,
    down: migration_20260408_040000_update_flex_dashboard_mock_typography.down,
    name: '20260408_040000_update_flex_dashboard_mock_typography',
  },
  {
    up: migration_20260408_050000_cleanup_invalid_page_relationships.up,
    down: migration_20260408_050000_cleanup_invalid_page_relationships.down,
    name: '20260408_050000_cleanup_invalid_page_relationships',
  },
  {
    up: migration_20260408_060000_update_flex_dashboard_mock_badge_animations.up,
    down: migration_20260408_060000_update_flex_dashboard_mock_badge_animations.down,
    name: '20260408_060000_update_flex_dashboard_mock_badge_animations',
  },
  {
    up: migration_20260408_070000_convert_flex_feature_cards_text_to_richtext.up,
    down: migration_20260408_070000_convert_flex_feature_cards_text_to_richtext.down,
    name: '20260408_070000_convert_flex_feature_cards_text_to_richtext',
  },
  {
    up: migration_20260408_080000_add_highlight_cards_style_controls.up,
    down: migration_20260408_080000_add_highlight_cards_style_controls.down,
    name: '20260408_080000_add_highlight_cards_style_controls',
  },
  {
    up: migration_20260408_090000_add_dashboard_mock_layout_variant.up,
    down: migration_20260408_090000_add_dashboard_mock_layout_variant.down,
    name: '20260408_090000_add_dashboard_mock_layout_variant',
  },
  {
    up: migration_20260416_010000_add_analytics_dashboard.up,
    down: migration_20260416_010000_add_analytics_dashboard.down,
    name: '20260416_010000_add_analytics_dashboard',
  },
  {
    up: migration_20260423_070302_add_career_posting_fields.up,
    down: migration_20260423_070302_add_career_posting_fields.down,
    name: '20260423_070302_add_career_posting_fields'
  },
  {
    up: migration_20260714_010000_add_connected_hero.up,
    down: migration_20260714_010000_add_connected_hero.down,
    name: '20260714_010000_add_connected_hero',
  },
  {
    up: migration_20260714_020000_connected_hero_light.up,
    down: migration_20260714_020000_connected_hero_light.down,
    name: '20260714_020000_connected_hero_light',
  },
  {
    up: migration_20260714_030000_add_statistics_impact_spotlight.up,
    down: migration_20260714_030000_add_statistics_impact_spotlight.down,
    name: '20260714_030000_add_statistics_impact_spotlight',
  },
  {
    up: migration_20260714_040000_add_statistics_leaflet.up,
    down: migration_20260714_040000_add_statistics_leaflet.down,
    name: '20260714_040000_add_statistics_leaflet',
  },
  {
    up: migration_20260714_050000_add_feature_cards_role_layout.up,
    down: migration_20260714_050000_add_feature_cards_role_layout.down,
    name: '20260714_050000_add_feature_cards_role_layout',
  },
];
