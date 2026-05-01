import { useEffect, useState } from 'react';
import { courseApi } from '../api/index.js';
import { AutoGenerationWizard } from '../components/AutoGenerationWizard.jsx';

export function CoursePage({ folder, onNavigate }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chapters, setChapters] = useState([]);
  const [files, setFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState(null);
  const [tocContent, setTocContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [promptCopy, setPromptCopy] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [newLectureWeek, setNewLectureWeek] = useState(4);
  const [newLectureSession, setNewLectureSession] = useState(1);
  const [creatingLecture, setCreatingLecture] = useState(false);
  const [lectureMaterials, setLectureMaterials] = useState({});
  const [uploadingMaterial, setUploadingMaterial] = useState({});

  useEffect(() => {
    loadCourseData();
  }, [folder]);

  async function loadCourseData() {
    try {
      setLoading(true);
      setError(null);

      const courseData = await courseApi.getCourse(folder);
      setCourse(courseData);

      // Load TOC and chapters
      try {
        const tocData = await courseApi.getTOC(folder);
        setChapters(tocData.chapters || []);
        setTocContent(tocData.content || '');
      } catch (e) {
        // TOC might not exist yet
        setChapters([]);
        setTocContent('');
      }

      // Load files
      try {
        const fileData = await courseApi.getFiles(folder);
        setFiles(fileData);
      } catch (e) {
        setFiles([]);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleTOCUpload(file) {
    try {
      setUploadingFiles(prev => ({ ...prev, toc: true }));
      await courseApi.uploadTOC(folder, file);
      setUploadStatus({ type: 'toc', success: true, message: '✅ 목차 파일이 성공적으로 업로드되었습니다!' });
      await loadCourseData();
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      setUploadStatus({ type: 'toc', success: false, message: `❌ 업로드 실패: ${err.message}` });
      setTimeout(() => setUploadStatus(null), 5000);
    } finally {
      setUploadingFiles(prev => ({ ...prev, toc: false }));
    }
  }

  async function handleChapterUpload(chapterKey, file) {
    try {
      setUploadingFiles(prev => ({ ...prev, [chapterKey]: true }));
      await courseApi.uploadChapter(folder, chapterKey, file);
      setUploadStatus({ type: 'chapter', success: true, message: `✅ 챕터 파일이 성공적으로 업로드되었습니다!` });
      await loadCourseData();
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      setUploadStatus({ type: 'chapter', success: false, message: `❌ 업로드 실패: ${err.message}` });
      setTimeout(() => setUploadStatus(null), 5000);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [chapterKey]: false }));
    }
  }

  async function handlePromptCopy(taskType) {
    try {
      const prompt = await courseApi.getPrompt(folder, taskType);
      const text = prompt.prompt || JSON.stringify(prompt);
      await navigator.clipboard.writeText(text);
      setPromptCopy(taskType);
      setTimeout(() => setPromptCopy(null), 2000);
    } catch (err) {
      alert(`프롬프트 복사 실패: ${err.message}`);
    }
  }

  async function handleCreateLecture(force = false) {
    try {
      setCreatingLecture(true);
      const result = await courseApi.initializeLecture(folder, newLectureWeek, newLectureSession, force);

      // 파일이 이미 존재하고 force가 false일 때
      if (result.exists && !force) {
        setCreatingLecture(false);
        const shouldRegenerate = window.confirm(
          `Week ${newLectureWeek} Session ${newLectureSession} 강의안이 이미 존재합니다.\n재생성하시겠습니까?\n\n(기존 내용이 새 템플릿으로 덮어씌워집니다)`
        );
        if (shouldRegenerate) {
          await handleCreateLecture(true);
        }
        return;
      }

      // 파일이 생성되었을 때
      const isRegenerated = result.regenerated || force;
      setUploadStatus({
        type: 'lecture',
        success: true,
        message: `✅ Week ${newLectureWeek} Session ${newLectureSession} 강의안이 ${isRegenerated ? '재생성' : '생성'}되었습니다!`
      });
      setTimeout(() => setUploadStatus(null), 3000);
      await loadCourseData();
    } catch (err) {
      setUploadStatus({ type: 'lecture', success: false, message: `❌ 생성 실패: ${err.message}` });
      setTimeout(() => setUploadStatus(null), 5000);
    } finally {
      setCreatingLecture(false);
    }
  }

  async function handleUploadMaterial(week, files) {
    if (!files || files.length === 0) return;

    for (const file of files) {
      try {
        setUploadingMaterial(prev => ({ ...prev, [`week${week}`]: true }));
        await courseApi.uploadLectureMaterial(folder, week, file);
        setUploadStatus({ type: 'material', success: true, message: `✅ Week ${week} 강의자료 "${file.name}" 업로드 완료!` });
        setTimeout(() => setUploadStatus(null), 3000);

        // Load materials for this week
        const materials = await courseApi.getLectureMaterials(folder, week);
        setLectureMaterials(prev => ({ ...prev, [week]: materials }));
      } catch (err) {
        setUploadStatus({ type: 'material', success: false, message: `❌ 업로드 실패: ${err.message}` });
        setTimeout(() => setUploadStatus(null), 5000);
      } finally {
        setUploadingMaterial(prev => ({ ...prev, [`week${week}`]: false }));
      }
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ fontSize: '16px', color: '#666', margin: '0' }}>과목 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
        <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '2rem', borderRadius: '8px' }}>
          <p style={{ fontSize: '16px', color: '#991b1b', margin: '0' }}>❌ 과목을 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <button
              onClick={() => onNavigate('home')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#2563eb',
                fontSize: '14px'
              }}
            >
              ← 돌아가기
            </button>
            <button
              onClick={() => {
                if (window.confirm(`정말로 "${course.course_name}" 과목을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
                  courseApi.deleteCourse(folder)
                    .then(() => {
                      alert('과목이 삭제되었습니다.');
                      onNavigate('home');
                    })
                    .catch(err => alert(`삭제 실패: ${err.message}`));
                }
              }}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              🗑️ 과목 삭제
            </button>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
            {course.course_name}
          </h1>
          <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
            {course.course_code} · {course.semester} · {course.professor_name}
          </p>
        </div>
      </header>

      {/* Tabs */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem', display: 'flex' }}>
          {['overview', 'textbook', 'tasks', 'exams', 'assignments', 'lectures', 'files'].map(tab => (
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
                color: activeTab === tab ? '#1f2937' : '#666',
                whiteSpace: 'nowrap'
              }}
            >
              {tab === 'overview' && '📌 개요'}
              {tab === 'textbook' && '📚 교재 관리'}
              {tab === 'tasks' && '📋 작업 목록'}
              {tab === 'exams' && '📝 시험 출제'}
              {tab === 'assignments' && '✏️ 과제 관리'}
              {tab === 'lectures' && '🎓 강의자료'}
              {tab === 'files' && '📁 파일 다운로드'}
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
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>목차 파일 업로드</h3>

              {/* Drag and drop area */}
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file && (file.name.endsWith('.txt') || file.name.endsWith('.md'))) {
                    handleTOCUpload(file);
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  border: dragActive ? '2px solid #2563eb' : '2px dashed #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: dragActive ? '#eff6ff' : '#f9fafb',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>파일을 드래그하거나 클릭하세요</p>
                <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>TXT 또는 Markdown 파일 (.txt, .md)</p>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleTOCUpload(file);
                  }}
                  style={{ display: 'none' }}
                />
              </label>

              {uploadStatus?.type === 'toc' && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: uploadStatus.success ? '#ecfdf5' : '#fef2f2',
                  borderLeft: `4px solid ${uploadStatus.success ? '#10b981' : '#ef4444'}`,
                  color: uploadStatus.success ? '#065f46' : '#991b1b'
                }}>
                  {uploadStatus.message}
                </div>
              )}

              {tocContent && (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '12px', fontWeight: '600', color: '#0284c7' }}>📋 업로드된 목차:</p>
                  <pre style={{ margin: '0', fontSize: '12px', color: '#666', overflow: 'auto', maxHeight: '150px' }}>
                    {tocContent.split('\n').slice(0, 10).join('\n')}
                    {tocContent.split('\n').length > 10 && '\n... (더보기)'}
                  </pre>
                </div>
              )}
            </div>

            {/* PDF 교재 업로드 */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>📕 교재 PDF 업로드</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '12px', color: '#666' }}>
                교과서나 강의 교재를 PDF 파일로 업로드하세요. (예: textbook.pdf, lecture-notes.pdf)
              </p>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: '#f9fafb',
                transition: 'all 0.2s'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                  <p style={{ margin: '0 0 0.25rem 0', fontWeight: '500' }}>PDF 파일을 여기에 드래그하세요</p>
                  <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>또는 클릭하여 파일 선택</p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.name.endsWith('.pdf')) {
                      alert(`PDF 교재 업로드: ${file.name}\n(구현 예정 - 파일시스템에 저장됨)`);
                    }
                  }}
                />
              </label>
            </div>

            {/* Chapter Files */}
            {chapters.length > 0 ? (
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>📚 챕터별 파일 업로드</h3>
                {chapters.map((chapter) => (
                  <div key={chapter.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0', fontWeight: '500', fontSize: '14px' }}>Chapter {chapter.number}: {chapter.title}</p>
                      {uploadingFiles[chapter.key] && (
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '12px', color: '#2563eb' }}>⏳ 업로드 중...</p>
                      )}
                    </div>
                    <label style={{
                      backgroundColor: uploadingFiles[chapter.key] ? '#d1d5db' : '#2563eb',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: uploadingFiles[chapter.key] ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      marginLeft: '1rem',
                      opacity: uploadingFiles[chapter.key] ? 0.6 : 1
                    }}>
                      {uploadingFiles[chapter.key] ? '업로드 중...' : '선택'}
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        disabled={uploadingFiles[chapter.key]}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleChapterUpload(chapter.key, file);
                        }}
                      />
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ backgroundColor: '#fef9e7', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #eab308' }}>
                <p style={{ margin: '0', color: '#78350f' }}>
                  💡 팁: 먼저 위에서 목차 파일을 업로드하면 챕터별 파일 업로드 영역이 나타납니다.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>📋 작업 목록</h2>

            {/* Syllabus */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '16px', fontWeight: '600' }}>강의계획서</h3>
                  <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>과목 개요, 학습성과, 평가 방법 등</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: course.status?.syllabus === 'done' ? '#dcfce7' : '#fef3c7', color: course.status?.syllabus === 'done' ? '#166534' : '#92400e', fontWeight: '600' }}>
                    {course.status?.syllabus === 'done' ? '✅ 완료' : '⏳ 대기'}
                  </span>
                  <button
                    onClick={() => handlePromptCopy('syllabus')}
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {promptCopy === 'syllabus' ? '✅ 복사됨' : '📋 복사'}
                  </button>
                </div>
              </div>
            </div>

            {/* Create New Lecture */}
            <div style={{ backgroundColor: '#f0f9ff', padding: '1.5rem', borderRadius: '8px', marginTop: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #0284c7' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 1rem 0', color: '#0c4a6e' }}>➕ 새 강의안 추가</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>주차</label>
                  <select
                    value={newLectureWeek}
                    onChange={(e) => setNewLectureWeek(parseInt(e.target.value))}
                    disabled={creatingLecture}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      cursor: creatingLecture ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {[...Array(15)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>세션</label>
                  <select
                    value={newLectureSession}
                    onChange={(e) => setNewLectureSession(parseInt(e.target.value))}
                    disabled={creatingLecture}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      cursor: creatingLecture ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {[1, 2, 3].map((s) => (
                      <option key={s} value={s}>Session {s}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => handleCreateLecture()}
                  disabled={creatingLecture}
                  style={{
                    backgroundColor: creatingLecture ? '#d1d5db' : '#0284c7',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: creatingLecture ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    opacity: creatingLecture ? 0.6 : 1,
                  }}
                >
                  {creatingLecture ? '생성 중...' : '생성'}
                </button>
              </div>
            </div>

            {/* Lectures */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem' }}>강의안 (처음 5개)</h3>
            {course.status?.lectures?.slice(0, 5).map((lecture, idx) => (
              <div key={idx} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0', fontWeight: '500', fontSize: '14px' }}>{lecture.label}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: lecture.status === 'done' ? '#dcfce7' : '#fef3c7', color: lecture.status === 'done' ? '#166534' : '#92400e', fontWeight: '600' }}>
                    {lecture.status === 'done' ? '✅ 완료' : '⏳ 대기'}
                  </span>
                  <button
                    onClick={() => handlePromptCopy(`week${String(lecture.week).padStart(2, '0')}_session${lecture.session}`)}
                    style={{
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {promptCopy === `week${String(lecture.week).padStart(2, '0')}_session${lecture.session}` ? '✅ 복사됨' : '📋 복사'}
                  </button>
                  <button
                    onClick={() => courseApi.downloadDocx(folder, `script-week${String(lecture.week).padStart(2, '0')}-session${lecture.session}`)}
                    style={{
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    📄 Word
                  </button>
                  <button
                    onClick={() => courseApi.downloadPptx(folder, `script-week${String(lecture.week).padStart(2, '0')}-session${lecture.session}`)}
                    style={{
                      backgroundColor: '#d97706',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    🎯 PPT
                  </button>
                </div>
              </div>
            ))}

            {course.status?.lectures && course.status.lectures.length > 5 && (
              <p style={{ textAlign: 'center', color: '#666', fontSize: '12px', marginTop: '1rem' }}>
                외 {course.status.lectures.length - 5}개의 강의가 있습니다
              </p>
            )}
          </div>
        )}

        {activeTab === 'exams' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>📝 시험 출제</h2>

            {/* 중간고사 */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '16px', fontWeight: '600' }}>중간고사 (Midterm)</h3>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '12px', color: '#666' }}>
                    범위: Week 1-7 | 형식: 객관식 25개 + 주관식 3개 | 시간: 90분
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handlePromptCopy('midterm')}
                    style={{
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {promptCopy === 'midterm' ? '✅ 복사됨' : '📋 프롬프트'}
                  </button>
                  <button
                    onClick={() => courseApi.downloadDocx(folder, 'midterm-student')}
                    style={{
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    📄 시험지
                  </button>
                  <button
                    onClick={() => courseApi.downloadPptx(folder, 'midterm-student')}
                    style={{
                      backgroundColor: '#d97706',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    🎯 PPT
                  </button>
                  <button
                    onClick={() => courseApi.downloadDocx(folder, 'midterm-answer')}
                    style={{
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    📄 답지
                  </button>
                  <button
                    onClick={() => courseApi.downloadPptx(folder, 'midterm-answer')}
                    style={{
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      opacity: 0.7,
                    }}
                  >
                    📊 PPT
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowWizard(true)}
                style={{
                  marginTop: '1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                🚀 자동 생성
              </button>
            </div>

            {/* 기말고사 */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '16px', fontWeight: '600' }}>기말고사 (Final)</h3>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '12px', color: '#666' }}>
                    범위: Week 8-15 | 형식: 객관식 30개 + 주관식 4개 | 시간: 120분
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handlePromptCopy('final')}
                    style={{
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {promptCopy === 'final' ? '✅ 복사됨' : '📋 프롬프트'}
                  </button>
                  <button
                    onClick={() => courseApi.downloadDocx(folder, 'final-student')}
                    style={{
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    📄 시험지
                  </button>
                  <button
                    onClick={() => courseApi.downloadPptx(folder, 'final-student')}
                    style={{
                      backgroundColor: '#d97706',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    🎯 PPT
                  </button>
                  <button
                    onClick={() => courseApi.downloadDocx(folder, 'final-answer')}
                    style={{
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    📄 답지
                  </button>
                  <button
                    onClick={() => courseApi.downloadPptx(folder, 'final-answer')}
                    style={{
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      opacity: 0.7,
                    }}
                  >
                    📊 PPT
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowWizard(true)}
                style={{
                  marginTop: '1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                🚀 자동 생성
              </button>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>✏️ 과제 관리</h2>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f3f4f6' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>과제명</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>상태</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {course.status?.assignments?.map((assignment, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem', fontSize: '14px', fontWeight: '500' }}>
                        {assignment.label}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontSize: '12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: assignment.status === 'done' ? '#dcfce7' : '#fef3c7', color: assignment.status === 'done' ? '#166534' : '#92400e', fontWeight: '600' }}>
                          {assignment.status === 'done' ? '✅ 완료' : '⏳ 대기'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handlePromptCopy(`assignment${assignment.num}`)}
                          style={{
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {promptCopy === `assignment${assignment.num}` ? '✅ 복사됨' : '📋 복사'}
                        </button>
                        <button
                          onClick={() => courseApi.downloadDocx(folder, `assignment${assignment.num}`)}
                          style={{
                            backgroundColor: '#059669',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          📄 다운로드
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'lectures' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>🎓 강의자료</h2>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>주차별 강의자료 업로드</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '12px', color: '#666' }}>
                각 주차별로 강의안(MD), PPT, PDF 등을 업로드할 수 있습니다.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(week => (
                  <div key={week} style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <p style={{ margin: '0 0 0.75rem 0', fontWeight: '600', fontSize: '14px' }}>📚 Week {week}</p>
                    <label style={{
                      backgroundColor: uploadingMaterial[`week${week}`] ? '#d1d5db' : '#2563eb',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: uploadingMaterial[`week${week}`] ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'inline-block',
                      opacity: uploadingMaterial[`week${week}`] ? 0.6 : 1,
                    }}>
                      {uploadingMaterial[`week${week}`] ? '⏳ 업로드 중...' : '📤 파일 선택'}
                      <input
                        type="file"
                        multiple
                        accept=".md,.ppt,.pptx,.pdf"
                        style={{ display: 'none' }}
                        disabled={uploadingMaterial[`week${week}`]}
                        onChange={(e) => handleUploadMaterial(week, e.target.files)}
                      />
                    </label>
                    {lectureMaterials[week] && lectureMaterials[week].length > 0 && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '11px', fontWeight: '600', color: '#666' }}>📁 파일 목록:</p>
                        {lectureMaterials[week].map((file, idx) => (
                          <div key={idx} style={{ fontSize: '11px', color: '#666', marginBottom: '0.25rem' }}>
                            {file.icon} {file.filename}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#eff6ff', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#0c4a6e' }}>💡 팁</p>
              <p style={{ margin: '0', fontSize: '12px', color: '#0284c7' }}>
                강의안은 Markdown(.md), PPT는 .pptx, 추가 자료는 PDF 형식으로 업로드하세요.
                업로드된 파일은 lectures 폴더에 자동 저장됩니다.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>📁 생성된 파일</h2>
            {files.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {files.map((file, idx) => (
                  <div key={idx} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{file.icon}</div>
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
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        width: '100%'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    >
                      ⬇️ 다운로드
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ backgroundColor: '#f0f9ff', padding: '2rem', borderRadius: '8px', textAlign: 'center', borderLeft: '4px solid #0284c7' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '24px' }}>📭</p>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '14px', fontWeight: '500', color: '#0c4a6e' }}>생성된 파일이 없습니다</p>
                <p style={{ margin: '0', fontSize: '12px', color: '#0284c7' }}>
                  작업 목록에서 프롬프트를 복사하여 Claude Code에서 콘텐츠를 생성하세요
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {showWizard && (
        <AutoGenerationWizard
          course={course}
          folder={folder}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}
