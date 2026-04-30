export function CourseCard({ course, onClick }) {
  const { status, course_name, course_code, semester, professor_name, delivery_language } = course;
  const percentage = status?.progress?.percentage || 0;

  const getProgressColor = () => {
    if (percentage === 0) return '#d1d5db';
    if (percentage < 50) return '#60a5fa';
    if (percentage < 100) return '#fbbf24';
    return '#10b981';
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>{course_name}</h3>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>{course_code}</p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '12px', color: '#4b5563', margin: '4px 0' }}>
          <span style={{ fontWeight: '500' }}>학기:</span> {semester}
        </p>
        <p style={{ fontSize: '12px', color: '#4b5563', margin: '4px 0' }}>
          <span style={{ fontWeight: '500' }}>교수:</span> {professor_name}
        </p>
        <p style={{ fontSize: '12px', color: '#4b5563', margin: '4px 0' }}>
          <span style={{ fontWeight: '500' }}>언어:</span> {delivery_language}
        </p>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '500' }}>진행률</span>
          <span style={{ fontSize: '12px', fontWeight: '600' }}>{percentage}%</span>
        </div>
        <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '8px' }}>
          <div
            style={{
              height: '8px',
              borderRadius: '9999px',
              backgroundColor: getProgressColor(),
              width: `${percentage}%`,
              transition: 'width 0.3s'
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: '11px', color: '#6b7280', margin: '0' }}>
          {status?.progress?.completed} / {status?.progress?.total} 항목 완료
        </p>
      </div>
    </div>
  );
}
