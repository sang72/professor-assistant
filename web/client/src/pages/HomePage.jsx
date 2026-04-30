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
          <div style={{ textAlign: 'center', color: '#4b5563' }}>
            <p>교과목 목록을 불러오는 중...</p>
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#4b5563', marginBottom: '1rem' }}>등록된 교과목이 없습니다.</p>
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
            >
              첫 교과목 만들기
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
