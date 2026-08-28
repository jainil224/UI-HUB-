import type { McpTool } from '../types/index.js';
import { search_components } from './searchComponents.js';
import { get_component } from './getComponent.js';
import { get_component_code } from './getComponentCode.js';
import { search_templates } from './searchTemplates.js';
import { get_template } from './getTemplate.js';
import { search_animations } from './searchAnimations.js';
import { get_animation_code } from './getAnimationCode.js';
import { list_categories } from './listCategories.js';
import { get_dependencies } from './getDependencies.js';

export const TOOLS: McpTool[] = [
  search_components,
  get_component,
  get_component_code,
  search_templates,
  get_template,
  search_animations,
  get_animation_code,
  list_categories,
  get_dependencies,
];
