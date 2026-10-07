export type ThemeMode = 'dark' | 'light';

export type AgeGroup = 'دانش‌آموزی' | 'دانشجویی' | 'حرفه‌ای‌ها';

export type CategoryType = 'skill' | 'charisma';

export interface Category {
  id: number;
  slug: string;
  title: string;
  desc: string;
  type: CategoryType;
  iconName: string;
}

export interface UserProfile {
  telegramId: number | string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  city: string;
  ageGroup: AgeGroup;
  isAcademyParticipant: boolean;
  photoUrl?: string;
  coins: number;
  stage: number; // 1, 2, 3
  comboMultiplier: number; // 1.0, 1.25, 1.5
  consecutiveVotes: number;
  suspensionUntil: number | null; // Timestamp
  totalVotesCast: number;
  totalNominated: number;
}

export interface Nomination {
  id: string;
  fullName: string;
  fatherName?: string;
  categorySlug: string;
  categoryTitle: string;
  referrerUserId: string;
  referrerName: string;
  promoteCount: number;
  demoteCount: number;
  skipCount: number;
  claimedByUserId?: string;
  createdAt: string;
  earnedCoins: number;
}

export interface PeerVote {
  id: string;
  voterUserId: string;
  nomineeId: string;
  voteType: 'promote' | 'demote' | 'skip';
  timestamp: number;
}

export interface MissionDefinition {
  id: number;
  stage: 1 | 2 | 3;
  title: string;
  subtitle: string;
  rewardCoins: number;
  description: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    type: 'text' | 'textarea' | 'select' | 'color-pair';
    options?: string[];
    minLength?: number;
    helpText?: string;
  }[];
}

export interface MissionProgress {
  status: 'locked' | 'active' | 'completed';
  data: Record<string, string>;
  completedAt?: string;
}

export interface MirrorEndorsement {
  categorySlug: string;
  categoryTitle: string;
  count: number;
}

export interface AppState {
  theme: ThemeMode;
  view: 'loading' | 'onboarding' | 'dashboard';
  onboardingStep: 1 | 2 | 3;
  activeTab: 'missions' | 'consensus' | 'leaderboard' | 'profile';
  user: UserProfile | null;
  missionsProgress: Record<number, MissionProgress>;
  nominations: Nomination[];
  peerVotes: Record<string, 'promote' | 'demote' | 'skip'>; // nomineeId -> vote
  webhookLogs: Array<{
    id: string;
    event: string;
    timestamp: string;
    data: Record<string, any>;
  }>;
  devBypassConsensusGate: boolean;
}

export const CATEGORIES: Category[] = [
  // ۱۲ مهارت تخصصی و عملیاتی
  { id: 1, slug: 'craftsman', title: 'دست‌به‌آچار و عیب‌یاب عملی', desc: 'مکانیک، تاسیسات، تعمیرات و راهکارهای فنی', type: 'skill', iconName: 'Wrench' },
  { id: 2, slug: 'it_code', title: 'دنیای کد و IT', desc: 'برنامه‌نویسی، هوش مصنوعی و حل باگ‌های نرم‌افزاری', type: 'skill', iconName: 'Code' },
  { id: 3, slug: 'engineering', title: 'مهندسی و ساخت', desc: 'معماری، عمران، طراحی صنعتی و نقشه‌کشی', type: 'skill', iconName: 'DraftingCompass' },
  { id: 4, slug: 'business', title: 'کسب‌وکار و معامله', desc: 'شم اقتصادی، فروش، بازاریابی و مذاکره تجاری', type: 'skill', iconName: 'TrendingUp' },
  { id: 5, slug: 'finance', title: 'حساب و کتاب و مالی', desc: 'امور مالیاتی، حسابداری و بودجه‌بندی دقیق', type: 'skill', iconName: 'Calculator' },
  { id: 6, slug: 'craft_art', title: 'دست‌سازه و هنر تجسمی', desc: 'نقاشی، خوشنویسی، صنایع دستی و دکوراسیون', type: 'skill', iconName: 'Palette' },
  { id: 7, slug: 'media_visual', title: 'رسانه و قاب تصویر', desc: 'عکاسی، تصویربرداری، تدوین و تولید محتوا', type: 'skill', iconName: 'Video' },
  { id: 8, slug: 'writing_oratory', title: 'کلام و قلم', desc: 'نویسندگی، شعر، ویرایش و انتقال رسا', type: 'skill', iconName: 'Feather' },
  { id: 9, slug: 'health_wellness', title: 'سلامت و تندرستی', desc: 'پزشکی، داروسازی، پرستاری، مشاوره سلامت و تغذیه', type: 'skill', iconName: 'HeartPulse' },
  { id: 10, slug: 'culinary', title: 'طعم و پذیرایی', desc: 'آشپزی خلاق، شیرینی‌پزی و میزبانی حرفه‌ای', type: 'skill', iconName: 'Utensils' },
  { id: 11, slug: 'organizer', title: 'سازمان‌دهنده و لجستیک', desc: 'هماهنگی رویدادها، انضباط اجرایی و اردوها', type: 'skill', iconName: 'CalendarCheck' },
  { id: 12, slug: 'creative_thinker', title: 'ایده‌پرداز و خلاق', desc: 'راهکارهای نوآورانه و حل بن‌بست‌های پیچیده', type: 'skill', iconName: 'Lightbulb' },

  // ۱۰ ویژگی کاریزما، امضای رفتاری و اخلاقی
  { id: 13, slug: 'style_icon', title: 'خوش‌پوش و آراسته', desc: 'پرستیژ ظاهری، شیک‌پوشی فاخر و وقار بصری', type: 'charisma', iconName: 'Sparkles' },
  { id: 14, slug: 'orator', title: 'سخنور و بیان نافذ', desc: 'کلام مسلط، فن بیان رسا و انتقال تأثیرگذار', type: 'charisma', iconName: 'Mic' },
  { id: 15, slug: 'charismatic_host', title: 'خوش‌صحبت و بزم‌آرا', desc: 'روایت‌گری شنیدنی، شوخ‌طبعی و گرمای جمع', type: 'charisma', iconName: 'Coffee' },
  { id: 16, slug: 'warm_welcomer', title: 'خوش‌برخورد و دل‌نشین', desc: 'لبخند همیشگی، پذیرش با مهر و آرامش‌بخشی', type: 'charisma', iconName: 'Smile' },
  { id: 17, slug: 'always_ontime', title: 'خوش‌قول و وقت‌شناس', desc: 'انضباط آهنین زمانی و تعهد قطعی در کلام', type: 'charisma', iconName: 'Clock' },
  { id: 18, slug: 'mood_booster', title: 'بمب انرژی و حال‌خوب‌کن', desc: 'تزریق انگیزه و نشاط و زداینده خستگی جمع', type: 'charisma', iconName: 'Zap' },
  { id: 19, slug: 'etiquette_grace', title: 'باکلاس و باوقار', desc: 'رعایت اتیکت والای اجتماعی و اخلاق فاخر', type: 'charisma', iconName: 'Crown' },
  { id: 20, slug: 'athlete', title: 'ورزشکار و نماد انگیزه', desc: 'آمادگی بدنی، روحیه پهلوانی و سبک زندگی سالم', type: 'charisma', iconName: 'Activity' },
  { id: 21, slug: 'musical_soul', title: 'اهل موسیقی و نوا', desc: 'نوازندگی، شناخت گوشه‌ها و حس لطیف هنری', type: 'charisma', iconName: 'Music' },
  { id: 22, slug: 'devout_dedicated', title: 'باایمان، متعهد و امین', desc: 'تقوای قلبی، امانت‌داری کامل و حضور خادمانه', type: 'charisma', iconName: 'ShieldCheck' }
];

export const MISSIONS_DATA: MissionDefinition[] = [
  {
    id: 1,
    stage: 1,
    title: 'کشف دارایی متمایز',
    subtitle: 'شناسایی نقطه عطف و ارزش غیرقابل مذاکره',
    rewardCoins: 20,
    description: '۳ فیلد زیر را تکمیل کنید و دارایی اصلی خود را معین فرمایید.',
    fields: [
      { key: 'work_ref', label: '۱. کار یا مهارتی که دیگران معمولاً برای آن به شما مراجعه می‌کنند:', placeholder: 'مثال: تعمیر ابزارها، طراحی پوستر، تنظیم قرارداد، حل اختلافات...', type: 'text', minLength: 3 },
      { key: 'real_pride', label: '۲. دستاورد یا افتخار واقعی شما (حتی کوچک اما اصیل):', placeholder: 'مثال: به سرانجام رساندن پروژه گروهی دانشگاه بدون تاخیر...', type: 'text', minLength: 3 },
      { key: 'core_value', label: '۳. ارزش اخلاقی غیرقابل‌مذاکره شما در زندگی:', placeholder: 'مثال: صداقت در بیان، خوش‌قولی در تحویل، احترام به زمان دیگران...', type: 'text', minLength: 3 },
      {
        key: 'primary_asset',
        label: 'دارایی اصلی متمایز شما از میان موارد بالا:',
        placeholder: 'یکی از موارد بالا را به عنوان مزیت اصلی خود برگزینید',
        type: 'select',
        options: ['مهارت تخصصی و مورد رجوع', 'دستاورد و تجربه اصیل', 'ارزش اخلاقی و انضباطی']
      }
    ]
  },
  {
    id: 2,
    stage: 1,
    title: 'ساخت بیانیه جایگاه شخصی',
    subtitle: 'قالب هویتی: کمک به چه کسی، چه نتیجه‌ای، با چه روشی',
    rewardCoins: 25,
    description: 'قالب روبرو را کامل کنید: «من به [مخاطب] کمک می‌کنم تا [نتیجه] را با [روش متمایز] رقم بزنند». حداقل ۱۰ کلمه.',
    fields: [
      { key: 'target_audience', label: 'مخاطب هدف شما کیست؟', placeholder: 'مثال: دانشجویان سال اول، کسب‌وکارهای نوپا، دانش‌آموزان کنکوری...', type: 'text', minLength: 3 },
      { key: 'outcome', label: 'چه نتیجه یا ارزشی برای آنها خلق می‌کنید؟', placeholder: 'مثال: مفاهیم پیچیده را سریع بفهمند و پروژه را با نمره الف تحویل دهند...', type: 'text', minLength: 5 },
      { key: 'unique_method', label: 'با چه روش یا ویژگی متمایزی؟', placeholder: 'مثال: از طریق نقشه‌های ذهنی و شبیه‌سازی کاربردی...', type: 'text', minLength: 5 }
    ]
  },
  {
    id: 3,
    stage: 1,
    title: 'ممیزی ردپای دیجیتال و بایو',
    subtitle: 'نگارش معرفی سه‌خطی حرفه‌ای بدون شکسته‌نفسی',
    rewardCoins: 30,
    description: 'متن معرفی کوتاه خود را به صورت حرفه‌ای بنویسید (حداقل ۴۰ کاراکتر) و یک لینک مرجع (گیت‌هاب، لینکدین، کانال یا پیج) ثبت کنید.',
    fields: [
      { key: 'bio_text', label: 'متن بایو و معرفی رسمی سه‌خطی:', placeholder: 'در سه خط خود، تخصص، پروژه‌های اثرگذار و زمینه همکاری دلخواهتان را شرح دهید...', type: 'textarea', minLength: 40 },
      { key: 'profile_link', label: 'لینک مرجع یا شناسه شبکه‌های اجتماعی/رزومه:', placeholder: 'مثال: https://linkedin.com/in/username یا @telegram_id', type: 'text', minLength: 4 }
    ]
  },
  {
    id: 4,
    stage: 2,
    title: 'کارت معرفی و هویت بصری',
    subtitle: 'تعیین پالت رنگی هویتی و شعار شخصی',
    rewardCoins: 35,
    description: 'دو رنگ نمادین که بازتاب‌دهنده شخصیت شما هستند را انتخاب کنید و شعار (تگ‌لاین) شخصی خود را ثبت نمایید.',
    fields: [
      { key: 'brand_colors', label: 'انتخاب ترکیب رنگی امضا:', placeholder: '', type: 'color-pair' },
      { key: 'tagline', label: 'شعار یا تگ‌لاین شخصی شما:', placeholder: 'مثال: تعهد به دقت، خلق با شوق | ساختن به جای مصرف کردن', type: 'text', minLength: 5 }
    ]
  },
  {
    id: 5,
    stage: 2,
    title: 'شاهد شایستگی (Micro-Proof)',
    subtitle: 'ثبت یک نمونه مسئله حل‌شده واقعی',
    rewardCoins: 35,
    description: 'یک چالش کاری، تحصیلی یا تیمی واقعی که شخصاً آن را حل کردید را مستند کنید.',
    fields: [
      { key: 'problem_desc', label: 'شرح صورت مسئله یا گره کار:', placeholder: 'مسئله چه بود و چه بن‌بستی وجود داشت؟', type: 'textarea', minLength: 15 },
      { key: 'solution_action', label: 'روش و راهکار اختصاصی شما برای حل مسئله:', placeholder: 'شما چه اقدامی انجام دادید و نتیجه چه شد؟', type: 'textarea', minLength: 15 }
    ]
  },
  {
    id: 6,
    stage: 2,
    title: 'ارائه آسانسوری ۳۰ ثانیه‌ای (Elevator Pitch)',
    subtitle: 'کیستم (۵ث) + چه‌کار می‌کنم (۱۵ث) + چشم‌انداز آینده (۱۰ث)',
    rewardCoins: 40,
    description: 'در قالبی فشرده و اثرگذار، ساختار سه گانه پیچ ۳۰ ثانیه‌ای خود را وارد نمایید.',
    fields: [
      { key: 'pitch_who', label: 'کیستم؟ (بخش اول - ۵ ثانیه):', placeholder: 'مثال: علی رضایی هستم، توسعه‌دهنده نرم‌افزار و تحلیل‌گر داده...', type: 'text', minLength: 6 },
      { key: 'pitch_what', label: 'چه‌کار می‌کنم؟ (بخش دوم - ۱۵ ثانیه):', placeholder: 'مثال: سیستم‌های خودکار پردازش اطلاعات برای تیم‌های دانشجویی می‌سازم تا وقتشان تلف نشود...', type: 'textarea', minLength: 20 },
      { key: 'pitch_future', label: 'چشم‌انداز آینده چیست؟ (بخش سوم - ۱۰ ثانیه):', placeholder: 'مثال: هدفم رساندن اولین محصول به مرحله صنعتی تا پایان تابستان است...', type: 'text', minLength: 10 }
    ]
  },
  {
    id: 7,
    stage: 2,
    title: 'شبیه‌سازی چشم‌انداز اثر',
    subtitle: 'توصیف خروجی اثر یا کارگاه شما در جامعه',
    rewardCoins: 35,
    description: 'بنویسید اثر، مهارت یا محصول شما چگونه می‌تواند زندگی حداقل یک گروه در جامعه را بهتر کند. (حداقل ۳۰ کلمه)',
    fields: [
      { key: 'impact_vision', label: 'متن چشم‌انداز اثرگذاری اجتماعی و تخصصی:', placeholder: 'شرح دهید اگر طرح یا مهارت شما توسعه پیدا کند، چه تغییر پایداری در محیط اطرافتان یا جامعه هدف رخ می‌دهد...', type: 'textarea', minLength: 60 }
    ]
  },
  {
    id: 8,
    stage: 3,
    title: 'طراحی پیام اصولی ارتباط کاری',
    subtitle: 'ارائه ارزش پیش از تقاضا (Outreach Message)',
    rewardCoins: 40,
    description: 'یک پیام ارتباطی اصولی برای همکاری با یک فرد سرشناس، استاد یا کارفرما تدوین کنید.',
    fields: [
      { key: 'recipient_title', label: 'مخاطب پیام (عنوان یا نقش):', placeholder: 'مثال: مدیر فنی شرکت دانش‌بنیان، دبیر انجمن علمی، استاد راهنما...', type: 'text', minLength: 4 },
      { key: 'offered_value', label: 'ارزش اولیه‌ای که شما پیشنهاد می‌دهید:', placeholder: 'مثال: بررسی رایگان باگ‌های رابط کاربری، ارائه گزارش خلاصه از داده‌ها...', type: 'textarea', minLength: 15 },
      { key: 'call_to_action', label: 'درخواست دقیق یا اقدام بعدی (CTA):', placeholder: 'مثال: هماهنگی یک جلسه تلفنی ۱۵ دقیقه‌ای در روزهای فرد...', type: 'text', minLength: 8 }
    ]
  },
  {
    id: 9,
    stage: 3,
    title: 'مطالعه موردی چالش به روش STAR',
    subtitle: 'موقعیت (S) + وظیفه (T) + اقدام (A) + نتیجه (R)',
    rewardCoins: 45,
    description: 'قالب بین‌المللی مصاحبه‌های شایستگی (STAR) را برای برجسته‌ترین تجربه خود کامل کنید.',
    fields: [
      { key: 'star_situation', label: '۱. موقعیت (Situation - موقعیت چالش):', placeholder: 'زمانی که در مسابقات دانشگاهی با کمبود شدید زمان و منابع روبرو شدیم...', type: 'textarea', minLength: 10 },
      { key: 'star_task', label: '۲. وظیفه (Task - مأموریت دقیق شما):', placeholder: 'وظیفه من طراحی مجدد ساختار مدار طی ۲۴ ساعت بود...', type: 'textarea', minLength: 10 },
      { key: 'star_action', label: '۳. اقدام (Action - رفتار و ابتکار شما):', placeholder: 'بخش‌های اضافی را حذف کردم و معماری ماژولار پیاده کردم...', type: 'textarea', minLength: 10 },
      { key: 'star_result', label: '۴. نتیجه (Result - نتیجه ملموس و عددی):', placeholder: 'دستگاه بدون خطا کار کرد و رتبه دوم استانی را کسب کردیم...', type: 'textarea', minLength: 10 }
    ]
  },
  {
    id: 10,
    stage: 3,
    title: 'تجمیع و صدور پرونده رسمی جشنواره',
    subtitle: 'بازبینی نهایی، انتخاب محور رقابتی و دریافت شناسه',
    rewardCoins: 50,
    description: 'محور رقابتی مدنظر خود در هفتمین دوره جشنواره بار دانش را انتخاب کنید و پرونده رسمی داوری را صادر نمایید.',
    fields: [
      {
        key: 'festival_track',
        label: 'محور رقابتی شما در جشنواره بار دانش:',
        placeholder: 'انتخاب محور',
        type: 'select',
        options: [
          'روایت دستاورد علمی و پژوهشی',
          'محصول نوآورانه و اختراع کاربردی',
          'تولید محتوا و رسانه دانشگاهی',
          'مسئولیت اجتماعی و حل چالش‌های بومی'
        ]
      },
      {
        key: 'final_signature',
        label: 'امضای تعهد اخلاقی (نام و نام خانوادگی جهت تایید صحت اطلاعات):',
        placeholder: 'نام و نام خانوادگی خود را بنویسید',
        type: 'text',
        minLength: 4
      }
    ]
  }
];

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAtText?: string;
}
