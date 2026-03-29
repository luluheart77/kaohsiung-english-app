// ── Lightweight Markdown → HTML renderer ─────────────────────────────────────
function parseMarkdown(text) {
    if (!text) return '';
    const escape = s => s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const lines = text.split('\n');
    const out = [];
    let inUl = false;
    let inOl = false;
    const closeList = () => {
        if (inUl) { out.push('</ul>'); inUl = false; }
        if (inOl) { out.push('</ol>'); inOl = false; }
    };
    const inline = raw => {
        const esc = escape(raw);
        return esc
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
    };
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (trimmed === '') { closeList(); out.push('<br>'); continue; }
        if (/^###\s+/.test(trimmed)) { closeList(); out.push(`<h3>${inline(trimmed.replace(/^###\s+/, ''))}</h3>`); continue; }
        if (/^##\s+/.test(trimmed))  { closeList(); out.push(`<h2>${inline(trimmed.replace(/^##\s+/, ''))}</h2>`); continue; }
        if (/^#\s+/.test(trimmed))   { closeList(); out.push(`<h1>${inline(trimmed.replace(/^#\s+/, ''))}</h1>`); continue; }
        if (/^[-*]\s+/.test(trimmed)) {
            if (inOl) { out.push('</ol>'); inOl = false; }
            if (!inUl) { out.push('<ul>'); inUl = true; }
            out.push(`<li>${inline(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
            continue;
        }
        if (/^\d+\.\s+/.test(trimmed)) {
            if (inUl) { out.push('</ul>'); inUl = false; }
            if (!inOl) { out.push('<ol>'); inOl = true; }
            out.push(`<li>${inline(trimmed.replace(/^\d+\.\s+/, ''))}</li>`);
            continue;
        }
        closeList();
        out.push(`<p>${inline(trimmed)}</p>`);
    }
    closeList();
    return out.join('').replace(/(<br>){2,}/g, '<br>');
}

// ── SDG metadata — ALL 17 goals ───────────────────────────────────────────────
const SDG_META = {
    1:  { label: 'SDG 1',  name: '消除貧窮',         color: '#E5243B', emoji: '🏠' },
    2:  { label: 'SDG 2',  name: '消除飢餓',         color: '#DDA63A', emoji: '🌾' },
    3:  { label: 'SDG 3',  name: '健康與福祉',       color: '#4C9F38', emoji: '❤️' },
    4:  { label: 'SDG 4',  name: '優質教育',         color: '#C5192D', emoji: '📚' },
    5:  { label: 'SDG 5',  name: '性別平等',         color: '#FF3A21', emoji: '⚖️' },
    6:  { label: 'SDG 6',  name: '潔淨水資源',       color: '#26BDE2', emoji: '💧' },
    7:  { label: 'SDG 7',  name: '可負擔的潔淨能源', color: '#FCC30B', emoji: '⚡' },
    8:  { label: 'SDG 8',  name: '就業與經濟成長',   color: '#A21942', emoji: '💼' },
    9:  { label: 'SDG 9',  name: '工業創新與基礎設施',color: '#FD6925', emoji: '🏭' },
    10: { label: 'SDG 10', name: '減少不平等',       color: '#DD1367', emoji: '🤝' },
    11: { label: 'SDG 11', name: '永續城鄉',         color: '#FD9D24', emoji: '🏙️' },
    12: { label: 'SDG 12', name: '責任消費與生產',   color: '#BF8B2E', emoji: '♻️' },
    13: { label: 'SDG 13', name: '氣候行動',         color: '#3F7E44', emoji: '🌡️' },
    14: { label: 'SDG 14', name: '海洋生態',         color: '#0A97D9', emoji: '🌊' },
    15: { label: 'SDG 15', name: '陸域生態',         color: '#56C02B', emoji: '🌿' },
    16: { label: 'SDG 16', name: '和平正義與制度',   color: '#00689D', emoji: '🕊️' },
    17: { label: 'SDG 17', name: '全球夥伴關係',     color: '#19486A', emoji: '🌐' },
};

// ── Sustainability routes definition ─────────────────────────────────────────
const ROUTES = [
    {
        id: 'water',
        title: '高雄水文循環路線',
        title_en: 'Kaohsiung Water Cycle Route',
        emoji: '💧',
        color: '#26BDE2',
        sdgs: [6, 11, 13],
        desc: '從愛河整治到沿海濕地，探索高雄如何透過工程與生態雙軌管理城市水資源。',
        location_ids: [1, 2, 56, 55, 127],
        topic_ids: [1, 3, 56, 55, 127],
    },
    {
        id: 'energy',
        title: '再生能源海岸路線',
        title_en: 'Renewable Energy Coastal Route',
        emoji: '⚡',
        color: '#FCC30B',
        sdgs: [7, 13, 14],
        desc: '沿著高雄西海岸，認識風力發電、太陽能愛之船，以及綠能轉型中的漁業社區。',
        location_ids: [1, 57, 10, 110, 125],
        topic_ids: [2, 57, 20, 110, 125],
    },
    {
        id: 'industrial',
        title: '工業轉型文化路線',
        title_en: 'Industrial Transformation Route',
        emoji: '🏭',
        color: '#FD9D24',
        sdgs: [11, 13],
        desc: '見證高雄從重工業城市轉型的軌跡——廢倉庫變藝術特區，糖廠變文化園區，鐵道變公共空間。',
        location_ids: [4, 5, 58, 123, 109],
        topic_ids: [7, 9, 58, 123, 109],
    },
    {
        id: 'biodiversity',
        title: '生態多樣性路線',
        title_en: 'Biodiversity & Wetlands Route',
        emoji: '🌿',
        color: '#56C02B',
        sdgs: [14, 15, 6],
        desc: '從都市濕地紅樹林到南部候鳥棲地，追蹤黑面琵鷺的足跡，認識高雄的生態廊道。',
        location_ids: [2, 56, 52, 127, 134],
        topic_ids: [4, 56, 52, 127, 134],
    },
    {
        id: 'indigenous',
        title: '原住民永續智慧路線',
        title_en: 'Indigenous Sustainability Route',
        emoji: '🌸',
        color: '#E5243B',
        sdgs: [15, 11],
        desc: '深入高雄山區部落，從布農族八部合音到茂林紫蝶幽谷，認識原住民與土地共生的永續智慧。',
        location_ids: [134, 135, 136, 130, 129],
        topic_ids: [134, 135, 136, 130, 129],
    },
];

// ── Expanded vocab — covers all SDG themes beyond environment ─────────────────
// Used as a seed/fallback; AI extraction from conversations adds dynamically.
const VOCAB_BY_TOPIC = {
    // ── SDG 6 Water ──────────────────────────────────────────────────────────
    1:   [{ word: 'remediation',          zh: '整治／復育',       sdgs: [6,11]   },
          { word: 'watershed',            zh: '流域',             sdgs: [6]      },
          { word: 'water quality',        zh: '水質',             sdgs: [6]      }],
    3:   [{ word: 'sponge city',          zh: '海綿城市',         sdgs: [6,11]   },
          { word: 'green infrastructure', zh: '綠色基礎設施',     sdgs: [11,13]  },
          { word: 'stormwater management',zh: '雨水管理',         sdgs: [6,11]   }],
    55:  [{ word: 'detention pond',       zh: '滯洪池',           sdgs: [6,11]   },
          { word: 'flood governance',     zh: '防洪治理',         sdgs: [6]      },
          { word: 'floodplain',           zh: '洪氾平原',         sdgs: [6,11]   }],
    114: [{ word: 'reservoir',            zh: '水庫',             sdgs: [6]      },
          { word: 'water conservation',   zh: '水資源保育',       sdgs: [6]      }],
    138: [{ word: 'water culture',        zh: '水文化',           sdgs: [6,11]   }],

    // ── SDG 7 Energy ─────────────────────────────────────────────────────────
    2:   [{ word: 'zero-emission',        zh: '零排放',           sdgs: [7,13]   },
          { word: 'sustainable tourism',  zh: '永續觀光',         sdgs: [11]     },
          { word: 'solar-powered',        zh: '太陽能驅動',       sdgs: [7]      }],
    57:  [{ word: 'wind turbine',         zh: '風力發電機',       sdgs: [7]      },
          { word: 'renewable energy',     zh: '再生能源',         sdgs: [7,13]   },
          { word: 'kilowatt-hour',        zh: '千瓦小時',         sdgs: [7]      },
          { word: 'offshore wind',        zh: '離岸風電',         sdgs: [7,13]   }],

    // ── SDG 8 Decent Work & Economy ──────────────────────────────────────────
    10:  [{ word: 'port economy',         zh: '港口經濟',         sdgs: [8,11]   },
          { word: 'container throughput', zh: '貨櫃吞吐量',       sdgs: [8,9]    },
          { word: 'waterfront development',zh:'親水開發',         sdgs: [8,11]   }],
    20:  [{ word: 'marine economy',       zh: '海洋經濟',         sdgs: [8,14]   },
          { word: 'maritime trade',       zh: '海上貿易',         sdgs: [8,17]   }],
    21:  [{ word: 'culinary heritage',    zh: '飲食文化遺產',     sdgs: [8,11]   },
          { word: 'food tourism',         zh: '美食觀光',         sdgs: [8,11]   }],
    109: [{ word: 'petrochemical',        zh: '石化工業',         sdgs: [8,9]    },
          { word: 'environmental justice',zh: '環境正義',         sdgs: [10,11]  },
          { word: 'export processing zone',zh:'加工出口區',       sdgs: [8,9]    }],
    123: [{ word: 'industrial heritage',  zh: '工業遺產',         sdgs: [8,11]   },
          { word: 'sugar refinery',       zh: '糖廠',             sdgs: [8,11]   }],
    124: [{ word: 'fishing harbor',       zh: '漁港',             sdgs: [8,14]   },
          { word: 'fish market',          zh: '魚市場',           sdgs: [8,14]   }],
    125: [{ word: 'dried shrimp',         zh: '蝦米',             sdgs: [8,14]   },
          { word: 'artisanal fishery',    zh: '傳統漁業',         sdgs: [8,14]   }],
    126: [{ word: 'aquaculture',          zh: '養殖漁業',         sdgs: [8,14]   },
          { word: 'grouper farming',      zh: '石斑魚養殖',       sdgs: [8,14]   }],

    // ── SDG 9 Industry, Innovation & Infrastructure ───────────────────────────
    5:   [{ word: 'rotating bridge',      zh: '旋轉橋',           sdgs: [9,11]   },
          { word: 'bascule bridge',       zh: '活動橋',           sdgs: [9]      }],
    9:   [{ word: 'bridge engineering',   zh: '橋梁工程',         sdgs: [9,11]   },
          { word: 'harbor infrastructure',zh: '港灣基礎設施',     sdgs: [9,11]   }],
    58:  [{ word: 'railway heritage',     zh: '鐵道遺產',         sdgs: [9,11]   },
          { word: 'adaptive reuse',       zh: '活化再利用',       sdgs: [9,11]   },
          { word: 'repurposed space',     zh: '空間再造',         sdgs: [9,11]   }],
    111: [{ word: 'aviation hub',         zh: '航空樞紐',         sdgs: [9,11]   },
          { word: 'air connectivity',     zh: '航空連結',         sdgs: [9,17]   }],
    116: [{ word: 'petrochemical cluster',zh: '石化聚落',         sdgs: [9,13]   },
          { word: 'industrial coexistence',zh:'工業共存',         sdgs: [9,11]   }],
    137: [{ word: 'supply chain',         zh: '供應鏈',           sdgs: [9,12]   },
          { word: 'industrial zone',      zh: '工業區',           sdgs: [9,11]   }],

    // ── SDG 10 Reduced Inequalities ───────────────────────────────────────────
    54:  [{ word: 'inclusive playground', zh: '共融遊戲場',       sdgs: [10,11]  },
          { word: 'universal design',     zh: '通用設計',         sdgs: [10,11]  },
          { word: 'social inclusion',     zh: '社會包容',         sdgs: [10]     }],
    106: [{ word: 'urban equity',         zh: '城市公平',         sdgs: [10,11]  },
          { word: 'administrative history',zh:'行政歷史',         sdgs: [11,16]  }],

    // ── SDG 11 Sustainable Cities ─────────────────────────────────────────────
    4:   [{ word: 'warehouse district',   zh: '倉庫區',           sdgs: [11]     },
          { word: 'creative hub',         zh: '創意聚落',         sdgs: [11]     },
          { word: 'urban regeneration',   zh: '城市再生',         sdgs: [11]     }],
    7:   [{ word: 'industrial heritage',  zh: '工業遺產',         sdgs: [11]     }],
    8:   [{ word: 'public art',           zh: '公共藝術',         sdgs: [11]     },
          { word: 'street art',           zh: '街頭藝術',         sdgs: [11]     },
          { word: 'creative freedom',     zh: '創作自由',         sdgs: [11,16]  }],
    11:  [{ word: 'marine ecology',       zh: '海洋生態',         sdgs: [14]     },
          { word: 'coastal erosion',      zh: '海岸侵蝕',         sdgs: [14]     }],
    15:  [{ word: 'air-raid shelter',     zh: '防空洞',           sdgs: [11]     },
          { word: 'adaptive reuse',       zh: '活化再利用',       sdgs: [11]     }],
    16:  [{ word: 'heritage conservation',zh: '文化遺產保存',     sdgs: [11]     },
          { word: 'repurposed military',  zh: '軍事用地再利用',   sdgs: [11]     }],
    19:  [{ word: 'urban mobility',       zh: '城市交通',         sdgs: [11]     },
          { word: 'transit-oriented',     zh: '以運輸為導向',     sdgs: [11]     }],
    51:  [{ word: 'urban heat island',    zh: '都市熱島效應',     sdgs: [11,13]  },
          { word: 'carbon sequestration', zh: '碳封存',           sdgs: [13,15]  },
          { word: 'urban forest',         zh: '都市森林',         sdgs: [11,15]  }],
    52:  [{ word: 'habitat restoration',  zh: '棲地復育',         sdgs: [15]     },
          { word: 'brownfield',           zh: '棕地',             sdgs: [11,15]  }],
    53:  [{ word: 'civic space',          zh: '公共空間',         sdgs: [11]     },
          { word: 'placemaking',          zh: '場所營造',         sdgs: [11]     }],
    59:  [{ word: 'landfill rehabilitation',zh:'掩埋場復育',      sdgs: [11,15]  },
          { word: 'brownfield redevelopment',zh:'棕地再開發',     sdgs: [11]     },
          { word: 'soil remediation',     zh: '土壤整治',         sdgs: [11,15]  }],
    101: [{ word: 'temple aesthetics',    zh: '廟宇美學',         sdgs: [11]     },
          { word: 'folk religion',        zh: '民間信仰',         sdgs: [11]     }],
    103: [{ word: 'joss paper',           zh: '金紙',             sdgs: [12,13]  },
          { word: 'eco-friendly ritual',  zh: '環保祭祀',         sdgs: [12,13]  }],
    107: [{ word: 'commercial district',  zh: '商業區',           sdgs: [8,11]   },
          { word: 'youth culture',        zh: '青年文化',         sdgs: [11]     }],
    112: [{ word: 'national monument',    zh: '國定古蹟',         sdgs: [11]     },
          { word: 'wood carving',         zh: '木雕藝術',         sdgs: [11]     }],
    121: [{ word: 'vernacular architecture',zh:'鄉土建築',        sdgs: [11]     }],

    // ── SDG 12 Responsible Consumption & Production ───────────────────────────
    22:  [{ word: 'food tradition',       zh: '飲食傳統',         sdgs: [11,12]  },
          { word: 'local produce',        zh: '在地農產',         sdgs: [2,12]   }],
    23:  [{ word: 'food culture',         zh: '飲食文化',         sdgs: [11,12]  }],
    24:  [{ word: 'night market',         zh: '夜市',             sdgs: [8,11]   },
          { word: 'street food',          zh: '街頭小吃',         sdgs: [8,12]   }],
    25:  [{ word: 'artisan pastry',       zh: '工藝糕點',         sdgs: [8,12]   }],
    26:  [{ word: 'plant-based diet',     zh: '植物性飲食',       sdgs: [2,12,13]}],

    // ── SDG 13 Climate Action ─────────────────────────────────────────────────
    13:  [{ word: 'wildlife coexistence', zh: '野生動物共存',     sdgs: [15]     }],
    105: [{ word: 'community resilience', zh: '社區韌性',         sdgs: [11,13]  }],

    // ── SDG 14 Life Below Water ───────────────────────────────────────────────
    56:  [{ word: 'mangrove',             zh: '紅樹林',           sdgs: [14,15]  },
          { word: 'wetland buffer',       zh: '濕地緩衝帶',       sdgs: [6,14]   },
          { word: 'tidal ecosystem',      zh: '潮汐生態系',       sdgs: [14]     }],
    110: [{ word: 'coastal heritage',     zh: '海岸文化遺產',     sdgs: [11,14]  }],
    119: [{ word: 'coastal fishing',      zh: '沿海漁業',         sdgs: [14]     },
          { word: 'traditional fishing',  zh: '傳統漁法',         sdgs: [14]     }],
    127: [{ word: 'Black-faced Spoonbill',zh: '黑面琵鷺',         sdgs: [14,15]  },
          { word: 'migratory birds',      zh: '候鳥',             sdgs: [15]     },
          { word: 'wetland sanctuary',    zh: '濕地保護區',       sdgs: [14,15]  },
          { word: 'endangered species',   zh: '瀕危物種',         sdgs: [14,15]  }],

    // ── SDG 15 Life on Land ───────────────────────────────────────────────────
    4:   [{ word: 'biodiversity',         zh: '生物多樣性',       sdgs: [14,15]  },
          { word: 'ecological corridor',  zh: '生態廊道',         sdgs: [15]     }],
    117: [{ word: 'mountain ecosystem',   zh: '山地生態系',       sdgs: [15]     },
          { word: 'hiking trail',         zh: '健行步道',         sdgs: [11,15]  }],
    122: [{ word: 'mud volcano',          zh: '泥火山',           sdgs: [15]     },
          { word: 'geological wonder',    zh: '地質奇景',         sdgs: [15]     }],
    130: [{ word: 'hot springs',          zh: '溫泉',             sdgs: [8,15]   },
          { word: 'riparian ecosystem',   zh: '河岸生態系',       sdgs: [6,15]   }],
    131: [{ word: 'mountain biodiversity',zh: '山地生物多樣性',   sdgs: [15]     }],
    134: [{ word: 'indigenous conservation',zh:'原住民保育',      sdgs: [15]     },
          { word: 'Purple Butterfly Valley',zh:'紫蝶幽谷',        sdgs: [15]     },
          { word: 'seasonal migration',   zh: '季節性遷移',       sdgs: [15]     }],

    // ── SDG 16 Peace, Justice & Strong Institutions ───────────────────────────
    17:  [{ word: 'colonial trade',       zh: '殖民貿易',         sdgs: [16,17]  },
          { word: 'maritime law',         zh: '海事法',           sdgs: [14,16]  }],
    18:  [{ word: 'colonial architecture',zh: '殖民建築',         sdgs: [11,16]  },
          { word: 'heritage preservation',zh: '古蹟保存',         sdgs: [11,16]  }],
    104: [{ word: 'cultural preservation',zh: '文化保存',         sdgs: [11,16]  }],
    108: [{ word: 'business ethics',      zh: '商業倫理',         sdgs: [8,16]   },
          { word: 'moral integrity',      zh: '道德誠信',         sdgs: [16]     }],
    133: [{ word: 'martial arts tradition',zh:'武術傳統',         sdgs: [11,16]  },
          { word: 'intangible heritage',  zh: '無形文化遺產',     sdgs: [11,16]  }],

    // ── SDG 4 Education & Culture ─────────────────────────────────────────────
    5:   [{ word: 'modern architecture',  zh: '現代建築',         sdgs: [9,11]   }],
    6:   [{ word: 'Mandopop',             zh: '華語流行音樂',     sdgs: [4,11]   },
          { word: 'linguistic diversity', zh: '語言多樣性',       sdgs: [4,11]   },
          { word: 'cultural revival',     zh: '文化復興',         sdgs: [4,11]   }],
    14:  [{ word: 'higher education',     zh: '高等教育',         sdgs: [4]      },
          { word: 'international campus', zh: '國際校園',         sdgs: [4,17]   }],
    128: [{ word: 'Confucian values',     zh: '儒家價值',         sdgs: [4,16]   }],
    129: [{ word: 'Hakka culture',        zh: '客家文化',         sdgs: [4,11]   },
          { word: 'traditional craft',    zh: '傳統工藝',         sdgs: [4,11]   },
          { word: 'oil-paper umbrella',   zh: '油紙傘',           sdgs: [4,11]   }],

    // ── Indigenous SDGs ───────────────────────────────────────────────────────
    135: [{ word: 'polyphony',            zh: '複音音樂',         sdgs: [4,11]   },
          { word: 'Bunun people',         zh: '布農族',           sdgs: [10,15]  },
          { word: 'oral tradition',       zh: '口述傳統',         sdgs: [4,16]   }],
    136: [{ word: 'indigenous astronomy', zh: '原住民天文',       sdgs: [4,15]   },
          { word: 'tribal culture',       zh: '部落文化',         sdgs: [10,11]  }],
    132: [{ word: 'Hakka heritage',       zh: '客家文化遺產',     sdgs: [4,11]   },
          { word: 'rural sustainability', zh: '農村永續',         sdgs: [2,11]   }],

    // ── SDG 2 Food & Agriculture ─────────────────────────────────────────────
    113: [{ word: 'agricultural tourism', zh: '農業觀光',         sdgs: [2,8]    },
          { word: 'crop diversification', zh: '作物多元化',       sdgs: [2,15]   }],

    // ── SDG 17 Partnerships ───────────────────────────────────────────────────
    115: [{ word: 'global Buddhism',      zh: '全球佛教',         sdgs: [17,16]  },
          { word: 'international outreach',zh:'國際交流',         sdgs: [17]     }],
    521: [{ word: 'urban forest',         zh: '都市森林',         sdgs: [11,15]  },
          { word: 'visual ecology',       zh: '視覺生態',         sdgs: [11,15]  }],
};

// ─────────────────────────────────────────────────────────────────────────────

const app = {
    data: null,
    map: null,
    allMarkers: [],
    routeLayer: null,
    activeSdgFilter: 'all',

    state: {
        currentView: 'home',
        currentScenario: null,
        currentTopicId: null,
        currentTopicSdgs: [],
        currentLocationIcon: '',
        messages: [],
        showTranslations: false,
        stats: { taskCount: 0, streak: 1, rounds: 0, sessions: 0 },
    },
    currentTasks: [],

    // ── Init ─────────────────────────────────────────────────────────────────

    async init() {
        this.loadStatsFromStorage();
        await this.loadAppJson();
        this.navigate('home');
    },

    async loadAppJson() {
        try {
            const r = await fetch('/kaohsiung_tour_data.json');
            this.data = await r.json();
        } catch(e) { console.error('Failed to load JSON:', e); }
    },

    loadStatsFromStorage() {
        try {
            const saved = localStorage.getItem('langquest_stats');
            const lastDate = localStorage.getItem('langquest_last_date');
            const today = new Date().toDateString();
            if (saved) {
                this.state.stats = { ...this.state.stats, ...JSON.parse(saved) };
                if (lastDate !== today) {
                    if (lastDate) {
                        const diff = Math.floor((new Date() - new Date(lastDate)) / 86400000);
                        if (diff === 1) this.state.stats.streak++;
                        else if (diff > 1) this.state.stats.streak = 1;
                    }
                    localStorage.setItem('langquest_last_date', today);
                    this.saveStats();
                }
            } else {
                localStorage.setItem('langquest_last_date', today);
            }
        } catch(e) { console.error('Storage error:', e); }
    },

    saveStats() {
        localStorage.setItem('langquest_stats', JSON.stringify(this.state.stats));
    },

    // ── Navigation ───────────────────────────────────────────────────────────

    navigate(viewId) {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        this.state.currentView = viewId;

        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const btn = document.getElementById(`nav-${viewId}`);
        if (btn) btn.classList.add('active');

        if (viewId === 'scenarios') {
            this._stopMic();
            speechSynthesis.cancel();
            requestAnimationFrame(() => requestAnimationFrame(() => {
                this.initMap();
                if (this.map) {
                    this.map.invalidateSize();
                    setTimeout(() => this.map.invalidateSize(), 300);
                }
            }));
        }
        if (viewId === 'routes')  this.renderRoutes();
        if (viewId === 'vocab')   this.renderVocab();
        if (viewId === 'badges')  this.loadStats();
    },

    // ── Map ──────────────────────────────────────────────────────────────────

    areaColors: {
        1: '#4f46e5',
        2: '#0891b2',
        3: '#d97706',
        4: '#dc2626',
        5: '#059669',
    },

    _buildLocationSdgIndex() {
        const index = {};
        this.data.topics.forEach(topic => {
            const sdgs = topic.sdg_ids || [];
            if (!index[topic.location_id]) index[topic.location_id] = new Set();
            sdgs.forEach(s => index[topic.location_id].add(s));
        });
        return index;
    },

    initMap() {
        if (!this.data) return;
        const mapEl = document.getElementById('map');
        if (!mapEl) return;
        if (this.map) { this.map.invalidateSize(); return; }

        this.map = L.map('map', { center: [22.638, 120.298], zoom: 12 });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18,
        }).addTo(this.map);

        const topicsByLocation = {};
        this.data.topics.forEach(t => {
            if (!topicsByLocation[t.location_id]) topicsByLocation[t.location_id] = [];
            topicsByLocation[t.location_id].push(t);
        });

        const locationSdgIndex = this._buildLocationSdgIndex();

        this.data.locations.forEach(loc => {
            if (!loc.lat || !loc.lng) return;
            const topics = topicsByLocation[loc.id] || [];
            if (topics.length === 0) return;

            const color = this.areaColors[loc.area_id] || '#4f46e5';
            const locSdgs = Array.from(locationSdgIndex[loc.id] || []);

            const marker = this._createMarker(loc, topics, color);
            marker.addTo(this.map);
            marker.on('click', () => this.showLocationPanel(loc, topics));

            this.allMarkers.push({ marker, locationId: loc.id, sdgs: locSdgs });
        });

        setTimeout(() => this.map.invalidateSize(), 150);
    },

    _createMarker(loc, topics, color) {
        const icon = L.divIcon({
            className: '',
            html: `<div class="map-pin" style="width:38px;height:38px;border:2.5px solid ${color};box-shadow:0 4px 14px ${color}55;">
                       <span style="font-size:1.05rem;line-height:1">${loc.icon}</span>
                       <span class="pin-badge" style="background:${color}">${topics.length}</span>
                   </div>`,
            iconSize: [38, 38],
            iconAnchor: [19, 19],
        });
        return L.marker([loc.lat, loc.lng], { icon });
    },

    // ── SDG filter ────────────────────────────────────────────────────────────

    filterBySdg(sdg) {
        this.activeSdgFilter = sdg;
        document.querySelectorAll('.sdg-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sdg == sdg);
        });
        this.allMarkers.forEach(({ marker, sdgs }) => {
            if (sdg === 'all' || sdgs.includes(Number(sdg))) {
                if (!this.map.hasLayer(marker)) marker.addTo(this.map);
            } else {
                if (this.map.hasLayer(marker)) this.map.removeLayer(marker);
            }
        });
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
            this.routeLayer = null;
        }
    },

    // ── Location panel ────────────────────────────────────────────────────────

    showLocationPanel(loc, topics) {
        const area = this.data.areas.find(a => a.id === loc.area_id);
        document.getElementById('panel-location-icon').textContent = loc.icon;
        document.getElementById('panel-location-name').textContent = loc.name_zh;
        document.getElementById('panel-location-meta').textContent =
            `${loc.name_en}${area ? ' · ' + area.name_zh : ''}`;

        const list = document.getElementById('panel-topic-list');
        list.innerHTML = topics.map(t => {
            const sdgPills = (t.sdg_ids || []).map(s => {
                const m = SDG_META[s];
                return m ? `<span class="sdg-pill" style="background:${m.color}20;color:${m.color};border-color:${m.color}40">${m.emoji} ${m.label}</span>` : '';
            }).join('');
            return `
            <div class="topic-card" onclick="app.startScenario(${JSON.stringify(t).replace(/"/g,'&quot;')}, '${loc.icon}')">
                <div class="topic-card-zh">${t.title_zh}</div>
                <div class="topic-card-en">${t.title_en}</div>
                ${sdgPills ? `<div class="topic-sdg-pills">${sdgPills}</div>` : ''}
            </div>`;
        }).join('');

        const panel = document.getElementById('location-panel');
        panel.classList.remove('hidden');
        panel.style.animation = 'none';
        panel.offsetHeight;
        panel.style.animation = '';
    },

    closeLocationPanel() {
        document.getElementById('location-panel').classList.add('hidden');
    },

    // ── Routes ────────────────────────────────────────────────────────────────

    renderRoutes() {
        const grid = document.getElementById('routes-grid');
        grid.innerHTML = ROUTES.map(route => {
            const sdgPills = route.sdgs.map(s => {
                const m = SDG_META[s];
                return m ? `<span class="sdg-pill" style="background:${m.color}20;color:${m.color};border-color:${m.color}40">${m.emoji} ${m.label} ${m.name}</span>` : '';
            }).join('');
            const stops = route.location_ids.length;
            return `
            <div class="route-card" onclick="app.openRoute('${route.id}')">
                <div class="route-card-header" style="background:${route.color}15;border-bottom:2px solid ${route.color}30">
                    <span class="route-emoji">${route.emoji}</span>
                    <div>
                        <div class="route-title">${route.title}</div>
                        <div class="route-title-en">${route.title_en}</div>
                    </div>
                    <span class="route-stops">${stops} 站</span>
                </div>
                <div class="route-card-body">
                    <p class="route-desc">${route.desc}</p>
                    <div class="route-sdg-pills">${sdgPills}</div>
                    <button class="route-start-btn" style="background:${route.color}" onclick="event.stopPropagation();app.openRoute('${route.id}')">
                        在地圖上查看 →
                    </button>
                </div>
            </div>`;
        }).join('');
    },

    openRoute(routeId) {
        const route = ROUTES.find(r => r.id === routeId);
        if (!route || !this.data) return;

        this.navigate('scenarios');

        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (this.routeLayer) {
                this.map.removeControl(this.routeLayer);
                this.routeLayer = null;
            }

            const waypoints = route.location_ids
                .map(id => this.data.locations.find(l => l.id === id))
                .filter(l => l && l.lat && l.lng)
                .map(l => L.latLng(l.lat, l.lng));

            if (waypoints.length < 2) return;

            this.filterBySdg('all');

            this.routeLayer = L.Routing.control({
                waypoints,
                router: L.Routing.osrmv1({
                    serviceUrl: 'https://router.project-osrm.org/route/v1',
                    profile: 'driving',
                }),
                lineOptions: {
                    styles: [{ color: route.color, weight: 5, opacity: 0.85 }],
                    extendToWaypoints: true,
                    missingRouteTolerance: 0,
                },
                createMarker: (i, wp) => {
                    const loc = this.data.locations.find(l =>
                        Math.abs(l.lat - wp.latLng.lat) < 0.0001 &&
                        Math.abs(l.lng - wp.latLng.lng) < 0.0001
                    );
                    const icon = L.divIcon({
                        className: '',
                        html: `<div style="
                            width:32px;height:32px;
                            background:${route.color};
                            border:2.5px solid white;
                            border-radius:50%;
                            display:flex;align-items:center;justify-content:center;
                            color:white;font-weight:700;font-size:0.85rem;
                            box-shadow:0 3px 10px ${route.color}88;
                        ">${i + 1}</div>`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16],
                    });
                    const marker = L.marker(wp.latLng, { icon });
                    if (loc) {
                        marker.bindTooltip(
                            `<strong>${loc.icon} ${loc.name_zh}</strong><br><span style="font-size:0.8rem;color:#64748b">${loc.name_en}</span>`,
                            { direction: 'top', offset: [0, -18] }
                        );
                    }
                    return marker;
                },
                show: false,
                collapsible: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                routeWhileDragging: false,
            }).addTo(this.map);

            this.routeLayer.on('routesfound', e => {
                const bounds = L.latLngBounds(e.routes[0].coordinates);
                this.map.fitBounds(bounds, { padding: [60, 320] });
                this.showToast(`${route.emoji} ${route.title} — ${waypoints.length} 站`);
            });

            this.routeLayer.on('routingerror', () => {
                this.showToast('⚠️ 路線載入失敗，請檢查網路連線');
            });
        }));
    },

    // ── Chat ─────────────────────────────────────────────────────────────────

    async startScenario(topic, locationIcon = '') {
        this.state.currentScenario = topic.title_en;
        this.state.currentTopicId = topic.id;
        this.state.currentTopicSdgs = topic.sdg_ids || [];
        this.state.currentLocationIcon = locationIcon;

        document.getElementById('chat-scenario-title').textContent = topic.title_zh;
        document.getElementById('chat-location-icon').textContent = locationIcon;

        const tagContainer = document.getElementById('chat-sdg-tags');
        tagContainer.innerHTML = (topic.sdg_ids || []).map(s => {
            const m = SDG_META[s];
            return m ? `<span class="sdg-pill small" style="background:${m.color}20;color:${m.color};border-color:${m.color}40">${m.emoji} ${m.label}</span>` : '';
        }).join('');

        document.getElementById('chat-messages').innerHTML = '';
        this.state.messages = [];
        this.state.stats.sessions++;
        this.saveStats();

        this.navigate('chat');
        this.closeLocationPanel();
        this.loadTasksForScenario(topic.id);

        // Seed vocab from static dictionary for this topic
        this._awardVocab(topic.id);

        const tid = this.showTypingIndicator();
        try {
            const r = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenario: topic.title_en, messages: [] }),
            });
            const d = await r.json();
            this.removeTypingIndicator(tid);
            if (d.reply) {
                this.addMessageToUI('bot', d.reply, d.translation);
                this._speak(d.reply);
                // Extract vocab from the opening message
                this._extractAndSaveVocab(d.reply);
            }
        } catch(e) {
            this.removeTypingIndicator(tid);
            this.addMessageToUI('bot',
                `Welcome! Let's talk about **${topic.title_en}**.`,
                `歡迎！讓我們聊聊${topic.title_zh}。`);
        }
    },

    showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.className = 'message bot typing';
        div.id = id;
        div.innerHTML = '<span style="letter-spacing:3px;font-size:1.2rem">•••</span>';
        document.getElementById('chat-messages').appendChild(div);
        this._scrollToBottom();
        return id;
    },

    removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    },

    addMessageToUI(role, content, translation = '') {
        const c = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.className = `message ${role}${this.state.showTranslations && translation ? ' show-translation' : ''}`;

        const contentHtml = role === 'bot'
            ? `<div class="content md-body">${parseMarkdown(content)}</div>`
            : `<div class="content">${content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`;

        const translationHtml = translation
            ? `<div class="translation md-body">${parseMarkdown(translation)}</div>`
            : '';

        div.innerHTML = contentHtml + translationHtml;
        c.appendChild(div);
        this._scrollToBottom();
    },

    _scrollToBottom() {
        const c = document.getElementById('chat-messages');
        if (c) c.scrollTop = c.scrollHeight;
    },

    handleInputKeypress(e) { if (e.key === 'Enter') this.sendMessage(); },

    async sendMessage() {
        const inputEl = document.getElementById('chat-input');
        const text = inputEl.value.trim();
        if (!text) return;
        inputEl.value = '';

        this.addMessageToUI('user', text);
        const historyToSend = [...this.state.messages];
        this.state.messages.push({ role: 'user', content: text });
        this.state.stats.rounds++;
        this.saveStats();

        const tid = this.showTypingIndicator();
        this.evaluateUserMessage(text);

        try {
            const r = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scenario: this.state.currentScenario,
                    messages: [...historyToSend, { role: 'user', content: text }],
                }),
            });
            const d = await r.json();
            this.removeTypingIndicator(tid);
            if (d.reply) {
                this.addMessageToUI('bot', d.reply, d.translation);
                this.state.messages.push({ role: 'bot', content: d.reply, translation: d.translation || '' });
                this._speak(d.reply);
                // Extract vocab from every bot reply — covers all SDG topics dynamically
                this._extractAndSaveVocab(d.reply);
            } else {
                this.addMessageToUI('bot', `Error: ${d.error || 'Unknown error'}`);
            }
        } catch(e) {
            this.removeTypingIndicator(tid);
            this.addMessageToUI('bot', 'Sorry, connection failed. 抱歉，連線失敗。');
        }
    },

    toggleTranslation() {
        this.state.showTranslations = !this.state.showTranslations;
        document.querySelectorAll('.message').forEach(m => {
            if (m.querySelector('.translation'))
                m.classList.toggle('show-translation', this.state.showTranslations);
        });
    },

    async requestHint() {
        const tid = this.showTypingIndicator();
        try {
            const r = await fetch('/api/task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'request_hint', scenario: this.state.currentScenario, history: this.state.messages }),
            });
            const d = await r.json();
            this.removeTypingIndicator(tid);
            if (d.hint) {
                document.getElementById('chat-input').value = d.hint;
                document.getElementById('chat-input').focus();
            }
        } catch(e) { this.removeTypingIndicator(tid); }
    },

    // ── Tasks ─────────────────────────────────────────────────────────────────

    loadTasksForScenario(topicId) {
        if (!this.data) return;
        const tasks = this.data.tasks.filter(t => t.topic_id === topicId);
        this.currentTasks = tasks.map((t, i) => ({
            id: topicId * 100 + i,
            text: t.task_content_zh,
            task_content_en: t.task_content_en,
            completed: false,
        }));
        this.renderTasks();
    },

    renderTasks() {
        const list = document.getElementById('task-list');
        if (!list) return;
        list.innerHTML = this.currentTasks.map(t =>
            `<li class="${t.completed ? 'completed' : ''}">${t.text}</li>`
        ).join('');
    },

    async evaluateUserMessage(userMessage) {
        const open = this.currentTasks.filter(t => !t.completed)
            .map(t => ({ id: t.id, question: t.task_content_en || t.text }));
        if (open.length === 0) return;
        try {
            const r = await fetch('/api/task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'evaluate_tasks', scenario: this.state.currentScenario, userMessage, currentTasks: open }),
            });
            const d = await r.json();
            if (d.completedIds && d.completedIds.length > 0) {
                this.currentTasks.forEach(t => {
                    if (d.completedIds.includes(t.id)) {
                        t.completed = true;
                        this.showToast(`🎯 任務完成：${t.text}`);
                        this.state.stats.taskCount++;
                        this.saveStats();
                    }
                });
                this.renderTasks();
            }
        } catch(e) { console.error('Eval error:', e); }
    },

    showTasks()  { document.getElementById('task-modal').classList.remove('hidden'); },
    hideTasks()  { document.getElementById('task-modal').classList.add('hidden'); },

    // ── Vocab — AI extraction from every bot reply ────────────────────────────

    /**
     * Called after every bot reply.
     * Fires a background request to /api/vocab, which uses Gemini to extract
     * sustainability vocabulary from the reply text.
     * Covers ALL 17 SDGs — not just the environmental ones.
     */
    async _extractAndSaveVocab(botReply) {
        // Don't block the UI — fire and forget
        try {
            const r = await fetch('/api/vocab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    botReply,
                    scenario: this.state.currentScenario,
                    topicId: this.state.currentTopicId,
                }),
            });
            const d = await r.json();
            if (!d.words || d.words.length === 0) return;

            const stored = this._loadVocab();
            let added = 0;

            d.words.forEach(entry => {
                const existing = stored.find(v => v.word.toLowerCase() === entry.word.toLowerCase());
                if (!existing) {
                    stored.push({
                        word: entry.word,
                        zh: entry.zh,
                        sdgs: entry.sdgs,
                        topicId: entry.topicId,
                        learnedAt: new Date().toISOString(),
                        seen: 1,
                        source: 'ai', // marks as AI-extracted
                    });
                    added++;
                } else {
                    existing.seen = (existing.seen || 1) + 1;
                }
            });

            this._saveVocab(stored);

            if (added > 0) {
                // Small subtle toast — different from task completion
                setTimeout(() => this.showToast(`📖 +${added} 個新單字加入單字庫`), 800);
            }
        } catch(e) {
            // Silently fail — vocab extraction is best-effort
            console.warn('Vocab extraction failed:', e);
        }
    },

    /**
     * Seeds vocab from the static VOCAB_BY_TOPIC dictionary when a scenario starts.
     * This ensures every topic has at least some words even before the conversation begins.
     */
    _awardVocab(topicId) {
        const words = VOCAB_BY_TOPIC[topicId];
        if (!words || words.length === 0) return;

        const stored = this._loadVocab();
        let added = 0;
        words.forEach(entry => {
            if (!stored.find(v => v.word === entry.word)) {
                stored.push({
                    word: entry.word,
                    zh: entry.zh,
                    sdgs: entry.sdgs,
                    topicId,
                    learnedAt: new Date().toISOString(),
                    seen: 1,
                    source: 'seed',
                });
                added++;
            } else {
                const existing = stored.find(v => v.word === entry.word);
                if (existing) existing.seen = (existing.seen || 1) + 1;
            }
        });
        this._saveVocab(stored);

        if (added > 0) {
            setTimeout(() => this.showToast(`📖 新增 ${added} 個永續單字！`), 1000);
        }
    },

    _loadVocab() {
        try { return JSON.parse(localStorage.getItem('langquest_vocab') || '[]'); }
        catch(e) { return []; }
    },

    _saveVocab(vocab) {
        localStorage.setItem('langquest_vocab', JSON.stringify(vocab));
    },

    // ── Vocab view ────────────────────────────────────────────────────────────

    _vocabFilter: 'all',
    _vocabSearch: '',

    renderVocab() {
        const vocab = this._loadVocab();

        // Collect all SDG numbers present in vocab (supports 1–17)
        const sdgsInVocab = new Set();
        vocab.forEach(v => (v.sdgs || []).forEach(s => sdgsInVocab.add(s)));

        const filterContainer = document.getElementById('vocab-sdg-filters');
        filterContainer.innerHTML = `
            <button class="sdg-filter-btn ${this._vocabFilter === 'all' ? 'active' : ''}"
                onclick="app.setVocabSdgFilter('all')">全部 (${vocab.length})</button>
            ${Array.from(sdgsInVocab).sort((a,b)=>a-b).map(s => {
                const m = SDG_META[s];
                const count = vocab.filter(v => (v.sdgs||[]).includes(s)).length;
                return m ? `<button class="sdg-filter-btn ${this._vocabFilter == s ? 'active' : ''}"
                    onclick="app.setVocabSdgFilter(${s})"
                    style="${this._vocabFilter == s ? `background:${m.color}20;border-color:${m.color};color:${m.color}` : ''}">
                    ${m.emoji} ${m.label} (${count})
                </button>` : '';
            }).join('')}`;

        let filtered = vocab;
        if (this._vocabFilter !== 'all') {
            filtered = filtered.filter(v => (v.sdgs||[]).includes(Number(this._vocabFilter)));
        }
        if (this._vocabSearch) {
            const q = this._vocabSearch.toLowerCase();
            filtered = filtered.filter(v => v.word.toLowerCase().includes(q) || v.zh.includes(q));
        }

        const empty = document.getElementById('vocab-empty');
        const grid = document.getElementById('vocab-grid');

        if (filtered.length === 0) {
            empty.classList.remove('hidden');
            grid.innerHTML = '';
            return;
        }
        empty.classList.add('hidden');

        grid.innerHTML = filtered.map(v => {
            const sdgPills = (v.sdgs || []).map(s => {
                const m = SDG_META[s];
                return m ? `<span class="sdg-pill" style="background:${m.color}20;color:${m.color};border-color:${m.color}40">${m.emoji} ${m.label}</span>` : '';
            }).join('');
            const date = v.learnedAt ? new Date(v.learnedAt).toLocaleDateString('zh-TW') : '';
            const sourceIcon = v.source === 'ai' ? '🤖' : '📌';
            return `
            <div class="vocab-card" onclick="app.openVocabModal('${v.word.replace(/'/g,"\\'")}')">
                <div class="vocab-word">${v.word}</div>
                <div class="vocab-zh">${v.zh}</div>
                <div class="vocab-pills">${sdgPills}</div>
                <div class="vocab-meta">${sourceIcon} ${date} · 出現 ${v.seen || 1} 次</div>
            </div>`;
        }).join('');
    },

    setVocabSdgFilter(sdg) {
        this._vocabFilter = sdg;
        this.renderVocab();
    },

    filterVocab(q) {
        this._vocabSearch = q;
        this.renderVocab();
    },

    openVocabModal(word) {
        const vocab = this._loadVocab();
        const v = vocab.find(x => x.word === word);
        if (!v) return;

        const sdgPills = (v.sdgs || []).map(s => {
            const m = SDG_META[s];
            return m ? `
            <div class="vocab-sdg-detail" style="border-left:3px solid ${m.color};background:${m.color}10">
                <span style="font-size:1.4rem">${m.emoji}</span>
                <div>
                    <div style="font-weight:600;color:${m.color}">${m.label}: ${m.name}</div>
                </div>
            </div>` : '';
        }).join('');

        const sourceLabel = v.source === 'ai'
            ? '<span style="font-size:0.75rem;color:var(--teal-bright)">🤖 AI 對話中學到</span>'
            : '<span style="font-size:0.75rem;color:var(--text-dim)">📌 主題詞彙</span>';

        document.getElementById('vocab-modal-body').innerHTML = `
            <div style="margin-bottom:1.2rem">
                <div style="font-size:1.8rem;font-weight:700;margin-bottom:0.3rem">${v.word}</div>
                <div style="font-size:1.1rem;color:var(--text-muted);margin-bottom:0.5rem">${v.zh}</div>
                <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.5rem">${sourceLabel}</div>
                <div style="font-size:0.8rem;color:var(--text-dim)">出現 ${v.seen || 1} 次 · 首次學習 ${v.learnedAt ? new Date(v.learnedAt).toLocaleDateString('zh-TW') : ''}</div>
            </div>
            <div style="margin-bottom:1rem">
                <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin-bottom:0.6rem">相關 SDG 目標</div>
                <div style="display:flex;flex-direction:column;gap:0.5rem">${sdgPills}</div>
            </div>`;

        document.getElementById('vocab-modal').classList.remove('hidden');
    },

    closeVocabModal() {
        document.getElementById('vocab-modal').classList.add('hidden');
    },

    // ── Toast ─────────────────────────────────────────────────────────────────

    showToast(msg) {
        const t = document.createElement('div');
        t.className = 'toast';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3500);
    },

    // ── Badges ────────────────────────────────────────────────────────────────

    loadStats() {
        const vocab = this._loadVocab();
        document.getElementById('stat-streak').textContent    = this.state.stats.streak;
        document.getElementById('stat-completed').textContent = this.state.stats.taskCount;
        document.getElementById('stat-vocab').textContent     = vocab.length;
        const avg = this.state.stats.sessions > 0
            ? (this.state.stats.rounds / this.state.stats.sessions).toFixed(1) : 0;
        document.getElementById('stat-rounds').textContent = avg;
        this.renderBadges(this.state.stats.taskCount, this.state.stats.streak, vocab.length);
    },

    renderBadges(taskCount, streak, vocabCount) {
        const grid = document.getElementById('badges-grid');
        const badges = [
            { icon: '🐣', title: '初學起步',   req: '完成 1 個任務',     earned: taskCount  >= 1  },
            { icon: '💬', title: '侃侃而談',   req: '完成 5 個任務',     earned: taskCount  >= 5  },
            { icon: '🌟', title: '在地專家',   req: '完成 10 個任務',    earned: taskCount  >= 10 },
            { icon: '🗺️', title: '地圖探索家', req: '完成 20 個任務',    earned: taskCount  >= 20 },
            { icon: '🔥', title: '持之以恆',   req: '連續 3 天學習',     earned: streak     >= 3  },
            { icon: '🏆', title: '高雄通',     req: '連續 7 天學習',     earned: streak     >= 7  },
            { icon: '📖', title: '永續學者',   req: '蒐集 10 個永續單字', earned: vocabCount >= 10 },
            { icon: '🌍', title: 'SDG 達人',   req: '蒐集 30 個永續單字', earned: vocabCount >= 30 },
            { icon: '🎓', title: '永續博士',   req: '蒐集 60 個永續單字', earned: vocabCount >= 60 },
        ];
        grid.innerHTML = badges.map(b => `
            <div class="badge-card ${b.earned ? 'earned' : 'locked'}">
                <div class="icon">${b.icon}</div>
                <h4>${b.title}</h4>
                <p>${b.req}</p>
            </div>`).join('');
    },

    // ── Voice input ───────────────────────────────────────────────────────────

    _recognition: null,
    _isRecording: false,

    toggleMic() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showToast('⚠️ 您的瀏覽器不支援語音輸入（請使用 Chrome 或 Edge）');
            return;
        }
        if (this._isRecording) { this._stopMic(); } else { this._startMic(); }
    },

    _startMic() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        this._recognition = new SR();
        this._recognition.lang = 'en-US';
        this._recognition.continuous = false;
        this._recognition.interimResults = true;

        const btn = document.getElementById('mic-btn');
        const input = document.getElementById('chat-input');

        this._recognition.onstart = () => {
            this._isRecording = true;
            btn.classList.add('recording');
            input.placeholder = '正在聆聽…';
        };
        this._recognition.onresult = e => {
            const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
            input.value = transcript;
        };
        this._recognition.onend = () => {
            this._stopMic();
            if (input.value.trim()) this.sendMessage();
        };
        this._recognition.onerror = e => {
            this._stopMic();
            if (e.error !== 'aborted') this.showToast(`⚠️ 語音錯誤：${e.error}`);
        };
        this._recognition.start();
    },

    _stopMic() {
        this._isRecording = false;
        const btn = document.getElementById('mic-btn');
        const input = document.getElementById('chat-input');
        if (btn) btn.classList.remove('recording');
        if (input) input.placeholder = '用英文輸入或按麥克風說話…';
        if (this._recognition) {
            this._recognition.abort();
            this._recognition = null;
        }
    },

    // ── Audio output ──────────────────────────────────────────────────────────

    _ttsEnabled: false,

    toggleTts() {
        this._ttsEnabled = !this._ttsEnabled;
        const btn = document.getElementById('tts-toggle-btn');
        if (btn) {
            btn.classList.toggle('tts-active', this._ttsEnabled);
            btn.textContent = this._ttsEnabled ? '🔊 朗讀' : '🔈 朗讀';
        }
        if (!this._ttsEnabled) speechSynthesis.cancel();
    },

    _speak(text) {
        if (!this._ttsEnabled) return;
        speechSynthesis.cancel();
        const plain = text
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/^#{1,3}\s+/gm, '')
            .replace(/^[-*]\s+/gm, '')
            .replace(/^\d+\.\s+/gm, '');

        const utt = new SpeechSynthesisUtterance(plain);
        utt.lang = 'en-US';
        utt.rate = 0.92;
        utt.pitch = 1.0;

        const voices = speechSynthesis.getVoices();
        const preferred = voices.find(v =>
            v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
        ) || voices.find(v => v.lang.startsWith('en'));
        if (preferred) utt.voice = preferred;

        speechSynthesis.speak(utt);
    },
};

document.addEventListener('DOMContentLoaded', () => app.init());