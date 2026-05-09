# StudyLanguage – AI Guide & Architecture Reference

> **Dành cho AI:** Đây là tài liệu tham chiếu nhanh về kiến trúc, công nghệ và quy tắc code của dự án. Đọc toàn bộ file này trước khi hỗ trợ code bất kỳ tác vụ nào.

---

## 1. Tổng quan dự án

**StudyLanguage** là ứng dụng web hỗ trợ người dùng **học tiếng Anh**, được xây dựng trên Next.js 15 (App Router). Toàn bộ dữ liệu người dùng được lưu **cục bộ tại trình duyệt (localStorage)** – không có backend server, không có database từ xa. Tính năng AI được tích hợp trực tiếp từ phía client bằng cách gọi thẳng API của **OpenAI** hoặc **Google Gemini**.

### 4 module chính

| Module | Route | Mô tả |
|---|---|---|
| Học từ vựng | `/vocabulary` | CRUD từ vựng, Kanban 3 trạng thái, quiz trắc nghiệm / viết tay, import/export JSON |
| Học viết | `/writing` | AI sinh đoạn văn tiếng Việt, người dùng dịch từng câu sang tiếng Anh, AI chấm điểm & gợi ý |
| Học ngữ pháp | `/grammar` | Chọn chủ điểm ngữ pháp, AI sinh 10 câu trắc nghiệm, hiển thị kết quả & giải thích |
| Luyện đọc | `/reading` | AI sinh đoạn văn tiếng Anh + 5 câu hỏi reading comprehension, người dùng trả lời |

---

## 2. Tech Stack

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Framework | **Next.js 15** (App Router) | `npx next dev --turbopack` |
| Ngôn ngữ | **TypeScript 5** | Strict mode |
| Styling | **Tailwind CSS 4** + `tw-animate-css` | CSS variables với OKLCH color space |
| UI Components | **shadcn/ui** (Radix UI) | Tất cả primitive UI lấy từ `src/components/ui/` |
| State Management | **Redux Toolkit 2** + `react-redux` | 2 slice: `isLoading`, `AIConfig` |
| Forms | **react-hook-form 7** + **Zod 3** | Validation + schema |
| Icons | **lucide-react** | |
| Persistence | **Browser localStorage** | Không có backend/DB |
| AI Providers | **OpenAI API** (chat completions) và **Google Gemini API** | Gọi trực tiếp từ browser |
| Fonts | **Geist Sans** + **Geist Mono** (Google Fonts via next/font) | |
| ID Generation | **uuid v4** | |
| Package Manager | npm | |

---

## 3. Kiến trúc hệ thống

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout: StoreProvider + Header + LoadingOverlay
│   ├── page.tsx                # Trang chủ (danh sách module)
│   ├── globals.css             # CSS toàn cục + Tailwind theme tokens (OKLCH)
│   ├── vocabulary/page.tsx     # Trang học từ vựng
│   ├── writing/page.tsx        # Trang học viết (page-level state machine)
│   ├── reading/page.tsx        # Trang luyện đọc (page-level state machine)
│   └── grammar/page.tsx        # Trang học ngữ pháp
│
├── components/
│   ├── header.tsx              # Top navigation bar
│   ├── navigation.tsx          # Nav links (usePathname active state)
│   ├── loading.tsx             # Loading overlay toàn trang
│   ├── ui/                     # shadcn/ui primitives (không chỉnh sửa)
│   │   └── button, card, dialog, form, input, select, tabs, ...
│   ├── vocabulary/
│   │   ├── vocabulary-table.tsx    # Kanban 3 cột + drag-drop native + export/import
│   │   ├── vocabulary-form.tsx     # Form thêm/sửa từ vựng (react-hook-form + Zod)
│   │   ├── vocabulary-study.tsx    # Tabs chọn chế độ luyện
│   │   └── vocabulary-study/
│   │       ├── multi-choice.tsx    # Quiz trắc nghiệm
│   │       └── writing.tsx         # Quiz viết tay
│   ├── writing/
│   │   ├── topic-selector.tsx      # Chọn chủ đề + trình độ + nút tạo đoạn văn
│   │   ├── translation-practice.tsx # Dịch câu + AI chấm + gợi ý + lưu vocab
│   │   └── sentence-layout.tsx     # Hiển thị 1 câu trong đoạn văn
│   ├── reading/
│   │   ├── topic-selector.tsx      # Chọn chủ đề + trình độ luyện đọc
│   │   └── reading-practice.tsx    # Hiển thị đoạn văn + câu hỏi trắc nghiệm
│   └── settings/
│       └── setting-ai-key-modal.tsx # Modal cấu hình AI provider/key/model
│
├── hooks/
│   ├── useAI.ts                # Hook gọi AI (OpenAI / Gemini), parse response
│   └── reduxHook.ts            # useAppDispatch, useAppSelector (typed)
│
├── store/
│   ├── index.ts                # configureStore: { isLoading, AIConfig }
│   ├── aiConfigSlice.ts        # State: { provider, key, model }
│   ├── loadingSlice.ts         # State: { value: boolean }
│   └── provider.tsx            # <StoreProvider> bao root layout
│
├── lib/
│   ├── localStorage.ts         # Tất cả CRUD với localStorage (vocabulary, AI config, history)
│   └── utils.ts                # cn() (clsx + tailwind-merge)
│
├── types/
│   ├── index.ts                # VocabularyType, QuizQuestion, AiKeyType, AIResponseType, ...
│   └── writing.ts              # Feedback, Sentence
│
└── consts/
    └── index.ts                # TYPE_VOCAB_LABELS, STATUS_LABELS, LOCAL_STORAGE_KEY,
                                # DEFAULT_WRITING_TOPIC, DEFAULT_READING_TOPIC, PROVIDER_AI
```

---

## 4. Data Flow

### AI Call Flow

```
Page/Component
    │ gọi useAI() → callAI(prompt, systemPrompt?)
    │
    ▼
useAI (hooks/useAI.ts)
    ├── dispatch(setLoading(true))
    ├── Đọc AIConfig từ Redux store
    ├── if provider === 'OPENAI' → fetch openai.com/v1/chat/completions
    │   └── model: AIConfig.model
    ├── if provider === 'GEMINI' → fetch generativelanguage.googleapis.com
    │   └── model: AIConfig.model
    ├── Parse response: extractOpenAIChatCompletions() | extractGemini()
    │   └── Strip: ```, json, \n từ text response
    ├── Trả về: CallAiResponse { isSuccess, data: AIResponseType, msg }
    └── dispatch(setLoading(false))
```

### Vocabulary Data Flow

```
localStorage ←→ lib/localStorage.ts ←→ Components
    ├── getVocabulary()
    ├── addVocabulary(item: Omit<VocabularyType, "id"|"createdAt">)  ← tự sinh UUID
    ├── updateVocabulary(item: VocabularyType)
    └── deleteVocabulary(id: string)
```

### AI Config Flow

```
localStorage ←→ lib/localStorage.ts
    │ (getLocalStoreAiKey / setLocalStoreAiKey)
    ▼
Redux store (aiConfigSlice)
    │ setAIConfig(payload)
    ▼
useAI hook đọc state.AIConfig
```

---

## 5. Các kiểu dữ liệu quan trọng (`src/types/`)

```typescript
// Từ vựng
type VocabularyType = {
  id: string;          // UUID v4
  word: string;
  type: string;        // 'noun' | 'verb' | 'adjective' | 'adverb' | ...
  meaning: string;
  createdAt: string;   // ISO string
  status: "to_learn" | "learning" | "mastered";
};

// AI Config
type AiKeyType = {
  provider: "OPENAI" | "GEMINI";
  key: string;
  model: string;       // VD: "gpt-4o-mini", "gemini-flash-latest"
};

// Response từ useAI
type CallAiResponse = {
  data: AIResponseType | null;
  isSuccess: boolean;
  msg: string | null;
};
type AIResponseType = {
  text: string | null; // Đã được strip ``` json \n
  provider: "OPENAI" | "GEMINI" | "UNKNOWN";
  raw: any;
  token: number;
};

// Reading
type ReadingPracticeType = {
  paragraph: string;
  questions: Question[];
};
type Question = {
  label: string;
  answers: string[];
  trueAnsswer: number; // NOTE: typo có chủ ý trong codebase, KHÔNG sửa
  explain: string;
};

// Writing
type Feedback = {
  message: string;
  vocabs: { word: string; type: string; meaning: string }[];
  scope: number;       // 0-10
};
type Sentence = {
  id: number;
  text: string;        // Câu tiếng Việt gốc
  translation: string; // Bản dịch người dùng nhập
  feedback: Feedback | null;
  isCorrect: boolean | null;
};
```

---

## 6. Hằng số & LocalStorage Keys

```typescript
// src/consts/index.ts
LOCAL_STORAGE_KEY = {
  VOCABULARY: "vocabulary",
  WRITING_HISTORY_PARAGRAPH: "writing_history_paragraph",
  READING_HISTORY_PARAGRAPH: "reading_history_paragraph",
  AI_CONFIG: "AI_CONFIG",
};

PROVIDER_AI = { OPENAI: "OPENAI", GEMINI: "GEMINI" };
```

---

## 7. Quy tắc code (AI PHẢI tuân theo)

### 7.1 Kiến trúc & Tổ chức file

- **KHÔNG tạo backend route** – ứng dụng hoàn toàn client-side, không có `app/api/` route handlers.
- **KHÔNG dùng database** – mọi persistence phải qua `src/lib/localStorage.ts`. Nếu cần thêm key mới → thêm vào `LOCAL_STORAGE_KEY` trong `src/consts/index.ts` và thêm hàm tương ứng trong `localStorage.ts`.
- **Không để logic nghiệp vụ trong Page file** – Page chỉ chứa state management và orchestration. Logic gọi AI, xử lý dữ liệu phải tách vào hook hoặc component chuyên biệt.
- **Components theo module** – component thuộc module nào đặt trong `src/components/<module>/`.

### 7.2 TypeScript

- **Bắt buộc dùng TypeScript** – không dùng `any` trừ khi parse JSON response từ AI (trường hợp này cần comment rõ lý do).
- **Không dùng `as any` để escape lỗi** – phải fix đúng kiểu.
- **Định nghĩa interface/type riêng** cho props của mọi component. Đặt interface ngay trên component function.
- **Export type từ `src/types/`** – thêm type dùng chung vào `src/types/index.ts` hoặc file type theo module (VD: `writing.ts`).
- **Giữ nguyên typo `trueAnsswer`** trong `Question` type – đây là typo tồn tại trong codebase, thay đổi sẽ break parsing JSON từ AI.

### 7.3 React & Next.js

- **`"use client"`** – thêm directive ở đầu file nếu component dùng: state, effect, event handlers, browser APIs, Redux hooks, useAI.
- **Server Components** – chỉ dùng cho layout tĩnh và các component không cần interactivity (VD: `app/layout.tsx`, `app/page.tsx`).
- **Hydration** – khi đọc localStorage trong useEffect, phải dùng pattern `hydrated` state (xem `vocabulary/page.tsx`) để tránh hydration mismatch.
- **`next/link`** thay vì `<a>` cho internal routing.

### 7.4 State Management

- **Redux** chỉ dùng cho: global loading state (`isLoading`) và AI config (`AIConfig`).
- **State cục bộ** dùng `useState` trong component/page – không đưa mọi thứ vào Redux.
- **`useAppDispatch` và `useAppSelector`** từ `src/hooks/reduxHook.ts` – KHÔNG import trực tiếp từ `react-redux`.
- **`setLoading`** phải được dispatch khi bắt đầu/kết thúc mọi thao tác AI, đảm bảo Loading Overlay hiển thị đúng.

### 7.5 useAI Hook

- **KHÔNG gọi AI API trực tiếp** trong component hay page – luôn dùng `useAI()` hook từ `src/hooks/useAI.ts`.
- Hook `useAI` trả về `{ callAI, isHasKey }`:
  - `callAI(prompt, systemPrompt?)` → `Promise<CallAiResponse>`.
  - `isHasKey()` → kiểm tra config hợp lệ trước khi render nút hoặc gọi AI.
- **Kiểm tra `isHasKey()`** trước khi gọi AI, hiển thị thông báo yêu cầu cài đặt key nếu chưa có.
- **AI response là JSON**: dùng `JSON.parse(response.data.text)` – text đã được strip các ký tự thừa. Bọc trong try/catch.

### 7.6 UI & Styling

- **Dùng shadcn/ui components** từ `src/components/ui/` – không tự tạo các primitive UI cơ bản (button, input, dialog…).
- **Tailwind CSS utility classes** – không viết CSS inline ngoại trừ `style` cho dynamic giá trị không thể dùng utility (VD: `style={{ width: \`${progress}%\` }}`).
- **`cn()` từ `src/lib/utils.ts`** cho conditional className.
- **Responsive** – dùng breakpoints Tailwind (`md:`, `lg:`), layout mặc định mobile-first.
- **Màu sắc** – dùng CSS variable tokens (`bg-primary`, `text-muted-foreground`, `bg-destructive`…), không hardcode màu cụ thể.
- **Dark mode** – CSS variables đã có `.dark` class, không cần thêm logic riêng.

### 7.7 Vocabulary & Constants

- **Loại từ** (word type) phải lấy từ mảng `TYPE_VOCAB_LABELS` trong `src/consts/index.ts`, không hardcode string tùy ý.
- **Trạng thái từ vựng** chỉ có 3 giá trị: `"to_learn"` | `"learning"` | `"mastered"`.
- **Topic ID** phải là string số (`"0"`, `"1"`, `"-1"`). ID `-1` là "Đoạn văn tự điền" (writing).

### 7.8 Prompt Engineering cho AI

- Prompt luôn yêu cầu **trả về JSON**, không có text thừa.
- Kết hợp **history paragraph** (tối đa 10 mục) vào prompt để AI không lặp nội dung.
- **systemPrompt** cần chỉ rõ: trình độ người dùng (Cơ bản / Trung cấp / Chuyên nghiệp), vai trò AI, ngôn ngữ phản hồi (tiếng Việt).
- Khi AI trả về JSON array/object lồng trong text, dùng pattern `content.slice(content.indexOf('['), content.lastIndexOf(']') + 1)` để extract.

### 7.9 Error Handling

- Mọi lời gọi AI phải có `try/catch/finally` với `setLoading(false)` trong finally.
- Hiển thị lỗi thân thiện bằng **tiếng Việt** cho người dùng.
- `console.error()` để log lỗi kỹ thuật, không hiển thị raw error cho user.

### 7.10 Những thứ KHÔNG được làm

- ❌ Không cài thêm thư viện state management khác (Zustand, Jotai, …).
- ❌ Không dùng `axios` cho AI calls – dùng native `fetch`.
- ❌ Không tạo file `.env` hay lưu API key vào bất kỳ file nào – key phải nhập qua UI và lưu trong localStorage.
- ❌ Không xóa hoặc sửa các file trong `src/components/ui/` trừ khi cần thêm shadcn component mới.
- ❌ Không dùng `react-router-dom` cho routing – dùng Next.js App Router (`next/link`, `next/navigation`).
- ❌ Không tạo API route handlers trong `src/app/api/`.

---

## 8. Luồng phát triển tính năng mới

1. **Thêm type** vào `src/types/` nếu cần kiểu dữ liệu mới.
2. **Thêm constant** vào `src/consts/index.ts` nếu cần.
3. **Thêm localStorage function** vào `src/lib/localStorage.ts` và `LOCAL_STORAGE_KEY` nếu cần persist data.
4. **Tạo component** trong `src/components/<module>/`.
5. **Tạo/cập nhật Page** trong `src/app/<module>/page.tsx` – thêm `"use client"`.
6. **Thêm route** vào `src/components/navigation.tsx` nếu là module mới.
7. **Test** thủ công với cả hai provider (OPENAI, GEMINI).

---

## 9. Ví dụ pattern chuẩn

### Gọi AI đúng cách

```tsx
"use client";
import { useAI } from "@/hooks/useAI";
import { CallAiResponse } from "@/types";

export default function MyFeaturePage() {
  const { callAI, isHasKey } = useAI();

  const handleGenerate = async () => {
    if (!isHasKey()) {
      setError("Vui lòng cài đặt API key trong phần Cài đặt.");
      return;
    }
    try {
      const prompt = `... yêu cầu AI trả về JSON ...`;
      const response: CallAiResponse = await callAI(prompt);
      if (!response.isSuccess || !response.data) {
        setError(response.msg ?? "Có lỗi xảy ra.");
        return;
      }
      const parsed = JSON.parse(response.data.text ?? "{}");
      // xử lý parsed data...
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };
}
```

### Thêm localStorage key mới

```typescript
// src/consts/index.ts
export const LOCAL_STORAGE_KEY = {
  // ...existing keys...
  MY_NEW_FEATURE: "my_new_feature",
};

// src/lib/localStorage.ts
export const getMyNewFeature = (): MyType[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(LOCAL_STORAGE_KEY.MY_NEW_FEATURE);
  return data ? JSON.parse(data) : [];
};
export const saveMyNewFeature = (data: MyType[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY.MY_NEW_FEATURE, JSON.stringify(data));
};
```

---

## 10. Lệnh thường dùng

```bash
npm run dev      # Chạy dev server (Turbopack, port 3000)
npm run build    # Build production
npm run lint     # ESLint check
```
