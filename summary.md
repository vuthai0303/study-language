# Project Summary

## 1. Project Introduction

### What is this project?
This project is a web-based English learning application named **StudyLanguage**. It is built as a client-heavy Next.js application and focuses on helping users practice multiple English skills in a single interface.

### What is it used for?
The application is designed to support self-study for English learners. It combines manual learning activities, browser-based local persistence, and AI-powered content generation so users can practice English more interactively.

### Current features
The current project includes four main learning modules:

#### 1. Vocabulary learning
- Create and maintain a personal vocabulary list.
- Store vocabulary items in browser local storage.
- Review vocabulary through study modes.
- Practice with multiple-choice exercises.
- Practice with writing-based recall.
- Track vocabulary status such as to learn, learning, and mastered.

#### 2. Writing practice
- Select a writing topic and proficiency level.
- Generate Vietnamese source paragraphs with AI.
- Practice translating Vietnamese text into English.
- Reuse or store previously generated paragraphs in local history.
- Support both predefined topics and custom paragraph input flows.

#### 3. Grammar practice
- Select one or more grammar topics.
- Generate AI-powered multiple-choice grammar quizzes.
- Submit answers and view score results.
- Receive short Vietnamese explanations for correct answers.

#### 4. Reading practice
- Select a reading topic and proficiency level.
- Generate AI-powered English reading passages.
- Generate multiple-choice comprehension questions.
- Check answers and review explanations.
- Save reading history so newly generated content is less repetitive.

#### 5. AI settings management
- Configure AI provider, API key, and model in the UI.
- Support both OpenAI and Gemini providers.
- Store AI configuration in browser local storage.

#### 6. Shared application experience
- Global header and navigation.
- Shared loading overlay based on Redux state.
- Reusable UI components built with shadcn/ui and Radix UI.

---

## 2. Project Architecture

### Technology stack

#### Core language and framework
- **TypeScript** `^5`
- **React** `^19.0.0`
- **React DOM** `^19.0.0`
- **Next.js** `15.3.8`

#### State management
- **Redux Toolkit** `^2.9.0`
- **React Redux** `^9.2.0`

#### Form, validation, and input handling
- **react-hook-form** `^7.56.4`
- **@hookform/resolvers** `^5.0.1`
- **zod** `^3.25.17`
- **input-otp** `^1.4.2`

#### UI and styling
- **Tailwind CSS** `^4`
- **@tailwindcss/postcss** `^4`
- **shadcn/ui** `^0.0.4`
- **Radix UI**
  - **@radix-ui/react-dialog** `^1.1.14`
  - **@radix-ui/react-label** `^2.1.7`
  - **@radix-ui/react-scroll-area** `^1.2.10`
  - **@radix-ui/react-select** `^2.2.5`
  - **@radix-ui/react-slot** `^1.2.3`
  - **@radix-ui/react-tabs** `^1.1.12`
  - **@radix-ui/react-tooltip** `^1.2.7`
- **class-variance-authority** `^0.7.1`
- **clsx** `^2.1.1`
- **tailwind-merge** `^3.3.0`
- **tw-animate-css** `^1.3.0`
- **lucide-react** `^0.511.0`

#### Utilities and other libraries
- **axios** `^1.9.0`
- **uuid** `^11.1.0`
- **react-router-dom** `^7.6.0` *(installed in dependencies, although the current codebase mainly uses Next.js routing)*

#### Tooling and linting
- **eslint** `^9`
- **eslint-config-next** `15.3.2`
- **@eslint/eslintrc** `^3`
- **@types/node** `^20`
- **@types/react** `^19`
- **@types/react-dom** `^19`

### High-level architecture
This project uses the **Next.js App Router** structure. Most interactive pages are client components and rely on browser local storage plus direct calls to external AI APIs from the client side.

At a high level, the application is organized as follows:

#### `src/app`
This is the route layer of the application.

- `page.tsx`: landing page that introduces the available learning modules.
- `vocabulary/page.tsx`: vocabulary management and study page.
- `writing/page.tsx`: AI-assisted writing and translation practice.
- `grammar/page.tsx`: AI-generated grammar quiz page.
- `reading/page.tsx`: AI-generated reading practice page.
- `layout.tsx`: root layout, global metadata, providers, header, and loading overlay.
- `globals.css`: global styling.

This folder acts as the top-level entry point and connects pages with reusable components, hooks, constants, store logic, and local storage utilities.

#### `src/components`
This folder contains reusable UI building blocks and feature-specific components.

- `header.tsx`, `navigation.tsx`, `loading.tsx`: shared layout and feedback components.
- `settings/`: settings UI, especially AI key/provider/model configuration.
- `ui/`: shadcn/ui style primitive components such as button, card, dialog, input, tabs, table, tooltip, and select.
- `vocabulary/`: vocabulary list, study flows, and study-mode components.
- `writing/`: topic selection, translation practice, and writing-related layout components.
- `reading/`: topic selection and reading practice rendering.

This folder is consumed by route pages in `src/app` and helps separate UI concerns from page-level orchestration logic.

#### `src/hooks`
This folder contains reusable hooks.

- `useAI.ts`: wraps AI provider calls and normalizes responses from OpenAI and Gemini.
- `reduxHook.ts`: typed Redux hooks for dispatching actions and selecting state.

These hooks are used by pages and settings components to access shared behaviors.

#### `src/lib`
This folder contains utility and persistence logic.

- `localStorage.ts`: handles browser storage for AI configuration, vocabulary data, and generated history.
- `utils.ts`: shared utility helpers for UI and styling support.

This folder is an important bridge between feature components and browser persistence.

#### `src/store`
This folder contains Redux setup.

- `index.ts`: store configuration.
- `loadingSlice.ts`: global loading state.
- `provider.tsx`: Redux provider wrapper for the app.

This folder supports cross-page UI behavior, especially the loading overlay during async AI calls.

#### `src/consts`
This folder stores shared constants used across the app.

- Vocabulary labels and study labels.
- Default writing topics.
- Default reading topics.
- Local storage keys.
- Supported AI providers.

It centralizes reusable enumerations and default values used by pages, settings, and storage logic.

#### `src/types`
This folder defines shared TypeScript types for the entire application, including vocabulary, writing, AI response, and related domain models.

It provides type contracts used across pages, hooks, storage utilities, and components.

#### `public`
This folder contains static assets such as SVG files and the favicon.

---

## 3. Current Project Settings

### Application and runtime settings
- Project name: `study-language`
- App metadata title: **StudyLanguage**
- App metadata description: **Application to learn languages**
- Root HTML language: `en`
- Next.js config currently remains minimal with no custom runtime options defined.

### NPM scripts
- `npm run dev`: starts the development server with Turbopack.
- `npm run build`: builds the production bundle.
- `npm run start`: starts the production server.
- `npm run lint`: runs linting.

### TypeScript settings
Important TypeScript compiler settings currently in use:

- `target`: `ES2017`
- `lib`: `dom`, `dom.iterable`, `esnext`
- `strict`: `true`
- `noEmit`: `true`
- `module`: `esnext`
- `moduleResolution`: `bundler`
- `jsx`: `preserve`
- `incremental`: `true`
- Path alias: `@/*` maps to `./src/*`

These settings indicate a strict TypeScript setup aligned with modern Next.js development.

### ESLint settings
- Extends Next.js presets for **core-web-vitals** and **typescript**.
- Explicitly disables `@typescript-eslint/no-explicit-any`.

This means the project keeps Next.js linting standards while allowing `any` where needed.

### Styling settings
- Tailwind CSS v4 is enabled through PostCSS.
- PostCSS plugin in use: `@tailwindcss/postcss`.
- shadcn/ui configuration:
  - style: `new-york`
  - base color: `gray`
  - CSS entry: `src/app/globals.css`
  - CSS variables: enabled
  - icon library: `lucide`
  - aliases configured for components, utils, ui, lib, and hooks

### State management settings
- Redux store currently includes one slice: `isLoading`.
- The slice is used to show or hide a global loading overlay across the app.

### AI integration settings
The project currently supports two providers:

- `OPENAI`
- `GEMINI`

AI configuration is stored locally in the browser and includes:

- provider
- API key
- model

Default AI config values currently present in the code:

- default provider: `OPENAI`
- default model: `gpt-5.4-mini-2026-03-17`

The AI hook sends requests directly from the client to external provider APIs and then normalizes the returned content into a shared internal response format.

### Local storage settings
The application persists user data in browser local storage using the following keys:

- `vocabulary`
- `writing_history_paragraph`
- `reading_history_paragraph`
- `AI_CONFIG`

This means the current app works without a backend database and stores user progress locally on the browser.

### Content settings used by the learning modules

#### Writing topics
- Book / Novel
- Travel
- Technology
- Education
- Health
- Sports
- Work
- Self-introduction
- Interview
- Custom paragraph

#### Reading topics
- Book / Novel
- Travel
- Technology
- Education
- Health
- Sports
- Work

#### Vocabulary status options
- To learn
- Learning
- Mastered

#### Vocabulary study modes
- Multiple choice
- Writing

---

## Conclusion

StudyLanguage is a front-end focused English learning platform built with Next.js, React, TypeScript, Tailwind CSS, Redux Toolkit, and shadcn/ui. Its current architecture centers around four learning modules—vocabulary, writing, grammar, and reading—while using browser local storage and configurable AI providers to deliver a personalized study experience without requiring a backend service.
