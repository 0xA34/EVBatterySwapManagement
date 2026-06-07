import React, { useState } from 'react';

export default function Contact() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !message) {
      alert("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      alert("Chúng tôi đã nhận được yêu cầu hỗ trợ của bạn.");
      setEmail('');
      setSubject('');
      setMessage('');
    }, 500);
  };

  return (
    <main className="contact">
      <div className="container">
        <div className="contact-form-wrapper">
          <div className="form-card">
            <div className="form-header">
              <h1 className="form-title">Gửi yêu cầu hỗ trợ</h1>
              <p className="form-subtitle">Điền thông tin dưới đây để chúng tôi có thể hỗ trợ bạn tốt nhất</p>
            </div>

            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <label className="field">
                <span className="label">Email <span className="required">*</span></span>
                <input 
                  type="email" 
                  placeholder="email@example.com" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="field">
                <span className="label">Tiêu đề <span className="required">*</span></span>
                <input 
                  type="text" 
                  placeholder="Mô tả ngắn gọn vấn đề của bạn" 
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </label>

              <label className="field">
                <span className="label">Nội dung chi tiết <span className="required">*</span></span>
                <textarea 
                  rows={6} 
                  placeholder="Mô tả chi tiết vấn đề, lỗi gặp phải hoặc yêu cầu hỗ trợ..." 
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </label>

              <button type="submit" className="submit-button">
                <span className="button-text">Gửi yêu cầu hỗ trợ</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
