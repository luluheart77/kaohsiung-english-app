// ── Lightweight Markdown → HTML renderer ─────────────────────────────────────
// Supports: **bold**, *italic*, `code`, ## headings, - bullet lists, numbered lists, blank-line paragraphs
function parseMarkdown(text) {
    if (!text) return '';

    // Escape raw HTML first so injected content can't break the page
    const escape = s => s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Split into lines for block-level processing
    const lines = text.split('\n');
    const out = [];
    let inUl = false;
    let inOl = false;

    const closeList = () => {
        if (inUl) { out.push('</ul>'); inUl = false; }
        if (inOl) { out.push('</ol>'); inOl = false; }
    };

    // Inline formatting (applied after escaping)
    const inline = raw => {
        const esc = escape(raw);
        return esc
            // **bold**
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // *italic* (but not **)
            .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
            // `code`
            .replace(/`([^`]+)`/g, '<code>$1</code>');
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Blank line
        if (trimmed === '') {
            closeList();
            out.push('<br>');
            continue;
        }

        // ### Heading (h3)
        if (/^###\s+/.test(trimmed)) {
            closeList();
            out.push(`<h3>${inline(trimmed.replace(/^###\s+/, ''))}</h3>`);
            continue;
        }

        // ## Heading (h2)
        if (/^##\s+/.test(trimmed)) {
            closeList();
            out.push(`<h2>${inline(trimmed.replace(/^##\s+/, ''))}</h2>`);
            continue;
        }

        // # Heading (h1)
        if (/^#\s+/.test(trimmed)) {
            closeList();
            out.push(`<h1>${inline(trimmed.replace(/^#\s+/, ''))}</h1>`);
            continue;
        }

        // Unordered list item: - or * at start
        if (/^[-*]\s+/.test(trimmed)) {
            if (inOl) { out.push('</ol>'); inOl = false; }
            if (!inUl) { out.push('<ul>'); inUl = true; }
            out.push(`<li>${inline(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
            continue;
        }

        // Ordered list item: 1. 2. etc.
        if (/^\d+\.\s+/.test(trimmed)) {
            if (inUl) { out.push('</ul>'); inUl = false; }
            if (!inOl) { out.push('<ol>'); inOl = true; }
            out.push(`<li>${inline(trimmed.replace(/^\d+\.\s+/, ''))}</li>`);
            continue;
        }

        // Normal paragraph line
        closeList();
        out.push(`<p>${inline(trimmed)}</p>`);
    }

    closeList();

    // Clean up consecutive <br> spam from blank lines between blocks
    return out.join('').replace(/(<br>){2,}/g, '<br>');
}

// ── SDG metadata ─────────────────────────────────────────────────────────────
const SDG_META = {
    6:  { label: 'SDG 6',  name: '潔淨水資源',     color: '#26BDE2', emoji: '💧' },
    7:  { label: 'SDG 7',  name: '可負擔的潔淨能源', color: '#FCC30B', emoji: '⚡' },
    11: { label: 'SDG 11', name: '永續城鄉',         color: '#FD9D24', emoji: '🏙️' },
    13: { label: 'SDG 13', name: '氣候行動',         color: '#3F7E44', emoji: '🌡️' },
    14: { label: 'SDG 14', name: '海洋生態',         color: '#0A97D9', emoji: '🌊' },
    15: { label: 'SDG 15', name: '陸域生態',         color: '#56C02B', emoji: '🌿' },
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

// ── Vocab keywords mapped to topics ──────────────────────────────────────────
const VOCAB_BY_TOPIC = {
    1:   [{ word: 'remediation',      zh: '整治／復育',     sdgs: [6,11] },
          { word: 'watershed',        zh: '流域',           sdgs: [6]    }],
    2:   [{ word: 'zero-emission',    zh: '零排放',         sdgs: [7,13] },
          { word: 'sustainable tourism', zh: '永續觀光',    sdgs: [11]   }],
    3:   [{ word: 'sponge city',      zh: '海綿城市',       sdgs: [6,11] },
          { word: 'green infrastructure', zh: '綠色基礎設施', sdgs: [11,13] }],
    4:   [{ word: 'biodiversity',     zh: '生物多樣性',     sdgs: [14,15] },
          { word: 'ecological corridor', zh: '生態廊道',    sdgs: [15]   }],
    7:   [{ word: 'adaptive reuse',   zh: '活化再利用',     sdgs: [11]   },
          { word: 'industrial heritage', zh: '工業遺產',    sdgs: [11]   }],
    9:   [{ word: 'rotating bridge',  zh: '旋轉橋',         sdgs: [11]   }],
    11:  [{ word: 'marine ecology',   zh: '海洋生態',       sdgs: [14]   },
          { word: 'coastal erosion',  zh: '海岸侵蝕',       sdgs: [14]   }],
    13:  [{ word: 'wildlife coexistence', zh: '野生動物共存', sdgs: [15] }],
    15:  [{ word: 'air-raid shelter', zh: '防空洞',         sdgs: [11]   }],
    51:  [{ word: 'urban heat island', zh: '都市熱島效應',  sdgs: [11,13] },
          { word: 'carbon sequestration', zh: '碳封存',     sdgs: [13]   }],
    52:  [{ word: 'habitat restoration', zh: '棲地復育',    sdgs: [15]   }],
    55:  [{ word: 'detention pond',   zh: '滯洪池',         sdgs: [6,11] },
          { word: 'flood governance', zh: '防洪治理',       sdgs: [6]    }],
    56:  [{ word: 'mangrove',         zh: '紅樹林',         sdgs: [14,15] },
          { word: 'wetland buffer',   zh: '濕地緩衝帶',     sdgs: [6,14] }],
    57:  [{ word: 'wind turbine',     zh: '風力發電機',     sdgs: [7]    },
          { word: 'renewable energy', zh: '再生能源',       sdgs: [7,13] }],
    59:  [{ word: 'landfill rehabilitation', zh: '掩埋場復育', sdgs: [11,15] }],
    109: [{ word: 'petrochemical',    zh: '石化工業',       sdgs: [11]   },
          { word: 'environmental justice', zh: '環境正義',  sdgs: [11]   }],
    126: [{ word: 'aquaculture',      zh: '養殖漁業',       sdgs: [14]   }],
    127: [{ word: 'Black-faced Spoonbill', zh: '黑面琵鷺', sdgs: [14,15] },
          { word: 'migratory birds',  zh: '候鳥',           sdgs: [15]   }],
    134: [{ word: 'indigenous conservation', zh: '原住民保育', sdgs: [15] }],
    135: [{ word: 'cultural preservation', zh: '文化保存',  sdgs: [11]   }],
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

    // ── Markdown-aware message renderer ──────────────────────────────────────
    addMessageToUI(role, content, translation = '') {
        const c = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.className = `message ${role}${this.state.showTranslations && translation ? ' show-translation' : ''}`;

        // Bot messages get markdown rendering; user messages are plain-text escaped
        const contentHtml = role === 'bot'
            ? `<div class="content md-body">${parseMarkdown(content)}</div>`
            : `<div class="content">${content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`;

        const translationHtml = translation
            ? `<div class="translation">${translation.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`
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
                        this._awardVocab(this.state.currentTopicId);
                    }
                });
                this.renderTasks();
            }
        } catch(e) { console.error('Eval error:', e); }
    },

    showTasks()  { document.getElementById('task-modal').classList.remove('hidden'); },
    hideTasks()  { document.getElementById('task-modal').classList.add('hidden'); },

    // ── Vocab ─────────────────────────────────────────────────────────────────

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

    _vocabFilter: 'all',
    _vocabSearch: '',

    renderVocab() {
        const vocab = this._loadVocab();

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
            return `
            <div class="vocab-card" onclick="app.openVocabModal('${v.word.replace(/'/g,"\\'")}')">
                <div class="vocab-word">${v.word}</div>
                <div class="vocab-zh">${v.zh}</div>
                <div class="vocab-pills">${sdgPills}</div>
                <div class="vocab-meta">學習於 ${date} · 出現 ${v.seen || 1} 次</div>
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

        document.getElementById('vocab-modal-body').innerHTML = `
            <div style="margin-bottom:1.2rem">
                <div style="font-size:1.8rem;font-weight:700;margin-bottom:0.3rem">${v.word}</div>
                <div style="font-size:1.1rem;color:var(--text-muted);margin-bottom:1rem">${v.zh}</div>
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
        ];
        grid.innerHTML = badges.map(b => `
            <div class="badge-card ${b.earned ? 'earned' : 'locked'}">
                <div class="icon">${b.icon}</div>
                <h4>${b.title}</h4>
                <p>${b.req}</p>
            </div>`).join('');
    },

    // ── Voice input (Speech-to-Text) ──────────────────────────────────────────

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

    // ── Audio output (Text-to-Speech) ─────────────────────────────────────────

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
        // Strip markdown before speaking
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