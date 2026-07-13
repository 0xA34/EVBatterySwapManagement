import React, { useState, useEffect, useRef } from 'react';
import { Battery, Zap, Shield, Key } from 'lucide-react';
import { getApiUrl } from '../utils/api';

export default function LinkedBattery() {
  const [battery, setBattery] = useState<{ serialNumber: string; model: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [serialInput, setSerialInput] = useState('PIN-');
  const [modelInput, setModelInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const modelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // TODO: Có thể gắn thêm API lấy trạng thái pin hiện hành của user tại đây
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const handleLinkBattery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const serialUpper = serialInput.trim().toUpperCase();
    const modelTrimmed = modelInput.trim();
    
    if (!serialUpper || !modelTrimmed) return;
    
    if (!serialUpper.startsWith('PIN-') || serialUpper.length > 10) {
      setErrorMsg('Số Serial phải bắt đầu bằng PIN- và tối đa 6 ký tự viết hoa phía sau.');
      return;
    }

    const modelParts = modelTrimmed.split('-');
    if (modelParts.length !== 2 || modelParts[1].length !== 6) {
      setErrorMsg('Model Pin phải có định dạng <Tên>-<6 ký tự viết hoa>, VD: Drift-XZMLQA');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('user_token');
      const response = await fetch(getApiUrl('/api/link-battery'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          serialNumber: serialUpper,
          model: modelTrimmed,
          capacityKwh: 0,
          currentChargePercentage: 100
        })
      });

      if (response.ok) {
        setBattery({
          serialNumber: serialUpper,
          model: modelTrimmed
        });
      } else {
        const errText = await response.text();
        setErrorMsg('Lỗi liên kết: ' + errText);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="landing" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 80px)', padding: '3rem 1rem' }}>
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '2.5rem', fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Pin Đang Sử Dụng
        </h1>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '3px solid #e2e8f0', 
              borderTopColor: '#2563eb', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: '500' }}>Đang tải thông tin pin...</p>
          </div>
        ) : battery ? (
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '24px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #2563eb 100%)', 
              padding: '3rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative elements */}
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>

              <div style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                padding: '1.25rem', 
                borderRadius: '50%',
                marginBottom: '1.5rem',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                position: 'relative',
                zIndex: 1
              }}>
                <Battery size={56} color="white" />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0, position: 'relative', zIndex: 1 }}>Pin Xe Điện Hiện Tại</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', opacity: 0.95, fontSize: '0.95rem', backgroundColor: 'rgba(0,0,0,0.15)', padding: '4px 12px', borderRadius: '999px', position: 'relative', zIndex: 1 }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', boxShadow: '0 0 8px #4ade80' }}></span>
                Trạng thái: Đang kết nối
              </div>
            </div>
            
            <div style={{ padding: '2.5rem 2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '16px', color: '#3b82f6' }}>
                    <Key size={28} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Số Serial</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', color: '#0f172a', fontWeight: '700', fontFamily: 'monospace' }}>
                      {battery.serialNumber}
                    </p>
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: '#e2e8f0' }}></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '16px', color: '#10b981' }}>
                    <Zap size={28} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Model Pin</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', color: '#0f172a', fontWeight: '600' }}>
                      {battery.model}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', padding: '1.25rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Shield size={24} color="#16a34a" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534', lineHeight: '1.6' }}>
                  Đây là thông tin viên pin đang được gắn trên xe của bạn. Hãy đảm bảo số serial trên ứng dụng khớp với số serial thực tế trên vỏ pin để đảm bảo quyền lợi bảo hành.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '24px', 
            padding: '3rem 2rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                backgroundColor: '#f0f9ff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                border: '4px solid #e0f2fe'
              }}>
                <Battery size={40} color="#0ea5e9" />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.75rem', fontWeight: '700' }}>Liên kết pin mới</h3>
              <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0, maxWidth: '400px', marginInline: 'auto', lineHeight: '1.5' }}>
                Vui lòng nhập thông tin được in trên thân viên pin để tiến hành liên kết với tài khoản.
              </p>
            </div>

            <form onSubmit={handleLinkBattery} style={{ maxWidth: '450px', margin: '0 auto' }}>
              {errorMsg && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#b91c1c', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={18} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>
                  Số Serial <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    <Key size={20} />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={serialInput}
                    onChange={(e) => {
                      let val = e.target.value.toUpperCase();
                      if (!val.startsWith('PIN-')) {
                        val = 'PIN-';
                      }
                      if (val.length <= 10) {
                        setSerialInput(val);
                      }
                    }}
                    placeholder="VD: PIN-123456"
                    style={{ 
                      width: '100%', 
                      padding: '0.875rem 1rem 0.875rem 3.25rem', 
                      borderRadius: '12px', 
                      border: '1px solid #cbd5e1',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      textTransform: 'uppercase',
                      backgroundColor: '#f8fafc'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>
                  Model Pin <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    <Zap size={20} />
                  </div>
                  <input 
                    ref={modelInputRef}
                    type="text" 
                    required
                    value={modelInput}
                    onChange={(e) => {
                      let val = e.target.value;
                      const dashIndex = val.indexOf('-');
                      if (dashIndex !== -1) {
                        let prefix = val.substring(0, dashIndex);
                        prefix = prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();
                        const suffix = val.substring(dashIndex + 1).toUpperCase().substring(0, 6);
                        setModelInput(prefix + '-' + suffix);
                      } else {
                        if (val.length > 0) {
                          val = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
                        }
                        setModelInput(val);
                      }
                    }}
                    placeholder="VD: Drift-XZMLQA"
                    style={{ 
                      width: '100%', 
                      padding: '0.875rem 1rem 0.875rem 3.25rem',
                      borderRadius: '12px', 
                      border: '1px solid #cbd5e1',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: '#f8fafc'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {['Vero', 'Feliz', 'Evo', 'Drift'].map((model) => {
                    const isSelected = modelInput.startsWith(model + '-');
                    return (
                      <button
                        key={model}
                        type="button"
                        onClick={() => {
                          setModelInput(model + '-');
                          setTimeout(() => modelInputRef.current?.focus(), 50);
                        }}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '20px',
                          border: `1px solid ${isSelected ? '#3b82f6' : '#cbd5e1'}`,
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          color: isSelected ? '#2563eb' : '#64748b',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#94a3b8';
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.backgroundColor = '#ffffff';
                          }
                        }}
                      >
                        {model}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !serialInput.trim() || !modelInput.trim()}
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  backgroundColor: (isSubmitting || !serialInput.trim() || !modelInput.trim()) ? '#94a3b8' : '#2563eb', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontSize: '1.05rem', 
                  fontWeight: '600',
                  cursor: (isSubmitting || !serialInput.trim() || !modelInput.trim()) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s, transform 0.1s',
                  boxShadow: (isSubmitting || !serialInput.trim() || !modelInput.trim()) ? 'none' : '0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1)'
                }}
                onMouseDown={(e) => { if (!isSubmitting && serialInput.trim() && modelInput.trim()) e.currentTarget.style.transform = 'scale(0.98)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      border: '2px solid rgba(255,255,255,0.3)', 
                      borderTopColor: '#ffffff', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite' 
                    }}></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    Xác nhận liên kết
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
