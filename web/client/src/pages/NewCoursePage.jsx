import { useState } from 'react';
import { courseApi } from '../api/index.js';

export function NewCoursePage({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState('');
  const [formData, setFormData] = useState({
    course_name: '',
    course_code: '',
    semester: '',
    student_count: '',
    professor_name: 'Professor',
  });
  const [tocFile, setTocFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const languages = [
    { code: 'Korean', label: '한국어', emoji: '🇰🇷' },
    { code: 'English', label: 'English', emoji: '🇺🇸' },
    { code: 'Chinese', label: '中文', emoji: '🇨🇳' },
    { code: 'Japanese', label: '日本語', emoji: '🇯🇵' },
  ];

  const semesters = ['2026 Spring', '2026 Fall', '2026 Winter'];

  function handleNext() {
    if (step === 1 && !language) {
      setError('강의 언어를 선택해주세요');
      return;
    }
    if (step === 2) {
      if (!formData.course_name || !formData.course_code || !formData.semester || !formData.student_count) {
        setError('모든 필수 정보를 입력해주세요');
        return;
      }
    }
    setError(null);
    setStep(step + 1);
  }

  function handleBack() {
    setStep(step - 1);
    setError(null);
  }

  async function handleCreate() {
    try {
      setLoading(true);
      setError(null);

      const courseData = {
        ...formData,
        delivery_language: language,
      };

      const result = await courseApi.createCourse(courseData);

      if (tocFile) {
        await courseApi.uploadTOC(result.folder, tocFile);
      }

      onNavigate('course', { folder: result.folder });
    } catch (err) {
      setError(err.message || '과목 생성 실패');
      setLoading(false);
    }
  }

  function handleInputChange(field, value) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '60rem', margin: '0 auto', padding: '2rem 1rem' }}>
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
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0' }}>
            새 교과목 생성
          </h1>
        </div>
      </header>

      {/* Progress Bar */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1.5rem 0' }}>
        <div style={{ maxWidth: '60rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {[1, 2, 3, 4].map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: s <= step ? '#2563eb' : '#d1d5db',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                >
                  {s}
                </div>
                <span style={{ fontSize: '12px', color: s <= step ? '#2563eb' : '#9ca3af' }}>
                  {s === 1 && '언어'}
                  {s === 2 && '정보'}
                  {s === 3 && '교재'}
                  {s === 4 && '확인'}
                </span>
                {s < 4 && <div style={{ height: '2px', width: '2rem', backgroundColor: s < step ? '#2563eb' : '#d1d5db' }} />}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: '60rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', color: '#991b1b' }}>
            <p><strong>오류:</strong> {error}</p>
          </div>
        )}

        {/* Step 1: Language Selection */}
        {step === 1 && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '2rem' }}>강의 언어를 선택하세요</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setError(null);
                  }}
                  style={{
                    padding: '2rem',
                    border: language === lang.code ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: language === lang.code ? '#eff6ff' : '#f9fafb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                  onMouseOver={(e) => {
                    if (language !== lang.code) {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (language !== lang.code) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                >
                  <div style={{ fontSize: '2.5rem' }}>{lang.emoji}</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{lang.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Course Information */}
        {step === 2 && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '2rem' }}>과목 정보를 입력하세요</h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                  과목명 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: Franchise Management"
                  value={formData.course_name}
                  onChange={(e) => handleInputChange('course_name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                    과목 코드 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="예: FRM401"
                    value={formData.course_code}
                    onChange={(e) => handleInputChange('course_code', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                    학기 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => handleInputChange('semester', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">선택하세요</option>
                    {semesters.map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                    수강인원 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="예: 50"
                    value={formData.student_count}
                    onChange={(e) => handleInputChange('student_count', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                    교수명
                  </label>
                  <input
                    type="text"
                    placeholder="예: Professor Sangho Han"
                    value={formData.professor_name}
                    onChange={(e) => handleInputChange('professor_name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Textbook Upload */}
        {step === 3 && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>교재 목차 파일 (선택사항)</h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '2rem' }}>
              교재 목차 파일이 있다면 업로드하세요. (.txt 또는 .md 형식) 나중에 추가할 수도 있습니다.
            </p>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: '#f9fafb',
              transition: 'all 0.2s',
            }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = '#f9fafb';
                const file = e.dataTransfer.files?.[0];
                if (file && (file.name.endsWith('.txt') || file.name.endsWith('.md'))) {
                  setTocFile(file);
                }
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: '#1f2937' }}>파일을 드래그하거나 클릭</p>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>TXT 또는 Markdown 파일 (.txt, .md)</p>
              <input
                type="file"
                accept=".txt,.md"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setTocFile(file);
                }}
                style={{ display: 'none' }}
              />
            </label>
            {tocFile && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: '6px', borderLeft: '4px solid #10b981', color: '#065f46' }}>
                ✅ 선택됨: {tocFile.name}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '2rem' }}>과목 생성 확인</h2>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: '#666' }}>강의 언어</p>
                <p style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>
                  {languages.find(l => l.code === language)?.label}
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: '#666' }}>과목명</p>
                <p style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>{formData.course_name}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: '#666' }}>과목 코드</p>
                  <p style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>{formData.course_code}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: '#666' }}>학기</p>
                  <p style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>{formData.semester}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: '#666' }}>수강인원</p>
                  <p style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>{formData.student_count}명</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: '#666' }}>교수명</p>
                  <p style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>{formData.professor_name}</p>
                </div>
              </div>
              {tocFile && (
                <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '6px', borderLeft: '4px solid #0284c7' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: '#0284c7' }}>📄 교재 목차 파일</p>
                  <p style={{ margin: '0', fontSize: '14px', color: '#0c4a6e', fontWeight: '500' }}>{tocFile.name}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
          <button
            onClick={handleBack}
            disabled={step === 1}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: step === 1 ? '#d1d5db' : '#e5e7eb',
              color: step === 1 ? '#9ca3af' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: step === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: step === 1 ? 0.5 : 1,
            }}
          >
            이전
          </button>

          <button
            onClick={step === 4 ? handleCreate : handleNext}
            disabled={loading}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: loading ? '#d1d5db' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '생성 중...' : step === 4 ? '과목 생성' : '다음'}
          </button>
        </div>
      </main>
    </div>
  );
}
