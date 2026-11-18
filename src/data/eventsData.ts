export type EventCategory =
  | 'Концерты'
  | 'Театр'
  | 'Стендап'
  | 'Спорт'
  | 'Выставки'
  | 'Фестивали';

export type FilterCategory = 'Все' | EventCategory;

export type TimeSlot = 'Сегодня' | 'На выходных' | 'В этом месяце';

export type InterestId =
  | 'music'
  | 'theatre'
  | 'standup'
  | 'art'
  | 'sport'
  | 'openair';

export interface TarazEvent {
  id: string;
  title: string;
  subtitle: string;
  category: EventCategory;
  dateLabel: string;
  timeLabel: string;
  timeSlot: TimeSlot;
  venue: string;
  district: string;
  priceLabel: string;
  image: string;
  imageAlt: string;
  description: string;
  highlights: string[];
  interestTags: InterestId[];
  featured?: boolean;
}

export const REFERENCE_APP_IMAGE =
  '/assets/aistudio/_______________________1__30e62dbe.png';

export const HERO_CITY_IMAGE =
  '/src/assets/images/taraz_city_hero_1794978376461.jpg';

export const CATEGORIES: FilterCategory[] = [
  'Все',
  'Концерты',
  'Театр',
  'Стендап',
  'Спорт',
  'Выставки',
  'Фестивали',
];

export const INTEREST_OPTIONS: {
  id: InterestId;
  label: string;
  caption: string;
}[] = [
  {
    id: 'music',
    label: 'Живая музыка',
    caption: 'Симфонические вечера, акустика и локальные группы',
  },
  {
    id: 'theatre',
    label: 'Театр и драма',
    caption: 'Премьеры, камерные постановки и классика сцены',
  },
  {
    id: 'standup',
    label: 'Стендап и вечер',
    caption: 'Открытый микрофон, сольные шоу и городские клубы',
  },
  {
    id: 'art',
    label: 'Искусство и выставки',
    caption: 'Галереи, керамика древнего Тараза и современная живопись',
  },
  {
    id: 'sport',
    label: 'Спорт и арена',
    caption: 'Матчи, турниры и активные городские старты',
  },
  {
    id: 'openair',
    label: 'Фестивали под небом',
    caption: 'Парковые маркеты, гастрономия и закатные сеты',
  },
];

export const TIME_SLOTS: TimeSlot[] = [
  'Сегодня',
  'На выходных',
  'В этом месяце',
];

export const TARAZ_EVENTS: TarazEvent[] = [
  {
    id: 'balasagun-symphony',
    title: 'Симфония Великого Шёлкового пути',
    subtitle: 'Камерный оркестр при свечах',
    category: 'Концерты',
    dateLabel: '22 ноября',
    timeLabel: '19:30',
    timeSlot: 'На выходных',
    venue: 'ЦКЗ «Баласағұн»',
    district: 'Центр, пр. Толе би',
    priceLabel: 'от 4 500 ₸',
    image: '/src/assets/images/taraz_concert_hall_1794978376025.jpg',
    imageAlt: 'Симфонический и акустический концерт на тёплой освещённой сцене',
    description:
      'Вечер живой неоклассики и степных мотивов в главном концертном зале города. Специальная программа для струнного ансамбля, домбры и рояля.',
    highlights: ['Живой звук без фонограммы', 'Акустика большого зала', '1 час 40 мин'],
    interestTags: ['music'],
    featured: true,
  },
  {
    id: 'tokpanov-drama',
    title: 'Тень над Таласом: премьера сезона',
    subtitle: 'Современная драма в двух действиях',
    category: 'Театр',
    dateLabel: '20 ноября',
    timeLabel: '19:00',
    timeSlot: 'Сегодня',
    venue: 'Театр драмы им. А. Токпанова',
    district: 'Исторический квартал',
    priceLabel: 'от 2 500 ₸',
    image: '/src/assets/images/taraz_theatre_stage_1794978375269.jpg',
    imageAlt: 'Драматический спектакль на театральной сцене с выразительным светом',
    description:
      'История о памяти города, выборе и связи поколений. Новая сценография с минималистичным светом и живым вокальным сопровождением.',
    highlights: ['Премьерный показ', 'Обсуждение с режиссёром', 'Возраст 16+'],
    interestTags: ['theatre'],
    featured: true,
  },
  {
    id: 'kone-taraz-openair',
    title: 'Закатный фестиваль «Көне Тараз»',
    subtitle: 'Музыка, ремёсла и вечерний маркет',
    category: 'Фестивали',
    dateLabel: '23 ноября',
    timeLabel: '17:00',
    timeSlot: 'На выходных',
    venue: 'Парк «Көне Тараз»',
    district: 'Старый город',
    priceLabel: 'Вход свободный',
    image: '/src/assets/images/taraz_openair_festival_1794978377529.jpg',
    imageAlt: 'Вечерний открытый городской фестиваль с живой музыкой и огоньками в парке',
    description:
      'Три акустические сцены под открытым небом, мастера керамики Жамбыла, локальная гастрономия и тёплые встречи на закате у древних стен.',
    highlights: ['3 сцены в парке', 'Ярмарка мастеров', 'Формат для всей семьи'],
    interestTags: ['openair', 'music'],
    featured: true,
  },
  {
    id: 'asyl-ceramic-expo',
    title: 'Палитра Тараза: нить веков',
    subtitle: 'Выставка живописи и авторской керамики',
    category: 'Выставки',
    dateLabel: '20–30 ноября',
    timeLabel: '11:00',
    timeSlot: 'Сегодня',
    venue: 'Галерея «Асыл»',
    district: 'ул. Сулейменова',
    priceLabel: 'от 1 500 ₸',
    image: '/src/assets/images/taraz_art_exhibition_1794978376208.jpg',
    imageAlt: 'Минималистичная галерея с картинами и скульптурной керамикой',
    description:
      'Экспозиция современных художников юга Казахстана и керамистов, переосмысливающих орнаменты эпохи Караханидов в современной эстетике.',
    highlights: ['Кураторская экскурсия в 16:00', '34 работы в зале', 'Фотозона разрешена'],
    interestTags: ['art'],
  },
  {
    id: 'sherkhan-standup',
    title: 'Тараз Stand-Up Club: Большой вечер',
    subtitle: 'Пять комиков с новым материалом',
    category: 'Стендап',
    dateLabel: '21 ноября',
    timeLabel: '20:30',
    timeSlot: 'Сегодня',
    venue: 'Сцена «Шерхан»',
    district: 'Центр',
    priceLabel: 'от 3 000 ₸',
    image: '/src/assets/images/taraz_openair_festival_1794978377529.jpg',
    imageAlt: 'Вечерняя камерная встреча и живое выступление перед зрителями',
    description:
      'Тёплый пятничный стендап без цензуры на локальные темы, городские истории и живую импровизацию с залом.',
    highlights: ['5 резидентов сцены', 'Сбор гостей за 30 минут', '18+'],
    interestTags: ['standup'],
  },
  {
    id: 'taraz-arena-basket',
    title: 'Кубок Жамбыла: финал на Тараз-Арене',
    subtitle: 'Баскетбольное дерби и шоу-перерыв',
    category: 'Спорт',
    dateLabel: '29 ноября',
    timeLabel: '18:00',
    timeSlot: 'В этом месяце',
    venue: 'Дворец спорта «Тараз-Арена»',
    district: 'ул. Тауке хана',
    priceLabel: 'от 2 000 ₸',
    image: '/src/assets/images/taraz_standup_sport_1794978377030.jpg',
    imageAlt: 'Динамичный спортивный матч под софитами заполненной городской арены',
    description:
      'Решающий матч городского баскетбольного турнира с трибунами, световым открытием и фанатской зоной для болельщиков.',
    highlights: ['Главная арена города', 'Фан-сектор', 'Прямая статистика'],
    interestTags: ['sport'],
  },
];
