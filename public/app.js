const app = {
    data: null,
    map: null,
    state: {
        currentView: 'home',
        currentScenario: null,
        currentTopicId: null,
        currentLocationIcon: '',
        messages: [],
        showTranslations: false,
        stats: {
            taskCount: 0,
            streak: 1,
            rounds: 0,
            sessions: 0
        }
    },
    currentTasks: [],

    async init() {
        this.loadStatsFromStorage();
        await this.loadAppJson();
        this.navigate('home');
    },

    async loadAppJson() {
        try {
            const response = await fetch('/kaohsiung_tour_data.json');
            this.data = await response.json();
        } catch(e) {
            console.error('Failed to load JSON data:', e);
        }
    },

    loadStatsFromStorage() {
        try {
            const savedStats = localStorage.getItem('langquest_stats');
            const lastDate = localStorage.getItem('langquest_last_date');
            const today = new Date().toDateString();

            if (savedStats) {
                this.state.stats = { ...this.state.stats, ...JSON.parse(savedStats) };
                if (lastDate !== today) {
                    if (lastDate) {
                        const diffDays = Math.floor((new Date() - new Date(lastDate)) / (1000 * 3600 * 24));
                        if (diffDays === 1) this.state.stats.streak++;
                        else if (diffDays > 1) this.state.stats.streak = 1;
                    }
                    localStorage.setItem('langquest_last_date', today);
                    this.saveStats();
                }
            } else {
                localStorage.setItem('langquest_last_date', today);
            }
        } catch(e) {
            console.error('Storage error:', e);
        }
    },

    saveStats() {
        localStorage.setItem('langquest_stats', JSON.stringify(this.state.stats));
    },

    navigate(viewId) {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        this.state.currentView = viewId;

        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeNavBtn = document.getElementById(`nav-${viewId}`);
        if (activeNavBtn) activeNavBtn.classList.add('active');

        if (viewId === 'scenarios') {
            // Wait for the element to be visible and sized before initialising Leaflet
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.initMap();
                    if (this.map) {
                        this.map.invalidateSize();
                    }
                });
            });
        }
        if (viewId === 'badges') {
            this.loadStats();
        }
    },

    // ── Map ──────────────────────────────────────────────────────────────────

    // Area color mapping
    areaColors: {
        1: '#4f46e5', // Love River — indigo
        2: '#0891b2', // Sizihwan — cyan
        3: '#d97706', // Food — amber
        4: '#dc2626', // Culture/Districts — red
        5: '#059669', // Parks — emerald
    },

    initMap() {
        if (!this.data) return;

        const mapEl = document.getElementById('map');
        if (!mapEl) return;

        // Already initialised — just refresh size
        if (this.map) {
            this.map.invalidateSize();
            return;
        }

        this.map = L.map('map', {
            center: [22.638, 120.298],
            zoom: 12,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18,
        }).addTo(this.map);

        // Group topics by location_id
        const topicsByLocation = {};
        this.data.topics.forEach(t => {
            if (!topicsByLocation[t.location_id]) topicsByLocation[t.location_id] = [];
            topicsByLocation[t.location_id].push(t);
        });

        // Place a marker for each location that has coordinates
        this.data.locations.forEach(loc => {
            if (!loc.lat || !loc.lng) return;

            const topics = topicsByLocation[loc.id] || [];
            if (topics.length === 0) return;

            const color = this.areaColors[loc.area_id] || '#4f46e5';

            const icon = L.divIcon({
                className: '',
                html: `
                    <div class="map-pin" style="
                        width: 38px; height: 38px;
                        border: 2.5px solid ${color};
                        box-shadow: 0 4px 14px ${color}55;
                    ">
                        <span style="font-size:1.05rem; line-height:1">${loc.icon}</span>
                        <span class="pin-badge" style="background:${color}">${topics.length}</span>
                    </div>`,
                iconSize: [38, 38],
                iconAnchor: [19, 19],
                popupAnchor: [0, -22],
            });

            const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(this.map);
            marker.on('click', () => this.showLocationPanel(loc, topics));
        });

        // Slight delay to ensure container is sized
        setTimeout(() => this.map.invalidateSize(), 150);
    },

    showLocationPanel(loc, topics) {
        const area = this.data.areas.find(a => a.id === loc.area_id);
        const color = this.areaColors[loc.area_id] || '#4f46e5';

        document.getElementById('panel-location-icon').textContent = loc.icon;
        document.getElementById('panel-location-name').textContent = loc.name_zh;
        document.getElementById('panel-location-meta').textContent =
            `${loc.name_en}${area ? ' · ' + area.name_zh : ''}`;

        const list = document.getElementById('panel-topic-list');
        list.innerHTML = topics.map(t => `
            <div class="topic-card" onclick="app.startScenario(${JSON.stringify(t).replace(/"/g, '&quot;')}, '${loc.icon}')">
                <div class="topic-card-zh">${t.title_zh}</div>
                <div class="topic-card-en">${t.title_en}</div>
            </div>
        `).join('');

        const panel = document.getElementById('location-panel');
        panel.classList.remove('hidden');
        // Re-trigger animation
        panel.style.animation = 'none';
        panel.offsetHeight; // reflow
        panel.style.animation = '';
    },

    closeLocationPanel() {
        document.getElementById('location-panel').classList.add('hidden');
    },

    // ── Chat ─────────────────────────────────────────────────────────────────

    async startScenario(topic, locationIcon = '') {
        this.state.currentScenario = topic.title_en;
        this.state.currentTopicId = topic.id;
        this.state.currentLocationIcon = locationIcon;

        document.getElementById('chat-scenario-title').textContent = topic.title_zh;
        document.getElementById('chat-location-icon').textContent = locationIcon;
        document.getElementById('chat-messages').innerHTML = '';

        // Reset message history
        this.state.messages = [];

        this.state.stats.sessions++;
        this.saveStats();

        this.navigate('chat');
        this.closeLocationPanel();
        this.loadTasksForScenario(topic.id);

        const typingId = this.showTypingIndicator();
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenario: topic.title_en, messages: [] })
            });
            const data = await response.json();
            this.removeTypingIndicator(typingId);
            if (data.reply) {
                this.addMessageToUI('bot', data.reply, data.translation);
            }
        } catch(error) {
            this.removeTypingIndicator(typingId);
            this.addMessageToUI('bot',
                `Welcome! Let's talk about ${topic.title_en}.`,
                `歡迎！讓我們聊聊${topic.title_zh}。`
            );
        }
    },

    showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.className = 'message bot typing';
        div.id = id;
        div.innerHTML = '<span style="letter-spacing:2px">•••</span>';
        document.getElementById('chat-messages').appendChild(div);
        this._scrollToBottom();
        return id;
    },

    removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    },

    addMessageToUI(role, content, translation = '') {
        const container = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.className = `message ${role}${this.state.showTranslations && translation ? ' show-translation' : ''}`;

        const safe = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        div.innerHTML = `<div class="content">${safe(content)}</div>` +
            (translation ? `<div class="translation">${safe(translation)}</div>` : '');

        container.appendChild(div);
        this._scrollToBottom();
    },

    _scrollToBottom() {
        const c = document.getElementById('chat-messages');
        if (c) c.scrollTop = c.scrollHeight;
    },

    handleInputKeypress(e) {
        if (e.key === 'Enter') this.sendMessage();
    },

    async sendMessage() {
        const inputEl = document.getElementById('chat-input');
        const text = inputEl.value.trim();
        if (!text) return;

        inputEl.value = '';

        // Show in UI immediately
        this.addMessageToUI('user', text);

        // Snapshot history BEFORE adding the new user message
        const historyToSend = [...this.state.messages];

        // Now push user message to state
        this.state.messages.push({ role: 'user', content: text });
        this.state.stats.rounds++;
        this.saveStats();

        const typingId = this.showTypingIndicator();

        // Evaluate tasks in parallel (fire and forget)
        this.evaluateUserMessage(text);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scenario: this.state.currentScenario,
                    messages: [...historyToSend, { role: 'user', content: text }]
                })
            });

            const data = await response.json();
            this.removeTypingIndicator(typingId);

            if (data.reply) {
                this.addMessageToUI('bot', data.reply, data.translation);
                this.state.messages.push({ role: 'bot', content: data.reply, translation: data.translation || '' });
            } else {
                this.addMessageToUI('bot', `Error: ${data.error || 'Unknown error'}`);
            }
        } catch(error) {
            this.removeTypingIndicator(typingId);
            this.addMessageToUI('bot', 'Sorry, I had trouble connecting to the server.', '抱歉，無法連接到伺服器。');
        }
    },

    toggleTranslation() {
        this.state.showTranslations = !this.state.showTranslations;
        document.querySelectorAll('.message').forEach(msg => {
            const hasTranslation = msg.querySelector('.translation');
            if (hasTranslation) {
                msg.classList.toggle('show-translation', this.state.showTranslations);
            }
        });
    },

    async requestHint() {
        const typingId = this.showTypingIndicator();
        try {
            const response = await fetch('/api/task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'request_hint',
                    scenario: this.state.currentScenario,
                    history: this.state.messages
                })
            });
            const data = await response.json();
            this.removeTypingIndicator(typingId);
            if (data.hint) {
                document.getElementById('chat-input').value = data.hint;
                document.getElementById('chat-input').focus();
            }
        } catch(e) {
            this.removeTypingIndicator(typingId);
        }
    },

    // ── Tasks ────────────────────────────────────────────────────────────────

    loadTasksForScenario(topicId) {
        if (!this.data) return;
        const tasks = this.data.tasks.filter(t => t.topic_id === topicId);
        this.currentTasks = tasks.map((task, i) => ({
            id: topicId * 100 + i,
            text: task.task_content_zh,
            task_content_en: task.task_content_en,
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
        const openTasks = this.currentTasks
            .filter(t => !t.completed)
            .map(t => ({ id: t.id, question: t.task_content_en || t.text }));
        if (openTasks.length === 0) return;

        try {
            const response = await fetch('/api/task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'evaluate_tasks',
                    scenario: this.state.currentScenario,
                    userMessage,
                    currentTasks: openTasks
                })
            });
            const data = await response.json();
            if (data.completedIds && data.completedIds.length > 0) {
                this.currentTasks.forEach(t => {
                    if (data.completedIds.includes(t.id)) {
                        t.completed = true;
                        this.showToast(`🎯 任務完成：${t.text}`);
                        this.state.stats.taskCount++;
                        this.saveStats();
                    }
                });
                this.renderTasks();
            }
        } catch(e) {
            console.error('Eval error:', e);
        }
    },

    showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    },

    showTasks() { document.getElementById('task-modal').classList.remove('hidden'); },
    hideTasks() { document.getElementById('task-modal').classList.add('hidden'); },

    // ── Badges ───────────────────────────────────────────────────────────────

    loadStats() {
        document.getElementById('stat-streak').textContent = this.state.stats.streak;
        document.getElementById('stat-completed').textContent = this.state.stats.taskCount;
        const avg = this.state.stats.sessions > 0
            ? (this.state.stats.rounds / this.state.stats.sessions).toFixed(1)
            : 0;
        document.getElementById('stat-rounds').textContent = avg;
        this.renderBadges(this.state.stats.taskCount, this.state.stats.streak);
    },

    renderBadges(taskCount, streak) {
        const grid = document.getElementById('badges-grid');
        const badges = [
            { icon: '🐣', title: '初學起步', req: '完成 1 個任務', earned: taskCount >= 1 },
            { icon: '💬', title: '侃侃而談', req: '完成 5 個任務', earned: taskCount >= 5 },
            { icon: '🌟', title: '在地專家', req: '完成 10 個任務', earned: taskCount >= 10 },
            { icon: '🗺️', title: '地圖探索家', req: '完成 20 個任務', earned: taskCount >= 20 },
            { icon: '🔥', title: '持之以恆', req: '連續 3 天學習', earned: streak >= 3 },
            { icon: '🏆', title: '高雄通', req: '連續 7 天學習', earned: streak >= 7 },
        ];

        grid.innerHTML = badges.map(b => `
            <div class="badge-card ${b.earned ? 'earned' : 'locked'}">
                <div class="icon">${b.icon}</div>
                <h4>${b.title}</h4>
                <p>${b.req}</p>
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());