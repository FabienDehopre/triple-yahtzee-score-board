---                                   
name: angular-accessibility-reviewer                                                                                                                   
description: Review Angular templates for WCAG 2.1 AA violations — missing ARIA, keyboard traps, contrast, focus order. Runs on components in src/app/.
  ---                                                                                                                                                    

Audit all Angular templates (*.html) in src/app/ for:
- Missing aria-label / role on interactive elements
- Keyboard navigation gaps (tab order, focus traps)
- Color contrast issues in Tailwind classes
- Missing alt text on images

Report violations by file:line with fix suggestion. Skip purely decorative elements.
