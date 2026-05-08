# Transloco for runtime i18n

The app uses [Transloco](https://jsverse.github.io/transloco/) for internationalization.

We chose Transloco over native Angular i18n because native i18n requires a separate AOT build per locale — there is no runtime language switching. This app is a single-page client-side tool (ADR-0005); reloading a different bundle to change language is poor UX.

We chose Transloco over ngx-translate because ngx-translate has had no active development since ~2023. Transloco is actively maintained, has an Angular 21-compatible signals integration, and is the community-endorsed successor for runtime switching in the Angular ecosystem.

## Consequences

- Translation keys live in `public/i18n/<locale>.json` (Transloco default)
- Components use the `transloco` pipe or `TranslocoService` — not Angular's built-in `i18n` attribute
- Adding a new locale = add a JSON file and register it in `TranslocoModule` config; no rebuild required
- `index.html` `lang` attribute must be updated dynamically when the locale changes