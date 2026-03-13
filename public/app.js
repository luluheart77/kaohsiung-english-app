const app = {
    data: null,
    state: {
        currentView: 'home',
        currentScenario: null,
        currentTopicId: null,
        messages: [],
        showTranslations: false,
        stats: {
            taskCount: 0,
            streak: 1,
            rounds: 0,
            sessions: 0
        }
    },

    async init() {
        console.log("App initialized");
        this.loadStatsFromStorage();
        await this.loadAppJson();
        this.navigate('home');
    },

    async loadAppJson() {
        try {
            const response = await fetch('/kaohsiung_tour_data.json');
            this.data = await response.json();
            console.log("Loaded local JSON data:", this.data);
        } catch(e) {
            console.error("Failed to load JSON data:", e);
        }
    },

    loadStatsFromStorage() {
        try {
            const savedStats = localStorage.getItem('langquest_stats');
            const lastDate = localStorage.getItem('langquest_last_date');
            const today = new Date().toDateString();
            
            if (savedStats) {
                // Merge with default state structure
                this.state.stats = { ...this.state.stats, ...JSON.parse(savedStats) };
                
                // Track streak safely
                if (lastDate !== today) {
                    if (lastDate) {
                        const lastTime = new Date(lastDate).getTime();
                        const diffDays = Math.floor((new Date().getTime() - lastTime) / (1000 * 3600 * 24));
                        if (diffDays === 1) {
                            this.state.stats.streak++;
                        } else if (diffDays > 1) {
                            this.state.stats.streak = 1; // Reset streak if missed a day
                        }
                    }
                    localStorage.setItem('langquest_last_date', today);
                    this.saveStats();
                }
            } else {
                localStorage.setItem('langquest_last_date', today);
            }
        } catch (e) {
            console.error("Storage error:", e);
        }
    },

    saveStats() {
        localStorage.setItem('langquest_stats', JSON.stringify(this.state.stats));
    },

    navigate(viewId) {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        this.state.currentView = viewId;

        if (viewId === 'scenarios') {
            this.loadTopics();
        }

        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeNavBtn = document.getElementById(`nav-${viewId}`);
        if(activeNavBtn) activeNavBtn.classList.add('active');
        
        if (typeof analytics !== 'undefined') analytics.track('page_view', { page: viewId });
    },

    async loadTopics() {
        if (!this.data) return;
        const grid = document.getElementById('topics-grid');
        grid.innerHTML = '';
        
        // Let's only list the first 12 topics so it doesn't get overwhelmingly long for now.
        const topics = this.data.topics.slice(0, 12);
        
        topics.forEach((topic, index) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.style.animationDelay = `${index * 0.05}s`;
            card.onclick = () => this.startScenario(topic);
            
            // Find the location icon
            const location = this.data.locations.find(l => l.id === topic.location_id);
            const icon = location ? location.icon : "📍";
            
            card.innerHTML = `
                <div class="icon-wrapper"><div class="icon">${icon}</div></div>
                <div class="card-content">
                    <h3>${topic.title_zh}</h3>
                    <p class="subtitle">${topic.title_en.toUpperCase()}</p>
                    <p class="desc">${location ? location.name_zh : ''}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    },

    async startScenario(topic) {
        if (typeof analytics !== 'undefined') analytics.track('start_scenario', { scenario: topic.title_en });
        
        this.state.currentScenario = topic.title_en;
        this.state.currentTopicId = topic.id;
        
        document.getElementById('chat-scenario-title').innerText = topic.title_zh;
        
        document.getElementById('chat-messages').innerHTML = '';
        this.state.messages = [];
        
        // Mock session stats
        this.state.stats.sessions++;
        this.saveStats();

        this.navigate('chat');
        this.loadTasksForScenario(topic.id);
        
        const typingId = this.showTypingIndicator();
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scenario: topic.title_en,
                    messages: []
                })
            });
            const data = await response.json();
            this.removeTypingIndicator(typingId);
            
            if (data.reply) {
                this.addMessageToUI('bot', data.reply, data.translation);
            }
        } catch (error) {
            console.error(error);
            this.removeTypingIndicator(typingId);
            this.addMessageToUI('bot', `Welcome to the ${topic.title_en}. How can I help you today?`, `歡迎來到${topic.title_zh}。今天我能如何幫忙？`);
        }
    },

    showTypingIndicator() {
        const typingId = 'msg-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = `message bot typing`;
        msgDiv.id = typingId;
        msgDiv.innerHTML = `<div class="content"><span style="font-size: 1.5rem; line-height: 0.5;">...</span></div>`;
        document.getElementById('chat-messages').appendChild(msgDiv);
        document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
        return typingId;
    },

    removeTypingIndicator(typingId) {
        const el = document.getElementById(typingId);
        if (el) el.remove();
    },

    addMessageToUI(role, content, translation = "") {
        const messagesContainer = document.getElementById('chat-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role} ${this.state.showTranslations ? 'show-translation' : ''}`;
        
        const safeContent = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const safeTranslation = translation ? translation.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";

        let innerHTML = `<div class="content">${safeContent}</div>`;
        if (translation) innerHTML += `<div class="translation">${safeTranslation}</div>`;
        
        msgDiv.innerHTML = innerHTML;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.state.messages.push({ role, content, translation });
        
        if (role === 'user') {
            this.state.stats.rounds++;
            this.saveStats();
        }
    },

    handleInputKeypress(event) {
        if (event.key === 'Enter') this.sendMessage();
    },

    async sendMessage() {
        const inputEl = document.getElementById('chat-input');
        const text = inputEl.value.trim();
        if (!text) return;
        
        this.addMessageToUI('user', text);
        inputEl.value = '';
        
        const typingId = this.showTypingIndicator();
        
        try {
            this.evaluateUserMessageSync(text);

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scenario: this.state.currentScenario,
                    messages: this.state.messages
                })
            });

            const data = await response.json();
            this.removeTypingIndicator(typingId);
            
            if (data.reply) {
                this.addMessageToUI('bot', data.reply, data.translation);
            } else {
                this.addMessageToUI('bot', "Sorry, I had trouble processing that.", "抱歉，我無法處理這個訊息。");
            }
            
        } catch (error) {
            this.removeTypingIndicator(typingId);
            this.addMessageToUI('bot', "Sorry, I had trouble connecting to the server.", "抱歉，無法連接到伺服器。");
            console.error(error);
        }
    },

    toggleTranslation() {
        this.state.showTranslations = !this.state.showTranslations;
        document.querySelectorAll('.message').forEach(msg => {
            msg.classList.toggle('show-translation', this.state.showTranslations);
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
            if(data.hint) {
                document.getElementById('chat-input').value = data.hint;
            }
        } catch (e) {
            this.removeTypingIndicator(typingId);
            console.error("Hint error:", e);
        }
    },

    async loadTasksForScenario(topicId) {
        if(!this.data) return;
        
        const tasks = this.data.tasks.filter(t => t.topic_id === topicId);
        
        this.currentTasks = tasks.map((task, index) => ({
            id: topicId * 100 + index, // Generate unique ID for evaluator
            text: task.task_content_zh,
            task_content_en: task.task_content_en,
            completed: false
        }));
        
        this.renderTasks();
    },

    renderTasks() {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';
        
        this.currentTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            li.innerText = task.text;
            taskList.appendChild(li);
        });
    },

    async evaluateUserMessageSync(userMessage) {
        const openTasks = this.currentTasks.filter(t => !t.completed).map(t => ({ id: t.id, question: t.task_content_en || t.text }));
        if(openTasks.length === 0) return;

        try {
            const response = await fetch('/api/task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'evaluate_tasks',
                    scenario: this.state.currentScenario,
                    userMessage: userMessage,
                    currentTasks: openTasks
                })
            });
            const data = await response.json();
            if(data.completedIds && data.completedIds.length > 0) {
                this.currentTasks.forEach(t => {
                    if (data.completedIds.includes(t.id)) {
                        t.completed = true;
                        this.notifyTaskCompleted(t.text);
                        this.state.stats.taskCount++;
                        this.saveStats();
                    }
                });
                this.renderTasks();
            }
        } catch (e) {
            console.error("Eval error", e);
        }
    },

    notifyTaskCompleted(taskText) {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.background = 'var(--success)';
        toast.style.color = '#fff';
        toast.style.padding = '1rem 1.5rem';
        toast.style.borderRadius = '100px';
        toast.style.zIndex = '1000';
        toast.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
        toast.style.animation = 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        toast.style.fontWeight = '600';
        toast.innerText = `🎯 任務完成：${taskText}`;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    },

    showTasks() { document.getElementById('task-modal').classList.remove('hidden'); },
    hideTasks() { document.getElementById('task-modal').classList.add('hidden'); },

    async loadStats() {
        document.getElementById('stat-streak').innerText = this.state.stats.streak;
        document.getElementById('stat-completed').innerText = this.state.stats.taskCount;

        const avgRounds = this.state.stats.sessions > 0 ? (this.state.stats.rounds / this.state.stats.sessions).toFixed(1) : 0;
        document.getElementById('stat-rounds').innerText = avgRounds;

        this.renderBadges(this.state.stats.taskCount, this.state.stats.streak);
    },

    renderBadges(taskCount, streak) {
        const badgesContainer = document.getElementById('badges-grid');
        badgesContainer.innerHTML = '';

        const availableBadges = [
            { id: 1, title: '初學起步', icon: '🐣', requirement: '完成 1 個任務', earned: taskCount >= 1 },
            { id: 2, title: '侃侃而談', icon: '💬', requirement: '完成 5 個任務', earned: taskCount >= 5 },
            { id: 3, title: '在地專家', icon: '🌟', requirement: '完成 10 個任務', earned: taskCount >= 10 },
            { id: 4, title: '持之以恆', icon: '🔥', requirement: '連續 3 天學習', earned: streak >= 3 }
        ];

        let earnedCount = 0;
        availableBadges.forEach(badge => {
            if (badge.earned) earnedCount++;
            const badgeEl = document.createElement('div');
            badgeEl.className = `badge-card ${badge.earned ? 'earned' : 'locked'}`;
            badgeEl.innerHTML = `
                <div class="icon">${badge.icon}</div>
                <h4>${badge.title}</h4>
                <p>${badge.requirement}</p>
            `;
            badgesContainer.appendChild(badgeEl);
        });

        if(earnedCount === 0) {
            badgesContainer.innerHTML = '<div class="empty-state">尚未獲得徽章。快開始一個情境對話吧！</div>';
        }
    }
};

const originalNavigate = app.navigate.bind(app);
app.navigate = function(viewId) {
    originalNavigate(viewId);
    if(viewId === 'badges') {
        app.loadStats();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
    if(typeof analytics !== 'undefined') analytics.track('app_load');
});

const analytics = {
    track(event, data = {}) {
        console.log(`[Analytics] ${event}`, data);
    }
};
