import React, { useState } from 'react';
import { ChevronRight, MessageCircle, Check, Zap, Award, BarChart3, Globe, MapPin } from 'lucide-react';

const KaohsiungEnglishApp = () => {
  // Mock Data Structure (based on your Supabase schema)
  const mockData = {
    areas: [
      { id: 1, name_zh: '美濃', name_en: 'Meinong' },
      { id: 2, name_zh: '駁二', name_en: 'Pier-2' },
      { id: 3, name_zh: '柴山', name_en: 'Chaishan' }
    ],
    locations: {
      1: [
        { id: 1, name_zh: '紙傘工坊', name_en: 'Oil Paper Umbrella Workshop', icon: '☂️', area_id: 1 },
        { id: 2, name_zh: '粄條文化街', name_en: 'Bǎn Noodle Culture Street', icon: '🍜', area_id: 1 }
      ],
      2: [
        { id: 3, name_zh: '輕軌車站', name_en: 'LRT Station', icon: '🚊', area_id: 2 },
        { id: 4, name_zh: '美食廣場', name_en: 'Food Court', icon: '🍲', area_id: 2 }
      ],
      3: [
        { id: 5, name_zh: '猴子森林', name_en: 'Monkey Forest', icon: '🐵', area_id: 3 },
        { id: 6, name_zh: '步道觀景台', name_en: 'Scenic Viewpoint', icon: '🏔️', area_id: 3 }
      ]
    },
    topics: {
      1: { id: 1, title_zh: '購買油紙傘', title_en: 'Buying Oil Paper Umbrella', location_id: 1, progress: 40 },
      2: { id: 2, title_zh: '品嚐粄條', title_en: 'Tasting Bǎn Noodles', location_id: 2, progress: 60 },
      3: { id: 3, title_zh: '搭乘輕軌', title_en: 'Taking the LRT', location_id: 3, progress: 20 },
      4: { id: 4, title_zh: '探索猴子森林', title_en: 'Exploring Monkey Forest', location_id: 5, progress: 0 }
    },
    tasks: {
      1: [
        { id: 1, content_zh: '商人會說什麼歡迎詞？', content_en: 'What greeting would the shopkeeper say?', type: 'multiple-choice', options: ['Hello!', 'Welcome!', 'Good morning!'] },
        { id: 2, content_zh: '配對顏色單字', content_en: 'Match color words', type: 'matching', pairs: [{ left: '紅色', right: 'Red' }] },
        { id: 3, content_zh: '用英文描述油紙傘', content_en: 'Describe the umbrella in English', type: 'speaking' }
      ]
    }
  };

  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentTask, setCurrentTask] = useState(0);
  const [userStats, setUserStats] = useState({ tasksCompleted: 3, score: 85, streak: 5 });

  // Navigation Functions
  const goHome = () => setCurrentScreen('home');
  const selectArea = (areaId) => {
    setSelectedArea(areaId);
    setCurrentScreen('locations');
  };
  const selectLocation = (locationId) => {
    setSelectedLocation(locationId);
    setCurrentScreen('topics');
  };
  const selectTopic = (topicId) => {
    setSelectedTopic(topicId);
    setConversationHistory([{ role: 'ai', text: '你好！今天想學什麼呢？', en: 'Hello! What would you like to learn today?' }]);
    setCurrentTask(0);
    setCurrentScreen('dialogue');
  };
  const handleTaskSubmit = () => {
    if (currentTask < mockData.tasks[selectedTopic].length - 1) {
      setCurrentTask(currentTask + 1);
    } else {
      setUserStats({ ...userStats, tasksCompleted: userStats.tasksCompleted + 1, score: userStats.score + 5 });
      setCurrentScreen('completion');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F8F9FA 0%, #EFF6FF 100%)', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(90deg, #28A745 0%, #28A745 100%)',
        color: '#F8F9FA',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(40, 167, 69, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={goHome}>
          <div style={{ fontSize: '28px' }}>🌍</div>
          <div>
            <h1 style={{ margin: '0', fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>高雄英語冒險</h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', opacity: 0.9 }}>Kaohsiung English Quest</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '700' }}>{userStats.tasksCompleted}</div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>完成</div>
          </div>
          <div style={{ width: '2px', height: '30px', background: 'rgba(255,255,255,0.3)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '700' }}>{userStats.score}</div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>分數</div>
          </div>
        </div>
      </header>

      {/* SCREEN 1: HOME */}
      {currentScreen === 'home' && (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px', animation: 'fadeIn 0.6s ease-out' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1a1a1a', marginBottom: '10px', letterSpacing: '-1px' }}>歡迎來到高雄</h2>
            <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>選擇一個地區，開始你的英語冒險之旅</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {mockData.areas.map((area, idx) => (
              <div
                key={area.id}
                onClick={() => selectArea(area.id)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '2px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: 'translateY(0)',
                  animation: `slideUp 0.5s ease-out ${idx * 0.1}s both`,
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#28A745';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(40, 167, 69, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>
                  {area.id === 1 ? '☂️' : area.id === 2 ? '🚊' : '🐵'}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 8px 0' }}>{area.name_zh}</h3>
                <p style={{ fontSize: '13px', color: '#999', margin: 0, marginBottom: '16px' }}>{area.name_en}</p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#28A745',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  探索 <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>

          {/* Achievement Card */}
          <div style={{
            background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginTop: '40px'
          }}>
            <Award size={40} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' }}>7天連勝！🔥</h4>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>繼續保持，下一個成就還要2個任務</p>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2: LOCATIONS */}
      {currentScreen === 'locations' && selectedArea && (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
          <button
            onClick={() => setCurrentScreen('home')}
            style={{
              background: 'none',
              border: 'none',
              color: '#28A745',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← 返回首頁
          </button>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a1a', marginBottom: '8px' }}>
              {mockData.areas.find(a => a.id === selectedArea)?.name_zh}
            </h2>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              {mockData.areas.find(a => a.id === selectedArea)?.name_en}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {mockData.locations[selectedArea]?.map((location) => (
              <div
                key={location.id}
                onClick={() => selectLocation(location.id)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '2px solid transparent',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#28A745';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(40, 167, 69, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{location.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px 0' }}>
                  {location.name_zh}
                </h3>
                <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>{location.name_en}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCREEN 3: TOPICS */}
      {currentScreen === 'topics' && selectedLocation && (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
          <button
            onClick={() => setCurrentScreen('locations')}
            style={{
              background: 'none',
              border: 'none',
              color: '#28A745',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← 返回上一頁
          </button>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a1a', marginBottom: '8px' }}>
              學習主題
            </h2>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>選擇一個課題開始學習</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {Object.values(mockData.topics)
              .filter(topic => topic.location_id === selectedLocation)
              .map((topic) => (
              <div
                key={topic.id}
                onClick={() => selectTopic(topic.id)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '2px solid transparent',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#28A745';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(40, 167, 69, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 8px 0' }}>
                  {topic.title_zh}
                </h3>
                <p style={{ fontSize: '13px', color: '#999', margin: '0 0 16px 0' }}>{topic.title_en}</p>
                <div style={{ height: '6px', background: '#E9ECEF', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${topic.progress}%`,
                    background: 'linear-gradient(90deg, #007BFF 0%, #28A745 100%)'
                  }}></div>
                </div>
                <p style={{ fontSize: '12px', color: '#999', margin: '8px 0 0 0' }}>{topic.progress}% 完成</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCREEN 4: DIALOGUE / TASKS */}
      {currentScreen === 'dialogue' && selectedTopic && (
        <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
          <button
            onClick={() => setCurrentScreen('topics')}
            style={{
              background: 'none',
              border: 'none',
              color: '#28A745',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← 返回上一頁
          </button>

          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
          }}>
            {mockData.tasks[selectedTopic] && (
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600', color: '#999' }}>
                  任務 {currentTask + 1} / {mockData.tasks[selectedTopic].length}
                </p>

                <div style={{
                  height: '8px',
                  background: '#E9ECEF',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${((currentTask + 1) / mockData.tasks[selectedTopic].length) * 100}%`,
                    background: 'linear-gradient(90deg, #007BFF 0%, #28A745 100%)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>

                {mockData.tasks[selectedTopic][currentTask]?.type === 'multiple-choice' && (
                  <div>
                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                      {mockData.tasks[selectedTopic][currentTask]?.content_zh}
                    </p>
                    <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#999' }}>
                      {mockData.tasks[selectedTopic][currentTask]?.content_en}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {mockData.tasks[selectedTopic][currentTask]?.options?.map((option, idx) => (
                        <button key={idx} style={{
                          padding: '12px 16px',
                          background: '#FFFFFF',
                          border: '2px solid #E9ECEF',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = '#28A745';
                          e.target.style.background = '#F0F8F5';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = '#E9ECEF';
                          e.target.style.background = '#FFFFFF';
                        }}
                        onClick={handleTaskSubmit}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {mockData.tasks[selectedTopic][currentTask]?.type === 'speaking' && (
                  <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎙️</div>
                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                      {mockData.tasks[selectedTopic][currentTask]?.content_zh}
                    </p>
                    <button style={{
                      padding: '12px 24px',
                      background: '#28A745',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      marginBottom: '12px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#1e7e34'}
                    onMouseLeave={(e) => e.target.style.background = '#28A745'}
                    onClick={handleTaskSubmit}
                    >
                      ▶ 開始錄音
                    </button>
                    <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#999' }}>(第2階段實裝)</p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setCurrentScreen('home')}
              style={{
                marginTop: '24px',
                padding: '12px 16px',
                background: '#E9ECEF',
                color: '#1a1a1a',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              ← 返回首頁
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 5: COMPLETION */}
      {currentScreen === 'completion' && (
        <div style={{
          minHeight: 'calc(100vh - 100px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <div style={{
              fontSize: '80px',
              marginBottom: '24px',
              animation: `bounce 0.6s ease-in-out`
            }}>
              🎉
            </div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#1a1a1a',
              margin: '0 0 12px 0'
            }}>
              太棒了！
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666',
              margin: '0 0 32px 0',
              lineHeight: '1.5'
            }}>
              你完成了所有任務，獲得 <strong style={{ color: '#28A745' }}>+50 分</strong>
            </p>
            <button
              onClick={goHome}
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(90deg, #FD7E14 0%, #FF8C00 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(253, 126, 20, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              繼續冒險 →
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default KaohsiungEnglishApp;
