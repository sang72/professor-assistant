import { useEffect, useState } from 'react';
import { courseApi } from '../api/index.js';
import { CourseCard } from '../components/CourseCard.jsx';

export function HomePage({ onNavigate }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      const data = await courseApi.listCourses();
      setCourses(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px 0' }}>🎓 Professor Assistant</h1>
            <p style={{ color: '#4b5563', margin: '0', fontSize: '14px' }}>AI 기반 교수 지원 시스템</p>
          </div>
          <button
            onClick={() => onNavigate('new')}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            + 새 교과목
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1rem' }}>
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#991b1b'
          }}>
            <p><strong>오류:</strong> {error}</p>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', animation: 'pulse 2s infinite' }}>
                <div style={{ height: '40px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '1rem' }}></div>
                <div style={{ height: '20px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '1rem', width: '80%' }}></div>
                <div style={{ height: '60px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>📚</p>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#1f2937' }}>등록된 교과목이 없습니다</h2>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem', fontSize: '14px' }}>첫 교과목을 만들어 강의계획서, 강의안, 시험문제를 자동으로 생성해보세요!</p>
            <button
              onClick={() => onNavigate('new')}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              ✨ 첫 교과목 만들기
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {courses.map((course) => (
              <CourseCard
                key={course.folder}
                course={course}
                onClick={() => onNavigate('course', { folder: course.folder })}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
