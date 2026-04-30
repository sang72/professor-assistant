import { useEffect, useState } from 'react';
import { courseApi } from '../api/index.js';

export function CoursePage({ folder, onNavigate }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chapters, setChapters] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    loadCourseData();
  }, [folder]);

  async function loadCourseData() {
    try {
      setLoading(true);
      const courseData = await courseApi.getCourse(folder);
      setCourse(courseData);

      // Load TOC and chapters
      const tocData = await courseApi.getTOC(folder);
      setChapters(tocData.chapters || []);

      // Load files
      const fileData = await courseApi.getFiles(folder);
      setFiles(fileData);

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>과목 정보를 불러오는 중...</div>;
  }

  if (!course) {
    return <div style={{ padding: '2rem', color: '#d00' }}>과목을 찾을 수 없습니다.</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
          <button
            onClick={() => onNavigate('home')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#2563eb',
              marginBottom: '1rem',
              fontSize: '14px'
            }}
          >
            ← 돌아가기
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
            {course.course_name}
          </h1>
          <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
            {course.course_code} · {course.semester} · {course.professor_name}
          </p>
        </div>
      </header>

      {/* Tabs */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem', display: 'flex' }}>
          {['overview', 'textbook', 'tasks', 'files'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === tab ? '#f3f4f6' : 'transparent',
                borderBottom: activeTab === tab ? '3px solid #2563eb' : 'none',
                fontSize: '14px',
                fontWeight: activeTab === tab ? '500' : '400',
                color: activeTab === tab ? '#1f2937' : '#666'
              }}
            >
              {tab === 'overview' && '개요'}
              {tab === 'textbook' && '교재 관리'}
              {tab === 'tasks' && '작업 목록'}
              {tab === 'files' && '파일 다운로드'}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#991b1b' }}>
            <p><strong>오류:</strong> {error}</p>
          </div>
        )}

        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>과목 개요</h2>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <p><strong>학번:</strong> {course.course_code}</p>
              <p><strong>학기:</strong> {course.semester}</p>
              <p><strong>교수:</strong> {course.professor_name}</p>
              <p><strong>수강인원:</strong> {course.student_count}명</p>
              <p><strong>강의언어:</strong> {course.delivery_language}</p>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginTop: '1.5rem', marginBottom: '0.5rem' }}>학습성과</h3>
            <ul style={{ paddingLeft: '1.5rem', color: '#666' }}>
              {course.top_3_outcomes?.map((outcome, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>{outcome}</li>
              ))}
            </ul>
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
              <p><strong>진행률:</strong> {course.status?.progress?.percentage || 0}% ({course.status?.progress?.completed || 0} / {course.status?.progress?.total || 0})</p>
            </div>
          </div>
        )}

        {activeTab === 'textbook' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>교재 관리</h2>

            {/* TOC Upload */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>목차 파일 업로드</h3>
              <input
                type="file"
                accept=".txt,.md"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    courseApi.uploadTOC(folder, file).then(() => {
                      loadCourseData();
                    });
                  }
                }}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  width: '100%',
                  cursor: 'pointer'
                }}
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '0.5rem' }}>
                텍스트(.txt) 또는 마크다운(.md) 형식 지원
              </p>
            </div>

            {/* Chapter Files */}
            {chapters.length > 0 && (
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>챕터별 파일 업로드</h3>
                {chapters.map((chapter) => (
                  <div key={chapter.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                    <div>
                      <p style={{ margin: '0', fontWeight: '500' }}>Chapter {chapter.number}</p>
                      <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{chapter.title}</p>
                    </div>
                    <label style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      선택
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            courseApi.uploadChapter(folder, chapter.key, file).then(() => {
                              loadCourseData();
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>작업 목록</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f3f4f6' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>항목</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>상태</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Syllabus */}
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem', fontSize: '14px' }}>강의계획서</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '12px', color: course.status?.syllabus === 'done' ? '#059669' : '#666' }}>
                      {course.status?.syllabus === 'done' ? '✅ 완료' : '⏳ 대기'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => alert('프롬프트 복사 기능 (구현 중)')}
                        style={{
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        프롬프트
                      </button>
                    </td>
                  </tr>

                  {/* Lectures */}
                  {course.status?.lectures?.slice(0, 3).map((lecture, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem', fontSize: '14px' }}>{lecture.label}</td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontSize: '12px', color: lecture.status === 'done' ? '#059669' : '#666' }}>
                        {lecture.status === 'done' ? '✅ 완료' : '⏳ 대기'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => courseApi.downloadDocx(folder, `script-week${String(lecture.week).padStart(2, '0')}-session${lecture.session}`)}
                          style={{
                            backgroundColor: '#059669',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Word
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>생성된 파일</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {files.map((file, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{file.icon}</div>
                  <p style={{ margin: '0', fontSize: '14px', fontWeight: '500', marginBottom: '0.5rem' }}>{file.name}</p>
                  <p style={{ margin: '0', fontSize: '12px', color: '#666', marginBottom: '1rem' }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    onClick={() => courseApi.downloadFile(folder, file.path)}
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    다운로드
                  </button>
                </div>
              ))}
            </div>
            {files.length === 0 && (
              <p style={{ textAlign: 'center', color: '#666' }}>생성된 파일이 없습니다.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
