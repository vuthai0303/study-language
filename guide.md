# StudyLanguage - AI Guide & Architecture Reference

> Tài liệu này mô tả kiến trúc hiện tại của StudyLanguage theo cách ngắn gọn, đồng nhất, và dễ scan cho AI.

---

## 1. Tổng Quan

StudyLanguage là ứng dụng học tiếng Anh chạy hoàn toàn ở phía trình duyệt bằng Next.js 15 App Router. Dữ liệu người dùng được lưu cục bộ bằng `localStorage`. Không có backend server, không có database, không có `app/api` route handlers. AI được gọi trực tiếp từ client qua OpenAI hoặc Google Gemini.

### Module chính

| Module | Route | Mục đích |
|---|---|---|
| Vocabulary | `/vocabulary` | CRUD từ vựng, Kanban 3 trạng thái, luyện tập multiple choice / writing / sentence (AI), import-export JSON, hệ thống level |
| Writing | `/writing` | AI sinh đoạn văn tiếng Việt, người dùng dịch từng câu sang tiếng Anh, AI chấm và gợi ý cải thiện |
| Grammar | `/grammar` | Người dùng chọn chủ đề ngữ pháp, AI sinh 10 câu trắc nghiệm kèm giải thích |
| Reading | `/reading` | AI sinh đoạn văn tiếng Anh và 5 câu hỏi đọc hiểu |

---

## 2. Tech Stack

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Framework | Next.js 15 (App Router) | Route nằm trong `src/app/` |
| Language | TypeScript 5 | Strict mode |
| Styling | Tailwind CSS 4 + `tw-animate-css` | Dùng CSS variables và OKLCH tokens |
| UI | shadcn/ui trên Radix UI | Primitive UI trong `src/components/ui/` |
| State | Redux Toolkit 2 + `react-redux` | Chỉ dùng cho AI config và loading overlay |
| Forms | react-hook-form 7 + Zod 3 | Dùng chủ yếu ở form vocabulary |
| Icons | lucide-react | |
| Persistence | Browser `localStorage` | Không dùng database |
| AI Providers | OpenAI API, Google Gemini API | Gọi trực tiếp từ client qua `useAI()` |
| Fonts | Geist Sans + Geist Mono | Qua `next/font` |
| ID | uuid v4 | Sinh `id` cho từ vựng mới |
| Package manager | npm | |

---

## 3. Kiến Trúc Folder

```text
src/
├── app/
│   ├── layout.tsx              # Root layout: StoreProvider + Header + LoadingOverlay
│   ├── page.tsx                # Trang chủ, danh sách module
│   ├── globals.css             # Global styles + theme tokens
│   ├── vocabulary/page.tsx     # Trang vocabulary
│   ├── writing/page.tsx        # Trang writing
│   ├── grammar/page.tsx        # Trang grammar
│   └── reading/page.tsx        # Trang reading
├── components/
│   ├── header.tsx              # Top navigation
│   ├── navigation.tsx          # Link active state
│   ├── loading.tsx             # Loading overlay
│   ├── ui/                     # shadcn/ui primitives
│   ├── vocabulary/
│   │   ├── vocabulary-table.tsx  # Kanban 3 trạng thái + import/export + edit/delete
│   │   ├── vocabulary-form.tsx   # Form thêm/sửa từ vựng
│   │   ├── vocabulary-study.tsx  # Điều phối bài luyện tập vocabulary
│   │   └── vocabulary-study/
│   │       ├── multi-choice.tsx  # Quiz trắc nghiệm vocabulary (hỗ trợ chiều Anh→Việt và Việt→Anh)
│   │       ├── writing.tsx       # Quiz viết vocabulary
│   │       └── sentence.tsx      # Quiz câu văn AI (MCQ hoặc fill-blank theo chiều)
│   ├── writing/
│   │   ├── topic-selector.tsx    # Chọn chủ đề + sinh đoạn văn
│   │   ├── translation-practice.tsx # Dịch từng câu + AI chấm + gợi ý + lưu vocab
│   │   └── sentence-layout.tsx   # Hiển thị từng câu trong paragraph
│   ├── reading/
│   │   ├── topic-selector.tsx    # Chọn chủ đề + sinh bài đọc
│   │   └── reading-practice.tsx  # Hiển thị bài đọc + câu hỏi
│   └── settings/
│       └── setting-ai-key-modal.tsx # Cấu hình AI provider/key/model
├── hooks/
│   ├── useAI.ts                # Gọi AI và parse response
│   ├── useTextToSpeech.ts      # Web Speech API
│   └── reduxHook.ts            # useAppDispatch, useAppSelector
├── store/
│   ├── index.ts                # configureStore
│   ├── aiConfigSlice.ts        # provider, key, model
│   ├── loadingSlice.ts         # loading overlay state
│   └── provider.tsx            # Redux Provider
├── lib/
│   ├── localStorage.ts         # Toàn bộ CRUD localStorage
│   └── utils.ts                # cn()
├── types/
│   ├── index.ts                # Types domain chung
│   └── writing.ts              # Types riêng cho writing
└── consts/
    └── index.ts                # Labels, defaults, localStorage keys, provider constants
```

---

## 4. Data Flow

### 4.1 AI Call Flow

```text
Page/Component
  -> useAI()
  -> đọc AI config từ Redux store
  -> kiểm tra config hợp lệ
  -> gọi OpenAI hoặc Gemini bằng fetch
  -> parse response về { text, provider, raw, token }
```

`useAI()` là điểm duy nhất dùng để gọi AI trong app. Hook này cũng sync config từ localStorage vào Redux khi mount.

### 4.2 Vocabulary Data Flow

```text
localStorage
  -> lib/localStorage.ts
  -> components vocabulary
```

Các thao tác chính:
- `getLocalVocabulary()`
- `addLocalVocabulary(...)`
- `updateLocalVocabulary(...)`
- `deleteLocalVocabulary(...)`
- `saveLocalVocabulary(...)`

### 4.3 AI Config Flow

```text
localStorage (AI_CONFIG)
  -> getLocalStoreAiKey()
  -> Redux aiConfigSlice
  -> useAI()
```

### 4.4 History Paragraph Flow

```text
writing_history_paragraph / reading_history_paragraph
  -> getLocalHistoryParagraph(isWriting)
  -> page/module state
  -> saveLocalHistoryParagraph(isWriting, list)
```

---

## 5. Domain Models

### Vocabulary

`VocabularyType`
- `id`
- `word`
- `type`
- `meaning`
- `status: "to_learn" | "learning" | "mastered"`
- `level`

### Writing

`Sentence`
- `id`
- `text`
- `translation`
- `feedback`
- `isCorrect`

`Feedback`
- `message`
- `vocabs`
- `scope`

### Reading

`ReadingPracticeType`
- `paragraph`
- `questions[]`

`Question`
- `label`
- `answers[]`
- `trueAnsswer`
- `explain`

### AI

`AiKeyType`
- `provider: "OPENAI" | "GEMINI"`
- `key`
- `model`

`CallAiResponse`
- `data`
- `isSuccess`
- `msg`

---

## 6. Business Logic

### 6.1 Vocabulary

#### Dữ liệu
- Từ vựng có hai trục: `status` và `level`.
- `status` gồm `to_learn`, `learning`, `mastered`.
- `level` biểu diễn mức độ thành thạo hiện tại.

#### CRUD
- Thêm mới từ form.
- Mặc định `status = to_learn`.
- `id` được sinh trong localStorage helper.
- Sửa có thể đổi cả `status`.
- Kéo thả sang cột khác sẽ đổi `status` và reset `level = 0`.
- Xóa loại bỏ mục khỏi localStorage ngay lập tức.

#### Import / Export
- Export xuất toàn bộ vocabulary dạng JSON.
- Import nhận JSON array.
- Chỉ thêm item hợp lệ và chưa trùng theo `word + type + meaning`.
- Item import mới được cấp `id` và `level` mới.

#### Chọn bài luyện tập
- `VocabularyStudy` tự load dữ liệu từ localStorage khi mount và khi refresh.
- Ba chế độ học:
  - `multiple_choice`: trắc nghiệm, không cần AI
  - `writing`: viết, không cần AI
  - `sentence`: câu văn AI, yêu cầu cấu hình AI
- Chiều luyện tập (chỉ áp dụng cho `multiple_choice` và `sentence`):
  - `en_to_vi`: hiển thị tiếng Anh, chọn nghĩa tiếng Việt — có voice và switch ẩn/hiện
  - `vi_to_en`: hiển thị nghĩa tiếng Việt, chọn/nhập từ tiếng Anh — luôn hiển, không có voice
- Điều kiện bắt đầu:
  - multiple choice: tối thiểu 4 từ
  - writing: tối thiểu 1 từ
  - sentence: tối thiểu 1 từ + phải có AI key

#### Chọn 10 từ
- Nếu `<= 10` từ, shuffle toàn bộ và dùng tất cả.
- Nếu `> 10` từ, ưu tiên từ level thấp hơn bằng weighted shuffle.
- Lấy:
  - 7 từ đầu
  - 3 từ cuối

#### Multiple Choice
- Hỗ trợ 2 chiều học:
  - `en_to_vi`: hiển từ tiếng Anh, chọn nghĩa tiếng Việt. Có voice (Web Speech API) và switch ẩn/hiện từ.
  - `vi_to_en`: hiển nghĩa tiếng Việt, chọn từ tiếng Anh. Luôn hiển, không có voice.
- Mỗi câu gồm 1 từ đúng + 3 đáp án sai.
- Đáp án sai ưu tiên lấy từ cùng pool vocabulary.
- Đúng: `level + 1`.
- Sai: `level - 2`.
- Nếu `level >= 10`:
  - tăng `status`
  - reset `level = 0`
- Nếu `level < 0` ở `learning` hoặc `mastered`:
  - hạ `status`
  - reset `level = 5`
- `level` không bao giờ âm.

#### Sentence (AI)
- Yêu cầu cấu hình AI (API Key).
- Random shuffle lấy tối đa 50 từ từ vocabulary list, gửi lên AI để tạo 10 câu hỏi.
- Hỗ trợ 2 chiều:
  - `en_to_vi`: hiển câu tiếng Anh (có voice + switch ẩn/hiện), chọn 1 trong 4 bản dịch tiếng Việt.
  - `vi_to_en`: hiển câu tiếng Việt (có voice tiếng anh + luôn hiển thị), nhập câu tiếng Anh vào input. Có gợi ý kí tự (reveal hình thức giống writing).
- Không cập nhật level/status của từ vựng sau khi trả lời.

#### Writing
- Mỗi câu yêu cầu nhập lại từ theo nghĩa tiếng Anh.
- Có reveal một phần ký tự để hỗ trợ.
- Đúng: `level + 2`.
- Sai: `level - 1`.
- Quy tắc tăng / giảm status khi vượt ngưỡng giống multiple choice.

#### Text-to-speech
- Vocabulary cards và quiz có thể phát âm từ bằng Web Speech API nếu trình duyệt hỗ trợ.

### 6.2 Writing

#### Chọn chủ đề
- Người dùng chọn topic từ danh sách mặc định.
- Chọn level trong 3 mức:
  - `Cơ bản`
  - `Trung cấp`
  - `Chuyên nghiệp`
- Có topic đặc biệt để tự nhập nội dung:
  - `id = "-1"`

#### Sinh đoạn văn
- Nếu topic có paragraph local thì có thể dùng lại.
- Nếu cần sinh mới:
  - kiểm tra API key
  - gọi `useAI()`
  - prompt yêu cầu AI sinh đoạn văn tiếng Việt theo topic và level
  - tránh lặp với history paragraph gần đây
- Sau khi tạo xong:
  - lưu paragraph vào history writing
  - mở phần luyện dịch từng câu

#### Luyện dịch
- Paragraph được tách thành từng câu.
- Người dùng dịch từng câu sang tiếng Anh.
- Khi kiểm tra:
  - AI trả JSON có `isCorrect`, `feedback`, `vocabs`, `scope`
  - `scope` là thang điểm 0 đến 10
  - `feedback` phải ngắn gọn, rõ ràng, bằng tiếng Việt
  - `vocabs` là danh sách từ liên quan để gợi ý thêm vào kho từ
- `isCorrect = true` khi bản dịch đạt scope tốt.
- `isCorrect = false` khi bản dịch chưa đạt.

#### Gợi ý dịch
- Có chế độ AI gợi ý bản dịch.
- Output vẫn là JSON, tập trung vào feedback và vocab liên quan.

#### Ghi nhớ từ
- Sau khi AI trả `vocabs`, người dùng có thể thêm từ vào vocabulary list.
- Nếu từ đã tồn tại, app không thêm lại mà chỉ hiển thị trạng thái hiện có.

#### History
- Paragraph mới được đưa vào `writing_history_paragraph`.
- Chỉ lưu tối đa 10 item gần nhất.

### 6.3 Grammar

#### Chọn chủ đề
- Người dùng chọn một hoặc nhiều chủ đề ngữ pháp từ danh sách tĩnh.
- Có thể chọn tất cả hoặc bỏ chọn tất cả.

#### Sinh quiz
- Khi bấm bắt đầu:
  - kiểm tra API key
  - gọi AI để sinh 10 câu hỏi trắc nghiệm
  - prompt yêu cầu JSON array בלבד, không thêm prose
- Mỗi câu hỏi gồm:
  - `question`
  - `options[4]`
  - `answer`
  - `feedback`

#### Parse kết quả
- App lấy JSON bằng cách cắt phần giữa `[` và `]`.
- Nếu parse lỗi:
  - báo lỗi thân thiện
  - không làm crash UI

#### Làm bài
- Người dùng chọn đáp án cho từng câu.
- Khi submit:
  - hiển thị đáp án đúng / sai
  - hiển thị feedback từng câu
  - tính điểm trên tổng số câu

### 6.4 Reading

#### Chọn chủ đề
- Người dùng chọn topic và level.
- Topic mặc định nằm trong `DEFAULT_READING_TOPIC`.

#### Sinh bài đọc
- Khi tạo bài:
  - kiểm tra API key
  - gọi AI để sinh đoạn văn tiếng Anh
  - đồng thời sinh 5 câu hỏi đọc hiểu
- Prompt yêu cầu JSON có:
  - `paragraph`
  - `questions[]`

#### Parse và lưu history
- Response được parse bằng `JSON.parse`.
- Paragraph mới được lưu vào `reading_history_paragraph`.
- Chỉ giữ tối đa 10 paragraph gần nhất.

#### Làm bài đọc
- Người dùng chọn đáp án cho từng câu hỏi.
- Khi bấm kiểm tra:
  - tính số câu đúng / sai
  - hiển thị tổng kết
- Khi completed:
  - khóa đáp án
  - hiển thị kết quả và giải thích đầy đủ

---

## 7. LocalStorage

Toàn bộ localStorage access đi qua `src/lib/localStorage.ts`.

### Keys hiện tại
- `VOCABULARY`
- `WRITING_HISTORY_PARAGRAPH`
- `READING_HISTORY_PARAGRAPH`
- `AI_CONFIG`

### Quy tắc
- Luôn guard `typeof window === "undefined"`.
- Luôn trả fallback an toàn nếu dữ liệu thiếu hoặc parse lỗi.
- Không truy cập localStorage trực tiếp trong component nếu không cần thiết.

---

## 8. AI Integration Notes

- Luôn gọi AI qua `useAI()`.
- `useAI()` hỗ trợ:
  - OpenAI chat completions
  - Gemini generateContent
- Response được normalize về `AIResponseType`.
- Nếu thiếu key hoặc config không hợp lệ, trả message thân thiện bằng tiếng Việt.
- Không log API key hoặc payload nhạy cảm.

---

## 9. Notes Cho Người Bảo Trì

- Không thêm backend route.
- Không thêm database.
- Không thêm state management library mới nếu không được yêu cầu rõ ràng.
- Không đổi architecture của persistence khỏi localStorage.
- Không chỉnh `src/components/ui/` trừ khi thật sự cần cập nhật primitive shadcn.

