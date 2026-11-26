# Top Manage

## العربية

**Top Manage** برنامج صغير يضم أدوات تعمل دون اتصال بالإنترنت داخل المتصفح، وهي مخصصة لأعمال حزم الاختبار في الأنابيب.

افتح الملف `index.html` لتظهر الصفحة الرئيسية التي تضم الأدوات. ويمكن تبديل اللغة بين العربية والإنجليزية، وتبديل المظهر بين الداكن والفاتح، من الزرين في أعلى الصفحة. اللغة الافتراضية هي العربية.

يوجد في الصفحة الرئيسية زر «رفع ملفات البيانات» لرفع جداول إكسل مرة واحدة، فتأخذ كل أداة ما تحتاجه منها تلقائيًا. تُحفظ الملفات داخل المتصفح على الجهاز فقط، ويمكن عرضها أو استبدالها أو حذفها من «مدير البيانات». وما زال بإمكانك رفع ملف مختلف يدويًا داخل أي أداة.

### الأدوات

1. **منشئ مجموعات التحديد** (الملف `TP_selectionset_tool.html`): يحوّل قائمة الخطوط من ملف إكسل، وفيها عمودان هما رقم الخط ورقم حزمة الاختبار، إلى ملف مجموعات تحديد لبرنامج نافيسووركس، بحيث تكون لكل حزمة اختبار مجموعة تحديد مستقلة.
2. **متابع حزم الاختبار** (الملف `TP_monitor_tool_no_index.html`): ينشئ ملف متابعة لحزم الاختبار من ملفات تفريغ السبول وتفريغ اللحامات، ويحتاج إلى ملف فهرس الدوائر والخطوط الذي يحمّله المستخدم بنفسه.

### طريقة الاستخدام

1. نزّل جميع ملفات المستودع معًا في مجلد واحد (تعتمد الصفحات على الملفين `tm.css` و`tm.js`)، أو افتح الموقع على الإنترنت: https://baselgehad.github.io/top-manage/
2. افتح الملف `index.html` في متصفح كروم أو إيدج، ثم اختر الأداة.
3. اسحب ملفات إكسل إلى الأداة. لا يلزم تثبيت أي برنامج ولا اتصال بالإنترنت.

### الخصوصية

تعمل كل الأدوات داخل المتصفح على جهازك، ولا يُرفع أي ملف أو بيانات إلى أي جهة. ولا يحتوي هذا المستودع على أي بيانات مشروع.

---

## English

**Top Manage** is a small program of offline browser tools for piping test-pack work.

Open `index.html` for the home page with all the tools. Buttons at the top switch between Arabic and English and between Dark and Light themes. Arabic is the default.

The home page has an "Upload data files" button to load your Excel sheets once; each tool then takes what it needs automatically. Files are kept inside the browser on your device only, and you can list, replace or remove them in the Data manager. You can still upload a different file by hand inside any tool.

### Tools

1. **Selection Set Builder** (`TP_selectionset_tool.html`): converts an Excel line list (line number and test pack number columns) into a Navisworks selection-set XML, one selection set per test pack.
2. **Test Pack Monitor** (`TP_monitor_tool_no_index.html`): builds a test-pack monitor workbook from spool dump and weld dump files, using a circuit-to-ISO index file that you load yourself.

### How to use

1. Download all the repository files together in one folder (the pages rely on `tm.css` and `tm.js`), or open the site online: https://baselgehad.github.io/top-manage/
2. Open `index.html` in Chrome or Edge and pick a tool.
3. Drag your Excel files into the tool. No install and no internet needed.

### Privacy

Everything runs inside your browser on your own device. No file or data is uploaded anywhere. This repository contains only the tools, no project data.

> Note: stored data is shared between pages only when they are opened from the same address (for example the online site). Opening the files straight from disk may not share it; use the online site, or upload by hand inside each tool.
