import {
  APP_INITIALIZER,
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  Provider,
  Type,
} from '@angular/core';

import { ThemeBuilder } from './builder';
import { ThemeManager } from './manager';

export const THEME_BUILDERS = new InjectionToken<ThemeBuilder<unknown>[]>(
  'THEME_BUILDERS',
);

export type ThemeBuilderTypes = Type<ThemeBuilder<unknown>>[];
export type InferThemeConfig<Builders extends ThemeBuilderTypes> = {
  [K in keyof Builders]: Builders[K] extends Type<ThemeBuilder<infer Config>>
    ? Config
    : never;
}[number];

export function provideTheme<Builders extends ThemeBuilderTypes>(
  builders: Builders,
  config: InferThemeConfig<Builders>,
): EnvironmentProviders {
  const builderProviders = builders.map(
    (builder): Provider => ({
      provide: THEME_BUILDERS,
      multi: true,
      useClass: builder,
    }),
  );
  return makeEnvironmentProviders([
    builderProviders,
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory:
        (themeManager = inject<ThemeManager<typeof config>>(ThemeManager)) =>
        () =>
          themeManager.apply(config),
    },
  ]);
}