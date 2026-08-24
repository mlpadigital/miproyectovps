import React from 'react';
import SnowboardingTemplate from './Snowboarding';
import AcademyTemplate from './Academy';
import MinimalTemplate from './Minimal';
import DarkTechTemplate from './DarkTech';
import MarketplaceTemplate from './Marketplace';
import RestaurantTemplate from './Restaurant';

export const TEMPLATES = {
  snowboarding: SnowboardingTemplate,
  academy: AcademyTemplate,
  minimal: MinimalTemplate,
  darktech: DarkTechTemplate,
  marketplace: MarketplaceTemplate,
  restaurant: RestaurantTemplate,
  default: MinimalTemplate
};

export const DefaultTemplate = MinimalTemplate;
