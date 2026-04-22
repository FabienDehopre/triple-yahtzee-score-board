---                                   
name: gen-component                   
description: Scaffold a new Angular component with spec file (red test first). Args: component name in kebab-case.
  ---                                                                                                                                                    

Given a component name argument:
1. Create src/app/<name>/<name>.ts, <name>.html, <name>.css
2. Create src/app/<name>/<name>.spec.ts with one failing test (red)
3. Add component to app.config.ts if standalone
4. Run: pnpm lint

Follow TDD: spec file first, implementation stubs only.
