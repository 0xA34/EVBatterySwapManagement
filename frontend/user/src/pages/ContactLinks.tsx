import { Link } from 'react-router-dom';

export default function ContactLinks() {
  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', padding: '4rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.5px' }}>Liên Hệ & Hỗ Trợ</h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn mọi lúc, mọi nơi. Vui lòng chọn kênh liên lạc phù hợp nhất.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Hotline */}
          <a href="tel:1900232389" className="contact-link-card" style={{ background: 'white', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', transition: 'all 0.3s ease', textAlign: 'center' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#1e293b' }}>Hotline Tư vấn</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Hỗ trợ khách hàng 24/7</p>
              <div style={{ marginTop: '1rem', fontSize: '1.4rem', fontWeight: 700, color: '#2563eb' }}>1900 23 23 89</div>
            </div>
          </a>

          {/* Email */}
          <a href="mailto:support@chargex.local" className="contact-link-card" style={{ background: 'white', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', transition: 'all 0.3s ease', textAlign: 'center' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#1e293b' }}>Email Hỗ trợ</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Phản hồi trong vòng 24 giờ</p>
              <div style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: 600, color: '#0d9488' }}>support@chargex.local</div>
            </div>
          </a>

          {/* Zalo OA */}
          <a href="#" className="contact-link-card" style={{ background: 'white', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', transition: 'all 0.3s ease', textAlign: 'center' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#fdf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c026d3' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#1e293b' }}>Zalo OA</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Trò chuyện trực tiếp với tư vấn</p>
              <div style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: 600, color: '#c026d3' }}>ChargeX Việt Nam</div>
            </div>
          </a>

          {/* Form */}
          <Link to="/contact" className="contact-link-card dark-card" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: '0 10px 30px -10px rgba(15,23,42,0.4)', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', transition: 'all 0.3s ease', textAlign: 'center' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8fafc' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#f8fafc' }}>Gửi yêu cầu trực tuyến</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>Mô tả chi tiết vấn đề của bạn</p>
              <div style={{ marginTop: '1rem', display: 'inline-block', background: 'rgba(255,255,255,0.15)', padding: '8px 24px', borderRadius: '20px', color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Điền Form →</div>
            </div>
          </Link>
        </div>
      </div>
      <style>{`
        .contact-link-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1) !important; }
        .dark-card:hover { box-shadow: 0 20px 40px -10px rgba(15,23,42,0.5) !important; filter: brightness(1.1); }
      `}</style>
    </main>
  );
}
