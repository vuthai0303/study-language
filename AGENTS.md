# AGENTS.md
# Agent Instructions

## Purpose

This file is the project brain for Codex when working on StudyLanguage.
StudyLanguage is a browser-only English learning web app built with Next.js 15 App Router, TypeScript strict mode, Tailwind CSS 4, shadcn/ui, Redux Toolkit, localStorage persistence, and direct client-side AI calls to OpenAI or Google Gemini.
Before changing code, read this file completely, inspect the existing implementation, and preserve the current architecture unless the user explicitly asks for a larger redesign.

## Implementation process

1. Understand the user's objectives, ask clarifying questions if necessary, and include examples to help the user confirm their understanding.
2. Plan and present the steps to be taken.
    - Trình bày theo hướng liệt kê file nào sẽ thay đổi, nội dung thay đổi là gì?, mức độ ảnh hưởng đến các chức năng hiện có như thế nào?.
3. Nếu người dùng đồng ý thực hiện theo kế hoạch, nếu không thì dựa theo phản hồi của người dùng và xây dựng lại kế hoạch khác tại bước 2.
4. Tạo thêm file `ai-log-{Datetime}` trong `.ai-log\` ghi lại công việc đã làm theo các mục sau:
    1. Objectives
    2. Plan
    3. Changed
    4. Result

## Instruction priority

Follow this order when instructions conflict:

1. Direct user request in the current Codex task.
2. More specific AGENTS.md or AGENTS.override.md files in nested directories.
3. This repository-level AGENTS.md.
4. Existing code patterns in the touched files.
5. General best practices.

If a user request conflicts with a security rule, data safety rule, or project boundary in this file, stop and explain the risk before changing code.

## Project summary

StudyLanguage has four main modules:

| Module | Route | Purpose |
|---|---|---|
| Vocabulary | `/vocabulary` | Vocabulary CRUD, 3-status Kanban, quiz by multiple-choice or writing, JSON import/export, automatic level system |
| Writing | `/writing` | AI generates Vietnamese paragraphs, user translates sentence-by-sentence into English, AI scores and suggests improvements |
| Grammar | `/grammar` | User selects grammar topic, AI generates 10 multiple-choice questions with explanations |
| Reading | `/reading` | AI generates English passage and 5 reading comprehension questions |

The app has no backend server, no remote database, and no `app/api` route handlers. User data is stored locally in the browser through `localStorage`.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript 5 strict mode |
| Styling | Tailwind CSS 4, `tw-animate-css`, CSS variables, OKLCH tokens |
| UI | shadcn/ui based on Radix UI |
| State | Redux Toolkit 2, `react-redux` |
| Forms | react-hook-form 7, Zod 3 |
| Icons | lucide-react |
| Persistence | Browser localStorage only |
| AI providers | OpenAI Chat Completions and Google Gemini |
| Fonts | Geist Sans and Geist Mono via `next/font` |
| ID | uuid v4 |
| Package manager | npm |

## Common commands

Use the scripts defined in `package.json`. Do not assume a script exists before checking.

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Non-negotiable architecture rules

- Do not create backend routes. Never add `src/app/api`, route handlers, server actions for persistence, or backend proxy APIs unless the user explicitly changes the project architecture.
- Do not add a database. Persistence must remain in src/lib/localStorage.ts.
- Do not store API keys in source files, environment examples, logs, tests, screenshots, documentation examples, generated fixtures, or committed JSON. API keys must only be entered through the settings UI and stored by the existing AI config flow.
- Do not call OpenAI or Gemini directly from pages or components. Always use useAI() from `src/hooks/useAI.ts`.
- Do not add new state management libraries such as Zustand, Jotai, MobX, or React Query unless the user explicitly approves.
- Do not add Axios for AI calls. Use native fetch through useAI.
- Do not add react-router-dom. Use Next.js App Router, next/link, and next/navigation.
- Do not edit files in `src/components/ui/` unless adding or updating a shadcn/ui primitive is explicitly necessary.

## Security and privacy rules

- Treat all API keys as secrets.
Never print API keys or full AI request payloads to console.log, console.error, UI messages, generated docs, or test snapshots.
- If code touches AI_CONFIG, useAI, setting-ai-key-modal.tsx, or localStorage.ts, check that keys are not exposed.
- If the user asks to hardcode a key, create a .env key, or include a real key in a sample, refuse and explain that this app currently expects runtime browser input through the settings modal.
- Because this is a browser-only app, do not claim that client-side API keys are fully secure. If asked about production hardening, recommend adding a backend proxy or server-side key management as an architecture change, but do not implement it unless explicitly requested.
- For business or company data, only use officially approved API keys with training opt-out. Do not use personal AI subscriptions or personal accounts for proprietary data.
- If a key may have leaked:
    1. Stop making unrelated changes.
    2. Identify whether the key appears in Git history, local files, build output, logs, screenshots, or docs.
    3. Tell the user to revoke or rotate the key immediately.
    4. Remove the secret from current files.
    5. If committed, recommend history cleanup and repository secret scanning.
    6. Re-run checks after cleanup.

## Development workflow for Codex

For every implementation task, follow this process strictly.
Read the `guide.md` file to understand the project's architecture and business logic.

### 1. Understand the objective
- Before editing any file, understand the user's objective and the expected outcome.
- Read the user's request carefully and identify:
    - the target feature, bug, refactor, or documentation update
    - the affected module, route, component, hook, store, type, constant, or localStorage helper
    - whether the task changes behavior, UI, data shape, AI prompt format, or persistence
    - whether the task may affect existing user data in localStorage
    - whether the task may affect AI provider behavior for OPENAI or GEMINI
    - whether the task may involve security-sensitive data such as API keys
- If the requirement is unclear, ask concise clarification questions before changing code.
- When useful, include a small example to confirm understanding with the user. Examples should be short and focused on behavior, not implementation details.
- Do not make code changes while the objective is still ambiguous.

### 2. Inspect the existing code
- Before proposing a plan, inspect the existing implementation.
- Then inspect the relevant files for the touched area.
- Examples:
    - For vocabulary work, inspect src/components/vocabulary/, src/types/, src/consts/, and src/lib/localStorage.ts
    - For writing work, inspect src/app/writing/page.tsx, src/components/writing/, src/types/writing.ts, and AI prompt usage
    - For reading work, inspect src/app/reading/page.tsx, src/components/reading/, and reading-related types
    - For grammar work, inspect src/app/grammar/page.tsx and related AI generation logic
    - For AI behavior, inspect src/hooks/useAI.ts, src/store/aiConfigSlice.ts, and src/components/settings/setting-ai-key-modal.tsx
    - For persistence changes, inspect src/lib/localStorage.ts and src/consts/index.ts

### 3. Create and present an implementation plan

- Before editing files, present a clear implementation plan to the user.
- The plan must include:
    - objective of the task
    - files expected to be changed. Include change `guide.md` to suitable for new objective.
    - what will be changed in each file
    - expected impact on existing behavior
    - risk level
    - any assumptions or open questions

### 4. Wait for user approval

- Do not edit files until the user approves the plan.
- Allowed before approval:
    - reading files
    - searching files
    - checking Git status
    - explaining the plan
    - asking clarification questions
- Not allowed before approval:
    - modifying source files
    - adding dependencies
    - changing lock files
    - deleting files
    - migrating localStorage data
    - running destructive commands
    - creating commits
    - changing Git history
- If the user does not approve the plan and gives feedback, revise the plan and present the updated version.
- If the user explicitly asks for direct implementation without a planning step, still provide a short plan first unless the change is documentation-only and obviously safe.

### 5. Implement only the approved scope

After approval, implement only what was included in the approved plan.

- Do not make unrelated refactors.

- Do not fix unrelated bugs silently.

- Do not add dependencies unless the approved plan explicitly includes them.

- Do not modify src/components/ui/ unless the approved plan explicitly includes it.

- Do not change architecture boundaries:
    - No backend routes
    - No database
    - No direct AI provider calls outside useAI
    - No hardcoded API keys
    - No React Router
- If implementation reveals that the approved plan is insufficient, stop and present an updated plan before continuing.

### 6. Validate the change
- After implementation, run the strongest available validation commands.
    ```Bash
    npm run lint
    npm run build
    ```
- If a command fails, fix the issue if it is within the approved scope, then re-run the command.
- If a command cannot be run because dependencies are missing, scripts are absent, or the environment is limited, report that clearly.
- Do not claim a command passed unless it was actually run and completed successfully.

### 7.  Create an AI work log
- After completing the implementation, create a work log file under .ai-log/.
- Use this filename format:
    ```Text
    .ai-log/ai-log-YYYYMMDD-HHMMSS.md
    ```
- Use local time unless the user specifies another timezone.
    Examples: 
    ```Text
    .ai-log/ai-log-20260526-103245.md
    .ai-log/ai-log-20260526-154012.md
    ```
- Use forward slash / in paths for cross-platform compatibility.
- If .ai-log/ does not exist, create it.
- The log file must be Markdown.
- The log file must not contain:
    - API keys
    - secrets
    - private credentials
    - full raw AI provider responses
    - sensitive user data
    - large pasted content from the user unless necessary
    - unrelated implementation notes
- The log file must include these sections:
    ```markdown
        # AI Work Log

        ## Objectives

        Describe what the user wanted to achieve.

        ## Plan

        Record the approved plan.

        ## Changed

        List the actual files changed and summarize what changed in each file.

        ## Result

        Summarize the final result, validation commands, and remaining notes.
    ```
- If validation was not run, write the reason clearly in Result.

### 8. Final response to the user
- After implementation and log creation, respond with a concise completion summary.
- The final response must include:
    - what was changed
    - files changed
    - validation result
    - path to the created AI log file
    - message commit git
    - any remaining risks or follow-up notes

### 9. Handling documentation-only tasks
- For documentation-only tasks, the process can be shorter, but still create an implementation plan and AI log.
- Documentation-only validation may be:
    ```Text
    Not run; documentation-only change.
    ```

## TypeScript rules

- Use TypeScript for all source code.
- Avoid any. The only acceptable use of any is for raw AI provider response parsing or unknown JSON boundaries, and it must include a short comment explaining why the type cannot be known safely.
- Do not use as any to escape type errors. Fix the type.
- Define props types or interfaces for every component. Place the props type directly above the component unless it is shared across files.
- Put shared types in `src/types/index.ts` or a module-specific file such as `src/types/writing.ts`.
- Prefer discriminated unions or explicit literal unions for domain values.

## React and Next.js rules

- Use Server Components by default only for static layouts and non-interactive components.
- Add "use client" at the top of files that use (useState, useEffect, event handlers, browser APIs such as localStorage, Redux hooks, useAI, form state, drag and drop)
- When reading from localStorage in client components, avoid hydration mismatch by using a hydrated state or equivalent pattern. Do not read browser-only values during server render.
- Use next/link for internal navigation. Do not use raw <a> for internal routes.
- Do not put heavy business logic inside src/app/**/page.tsx. Pages may orchestrate state and layout, but reusable logic should live in hooks, components, or library functions.

## State management rules

- Use Redux only for global cross-module state such as loading overlay and AI config.
- Use local component state for page-specific and component-specific UI state.
- Always import typed Redux hooks from ```Ts import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook"; ```
- Do not import useDispatch or useSelector directly from react-redux in app code.

## AI integration rules

- Always call AI through hook 
    ```Ts
    const { callAI, isHasKey } = useAI(); 
    ```
- Before calling AI, check isHasKey() and show a friendly Vietnamese message if the key is missing.
- Every AI call must use try/catch/finally.
- Every AI error shown to the user must be friendly Vietnamese text. Do not show raw technical errors to users.
- Use console.error() for technical debugging only. Do not log API keys or full sensitive payloads.
- Prompts should require JSON only, with no extra prose.
- When parsing AI response 
    ```Ts 
    const parsed = JSON.parse(response.data.text ?? "{}"); 
    ```
- Wrap parsing in try/catch.
- If AI returns an array or object embedded in text, extract with the existing pattern 
    ```Ts 
    const jsonText = content.slice(content.indexOf("["), content.lastIndexOf("]") + 1); 
    ```
- Use the object variant when parsing an object.
- System prompts should define (AI role, user level: Cơ bản, Trung cấp, or Chuyên nghiệp, output language: Vietnamese, strict JSON format)
- When generating writing or reading content, include recent history paragraphs, maximum 10 items, to reduce repeated content.

## LocalStorage rules

- All localStorage access must be centralized in `src/lib/localStorage.ts`.
- If new persisted data is needed:
    1. Add a key to LOCAL_STORAGE_KEY in src/consts/index.ts.
    2. Add typed getter and setter functions in src/lib/localStorage.ts.
    3. Guard every localStorage access with typeof window === "undefined".
    4. Return safe defaults when data is missing or invalid.
    5. Consider backward compatibility with existing local data.
    - Example pattern:
    ```Ts
    export const getMyFeature = (): MyType[] => {
    if (typeof window === "undefined") return [];

    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY.MY_FEATURE);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error(error);
        return [];
    }
    };
    ```
- Do not access localStorage directly in random components unless there is already an established pattern in that specific component and moving it would be outside the requested scope.

## UI and styling rules

- Use shadcn/ui primitives from `src/components/ui/`.
- Use Tailwind utility classes.
- Do not use inline styles except for dynamic values that cannot be represented with Tailwind utilities, such as dynamic progress width.
- Use `cn()` from `src/lib/utils.ts` for conditional className.
- Use CSS variable tokens such as (bg-primary, text-muted-foreground, bg-destructive, border-border,...)
- Do not hardcode colors such as #ffffff, red, or rgb(...) in components unless there is a strong reason and the user explicitly asks.
- Build mobile-first responsive layouts with Tailwind breakpoints such as `md:` and `lg:`.
- All interactive elements must be keyboard accessible. Prefer native buttons or shadcn components.
- Use lucide-react for icons.

## Dependency rules

- Do not add dependencies without explicit user approval.
- Before adding a dependency, first try to solve with:
    - existing Next.js APIs
    - existing React APIs
    - existing shadcn/ui components
    - existing Radix primitives
    - existing Tailwind utilities
    - existing project utilities
- If a dependency is truly necessary, explain:
    - why existing tools are insufficient
    - package name
    - expected bundle/runtime impact
    - security and maintenance risk
    - exact install command

## Accessibility rules

- Use semantic HTML.
- Buttons must be buttons, not clickable divs.
- Inputs must have labels or accessible names.
- Dialogs must use shadcn/Radix dialog primitives.
- Keyboard navigation must work for interactive controls.
- Do not remove focus outlines unless replacing them with accessible focus-visible styles.

## Error handling rules

- All user-facing errors must be in Vietnamese.
- Do not expose raw stack traces or raw provider errors in UI.
- For localStorage parsing errors, catch the error, log a technical error with `console.error`, and return a safe fallback.
- Display a friendly message for user such as: `Có lỗi xảy ra khi gọi AI, vui lòng thử lại.` and display detail message in `console.error`.

## Validation checklist

- After code changes, run the strongest available checks:
    ```Bash
    npm run lint
    npm run build
    ```
- If a test script exists:
    ```Bash
    npm test
    ```
- If a check fails, fix the issue and re-run it when practical.
- If a check cannot be run because of missing dependencies, environment limitations, or absent script, state that clearly in the final response.
- Manual validation should cover:
    - app loads
    - affected route renders
    - localStorage does not cause hydration mismatch
    - OPENAI and GEMINI paths are not broken when touched

## Git and commit rules

- Do not create branches unless the user asks.
- Do not commit changes unless the user asks.
- Do not amend existing commits unless the user asks.
- Before preparing a commit message, inspect staged diff first:
    ```Bash
    git diff --staged
    ```
- If no staged diff exists, inspect unstaged diff:
    ```Bash
    git diff
    ```
- Use Conventional Commits:
    ```Bash
    type(scope): short summary
    ```
    - **Allowed types:**
        - feat
        - fix
        - refactor
        - docs
        - test
        - style
        - chore
        - build
        - ci
        - perf
    - **Recommended scopes:**
        - vocabulary
        - writing
        - reading
        - grammar
        - ai
        - local storage
        - ui
        - settings
        - types
        - deps
    - **Commit message body should mention**:
        - what changed
        - why it changed
        - validation performed
    - **Never include API keys, secrets, raw prompts containing sensitive data, or large generated output in commit messages**

## Final response expectations or PR or File AI Log

- When summarizing work, include:
    1. What is the goal.
    2. What changed.
    3. Files touched.
    4. Validation run and result.
    5. Any remaining risks or follow-up notes.
- Do not claim validation passed if it was not run.

## Refactoring rules

- Refactor only when it directly supports the task or the user explicitly asks for refactoring.
- Keep behavior unchanged unless the user asks for behavior change.
- For risky refactors:
    1. Map current behavior.
    2. Identify public data shapes.
    3. Make small commits or small patch chunks.
    4. Run checks frequently.
    5. Avoid combining rename, logic change, and UI change in the same patch.
- Never refactor these without explicit reason:
    - `src/app/layout.tsx`
    - `src/components/ui/*`
    - `AI provider response extraction in useAI.ts`
    - `vocabulary level transition logic`
    - `localStorage key names`

## Recovery procedure for dangerous operations
- Before any operation that could delete data, rewrite history, clear localStorage, remove files, or migrate storage format, stop and confirm the intent with the user.
- For storage migrations, add backward-compatible read logic first. Do not erase old localStorage data unless the user explicitly asks.
- For file deletion, inspect references first with search.
- For broad rename, search the entire repo and update all references.
- For dependency changes, preserve lockfile consistency.
- If a destructive mistake occurs:
    1. Stop making more changes.
    2. Run git status --short.
    3. Identify modified/deleted files.
    4. Explain exactly what happened.
    5. Restore from Git if possible.
    6. Re-run validation after recovery.

## When unsure
- If requirements are ambiguous, ask a concise clarification before making structural changes.
- If the ambiguity is small and the safest default is obvious, proceed with the smallest reversible change and document the assumption.
- Do not invent backend behavior, hidden APIs, database schemas, authentication flows, or remote persistence.