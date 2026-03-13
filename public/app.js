const app = {
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

    init() {
        console.log("App initialized");
        this.navigate('home');
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
        const grid = document.getElementById('topics-grid');
        grid.innerHTML = '';
        
        const topics = [
            { id: 1, title_zh: '當地市場', title_en: 'market', icon: '🛒', desc: '練習購物、殺價及詢問商品。' },
            { id: 2, title_zh: '文化節慶', title_en: 'festival', icon: '🏮', desc: '學習描述傳統、活動與感受。' },
            { id: 3, title_zh: '農漁特產', title_en: 'agrifood', icon: '🌾', desc: '討論農業、當地特產及食物來源。' },
            { id: 4, title_zh: '市區導覽', title_en: 'city tour', icon: '🗺️', desc: '學習問路、搭乘交通工具。' },
            { id: 5, title_zh: '餐廳點餐', title_en: 'dining', icon: '🍽️', desc: '練習看菜單、點餐與結帳。' }
        ];
        
        topics.forEach((topic, index) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.style.animationDelay = `${index * 0.1}s`;
            card.onclick = () => this.startScenario(topic);
            
            card.innerHTML = `
                <div class="icon-wrapper"><div class="icon">${topic.icon}</div></div>
                <div class="card-content">
                    <h3>${topic.title_zh}</h3>
                    <p class="subtitle">${topic.title_en.toUpperCase()}</p>
                    <p class="desc">${topic.desc}</p>
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

        this.navigate('chat');
        this.loadTasksForScenario(topic.id);
        
        const typingId = this.showTypingIndicator();
        try {
            // Mock offline response instead of calling backend
            await new Promise(resolve => setTimeout(resolve, 800));
            this.removeTypingIndicator(typingId);
            this.addMessageToUI('bot', `Hello! Welcome to the ${topic.title_en}. I am the vendor. How can I assist you today?`, `你好！歡迎來到${topic.title_zh}。我是老闆，今天能為您提供什麼協助？`);
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

            // Mock an offline response
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.removeTypingIndicator(typingId);
            
            const mockResponses = [
                {en: "That sounds great! Would you like anything else?", zh: "聽起來很棒！您還需要點什麼嗎？"},
                {en: "I see. Let me think about that.", zh: "我明白了。讓我想一下。"},
                {en: "Could you repeat that?", zh: "您可以再說一次嗎？"},
                {en: "Perfect, let's do it.", zh: "完美，就這麼辦吧。"},
                {en: "How about we try another approach?", zh: "我們試試其他方法如何？"}
            ];
            const randomReply = mockResponses[Math.floor(Math.random() * mockResponses.length)];
            
            this.addMessageToUI('bot', randomReply.en, randomReply.zh);
            
        } catch (error) {
            this.removeTypingIndicator(typingId);
            this.addMessageToUI('bot', "Sorry, an error occurred offline.", "抱歉，離線時發生錯誤。");
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
            await new Promise(resolve => setTimeout(resolve, 500));
            this.removeTypingIndicator(typingId);
            const openTasks = this.currentTasks.filter(t => !t.completed);
            if (openTasks.length > 0) {
                document.getElementById('chat-input').value = `How do I ${openTasks[0].task_content_en.toLowerCase()}?`;
            } else {
                document.getElementById('chat-input').value = `What should I say next?`;
            }
        } catch (e) {
            this.removeTypingIndicator(typingId);
            console.error("Hint error:", e);
        }
    },

    async loadTasksForScenario(topicId) {
        const tasksMock = {
            1: [
                { id: 1, text: "詢問商品價格", task_content_en: "Ask for the price of an item", completed: false },
                { id: 2, text: "嘗試殺價", task_content_en: "Bargain for a lower price", completed: false }
            ],
            2: [
                { id: 3, text: "詢問一個節慶傳統", task_content_en: "Ask about a festival tradition", completed: false }
            ],
            3: [
                { id: 4, text: "詢問食物的來源", task_content_en: "Ask where the food is sourced", completed: false }
            ],
            4: [
                { id: 5, text: "請問怎麼去捷運站", task_content_en: "Ask for directions to the MRT station", completed: false }
            ],
            5: [
                { id: 6, text: "點一杯珍珠奶茶", task_content_en: "Order a bubble tea", completed: false }
            ]
        };
        
        this.currentTasks = tasksMock[topicId] || [];
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
        const openTasks = this.currentTasks.filter(t => !t.completed);
        if(openTasks.length === 0) return;

        // Offline mock evaluation: If the user says something reasonably long, check off a random task
        if (userMessage.length > 5) {
            const randomTask = openTasks[Math.floor(Math.random() * openTasks.length)];
            randomTask.completed = true;
            this.notifyTaskCompleted(randomTask.text);
            this.state.stats.taskCount++;
            this.renderTasks();
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
