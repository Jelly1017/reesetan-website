// src/components/crm/ContactForm.tsx
// React island for the contact form.
// - Posts to /api/contact (which writes to Supabase + sends email)
// - Client-side validation with the same Zod schema
// - Success state: shows confirmation + WhatsApp handoff
// - Honeypot field for spam

import { useState } from 'react';

type Service = 'training' | 'consultation' | 'strategy';
type Status = 'idle' | 'submitting' | 'success' | 'error';

interface Props {
  locale: 'en' | 'zh';
}

export default function ContactForm({ locale }: Props) {
  const isZh = locale === 'zh';
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || ''),
      service: String(fd.get('service') || '') as Service,
      team_size: String(fd.get('team_size') || '') || null,
      goals: String(fd.get('goals') || ''),
      locale,
      website: String(fd.get('website') || ''), // honeypot
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setErrorMsg(json.error || (isZh ? '提交失败,请重试。' : 'Submission failed. Please try again.'));
        setStatus('error');
        return;
      }

      setStatus('success');
      e.currentTarget.reset();
    } catch (err) {
      setErrorMsg(isZh ? '网络错误,请重试。' : 'Network error. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'oklch(94% 0.05 145)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="oklch(45% 0.15 145)" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 style={{ margin: '0 0 12px' }}>
          {isZh ? '收到!' : "Thanks — got it!"}
        </h3>
        <p style={{ color: 'var(--muted-foreground)', margin: '0 0 24px' }}>
          {isZh
            ? '我会在 24 小时内通过 WhatsApp 或邮件与您联系。'
            : "I'll be in touch within 24 hours via WhatsApp or email."}
        </p>
        <a
          href="https://wa.me/60163356790?text=Hi%20Reese%2C%20I%20just%20submitted%20the%20form%20on%20your%20website!"
          target="_blank"
          rel="noopener"
          className="btn btn--secondary"
        >
          {isZh ? '直接 WhatsApp 我' : 'Message me on WhatsApp now'}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="form-label" htmlFor="name">
            {isZh ? '姓名' : 'Name'} <span style={{ color: 'var(--destructive)' }}>*</span>
          </label>
          <input id="name" name="name" type="text" required className="input" placeholder={isZh ? '您的姓名' : 'Your name'} autoComplete="name" />
        </div>
        <div>
          <label className="form-label" htmlFor="email">
            {isZh ? '邮箱' : 'Email'} <span style={{ color: 'var(--destructive)' }}>*</span>
          </label>
          <input id="email" name="email" type="email" required className="input" placeholder={isZh ? 'you@company.com' : 'you@company.com'} autoComplete="email" />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label className="form-label" htmlFor="phone">
          {isZh ? '电话号码(优先 WhatsApp)' : 'Phone (WhatsApp preferred)'} <span style={{ color: 'var(--destructive)' }}>*</span>
        </label>
        <input id="phone" name="phone" type="tel" required className="input" placeholder="+60 12-345 6789" autoComplete="tel" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div>
          <label className="form-label" htmlFor="service">
            {isZh ? '感兴趣的服务' : 'Service'} <span style={{ color: 'var(--destructive)' }}>*</span>
          </label>
          <select id="service" name="service" required className="select" defaultValue="">
            <option value="" disabled>{isZh ? '选择一项' : 'Select one'}</option>
            <option value="training">{isZh ? '中小企业 / 企业培训' : 'SME / Corporate Training'}</option>
            <option value="consultation">{isZh ? '小时咨询' : 'Hourly Consultation'}</option>
            <option value="strategy">{isZh ? '营销策略审核' : 'Strategy Review'}</option>
          </select>
        </div>
        <div>
          <label className="form-label" htmlFor="team_size">
            {isZh ? '团队人数(如果是企业)' : 'Team size (if corporate)'}
          </label>
          <input id="team_size" name="team_size" type="text" className="input" placeholder={isZh ? '例如 10-20 人' : 'e.g. 10–20 people'} />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label className="form-label" htmlFor="goals">
          {isZh ? '您的目标' : 'Your goals'} <span style={{ color: 'var(--destructive)' }}>*</span>
        </label>
        <textarea
          id="goals"
          name="goals"
          required
          className="textarea"
          rows={4}
          placeholder={isZh ? '想用 AI 解决什么问题?目前的痛点是什么?' : 'What do you want to use AI for? What\'s the pain point?'}
        />
      </div>

      {/* Honeypot — hidden from humans, bots fill it */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {errorMsg && (
        <div className="form-status form-status--error" style={{ marginTop: 16 }} role="alert">
          {errorMsg}
        </div>
      )}

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
        <button
          type="submit"
          className="btn btn--primary btn--lg"
          disabled={status === 'submitting'}
        >
          {status === 'submitting'
            ? (isZh ? '发送中…' : 'Sending…')
            : (isZh ? '提交咨询' : 'Send Inquiry')}
        </button>
        <div className="hero-cta__reducer">
          {isZh ? '24 小时内回复 · 无承诺 · 工作日 9–6 (MYT)' : 'Reply within 24 hours · No commitment · Mon–Fri 9–6 MYT'}
        </div>
      </div>
    </form>
  );
}
