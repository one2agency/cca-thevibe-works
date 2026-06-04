import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Гід з екзамену CCA-F — повний переклад українською',
  description: 'Повний переклад офіційного Exam Guide Claude Certified Architect Foundations: домени, task statements, приклади питань, вправи підготовки. Завантажити PDF.',
  alternates: { canonical: '/exam-guide' },
  openGraph: { url: 'https://cca.thevibe.works/exam-guide' },
};

export default function ExamGuidePage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: 'Claude Certified Architect Foundations — Гід з екзамену (переклад українською)',
    description: 'Повний переклад офіційного Exam Guide CCA-F: домени, task statements, приклади питань та рекомендації підготовки',
    inLanguage: 'uk',
    educationalLevel: 'professional',
    provider: { '@type': 'Organization', name: 'theVibe.works', url: 'https://thevibe.works' },
    url: 'https://cca.thevibe.works/exam-guide',
  };

  return (
    <div className="page-wrap">
      <Breadcrumb items={[{ name: 'Гід з екзамену', href: '/exam-guide' }]} />
      <JsonLd data={schema} />

      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
          <span className="tag">Офіційний документ</span>
          <span className="tag">Переклад українською</span>
        </div>
        <h1>Claude Certified Architect — Foundations<br />Гід з сертифікаційного екзамену</h1>
        <p>Повний переклад офіційного Exam Guide від Anthropic · Версія 0.1, лютий 2025</p>
      </div>

      {/* Download bar */}
      <div className="card" style={{ padding: '18px 24px', marginBottom: 36, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Завантажити оригінал (англійська)</div>
          <div style={{ fontSize: 14, color: 'var(--ink2)' }}>Офіційний PDF від Anthropic · 570 KB</div>
        </div>
        <a href="/cca-exam-guide-en.pdf" download className="btn accent" style={{ fontSize: 15 }}>
          ↓ Завантажити PDF
        </a>
      </div>

      <div className="prose">

        {/* ── ВСТУП ── */}
        <h2 id="vstup">Вступ</h2>
        <p>
          Сертифікація Claude Certified Architect — Foundations підтверджує, що практики здатні
          приймати обґрунтовані рішення щодо компромісів при реалізації реальних рішень з Claude.
          Іспит перевіряє базові знання у сферах Claude Code, Claude Agent SDK, Claude API та
          Model Context Protocol (MCP) — основних технологій для створення промислових застосунків
          з Claude.
        </p>
        <p>
          Питання іспиту базуються на реалістичних сценаріях із реальних кейсів клієнтів:
          побудова agentic-систем для клієнтської підтримки, проєктування multi-agent дослідницьких
          пайплайнів, інтеграція Claude Code у CI/CD воркфлоу, інструменти продуктивності розробників
          та витягнення структурованих даних із неструктурованих документів. Кандидати мають
          демонструвати не лише концептуальні знання, а й практичне судження щодо архітектури,
          конфігурації та компромісів у продакшен-розгортаннях.
        </p>
        <p>
          Цей гід описує зміст іспиту, перелічує домени та task statements, надає приклади питань
          і рекомендації щодо підготовки. Використовуйте його разом із практичним досвідом для
          ефективної підготовки.
        </p>

        {/* ── ЦІЛЬОВИЙ КАНДИДАТ ── */}
        <h2 id="kandydat">Опис цільового кандидата</h2>
        <p>
          Ідеальний кандидат для цієї сертифікації — solution architect, що проєктує та реалізує
          промислові застосунки з Claude. Цей кандидат має практичний досвід:
        </p>
        <ul>
          <li>Побудови agentic-застосунків за допомогою Claude Agent SDK, включно з multi-agent оркестрацією, делегуванням до субагентів, інтеграцією інструментів та lifecycle hooks</li>
          <li>Налаштування та кастомізації Claude Code для командних воркфлоу через файли CLAUDE.md, Agent Skills, інтеграції MCP-серверів та план-режим</li>
          <li>Проєктування інтерфейсів MCP-інструментів і ресурсів для інтеграції з бекенд-системами</li>
          <li>Конструювання промптів для отримання надійного структурованого виводу з використанням JSON-схем, few-shot прикладів та патернів витягнення</li>
          <li>Ефективного управління контекстними вікнами в довгих документах, multi-turn діалогах та multi-agent передачах</li>
          <li>Інтеграції Claude у CI/CD пайплайни для автоматизованого code review, генерації тестів та фідбеку на pull requests</li>
          <li>Прийняття правильних рішень щодо ескалації та надійності, включно з обробкою помилок, human-in-the-loop воркфлоу та патернами самооцінки</li>
        </ul>
        <p>
          Кандидат зазвичай має 6+ місяців практичного досвіду роботи з Claude API, Agent SDK,
          Claude Code та MCP, розуміючи як можливості, так і обмеження великих мовних моделей
          у промислових середовищах.
        </p>

        {/* ── ЗМІСТ ІСПИТУ ── */}
        <h2 id="zmist">Зміст іспиту</h2>

        <h3>Типи відповідей</h3>
        <p>
          Всі питання іспиту мають формат multiple choice. Кожне питання має одну правильну
          відповідь і три неправильні (distractors). Оберіть єдину відповідь, яка найкраще
          доповнює твердження або відповідає на питання. Distractors — це варіанти, які може
          обрати кандидат з неповними знаннями або досвідом. Питання без відповіді вважаються
          неправильними; штрафу за здогадку немає.
        </p>

        <h3>Результати іспиту</h3>
        <p>
          Іспит має позначення «склав» або «не склав». Іспит оцінюється відповідно до мінімального
          стандарту, встановленого профільними спеціалістами. Результати надаються у вигляді
          scaled score від 100 до 1000. <strong>Мінімальний прохідний бал — 720.</strong> Scaled
          scoring дозволяє порівнювати результати між різними версіями іспиту з різними рівнями
          складності.
        </p>

        {/* ── СТРУКТУРА ЗМІСТУ ── */}
        <h2 id="domeny">Структура змісту — домени та ваги</h2>
        <table>
          <thead>
            <tr><th>Домен</th><th>Тема</th><th>Вага</th></tr>
          </thead>
          <tbody>
            <tr><td>Домен 1</td><td>Agentic Architecture &amp; Orchestration</td><td><strong>27%</strong></td></tr>
            <tr><td>Домен 2</td><td>Tool Design &amp; MCP Integration</td><td><strong>18%</strong></td></tr>
            <tr><td>Домен 3</td><td>Claude Code Configuration &amp; Workflows</td><td><strong>20%</strong></td></tr>
            <tr><td>Домен 4</td><td>Prompt Engineering &amp; Structured Output</td><td><strong>20%</strong></td></tr>
            <tr><td>Домен 5</td><td>Context Management &amp; Reliability</td><td><strong>15%</strong></td></tr>
          </tbody>
        </table>

        {/* ── СЦЕНАРІЇ ── */}
        <h2 id="scenariyi">Сценарії іспиту</h2>
        <p>
          Іспит використовує питання на основі сценаріїв. Кожен сценарій представляє реалістичний
          виробничий контекст, що обрамляє набір питань. Під час іспиту випадково обирається
          4 сценарії з повного набору з 6.
        </p>

        <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Сценарій 1: Customer Support Resolution Agent</h3>
          <p style={{ margin: 0, color: 'var(--ink2)' }}>
            Ви будуєте агент клієнтської підтримки на Claude Agent SDK. Агент обробляє
            запити з високою неоднозначністю: повернення товарів, платіжні спори, питання акаунтів.
            Має доступ до бекенд-систем через кастомні MCP-інструменти (get_customer, lookup_order,
            process_refund, escalate_to_human). Ціль — 80%+ first-contact resolution із розумінням
            коли ескалювати.<br/>
            <em>Основні домени: D1, D2, D5</em>
          </p>
        </div>

        <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Сценарій 2: Code Generation with Claude Code</h3>
          <p style={{ margin: 0, color: 'var(--ink2)' }}>
            Ви використовуєте Claude Code для прискорення розробки ПЗ. Команда застосовує
            його для генерації коду, рефакторингу, дебагінгу та документування. Потрібна
            інтеграція у воркфлоу розробки з кастомними slash commands, CLAUDE.md конфігураціями
            та розумінням коли використовувати plan mode vs direct execution.<br/>
            <em>Основні домени: D3, D5</em>
          </p>
        </div>

        <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Сценарій 3: Multi-Agent Research System</h3>
          <p style={{ margin: 0, color: 'var(--ink2)' }}>
            Ви будуєте multi-agent дослідницьку систему на Claude Agent SDK. Coordinator-агент
            делегує спеціалізованим субагентам: один шукає в інтернеті, один аналізує документи,
            один синтезує знахідки, один генерує звіти. Система досліджує теми та продукує
            повні, цитовані звіти.<br/>
            <em>Основні домени: D1, D2, D5</em>
          </p>
        </div>

        <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Сценарій 4: Developer Productivity with Claude</h3>
          <p style={{ margin: 0, color: 'var(--ink2)' }}>
            Ви будуєте інструменти продуктивності розробників на Claude Agent SDK. Агент допомагає
            інженерам досліджувати незнайомі кодбейси, розбиратися з legacy-системами, генерувати
            boilerplate-код та автоматизувати рутинні задачі. Використовує вбудовані інструменти
            (Read, Write, Bash, Grep, Glob) та інтегрується з MCP-серверами.<br/>
            <em>Основні домени: D2, D3, D1</em>
          </p>
        </div>

        <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Сценарій 5: Claude Code for Continuous Integration</h3>
          <p style={{ margin: 0, color: 'var(--ink2)' }}>
            Ви інтегруєте Claude Code у CI/CD пайплайн. Система виконує автоматичні code review,
            генерує тест-кейси та надає фідбек на pull requests. Потрібно проєктувати промпти,
            що дають actionable фідбек і мінімізують false positives.<br/>
            <em>Основні домени: D3, D4</em>
          </p>
        </div>

        <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Сценарій 6: Structured Data Extraction</h3>
          <p style={{ margin: 0, color: 'var(--ink2)' }}>
            Ви будуєте систему витягнення структурованих даних на Claude. Система витягує
            інформацію з неструктурованих документів, валідує вивід через JSON-схеми та
            підтримує високу точність. Має акуратно обробляти edge cases та інтегруватись
            із downstream-системами.<br/>
            <em>Основні домени: D4, D5</em>
          </p>
        </div>

        {/* ── ДОМЕНИ ДЕТАЛЬНО ── */}
        <h2 id="domeny-detalno">Домени — детальний опис</h2>

        <h3>Домен 1: Agentic Architecture &amp; Orchestration (27%)</h3>
        <p><strong>Task 1.1: Проєктування та реалізація agentic loops</strong></p>
        <ul>
          <li>Lifecycle agentic loop: надсилання запитів до Claude, перевірка stop_reason («tool_use» vs «end_turn»), виконання інструментів і повернення результатів</li>
          <li>Результати інструментів додаються до conversation history для наступного міркування моделі</li>
          <li>Відмінність між model-driven (Claude міркує, який інструмент викликати) та pre-configured decision trees</li>
          <li><em>Навичка:</em> правильне завершення loop при «end_turn»; уникання anti-patterns (перевірка тексту відповіді, жорсткий ліміт ітерацій)</li>
        </ul>
        <p><strong>Task 1.2: Оркестрація multi-agent систем (coordinator-subagent)</strong></p>
        <ul>
          <li>Hub-and-spoke архітектура: coordinator управляє всією комунікацією між субагентами</li>
          <li>Субагенти мають ізольований контекст — вони не успадковують conversation history coordinator'а</li>
          <li>Роль coordinator у декомпозиції задач, делегуванні, агрегації результатів та динамічному виборі субагентів</li>
          <li><em>Навичка:</em> iterative refinement loop; маршрутизація через coordinator для спостережуваності</li>
        </ul>
        <p><strong>Task 1.3: Конфігурація виклику, передачі контексту та spawning субагентів</strong></p>
        <ul>
          <li>Інструмент Task як механізм spawning субагентів; allowedTools має включати «Task»</li>
          <li>Контекст субагента має бути наданий явно в промпті — субагенти не успадковують його автоматично</li>
          <li>Паралельний запуск: кілька Task-викликів в одній відповіді coordinator'а</li>
        </ul>
        <p><strong>Task 1.4: Multi-step workflows з enforcement та handoff патернами</strong></p>
        <ul>
          <li>Різниця між programmatic enforcement (hooks, prerequisite gates) та prompt-based guidance</li>
          <li>При обов'язковому дотриманні (напр. верифікація перед фінансовими операціями) — prompt-інструкції мають ненульовий рівень відказів</li>
          <li><em>Навичка:</em> programmatic prerequisites що блокують downstream tool calls; structured handoff summaries при ескалації</li>
        </ul>
        <p><strong>Task 1.5: Agent SDK hooks для перехоплення tool calls та нормалізації даних</strong></p>
        <ul>
          <li>PostToolUse hooks для перетворення результатів інструментів перед обробкою моделлю</li>
          <li>Hooks для перехоплення вихідних tool calls для дотримання compliance rules</li>
          <li><em>Навичка:</em> нормалізація форматів (Unix timestamps, ISO 8601); блокування операцій понад ліміт</li>
        </ul>
        <p><strong>Task 1.6: Стратегії декомпозиції задач</strong></p>
        <ul>
          <li>Коли використовувати fixed sequential pipelines (prompt chaining) vs dynamic adaptive decomposition</li>
          <li>Prompt chaining для передбачуваних multi-aspect reviews; dynamic decomposition для відкритих дослідницьких задач</li>
        </ul>
        <p><strong>Task 1.7: Управління станом сесії, відновлення та forking</strong></p>
        <ul>
          <li>Named session resumption через --resume &lt;session-name&gt;</li>
          <li>fork_session для незалежних гілок від спільного analysis baseline</li>
          <li>Важливість інформування агента про зміни файлів при відновленні сесій після модифікацій коду</li>
        </ul>

        <h3>Домен 2: Tool Design &amp; MCP Integration (18%)</h3>
        <p><strong>Task 2.1: Ефективні інтерфейси інструментів з чіткими описами</strong></p>
        <ul>
          <li>Описи інструментів — основний механізм вибору інструментів LLM; мінімальні описи → ненадійний вибір між схожими інструментами</li>
          <li>Важливість вказування форматів входу, прикладів запитів, edge cases та пояснень меж використання</li>
          <li><em>Навичка:</em> написання описів, що чітко відрізняють кожен інструмент; розбиття generic інструментів на purpose-specific</li>
        </ul>
        <p><strong>Task 2.2: Структуровані відповіді помилок для MCP-інструментів</strong></p>
        <ul>
          <li>Патерн isError прапора для комунікації збоїв інструментів агенту</li>
          <li>Різниця між transient, validation, business та permission errors</li>
          <li><em>Навичка:</em> повернення errorCategory, isRetryable boolean та людиночитного опису</li>
        </ul>
        <p><strong>Task 2.3: Розподіл інструментів та налаштування tool_choice</strong></p>
        <ul>
          <li>Занадто велика кількість інструментів (18 замість 4-5) деградує надійність вибору</li>
          <li>tool_choice: «auto», «any», forced tool selection</li>
        </ul>
        <p><strong>Task 2.4: Інтеграція MCP-серверів у Claude Code та agent workflows</strong></p>
        <ul>
          <li>Project-level (.mcp.json) для командного інструментарію vs user-level (~/.claude.json) для особистих серверів</li>
          <li>Environment variable expansion у .mcp.json для credential management без коміту секретів</li>
          <li>MCP resources для виставлення каталогів контенту — зменшення exploratory tool calls</li>
        </ul>
        <p><strong>Task 2.5: Вбудовані інструменти (Read, Write, Edit, Bash, Grep, Glob)</strong></p>
        <ul>
          <li>Grep — пошук за вмістом файлів; Glob — пошук файлів за патерном; Edit — точкова зміна за унікальним текстом</li>
          <li>Якщо Edit не знаходить унікальний якір → fallback Read + Write</li>
          <li>Інкрементальне вивчення кодбейсу: спершу Grep для точок входу, потім Read для трасування</li>
        </ul>

        <h3>Домен 3: Claude Code Configuration &amp; Workflows (20%)</h3>
        <p><strong>Task 3.1: CLAUDE.md — ієрархія, scope, модульна організація</strong></p>
        <ul>
          <li>Ієрархія: user-level (~/.claude/CLAUDE.md), project-level (.claude/CLAUDE.md або root), directory-level</li>
          <li>User-level налаштування не шеряться через version control</li>
          <li>@import синтаксис для референсів зовнішніх файлів; .claude/rules/ для topic-specific файлів правил</li>
          <li>/memory команда для перегляду завантажених memory-файлів та діагностики</li>
        </ul>
        <p><strong>Task 3.2: Custom slash commands та skills</strong></p>
        <ul>
          <li>.claude/commands/ (project-scoped, через VCS) vs ~/.claude/commands/ (user-scoped)</li>
          <li>Skills у .claude/skills/ з SKILL.md frontmatter: context: fork, allowed-tools, argument-hint</li>
          <li>context: fork для ізольованого виконання skill без забруднення основної сесії</li>
        </ul>
        <p><strong>Task 3.3: Path-specific rules для умовного завантаження конвенцій</strong></p>
        <ul>
          <li>.claude/rules/ файли з YAML frontmatter paths полем та glob patterns для умовної активації</li>
          <li>Правила завантажуються лише при редагуванні файлів, що відповідають патернам</li>
          <li>Перевага перед directory-level CLAUDE.md для конвенцій, що охоплюють кілька директорій (напр. тест-файли)</li>
        </ul>
        <p><strong>Task 3.4: Plan mode vs direct execution</strong></p>
        <ul>
          <li>Plan mode: масштабні зміни, кілька валідних підходів, архітектурні рішення, multi-file модифікації</li>
          <li>Direct execution: прості, добре обмежені зміни (single-file bug fix із чітким stack trace)</li>
          <li>Explore subagent для ізоляції verbose discovery та повернення підсумків</li>
        </ul>
        <p><strong>Task 3.5: Iterative refinement для прогресивного покращення</strong></p>
        <ul>
          <li>Конкретні input/output приклади — найефективніший спосіб передати очікувані трансформації</li>
          <li>Test-driven ітерація: спочатку тести, потім ітерації через шерінг падінь</li>
          <li>Interview pattern: Claude ставить питання, що виявляють невраховані аспекти перед реалізацією</li>
        </ul>
        <p><strong>Task 3.6: Інтеграція Claude Code у CI/CD пайплайни</strong></p>
        <ul>
          <li>Прапорець -p (--print) для non-interactive режиму в автоматизованих пайплайнах</li>
          <li>--output-format json та --json-schema для машиночитного виводу</li>
          <li>Session context isolation: той самий інстанс, що генерував код, гірше його переглядає</li>
        </ul>

        <h3>Домен 4: Prompt Engineering &amp; Structured Output (20%)</h3>
        <p><strong>Task 4.1: Явні критерії для підвищення точності та зниження false positives</strong></p>
        <ul>
          <li>Явні критерії замість розмитих інструкцій («флагати лише коли заявлена поведінка суперечить реальній»)</li>
          <li>«Будь консервативним» / «лише high-confidence» не підвищують precision — потрібні категоріальні критерії</li>
          <li>Тимчасове вимкнення категорій з високим FP для відновлення довіри</li>
        </ul>
        <p><strong>Task 4.2: Few-shot prompting для консистентності та якості</strong></p>
        <ul>
          <li>Few-shot приклади — найефективніша техніка для консистентного формату виводу, коли інструкцій недостатньо</li>
          <li>Приклади дозволяють моделі узагальнювати судження на нові патерни, а не лише матчити заздалегідь задані</li>
        </ul>
        <p><strong>Task 4.3: Структурований вивід через tool use та JSON-схеми</strong></p>
        <ul>
          <li>tool_use з JSON-схемами — найнадійніший підхід для schema-compliant виводу без JSON-синтаксичних помилок</li>
          <li>tool_choice: «auto», «any», forced tool selection — різниця та застосування</li>
          <li>Optional/nullable поля замість required для полів, яких може не бути в джерелі</li>
          <li>Enum + «other» + detail string для розширюваних категорій; «unclear» для неоднозначних</li>
        </ul>
        <p><strong>Task 4.4: Валідація, retry та feedback loops</strong></p>
        <ul>
          <li>Retry з помилками: follow-up запит включає оригінальний документ, провалену екстракцію і конкретні помилки</li>
          <li>Retry неефективний, коли інформація відсутня в джерелі (на відміну від format/structural помилок)</li>
        </ul>
        <p><strong>Task 4.5: Batch processing</strong></p>
        <ul>
          <li>Message Batches API: 50% економія, до 24 год обробки, без multi-turn tool calling</li>
          <li>custom_id для кореляції пар запит/відповідь; обробка збоїв по custom_id</li>
          <li>Відповідність API для воркфлоу: sync для блокуючих pre-merge checks, batch для нічних звітів</li>
        </ul>
        <p><strong>Task 4.6: Multi-instance та multi-pass review архітектури</strong></p>
        <ul>
          <li>Self-review обмеження: модель зберігає reasoning-контекст генерації і менш схильна сумніватись</li>
          <li>Незалежний review-інстанс ефективніший за self-review інструкції або extended thinking</li>
        </ul>

        <h3>Домен 5: Context Management &amp; Reliability (15%)</h3>
        <p><strong>Task 5.1: Управління conversation context для збереження критичної інформації</strong></p>
        <ul>
          <li>Ризики progressive summarization: числа, відсотки, дати у розмитих формулюваннях</li>
          <li>«Lost in the middle» ефект: моделі надійно обробляють початок і кінець, але можуть пропустити середину</li>
          <li>Витягнення транзакційних фактів у persistent «case facts» блок поза сумаризованою історією</li>
          <li>Обрізання verbose tool-виводів до релевантних полів до потрапляння в контекст</li>
        </ul>
        <p><strong>Task 5.2: Надійність, обробка помилок та людський нагляд</strong></p>
        <ul>
          <li>Structured error propagation: тип збою, спробований запит, partial results та альтернативи</li>
          <li>Розрізнення access failure від валідного empty result</li>
          <li>Маршрутизація на human review при низькій confidence або неоднозначних джерелах</li>
          <li>Stratified random sampling high-confidence екстракцій для вимірювання реального error rate</li>
        </ul>

        {/* ── ПРИКЛАДИ ПИТАНЬ ── */}
        <h2 id="pryklady">Приклади питань (офіційні)</h2>
        <p>
          Наступні приклади ілюструють формат та рівень складності іспиту.
          Повний набір практичних питань — у{' '}
          <Link href="/trenazher">тренажері</Link>.
        </p>

        {[
          {
            n: 1, sc: 'Customer Support Resolution Agent',
            q: 'Дані продакшену показують: у 12% випадків агент пропускає get_customer і викликає lookup_order лише за іменем клієнта, що призводить до помилкової ідентифікації акаунтів. Яка зміна найефективніше вирішить цю проблему?',
            a: 'A', answer: 'Додати programmatic prerequisite, який блокує lookup_order і process_refund, доки get_customer не поверне верифікований customer ID.',
            ex: 'Коли критична бізнес-логіка вимагає певної послідовності, programmatic enforcement (hooks, prerequisite gates) дає детерміновані гарантії, яких prompt-підходи не можуть дати.',
          },
          {
            n: 2, sc: 'Customer Support Resolution Agent',
            q: 'Логи показують: агент часто викликає get_customer для запитів про замовлення замість lookup_order. Обидва інструменти мають мінімальні описи і приймають схожі формати ідентифікаторів. Який перший крок?',
            a: 'B', answer: 'Розширити опис кожного інструмента: формати входу, приклади запитів, edge cases і межі застосування відносно схожих інструментів.',
            ex: 'Описи інструментів — основний механізм вибору для LLM. За мінімальних описів моделі бракує контексту.',
          },
          {
            n: 4, sc: 'Code Generation with Claude Code',
            q: 'Ви хочете створити команду /review, що запускає чек-лист code review команди і має бути доступна кожному розробнику після clone. Де створити файл команди?',
            a: 'A', answer: 'У директорії .claude/commands/ у репозиторії проєкту.',
            ex: 'Project-scoped slash-команди зберігаються у .claude/commands/ — версіонуються та доступні всім після clone/pull.',
          },
          {
            n: 5, sc: 'Code Generation with Claude Code',
            q: 'Вам доручили реструктуризувати моноліт у мікросервіси: зміни в десятках файлів, рішення про межі сервісів. Який підхід обрати?',
            a: 'A', answer: 'Увійти в plan mode: дослідити кодбазу, зрозуміти залежності й спроєктувати підхід до змін.',
            ex: 'Plan mode створений для масштабних змін із кількома валідними підходами та архітектурними рішеннями.',
          },
          {
            n: 6, sc: 'Code Generation with Claude Code',
            q: 'Кодбейс має різні конвенції по зонах. Тест-файли розкидані по всьому проєкту. Потрібно щоб Claude автоматично застосовував правильні конвенції при генерації. Найбільш підтримуваний підхід?',
            a: 'A', answer: 'Створити файли правил у .claude/rules/ з YAML frontmatter з glob-патернами для умовного завантаження конвенцій за шляхом файлу.',
            ex: '.claude/rules/ з glob patterns (напр. **/*.test.tsx) дозволяє застосовувати конвенції за шляхом файлу незалежно від директорії.',
          },
          {
            n: 7, sc: 'Multi-Agent Research System',
            q: 'Система досліджує тему, але звіти охоплюють лише візуальне мистецтво, пропускаючи музику і кіно. Логи coordinator\'а показують декомпозицію лише на візуальні підтеми. Причина?',
            a: 'B', answer: 'Декомпозиція задачі coordinator\'ом надто вузька — призначення субагентам не покривають усіх релевантних доменів теми.',
            ex: 'Субагенти коректно виконали призначені завдання — проблема в scope самої декомпозиції.',
          },
          {
            n: 10, sc: 'Claude Code for Continuous Integration',
            q: 'Pipeline-скрипт запускає claude "Analyze this PR..." але job висить — Claude Code чекає на інтерактивний ввід. Правильний підхід?',
            a: 'A', answer: 'Додати прапорець -p: claude -p "Analyze this PR for security issues"',
            ex: 'Прапорець -p (--print) — задокументований спосіб запуску Claude Code в non-interactive режимі.',
          },
          {
            n: 11, sc: 'Claude Code for Continuous Integration',
            q: 'Два воркфлоу: (1) блокуючий pre-merge check, (2) нічний звіт по tech debt. Менеджер пропонує перевести обидва на Batches API. Як оцінити?',
            a: 'A', answer: 'Перевести на batch лише нічні звіти; для pre-merge checks — лишити real-time API.',
            ex: 'Batches API — до 24 год без гарантій latency. Не підходить для блокуючих воркфлоу; ідеально для нічних звітів.',
          },
          {
            n: 12, sc: 'Claude Code for Continuous Integration',
            q: 'Single-pass review 14 файлів PR дає непослідовні результати: детальний фідбек для одних файлів, поверховий для інших, суперечливі знахідки. Як перебудувати?',
            a: 'A', answer: 'Розбити на фокусовані проходи: аналіз кожного файлу окремо на локальні проблеми, потім окремий integration-прохід по крос-файлових потоках даних.',
            ex: 'Корінь проблеми — attention dilution при обробці багатьох файлів разом. Розбиття дає рівну глибину.',
          },
        ].map(item => (
          <div key={item.n} className="card q-static" style={{ marginBottom: 16 }}>
            <div className="qmeta" style={{ marginBottom: 10 }}>
              <span className="tag">Питання {item.n}</span>
              <span className="tag">{item.sc}</span>
            </div>
            <h3 className="q-text">{item.q}</h3>
            <div className={`opt correct`} style={{ marginBottom: 8 }}>
              <span className="k">{item.a}</span>
              <span>{item.answer}</span>
            </div>
            <div className="q-ex"><strong>Пояснення:</strong> {item.ex}</div>
          </div>
        ))}

        {/* ── ВПРАВИ ── */}
        <h2 id="vpravy">Вправи підготовки</h2>

        <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Вправа 1: Multi-Tool Agent з логікою ескалації</h3>
          <p><em>Закріплює: D1, D2, D5</em></p>
          <ol>
            <li>Визначте 3-4 MCP-інструменти з детальними описами, що чітко розрізняють кожен. Включіть мінімум два схожих інструменти, що потребують ретельних описів.</li>
            <li>Реалізуйте agentic loop із перевіркою stop_reason. Правильно обробляйте «tool_use» та «end_turn».</li>
            <li>Додайте структуровані відповіді помилок: errorCategory, isRetryable, опис. Переконайтесь, що агент коректно реагує на кожен тип.</li>
            <li>Реалізуйте programmatic hook що перехоплює tool calls та примусово виконує бізнес-правило (напр. блокування операцій понад ліміт).</li>
            <li>Протестуйте multi-concern повідомлення та перевірте декомпозицію і синтез єдиної відповіді.</li>
          </ol>
        </div>

        <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Вправа 2: Конфігурація Claude Code для командного воркфлоу</h3>
          <p><em>Закріплює: D3, D2</em></p>
          <ol>
            <li>Створіть project-level CLAUDE.md з універсальними стандартами кодування. Перевірте узгоджене застосування для всіх членів команди.</li>
            <li>Створіть .claude/rules/ файли з YAML frontmatter glob patterns для різних зон коду. Перевірте, що правила завантажуються лише при редагуванні відповідних файлів.</li>
            <li>Створіть project-scoped skill у .claude/skills/ з context: fork та allowed-tools обмеженнями.</li>
            <li>Налаштуйте MCP-сервер у .mcp.json з environment variable expansion. Додайте особистий сервер у ~/.claude.json та перевірте доступність обох.</li>
            <li>Протестуйте plan mode vs direct execution для задач різної складності.</li>
          </ol>
        </div>

        <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Вправа 3: Pipeline витягнення структурованих даних</h3>
          <p><em>Закріплює: D4, D5</em></p>
          <ol>
            <li>Визначте extraction tool з JSON-схемою: required та optional поля, enum + «other» + detail pattern, nullable поля.</li>
            <li>Реалізуйте validation-retry loop: при збої надсилайте follow-up із документом, провалою екстракцією та конкретними помилками.</li>
            <li>Додайте few-shot приклади з документами різних форматів (inline-цитати vs бібліографії, наратив vs таблиці).</li>
            <li>Спроєктуйте batch processing стратегію: 100 документів через Message Batches API, обробка збоїв по custom_id, rechunking завеликих документів.</li>
            <li>Реалізуйте маршрутизацію на human review: field-level confidence scores, routing low-confidence на перегляд, аналіз точності по типу документа.</li>
          </ol>
        </div>

        <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Вправа 4: Multi-Agent Research Pipeline</h3>
          <p><em>Закріплює: D1, D2, D5</em></p>
          <ol>
            <li>Побудуйте coordinator-агент із мінімум двома субагентами. Переконайтесь, що allowedTools включає «Task» і кожен субагент отримує знахідки явно в промпті.</li>
            <li>Реалізуйте паралельний запуск субагентів кількома Task-викликами в одній відповіді. Виміряйте покращення latency.</li>
            <li>Спроєктуйте структурований вивід субагентів: claim, evidence excerpt, source URL, publication date.</li>
            <li>Реалізуйте error propagation: симулюйте timeout субагента і перевірте структурований error-контекст (тип збою, спробований запит, partial results).</li>
            <li>Протестуйте конфліктні дані з двох авторитетних джерел — перевірте збереження обох значень із атрибуцією.</li>
          </ol>
        </div>

        {/* ── ТЕХНОЛОГІЇ ── */}
        <h2 id="tehnolohiyi">Технології та концепції</h2>
        <ul>
          <li><strong>Claude Agent SDK:</strong> AgentDefinition, agentic loops, stop_reason handling, hooks (PostToolUse), spawning субагентів через Task, allowedTools</li>
          <li><strong>Model Context Protocol (MCP):</strong> MCP servers/tools/resources, isError прапор, описи інструментів, .mcp.json конфігурація, environment variable expansion</li>
          <li><strong>Claude Code:</strong> CLAUDE.md ієрархія, .claude/rules/ з YAML frontmatter, .claude/commands/, .claude/skills/ з SKILL.md frontmatter (context: fork, allowed-tools, argument-hint), plan mode, /memory, /compact, --resume, fork_session, Explore subagent</li>
          <li><strong>Claude Code CLI:</strong> -p / --print прапорець, --output-format json, --json-schema</li>
          <li><strong>Claude API:</strong> tool_use з JSON-схемами, tool_choice («auto», «any», forced), stop_reason значення, system prompts</li>
          <li><strong>Message Batches API:</strong> 50% економія, до 24 год обробки, custom_id для кореляції, polling, без multi-turn tool calling</li>
          <li><strong>JSON Schema:</strong> required vs optional поля, enum типи, nullable поля, «other» + detail патерни</li>
          <li><strong>Built-in tools:</strong> Read, Write, Edit, Bash, Grep, Glob — цілі та критерії вибору</li>
          <li><strong>Few-shot prompting, Prompt chaining, Context window management, Session management, Confidence scoring</strong></li>
        </ul>

        {/* ── НЕ НА ІСПИТІ ── */}
        <h2 id="out-of-scope">Що НЕ перевіряється на іспиті</h2>
        <ul>
          <li>Fine-tuning або тренування кастомних моделей Claude</li>
          <li>Автентифікація, білінг або управління акаунтом API</li>
          <li>Розгортання або хостинг MCP-серверів (інфраструктура, networking)</li>
          <li>Внутрішня архітектура Claude або процес тренування</li>
          <li>Embedding моделі або деталі реалізації векторних баз даних</li>
          <li>Computer use (автоматизація браузера, взаємодія з десктопом)</li>
          <li>Vision/image analysis</li>
          <li>Streaming API або server-sent events</li>
          <li>Rate limiting, квоти або розрахунок вартості API</li>
          <li>OAuth, ротація API-ключів або деталі протоколів автентифікації</li>
          <li>Специфічні конфігурації хмарних провайдерів (AWS, GCP, Azure)</li>
          <li>Деталі реалізації prompt caching або алгоритми підрахунку токенів</li>
        </ul>

        {/* ── РЕКОМЕНДАЦІЇ ── */}
        <h2 id="pidgotovka">Рекомендації підготовки</h2>
        <ol>
          <li><strong>Побудуйте агент з Claude Agent SDK:</strong> повний agentic loop із tool calling, обробкою помилок та session management. Практикуйте spawning субагентів і передачу контексту.</li>
          <li><strong>Налаштуйте Claude Code для реального проєкту:</strong> CLAUDE.md ієрархія, path-specific rules у .claude/rules/, кастомні skills з frontmatter опціями, мінімум один MCP-сервер.</li>
          <li><strong>Спроєктуйте та протестуйте MCP-інструменти:</strong> описи, що чітко розрізняють схожі інструменти; structured error responses; тест надійності вибору на неоднозначних запитах.</li>
          <li><strong>Побудуйте pipeline витягнення даних:</strong> tool_use з JSON-схемами, validation-retry loops, optional/nullable поля, batch processing з Message Batches API.</li>
          <li><strong>Практикуйте prompt engineering:</strong> few-shot для неоднозначних сценаріїв, явні критерії для зниження false positives, multi-pass review для великих code review.</li>
          <li><strong>Вивчіть патерни управління контекстом:</strong> structured facts із verbose tool outputs, scratchpad файли, делегування субагентам для управління контекстними лімітами.</li>
          <li><strong>Розгляньте escalation та human-in-the-loop патерни:</strong> коли ескалювати (policy gaps, запити клієнтів) vs вирішувати автономно. Human review workflows із confidence-based routing.</li>
        </ol>

        <div style={{ marginTop: 40, padding: '20px 24px', background: 'var(--paper2)', borderRadius: 14, fontSize: 14, color: 'var(--ink2)' }}>
          <strong>Примітка:</strong> Це переклад офіційного Exam Guide від Anthropic (Version 0.1, лютий 2025).
          Оригінал позначений як «Confidential Need to Know (NTK)». Переклад надано виключно в навчальних цілях.
          Актуальна версія: <a href="/cca-exam-guide-en.pdf" download>завантажити оригінальний PDF</a>.
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/trenazher" className="btn accent">Запустити тренажер →</Link>
          <a href="/cca-exam-guide-en.pdf" download className="btn ghost">↓ Оригінал PDF (англ.)</a>
          <Link href="/domeny" className="btn ghost">Домени екзамену</Link>
        </div>
      </div>
    </div>
  );
}
