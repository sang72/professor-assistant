import { useState } from 'react';

export function AutoGenerationWizard({ course, folder, onClose }) {
  const [step, setStep] = useState(1); // 1: 생성 선택, 2: 강의, 3: 시험, 4: 과제
  const [generationType, setGenerationType] = useState(null); // 'lectures', 'exams', 'assignments'
  const [lectureWeek, setLectureWeek] = useState(1);
  const [lectureSession, setLectureSession] = useState(1);
  const [examType, setExamType] = useState('midterm'); // midterm, final
  const [examScope, setExamScope] = useState('');
  const [examTendency, setExamTendency] = useState('');
  const [examFormat, setExamFormat] = useState('');
  const [assignmentNum, setAssignmentNum] = useState(1);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  function generateLecturePrompt() {
    const prompt = `
## 🎓 자동 강의안 + PPT 생성 요청

### 교과목 정보
- 과목명: ${course.course_name}
- 과목 코드: ${course.course_code}
- 학기: ${course.semester}
- 교수명: ${course.professor_name}
- 강의 언어: ${course.delivery_language || 'English'}

### 요청 사항
주차: Week ${lectureWeek}, 세션: Session ${lectureSession}

다음 지침을 **반드시** 따르세요:

📋 **_templates/lecture_agent.md의 모든 지침을 적용하세요**

생성해야 할 것:
1. ✅ 수업 계획안 (한국어)
2. ✅ 강의 스크립트 (${course.delivery_language || 'English'})
3. ✅ 한국어 완역 스크립트 (${course.delivery_language !== 'Korean' ? 'O' : 'X'})
4. ✅ PPT 슬라이드 내용 + 이미지 추천
5. ✅ 2024-2025 최신 사례 업데이트

### 참고 파일
- courses/${folder}/config/course_config.json
- courses/${folder}/config/MASTER_CONTEXT.md
- courses/${folder}/syllabus/syllabus.md
- courses/${folder}/textbook/chapters/ (해당 주차 교재)

### 최종 저장 위치
courses/${folder}/lectures/week${String(lectureWeek).padStart(2, '0')}/session${lectureSession}.md

**지침을 모두 읽고 실행하세요!**
`;
    setGeneratedPrompt(prompt);
    setStep(4); // 최종 프롬프트 표시
  }

  function generateExamPrompt() {
    const prompt = `
## 📝 자동 시험 출제 요청

### 교과목 정보
- 과목명: ${course.course_name}
- 과목 코드: ${course.course_code}
- 학기: ${course.semester}
- 교수명: ${course.professor_name}
- 강의 언어: ${course.delivery_language || 'English'}

### 시험 설정
- 시험 유형: ${examType === 'midterm' ? '중간고사 (Weeks 1-7)' : '기말고사 (Weeks 8-15)'}
- 시험 범위: ${examScope || '강의 전체'}
- 시험 경향: ${examTendency || '균형잡힌 난이도'}
- 출제 유형: ${examFormat || '객관식 + 단답형 + 서술형'}

다음 지침을 **반드시** 따르세요:

📋 **_templates/exam_agent.md의 모든 지침을 적용하세요**

생성해야 할 것:
1. ✅ 시험지 (${course.delivery_language || 'English'})
2. ✅ 답안지 + 채점 기준 + 루브릭
3. ✅ 문제별 해설
4. ✅ 문제 출처 맵 (Bloom 분류)

### 참고 파일
- courses/${folder}/config/course_config.json
- courses/${folder}/config/MASTER_CONTEXT.md
- courses/${folder}/syllabus/syllabus.md
- courses/${folder}/lectures/ (모든 강의안)

### 최종 저장 위치
- courses/${folder}/exams/${examType}_student.md
- courses/${folder}/exams/${examType}_answer_key.md

**지침을 모두 읽고 실행하세요!**
`;
    setGeneratedPrompt(prompt);
    setStep(4); // 최종 프롬프트 표시
  }

  function generateAssignmentPrompt() {
    const prompt = `
## ✏️ 자동 과제 생성 요청

### 교과목 정보
- 과목명: ${course.course_name}
- 과목 코드: ${course.course_code}
- 학기: ${course.semester}
- 교수명: ${course.professor_name}
- 강의 언어: ${course.delivery_language || 'English'}

### 과제 설정
- 과제 번호: Assignment ${assignmentNum}
- 학습 수준: ${course.academic_level || 'Undergraduate'}

다음 지침을 **반드시** 따르세요:

📋 **_templates/assignment_agent.md의 모든 지침을 적용하세요**

생성해야 할 것:
1. ✅ 과제 설명서 (${course.delivery_language || 'English'})
2. ✅ 평가 기준 및 루브릭
3. ✅ 모범 답안
4. ✅ 학습 목표와의 연결

### 참고 파일
- courses/${folder}/config/course_config.json
- courses/${folder}/config/MASTER_CONTEXT.md
- courses/${folder}/syllabus/syllabus.md

### 최종 저장 위치
- courses/${folder}/assignments/assignment${assignmentNum}.md
- courses/${folder}/assignments/assignment${assignmentNum}_rubric.md

**지침을 모두 읽고 실행하세요!**
`;
    setGeneratedPrompt(prompt);
    setStep(4); // 최종 프롬프트 표시
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {step === 1 && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '20px', fontWeight: '600' }}>
              🚀 자동 생성 마법사
            </h2>
            <p style={{ margin: '0 0 1.5rem 0', color: '#666', fontSize: '14px' }}>
              생성할 콘텐츠를 선택하세요. 모든 기존 지침들이 자동으로 적용됩니다.
            </p>

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={() => { setGenerationType('lectures'); setStep(2); }}
                style={{
                  padding: '1rem',
                  backgroundColor: '#eff6ff',
                  border: '2px solid #0284c7',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>🎓 강의안 + PPT</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  강의 스크립트(영어/한국어) + PPT 슬라이드 + 최신 사례
                </div>
              </button>

              <button
                onClick={() => { setGenerationType('exams'); setStep(3); }}
                style={{
                  padding: '1rem',
                  backgroundColor: '#fef3c7',
                  border: '2px solid #d97706',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>📝 시험 출제</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  시험지 + 답안지 + 채점 기준 (범위/경향/유형 설정)
                </div>
              </button>

              <button
                onClick={() => { setGenerationType('assignments'); setStep(3); }}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f0fdf4',
                  border: '2px solid #22c55e',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>✏️ 과제 생성</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  과제 설명서 + 평가 기준 + 모범 답안
                </div>
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              취소
            </button>
          </div>
        )}

        {step === 2 && generationType === 'lectures' && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '20px', fontWeight: '600' }}>
              🎓 강의안 설정
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>
                주차 선택:
              </label>
              <select
                value={lectureWeek}
                onChange={(e) => setLectureWeek(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(w => (
                  <option key={w} value={w}>Week {w}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>
                세션 선택:
              </label>
              <select
                value={lectureSession}
                onChange={(e) => setLectureSession(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                {[1, 2, 3].map(s => (
                  <option key={s} value={s}>Session {s}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={generateLecturePrompt}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ✅ 프롬프트 생성
              </button>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#e5e7eb',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                돌아가기
              </button>
            </div>
          </div>
        )}

        {step === 3 && generationType === 'exams' && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '20px', fontWeight: '600' }}>
              📝 시험 출제 설정
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>
                시험 유형:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  onClick={() => setExamType('midterm')}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: examType === 'midterm' ? '#fbbf24' : '#fef3c7',
                    border: '2px solid #d97706',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: examType === 'midterm' ? '600' : '400'
                  }}
                >
                  중간고사
                </button>
                <button
                  onClick={() => setExamType('final')}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: examType === 'final' ? '#fbbf24' : '#fef3c7',
                    border: '2px solid #d97706',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: examType === 'final' ? '600' : '400'
                  }}
                >
                  기말고사
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>
                시험 범위:
              </label>
              <textarea
                value={examScope}
                onChange={(e) => setExamScope(e.target.value)}
                placeholder="예: Week 1-7, Chapter 1-5"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px',
                  minHeight: '60px',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>
                시험 경향:
              </label>
              <textarea
                value={examTendency}
                onChange={(e) => setExamTendency(e.target.value)}
                placeholder="예: 기억/이해 40% + 적용 40% + 분석 20%"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px',
                  minHeight: '60px',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>
                출제 유형:
              </label>
              <textarea
                value={examFormat}
                onChange={(e) => setExamFormat(e.target.value)}
                placeholder="예: 객관식 20개 + 단답형 4개 + 서술형 1개"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px',
                  minHeight: '60px',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={generateExamPrompt}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#d97706',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ✅ 프롬프트 생성
              </button>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#e5e7eb',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                돌아가기
              </button>
            </div>
          </div>
        )}

        {step === 3 && generationType === 'assignments' && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '20px', fontWeight: '600' }}>
              ✏️ 과제 설정
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>
                과제 번호:
              </label>
              <select
                value={assignmentNum}
                onChange={(e) => setAssignmentNum(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>Assignment {n}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={generateAssignmentPrompt}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ✅ 프롬프트 생성
              </button>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#e5e7eb',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                돌아가기
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '20px', fontWeight: '600' }}>
              📋 생성된 프롬프트
            </h2>
            <p style={{ margin: '0 0 1rem 0', fontSize: '12px', color: '#666' }}>
              다음 프롬프트를 복사하여 Claude Code의 대화창에 붙여넣고 실행하세요.
            </p>

            <textarea
              value={generatedPrompt}
              readOnly
              style={{
                width: '100%',
                padding: '1rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: 'monospace',
                minHeight: '300px',
                backgroundColor: '#f9fafb',
                color: '#1f2937'
              }}
            />

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPrompt);
                  alert('프롬프트가 클립보드에 복사되었습니다!');
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                📋 클립보드에 복사
              </button>
              <button
                onClick={() => { setStep(1); setGeneratedPrompt(''); }}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#e5e7eb',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                닫기
              </button>
            </div>

            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#eff6ff',
              borderRadius: '6px',
              borderLeft: '4px solid #0284c7'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', fontSize: '12px', color: '#0c4a6e' }}>
                💡 다음 단계:
              </p>
              <ol style={{ margin: '0', paddingLeft: '1.5rem', fontSize: '12px', color: '#0284c7' }}>
                <li>위의 "클립보드에 복사" 버튼 클릭</li>
                <li>Claude Code 대화창에서 프롬프트 붙여넣기</li>
                <li>Claude가 자동으로 모든 파일 생성</li>
                <li>생성된 파일이 [파일 다운로드] 탭에 표시됨</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
