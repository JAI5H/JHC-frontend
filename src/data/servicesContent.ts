export type ServiceContentSection = {
  bodyAr: string;
  bodyEn: string;
  titleAr: string;
  titleEn: string;
};

export type ServiceContent = {
  ctaAr: string;
  ctaEn: string;
  overviewAr: string;
  overviewEn: string;
  sectionsAr: Array<Pick<ServiceContentSection, "titleAr" | "bodyAr">>;
  sectionsEn: Array<Pick<ServiceContentSection, "titleEn" | "bodyEn">>;
  slug: string;
  subtitleAr: string;
  subtitleEn: string;
  titleAr: string;
  titleEn: string;
};

export const servicesContent: Record<string, ServiceContent> = {
  "operations-management": {
    slug: "operations-management",
    titleAr: "إدارة العمليات نيابة عن العميل",
    subtitleAr: "البديل الذكي لبناء أقسام داخلية مكلفة؛ نتولى إدارة وتطوير أقسامك بالكامل عن بُعد بأعلى كفاءة مؤسسية.",
    overviewAr:
      "بناء وإدارة الأقسام التشغيلية داخلياً يتطلب استنزافاً كبيراً للوقت والجهد ورأس المال، وهو ما قد يعيق التركيز على الأنشطة الأساسية المدرّة للأرباح. من خلال خدمة إدارة العمليات، نتحول إلى شريك تشغيلي حقيقي يتولى إدارة أقسام كاملة أو أجزاء حيوية من منشأتك عن بُعد من مصر. نحن لا نقوم بالعمل فحسب، بل نعيد هندسة الإجراءات وتطويرها لضمان استمرارية الأعمال وتحقيق المستهدفات المؤسسية بأقل تكلفة ممكنة وبأعلى معايير الحوكمة.",
    sectionsAr: [
      {
        titleAr: "إدارة قسم الموارد البشرية بالكامل",
        bodyAr: "من التوظيف والرواتب وحتى تقييم الأداء السنوي وقوانين العمل.",
      },
      {
        titleAr: "إدارة العمليات المالية والمحاسبية",
        bodyAr: "مسك الدفاتر، إعداد القوائم المالية، الميزانيات، والامتثال الضريبي.",
      },
      {
        titleAr: "إدارة مراكز خدمة العملاء والدعم",
        bodyAr: "تشغيل منظومة الدعم الفني وخدمة ما بعد البيع على مدار الساعة.",
      },
      {
        titleAr: "إدارة العمليات الإدارية وسلاسل الإمداد",
        bodyAr: "التنسيق الإداري الداخلي، إدارة المشتريات، والمتابعة مع الموردين.",
      },
    ],
    ctaAr: "انقل عملياتك لمستوى آخر من الكفاءة",
    titleEn: "Operations Management Outsourcing",
    subtitleEn: "The smart alternative to costly in-house departments. We fully manage and optimize your business operations remotely with elite efficiency.",
    overviewEn:
      "Building, staffing, and managing internal departments consumes critical resources that should be channeled into your core business strategy. Our Operations Management Outsourcing turning us into your reliable operational partner. We take full charge of entire departments or specialized business units, running them remotely from Egypt. Beyond execution, we actively re-engineer your workflows, streamline processes, and implement strict quality controls to guarantee continuous business growth at a fraction of the cost.",
    sectionsEn: [
      {
        titleEn: "End-to-End HR Operations",
        bodyEn: "Sourcing, payroll processing, performance management, and compliance.",
      },
      {
        titleEn: "Financial & Accounting Management",
        bodyEn: "Bookkeeping, financial statements, budgeting, and tax compliance support.",
      },
      {
        titleEn: "Customer Support & Success Operations",
        bodyEn: "Managing 24/7 helpdesks, ticketing systems, and post-sale customer care.",
      },
      {
        titleEn: "Back-Office & Administrative Workflows",
        bodyEn: "Procurement coordination, vendor management, and internal administrative alignment.",
      },
    ],
    ctaEn: "Optimize Your Operations Now",
  },
  "project-based-hiring": {
    slug: "project-based-hiring",
    titleAr: "التوظيف القائم على المشاريع",
    subtitleAr: "نوفر لك فرق عمل مؤهلة وكوادر متخصصة للمشاريع المؤقتة والمبادرات محددة المدة، دون التزامات التوظيف الدائم.",
    overviewAr:
      "المشاريع الكبرى والمبادرات الموسمية تتطلب أحياناً مضاعفة حجم العمالة بشكل مفاجئ وسريع، لكن التوظيف الدائم في هذه الحالات يمثل خطورة مالية وإدارية بعد انتهاء المشروع. تمنحك خدمة التوظيف القائم على المشاريع مرونة تشغيلية مطلقة؛ حيث نمد منشأتك بالخبرات المطلوبة فوراً لإنجاز مشروع محدد، قصيراً كان أو طويلاً، وبمجرد إغلاق المشروع تنتهي الالتزامات التعاقدية، مما يحمي ميزانيتك ويضمن رشاقتك المؤسسية.",
    sectionsAr: [
      {
        titleAr: "إطلاق مشاريع جديدة ومبادرات محددة المدة",
        bodyAr: "الحاجة لخبرات نوعية لتأسيس وإطلاق المشروع فقط.",
      },
      {
        titleAr: "المواسم والذروة التشغيلية",
        bodyAr: "مثل مواسم الفعاليات، أو فترات الإغلاق المالي، أو ضغط المشاريع الهندسية.",
      },
      {
        titleAr: "سد فجوات غياب الكفاءات الحالية",
        bodyAr: "تعويض فترات الإجازات الطويلة أو المهام الاستثنائية لمدراء المشاريع.",
      },
    ],
    ctaAr: "امنح مشاريعك المرونة والسرعة",
    titleEn: "Project-Based Staffing",
    subtitleEn: "Access qualified contract professionals and specialized temporary teams tailored for time-bound initiatives, completely free from permanent liabilities.",
    overviewEn:
      "Scaling up for a major project shouldn’t permanently inflate your long-term operational overhead. Our Project-Based Staffing solution gives organizations the operational elasticity required to rapidly deploy specialized talent exactly when and where a project demands it. Whether you are executing a short-term tech deployment, managing a seasonal surge, or launching a massive infrastructure initiative, we deliver ready-to-work experts on a contract basis. Once the project concludes, so do your liabilities—keeping your business lean, agile, and cost-efficient.",
    sectionsEn: [
      {
        titleEn: "Time-Bound Project Execution",
        bodyEn: "Deploying heavy-duty experts strictly for the design, rollout, or implementation phases of a project.",
      },
      {
        titleEn: "Seasonal & Peak Workloads",
        bodyEn: "Managing high-demand periods like financial year-ends, events, or abrupt spikes in construction/engineering milestones.",
      },
      {
        titleEn: "Interim Leadership & Skill Gaps",
        bodyEn: "Filling critical talent voids left by extended leaves or sudden executive departures.",
      },
    ],
    ctaEn: "Power Your Next Project",
  },
  recruitment: {
    slug: "recruitment",
    titleAr: "خدمات التوظيف الاحترافي",
    subtitleAr: "ندير منظومة التوظيف بالكامل من الأسواق المحلية والدولية لنضمن لك الكفاءة التي تطور عملك وتنسجم مع ثقافتك.",
    overviewAr:
      "نعلم أن قرار التوظيف الخاطئ يكلف المنشآت مبالغ طائلة ويؤثر سلباً على استقرار بيئة العمل. لذلك، لا نتعامل مع التوظيف كعملية إدارية روتينية لتعبئة الشواغر، بل نعتمد أسلوباً منهجياً صارماً يربط بين المهارات الفنية الفائقة للمرشح وبين السمات السلوكية والثقافية لمنشأتك. سواء كنت تبحث عن كفاءات نادرة في السوق السعودي المحلي، أو ترغب في استقطاب خبرات نوعية من الأسواق الدولية، نحن بوابتك الموثوقة للوصول إلى الصفوة.",
    sectionsAr: [
      {
        titleAr: "تحليل دقيق للاحتياج الوظيفي",
        bodyAr: "الجلوس مع إدارتك لفهم أبعاد الوظيفة، والمستهدفات، والسمات الشخصية المطلوبة.",
      },
      {
        titleAr: "البحث والاستقطاب الذكي",
        bodyAr: "تفعيل شبكة علاقاتنا الواسعة وقواعد البيانات المتقدمة للوصول للمرشحين (حتى غير الباحثين عن عمل بشكل نشط).",
      },
      {
        titleAr: "التقييم الفني والسلوكي الصارم",
        bodyAr: "إجراء مقابلات تصفية أولية واختبارات فنية متخصصة لاستبعاد غير المؤهلين.",
      },
      {
        titleAr: "تقديم القائمة المختصرة (Shortlist)",
        bodyAr: "نرسل لك أفضل 3 مرشحين تم فحصهم بالكامل، مع تقرير تقييمي شامل لكل مرشح لنسهل عليك القرار النهائي.",
      },
    ],
    ctaAr: "استقطب كفاءتك القادمة الآن",
    titleEn: "Professional Recruitment Services",
    subtitleEn: "Comprehensive recruitment solutions across local and international markets, delivering exceptional professionals tailored to your corporate culture.",
    overviewEn:
      "A bad hire costs more than just a salary; it disrupts team morale and derails project timelines. At our core, we treat recruitment as a precision science. We look beyond keywords on a resume to find high-caliber professionals whose expertise, leadership style, and cultural alignment match your business trajectory. Whether you need to source specialized professionals within the local Saudi market or headhunt top-tier experts globally, we have the methodology and reach to deliver the perfect match.",
    sectionsEn: [
      {
        titleEn: "Deep Needs Alignment",
        bodyEn: "Partnering with your team to understand the role's strategic impact, cultural requirements, and KPIs.",
      },
      {
        titleEn: "Executive Headhunting & Sourcing",
        bodyEn: "Utilizing extensive talent networks and modern sourcing tools to reach active and passive candidates.",
      },
      {
        titleEn: "Rigorous Technical & Behavioral Screening",
        bodyEn: "Conducting initial deep-dive interviews and competency assessments to filter out sub-par profiles.",
      },
      {
        titleEn: "Curated Shortlist Presentation",
        bodyEn: "Delivering the top 3 vetted candidates, complete with exhaustive evaluation reports to streamline your final decision.",
      },
    ],
    ctaEn: "Secure Your Next Core Hire",
  },
  "remote-workforce": {
    slug: "remote-workforce",
    titleAr: "حلول القوى العاملة عن بُعد",
    subtitleAr: "نوفر لك أفضل الكوادر المهنية المتخصصة من مصر لإدارة وتطوير عملياتك في دول الخليج، مع توفير تشغيلي يصل إلى 60%.",
    overviewAr:
      "في ظل التسارع الرقمي وتغير بيئات العمل، تمنحك هذه الخدمة القدرة على التوسع الاستراتيجي في دول مجلس التعاون الخليجي دون الحاجة إلى تحمل الأعباء المالية والقانونية الكاملة للتوظيف المحلي التقليدي. نحن لا نوفر لك مجرد موظفين عن بُعد، بل نتيح لك بنية تحتية تشغيلية متكاملة تضمن دمج هؤلاء الموظفين في منظومة عملك بسلاسة، مع الحفاظ على أعلى معايير الإنتاجية والجودة المطلوبة.",
    sectionsAr: [
      {
        titleAr: "الاستقطاب والاختيار الاحترافي",
        bodyAr: "البحث عن الكفاءات المطابقة بدقة للمواصفات الفنية وثقافة منشأتك.",
      },
      {
        titleAr: "التعيين والتهيئة التشغيلية",
        bodyAr: "إعداد الموظفين وتوفير البيئة التقنية اللازمة لبدء العمل فوراً.",
      },
      {
        titleAr: "المتابعة اليومية ومراقبة الأداء",
        bodyAr: "الإشراف المستمر لضمان الالتزام بساعات العمل والمستهدفات.",
      },
      {
        titleAr: "التقارير الدورية والحوكمة",
        bodyAr: "تزويدك بتقارير أداء منتظمة ومؤشرات قياس واضحة (KPIs).",
      },
    ],
    ctaAr: "ابنِ فريقك الرقمي الآن",
    titleEn: "Remote Workforce Solutions",
    subtitleEn: "Access top-tier professional talent from Egypt to power your Gulf operations, reducing operational costs by up to 60%.",
    overviewEn:
      "In today’s fast-paced digital economy, expanding your operational capacity shouldn't mean drowning in local overhead costs. Our Remote Workforce Solutions empower organizations across the GCC to build fully integrated, highly efficient teams without the logistical, legal, and financial burdens of traditional local recruitment. We bridge the talent gap by delivering reliable professionals and establishing a seamless operational infrastructure that aligns perfectly with your corporate culture and quality standards.",
    sectionsEn: [
      {
        titleEn: "Targeted Sourcing & Selection",
        bodyEn: "Finding specialized professionals who match both your technical criteria and corporate values.",
      },
      {
        titleEn: "Onboarding & Technical Readiness",
        bodyEn: "Setting up remote workspaces and ensuring day-one operational readiness.",
      },
      {
        titleEn: "Daily Supervision & Productivity Tracking",
        bodyEn: "Direct monitoring to ensure strict adherence to timelines and deliverables.",
      },
      {
        titleEn: "Performance Governance",
        bodyEn: "Providing data-driven periodic reports and transparent KPI tracking.",
      },
    ],
    ctaEn: "Build Your Remote Team Today",
  },
  "strategic-consulting": {
    slug: "strategic-consulting",
    titleAr: "الاستشارات الإدارية والاستراتيجية",
    subtitleAr: "حلول استشارية متعمقة لإعادة تصميم الهياكل التنظيمية، حوكمة العمليات، ورفع الميزة التنافسية لشركتك في السوق.",
    overviewAr:
      "النمو العشوائي أو الجمود التشغيلي هما أكبر مهدد لاستمرار الشركات وتوسعها. خدمة الاستشارات الإدارية والاستراتيجية مصممة لمساعدة القادة والملاك على رؤية منشآتهم بمنظور تحليلي خارجي ومحايد. نحن لا نقدم نصائح نظرية، بل ننزل معكم إلى أرض الواقع لتشخيص الخلل في الهياكل التنظيمية والإجراءات اليومية، ثم نصيغ استراتيجيات عملية قابلة للتطبيق تضمن رفع الكفاءة، تقليص الهدر، وتمهيد الطريق لنمو مستدام يتوافق مع رؤية السوق وأهدافكم الكبرى.",
    sectionsAr: [
      {
        titleAr: "تشخيص الواقع التشغيلي",
        bodyAr: "تحليل شامل للوضع الحالي لتحديد الفجوات ونقاط الاختناق الإداري والمالي.",
      },
      {
        titleAr: "إعادة الهيكلة وتصميم المنظمات",
        bodyAr: "تطوير الهياكل التنظيمية، وتحديد الصلاحيات والمصالح، وصياغة الأوصاف الوظيفية الدقيقة.",
      },
      {
        titleAr: "حوكمة وتطوير العمليات",
        bodyAr: "رسم مسارات تدفق العمل لمنع التداخل بين الإدارات ورفع سرعة اتخاذ القرار.",
      },
      {
        titleAr: "استراتيجيات النمو والتحول المؤسسي",
        bodyAr: "قيادة المنشأة خلال مراحل الانتقال الصعبة (مثل التوسع، الاندماج، أو التحول الرقمي) بأقل خسائر تشغيلية.",
      },
    ],
    ctaAr: "ابدأ رحلة التحول المؤسسي اليوم",
    titleEn: "Strategic & Management Consulting",
    subtitleEn: "In-depth management consulting to restructure organizational frameworks, govern workflows, and maximize your competitive edge.",
    overviewEn:
      "Operational stagnation and unmanaged growth are the silent killers of corporate value. Our Strategic & Management Consulting services are designed to give visionary leaders an objective, data-backed assessment of their organizational health. We move past high-level theories to roll up our sleeves and work directly within your business operations. By diagnosing structural bottlenecks, refining governance, and re-engineering legacy workflows, we build tailored strategic roadmaps that actively drive profitability, agility, and long-term market dominance.",
    sectionsEn: [
      {
        titleEn: "Operational Diagnostic Assessment",
        bodyEn: "Conducting comprehensive health checks to reveal hidden performance gaps, redundancies, and financial leaks.",
      },
      {
        titleEn: "Organizational Design & Restructuring",
        bodyEn: "Building scalable organizational charts, defining corporate matrixes, and drafting clear job architectures.",
      },
      {
        titleEn: "Workflow Governance & Optimization",
        bodyEn: "Mapping out seamless end-to-end business workflows to eliminate cross-departmental friction.",
      },
      {
        titleEn: "Change Management & Corporate Transformation",
        bodyEn: "Guiding organizations smoothly through highly critical transitions, expansions, or digital adoptions.",
      },
    ],
    ctaEn: "Shape Your Corporate Future",
  },
};
