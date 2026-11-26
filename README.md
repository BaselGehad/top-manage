# Top Manage

## العربية

**Top Manage** برنامج صغير يضم أدوات تعمل دون اتصال بالإنترنت داخل المتصفح، وهي مخصصة لأعمال حزم الاختبار في الأنابيب.

افتح الملف `index.html` لتظهر الصفحة الرئيسية التي تضم الأدوات. ويمكن تبديل اللغة بين العربية والإنجليزية من الزر في أعلى الصفحة، واللغة الافتراضية هي العربية.

### الأدوات

1. **منشئ مجموعات التحديد** (الملف `TP_selectionset_tool.html`): يحوّل قائمة الخطوط من ملف إكسل، وفيها عمودان هما رقم الخط ورقم حزمة الاختبار، إلى ملف مجموعات تحديد لبرنامج نافيسووركس، بحيث تكون لكل حزمة اختبار مجموعة تحديد مستقلة.
2. **متابع حزم الاختبار** (الملف `TP_monitor_tool_no_index.html`): ينشئ ملف متابعة لحزم الاختبار من ملفات تفريغ السبول وتفريغ اللحامات، ويحتاج إلى ملف فهرس الدوائر والخطوط الذي يحمّله المستخدم بنفسه.

### طريقة الاستخدام

1. نزّل ملفات المستودع، أو افتح الموقع على الإنترنت: https://baselgehad.github.io/top-manage/
2. افتح الملف `index.html` في متصفح كروم أو إيدج، ثم اختر الأداة.
3. اسحب ملفات إكسل إلى الأداة. لا يلزم تثبيت أي برنامج ولا اتصال بالإنترنت.

### الخصوصية

تعمل كل الأدوات داخل المتصفح على جهازك، ولا يُرفع أي ملف أو بيانات إلى أي جهة. ولا يحتوي هذا المستودع على أي بيانات مشروع.

---

## English

**Top Manage** is a small program of offline browser tools for piping test-pack work.

Open `index.html` for the home page with all the tools. A button at the top switches between Arabic and English. Arabic is the default.

### Tools

1. **Selection Set Builder** (`TP_selectionset_tool.html`): converts an Excel line list (line number and test pack number columns) into a Navisworks selection-set XML, one selection set per test pack.
2. **Test Pack Monitor** (`TP_monitor_tool_no_index.html`): builds a test-pack monitor workbook from spool dump and weld dump files, using a circuit-to-ISO index file that you load yourself.

### How to use

1. Download the repository files, or open the site online: https://baselgehad.github.io/top-manage/
2. Open `index.html` in Chrome or Edge and pick a tool.
3. Drag your Excel files into the tool. No install and no internet needed.

### Privacy

Everything runs inside your browser on your own device. No file or data is uploaded anywhere. This repository contains only the tools, no project data.
