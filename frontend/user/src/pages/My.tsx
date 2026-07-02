import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import img1 from '../image/Dr.Watermark_1782828785644.jpeg';
import img2 from '../image/Dr.Watermark_1782828850569.jpeg';
import img3 from '../image/Gemini_Generated_Image_71hbha71hbha71hb-clean.png';
import img4 from '../image/Gemini_Generated_Image_dliummdliummdliu-clean.png';
import productImg from '../image/1.jpg';

const images = [img1, img2, img3, img4];

export default function My() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <main className="landing">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1 className="hero-title">ChargeX</h1>
            <p className="hero-subtitle">Phần mềm quản lý trạm đổi pin xe điện</p>
            <p className="hero-desc">Giám sát trạng thái trạm, quản lý tồn kho pin, điều phối đổi pin theo thời gian thực, báo cáo hiệu suất và cảnh báo sự cố.</p>
            <div className="hero-actions">
              <Link to="/nearest-stations" className="button primary">Tìm kiếm trạm gần nhất</Link>
              <Link to="/book" className="button">Đặt lịch đổi pin</Link>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="hero-card">
              <div className="hero-metric">
                <span className="metric-label">Trạm hoạt động</span>
                <span className="metric-value">24</span>
              </div>
              <div className="hero-metric">
                <span className="metric-label">Lượt đổi hôm nay</span>
                <span className="metric-value">1.268</span>
              </div>
              <div className="hero-metric">
                <span className="metric-label">Tồn kho pin</span>
                <span className="metric-value">542</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="carousel-section" style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
        <div className="container" style={{ position: 'relative', width: '100%', maxWidth: '1000px', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
          
          <div style={{ position: 'relative', width: '100%' }}>
            {images.map((img, index) => (
              <img 
                key={index} 
                src={img} 
                alt={`Slide ${index + 1}`} 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  display: 'block',
                  position: index === currentIndex ? 'relative' : 'absolute',
                  top: 0,
                  left: 0,
                  opacity: index === currentIndex ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out',
                  zIndex: index === currentIndex ? 1 : 0
                }} 
              />
            ))}
          </div>
          
          <button 
            onClick={prevSlide}
            style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: 10 }}
          >
            <ChevronLeft size={24} color="#333" />
          </button>
          <button 
            onClick={nextSlide}
            style={{ position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: 10 }}
          >
            <ChevronRight size={24} color="#333" />
          </button>
          
          <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  background: currentIndex === index ? '#0ea5e9' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="products-section" style={{ padding: '4rem 0', backgroundColor: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2rem', color: '#1e293b', fontWeight: 'bold' }}>Sản phẩm & Dịch vụ nổi bật</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '2rem' 
          }}>
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} style={{ 
                backgroundColor: '#fff', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ position: 'relative', paddingTop: '66.67%' }}>
                  <img src={productImg} alt={`Sản phẩm ${index + 1}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#0f172a', fontWeight: '600' }}>Gói dịch vụ cao cấp {index + 1}</h3>
                  <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5', flex: 1 }}>
                    Giải pháp đổi pin nhanh chóng, an toàn và tiện lợi dành riêng cho xe điện của bạn.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontWeight: 'bold', color: '#0ea5e9', fontSize: '1.125rem' }}>Liên hệ</span>
                    <button style={{ 
                      backgroundColor: '#0f172a', 
                      color: 'white', 
                      border: 'none', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
                    >
                      Đăng ký ngay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
