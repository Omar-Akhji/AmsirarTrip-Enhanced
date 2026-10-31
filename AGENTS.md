# Mandatory Directive: Project Execution Protocols

## 1. Runtime & Package Manager: Always Use Bun

- **Strict Requirement**: Always use **Bun** (`bun`, `bun run`, `bunx`, `bun add`, `bun install`) as
  the runtime and package manager for this project.
- **Do not use**: `npm`, `yarn`, `pnpm`, or `npx` directly for project operations unless Bun is
  unavailable or explicitly requested.
- For scripts: use `bun run dev`, `bun run build`, `bun run check`, `bun run lint`.
- For executing CLI packages: use `bunx <package>` (or `npx.cmd` on Windows if a specific tool
  requires cmd wrapper).

## 2. Mandatory MCP & Tools Utilization

- **Check MCPs First**: Before making assumptions or improvising implementations, always check and
  utilize the configured MCP servers (defined in `.gemini/config/mcp_config.json`):
  - **Context7 (`context7`)**: Always use Context7 to resolve library IDs and query documentation
    (`resolve-library-id`, `query-docs`) for modern libraries, APIs, and frameworks (Astro, Vue,
    Tailwind, GSAP, etc.).
  - **Chrome DevTools (`chrome-devtools`)**: Use Chrome DevTools MCP tools (`new_page`,
    `navigate_page`, `list_console_messages`, `lighthouse_audit`, `evaluate_script`) to detect
    runtime defects, Core Web Vitals, console errors, accessibility violations, and verify changes
    live.
  - **Other Configured MCPs**: Leverage `pagespeed-insights`, `gsc` (Google Search Console),
    `visiblyai`, and `vue-docs` whenever relevant to performance, SEO, or framework architecture.

## 3. Skill Lookup Is Mandatory for Every Task

Whenever the user presents a request, task, problem, or feature to build:

1. **Always check available skills first**: Scan available skills in `.agents/skills/`,
   `~/.agents/skills/`, and `~/.gemini/config/skills/`.
2. **Identify relevant playbooks**:
   - For Bun runtime, commands, package management, or scripts -> Use `bun-development`.
   - For ideation, requirements clarification, new architecture, or feature planning -> Use
     `brainstorming`.
   - For debugging, resolving errors, test failures, or crashes -> Use `systematic-debugging`.
   - For UI, CSS, layout, styling, and visual design -> Use `impeccable`, `shadcn`, `antislop`,
     `antislop-ui`, `anti-slop-web-design`, `frontend-design`, `design-system`,
     `design-taste-frontend`, `taste-skill`, `ui-ux-pro-max`, `awesome-claude-design`, and
     `design-motion-principles`.
   - For copywriting, tone, text, and marketing copy -> Use `antislop-copywriting`.
   - For accessibility, contrast, and human ergonomics -> Use `antislop-human`.
   - For mobile layout, responsive breakpoints, and touch interfaces -> Use `antislop-layoutmobile`.
   - For code comments cleanup and AI commentary removal -> Use `antislop-code`.
   - For API contracts, endpoints, routes, and schemas -> Use `api-design-principles` and
     `api-security-best-practices`.
   - For backend structure, services, and architecture -> Use `backend-architect` and
     `backend-dev-guidelines`.
   - For code review, security audits, or pre-deployment checks -> Use `code-audit` and
     `production-audit`.
   - For building or inspecting MCP servers or tools -> Use `mcp-tool-developer`.
   - For test suites and testing -> Use `pytest-skill`.
3. **Execute using the skill's instructions**: Read the corresponding `SKILL.md` before taking
   action. Strictly adhere to its operating mode, constraints, and validation steps.
4. **State the active skill**: Inform the user which skill is being utilized to solve the task.

<!-- antislop:start -->

## antislop

For UI, copy, people, mobile layout, or code comments work, read these installed skill files
directly (use these paths even if a same-named global skill exists):

- Core filter, always on: `antislop`: `.agents/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.agents/skills/antislop-ui/SKILL.md`
- Copy & text: `antislop-copywriting`: `.agents/skills/antislop-copywriting/SKILL.md`
- People: `antislop-human`: `.agents/skills/antislop-human/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.agents/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `antislop-code`: `.agents/skills/antislop-code/SKILL.md`

Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session
instruction first, then global preference, then ask. A session instruction always wins. For a
resolved mode, say `antislop active: <mode> (session override).` or
`antislop active: <mode> (global preference).` once before presenting findings or making edits,
using the actual mode and source. Acknowledging the user's request without naming the source does
not replace this notice. Only an explicit choice of antislop during or after selects a session mode.
A request to review, audit, or avoid file edits does not select a mode; read the global preference
in that case. Another skill's mode does not select antislop's mode. If the mode is unresolved, ask
during/after and end the response; wait for the answer before any UI review, planning, or concept.
For read-only tasks, put the active-mode notice only at the start of the final answer, never in
progress messages. For editing tasks, announce before the first edit and omit it from the final
answer. To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick
Overwrite them.
<!-- antislop:end -->
