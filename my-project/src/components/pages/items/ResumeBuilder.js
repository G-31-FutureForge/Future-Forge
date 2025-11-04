import React, { useMemo, useState } from 'react';
import './ResumeBuilder.css';

const emptyExperience = () => ({
  company: '',
  title: '',
  start: '',
  end: '',
  description: ''
});

const emptyEducation = () => ({
  school: '',
  degree: '',
  start: '',
  end: '',
  description: ''
});

const ResumeBuilder = () => {
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch (e) {
      return {};
    }
  }, []);

  const [personal, setPersonal] = useState({
    fullName: storedUser.firstName || storedUser.firstname || storedUser.name || storedUser.username || '',
    title: '',
    email: storedUser.email || '',
    phone: '',
    location: ''
  });

  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState('');
  const [experiences, setExperiences] = useState([emptyExperience()]);
  const [educations, setEducations] = useState([emptyEducation()]);
  const [step, setStep] = useState('choose'); // 'choose' | 'edit'
  const [template, setTemplate] = useState(null); // 'classic' | 'modern' | 'minimal'

  const addExperience = () => setExperiences([...experiences, emptyExperience()]);
  const removeExperience = (idx) => setExperiences(experiences.filter((_, i) => i !== idx));
  const updateExperience = (idx, field, value) => {
    const next = experiences.map((exp, i) => (i === idx ? { ...exp, [field]: value } : exp));
    setExperiences(next);
  };

  const addEducation = () => setEducations([...educations, emptyEducation()]);
  const removeEducation = (idx) => setEducations(educations.filter((_, i) => i !== idx));
  const updateEducation = (idx, field, value) => {
    const next = educations.map((ed, i) => (i === idx ? { ...ed, [field]: value } : ed));
    setEducations(next);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="resume-builder-container">
      <div className="resume-builder">
        <section className="rb-section">
          <h1 className="rb-title">Resume Builder</h1>
          <p className="rb-subtitle">Choose a template to get started. You can switch templates anytime.</p>
        </section>

        {step === 'choose' && (
          <div className="rb-templates">
            <div className="template-card" onClick={() => { setTemplate('classic'); setStep('edit'); }}>
              <div className="template-preview tp-classic" style={{ backgroundImage: "url(/images/1.jpg)", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: '#fff' }} />
              <div className="template-meta">
                <h3>Classic</h3>
                <p>Traditional layout with clear sections and subtle accents.</p>
              </div>
            </div>
            <div className="template-card" onClick={() => { setTemplate('modern'); setStep('edit'); }}>
              <div className="template-preview tp-modern" style={{ backgroundImage: "url(/images/2.jpg)", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: '#fff' }} />
              <div className="template-meta">
                <h3>Modern</h3>
                <p>Bold header, accent color, contemporary typography.</p>
              </div>
            </div>
            <div className="template-card" onClick={() => { setTemplate('minimal'); setStep('edit'); }}>
              <div className="template-preview tp-minimal" style={{ backgroundImage: "url(/images/3.jpg)", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: '#fff' }} />
              <div className="template-meta">
                <h3>Minimal</h3>
                <p>Clean, spacious layout focusing on readability.</p>
              </div>
            </div>
            <div className="template-card" onClick={() => { setTemplate('t4'); setStep('edit'); }}>
              <div className="template-preview" style={{ backgroundImage: "url(/images/4.jpg)", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: '#fff' }} />
              <div className="template-meta">
                <h3>Template 4</h3>
                <p>Alternate visual style with distinct layout.</p>
              </div>
            </div>
            <div className="template-card" onClick={() => { setTemplate('t5'); setStep('edit'); }}>
              <div className="template-preview" style={{ backgroundImage: "url(/images/5.jpg)", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: '#fff' }} />
              <div className="template-meta">
                <h3>Template 5</h3>
                <p>Clean professional layout with accents.</p>
              </div>
            </div>
            <div className="template-card" onClick={() => { setTemplate('t6'); setStep('edit'); }}>
              <div className="template-preview" style={{ backgroundImage: "url(/images/6.jpg)", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: '#fff' }} />
              <div className="template-meta">
                <h3>Template 6</h3>
                <p>Emphasis on experience and skills.</p>
              </div>
            </div>
            <div className="template-card" onClick={() => { setTemplate('t7'); setStep('edit'); }}>
              <div className="template-preview" style={{ backgroundImage: "url(/images/7.jpg)", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: '#fff' }} />
              <div className="template-meta">
                <h3>Template 7</h3>
                <p>Modern header with balanced spacing.</p>
              </div>
            </div>
            <div className="template-card" onClick={() => { setTemplate('t8'); setStep('edit'); }}>
              <div className="template-preview" style={{ backgroundImage: "url(/images/8.jpg)", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: '#fff' }} />
              <div className="template-meta">
                <h3>Template 8</h3>
                <p>Minimalist layout focusing on content.</p>
              </div>
            </div>
          </div>
        )}

        {step === 'edit' && (
        <div className="rb-grid">
          <div className="rb-form">
            <div className="rb-topbar">
              <span className="rb-chip">Template: {template}</span>
              <button className="rb-btn" onClick={() => setStep('choose')}>Change Template</button>
            </div>
            <h2>Personal Information</h2>
            <div className="rb-row">
              <label>Full Name</label>
              <input value={personal.fullName} onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })} />
            </div>
            <div className="rb-row">
              <label>Title</label>
              <input value={personal.title} onChange={(e) => setPersonal({ ...personal, title: e.target.value })} placeholder="e.g., Frontend Developer" />
            </div>
            <div className="rb-two">
              <div className="rb-row"><label>Email</label><input value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} /></div>
              <div className="rb-row"><label>Phone</label><input value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} /></div>
            </div>
            <div className="rb-row">
              <label>Location</label>
              <input value={personal.location} onChange={(e) => setPersonal({ ...personal, location: e.target.value })} placeholder="City, Country" />
            </div>

            <h2>Professional Summary</h2>
            <div className="rb-row">
              <textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief summary about your experience, strengths, and goals" />
            </div>

            <h2>Skills</h2>
            <div className="rb-row">
              <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Comma-separated e.g., React, Node.js, CSS" />
            </div>

            <h2>Experience</h2>
            {experiences.map((exp, idx) => (
              <div className="rb-card" key={`exp-${idx}`}>
                <div className="rb-two">
                  <div className="rb-row"><label>Company</label><input value={exp.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} /></div>
                  <div className="rb-row"><label>Title</label><input value={exp.title} onChange={(e) => updateExperience(idx, 'title', e.target.value)} /></div>
                </div>
                <div className="rb-two">
                  <div className="rb-row"><label>Start</label><input value={exp.start} onChange={(e) => updateExperience(idx, 'start', e.target.value)} placeholder="Jan 2023" /></div>
                  <div className="rb-row"><label>End</label><input value={exp.end} onChange={(e) => updateExperience(idx, 'end', e.target.value)} placeholder="Present" /></div>
                </div>
                <div className="rb-row"><label>Summary</label><textarea rows={3} value={exp.description} onChange={(e) => updateExperience(idx, 'description', e.target.value)} /></div>
                <div className="rb-actions-line">
                  <button className="rb-btn rb-btn-danger" onClick={() => removeExperience(idx)}>Remove</button>
                </div>
              </div>
            ))}
            <div className="rb-actions-line"><button className="rb-btn" onClick={addExperience}>Add Experience</button></div>

            <h2>Education</h2>
            {educations.map((ed, idx) => (
              <div className="rb-card" key={`ed-${idx}`}>
                <div className="rb-two">
                  <div className="rb-row"><label>School</label><input value={ed.school} onChange={(e) => updateEducation(idx, 'school', e.target.value)} /></div>
                  <div className="rb-row"><label>Degree</label><input value={ed.degree} onChange={(e) => updateEducation(idx, 'degree', e.target.value)} /></div>
                </div>
                <div className="rb-two">
                  <div className="rb-row"><label>Start</label><input value={ed.start} onChange={(e) => updateEducation(idx, 'start', e.target.value)} placeholder="2019" /></div>
                  <div className="rb-row"><label>End</label><input value={ed.end} onChange={(e) => updateEducation(idx, 'end', e.target.value)} placeholder="2023" /></div>
                </div>
                <div className="rb-row"><label>Notes</label><textarea rows={3} value={ed.description} onChange={(e) => updateEducation(idx, 'description', e.target.value)} /></div>
                <div className="rb-actions-line">
                  <button className="rb-btn rb-btn-danger" onClick={() => removeEducation(idx)}>Remove</button>
                </div>
              </div>
            ))}
            <div className="rb-actions-line"><button className="rb-btn" onClick={addEducation}>Add Education</button></div>

            <div className="rb-actions-end">
              <button className="rb-btn rb-primary" onClick={handlePrint}>Download PDF</button>
            </div>
          </div>

          <div className="rb-preview print-area">
            <div className={`resume ${template ? `tmpl-${template}` : ''}`}>
              {template === 'sidebar' ? (
                <>
                  <div className="rs-grid">
                    <aside className="rs-left">
                      <div className="rs-photo" />
                      <div className="rs-block">
                        <h3>Contact</h3>
                        <p>{personal.email}</p>
                        <p>{personal.phone}</p>
                        <p>{personal.location}</p>
                      </div>
                      {skills && (
                        <div className="rs-block">
                          <h3>Skills</h3>
                          <ul className="skills-list">
                            {skills.split(',').map((s, i) => (
                              <li key={`skill-sb-${i}`}>{s.trim()}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </aside>
                    <main className="rs-right">
                      <header>
                        <h1>{personal.fullName || 'Your Name'}</h1>
                        <p className="muted">{personal.title || 'Professional Title'}</p>
                      </header>
                      {summary && (
                        <section>
                          <h3>About Me</h3>
                          <p>{summary}</p>
                        </section>
                      )}
                      {experiences.filter((e) => e.company || e.title || e.description).length > 0 && (
                        <section>
                          <h3>Experience</h3>
                          {experiences.map((exp, i) => (
                            <div className="exp-item" key={`exp-sb-${i}`}>
                              <h4>{exp.title || 'Job Title'}{exp.company ? `, ${exp.company}` : ''}</h4>
                              <p className="muted">{[exp.start, exp.end].filter(Boolean).join(' - ')}</p>
                              {exp.description && <p>{exp.description}</p>}
                            </div>
                          ))}
                        </section>
                      )}
                      {educations.filter((e) => e.school || e.degree || e.description).length > 0 && (
                        <section>
                          <h3>Education</h3>
                          {educations.map((ed, i) => (
                            <div className="ed-item" key={`ed-sb-${i}`}>
                              <h4>{ed.degree || 'Degree'}{ed.school ? `, ${ed.school}` : ''}</h4>
                              <p className="muted">{[ed.start, ed.end].filter(Boolean).join(' - ')}</p>
                              {ed.description && <p>{ed.description}</p>}
                            </div>
                          ))}
                        </section>
                      )}
                    </main>
                  </div>
                </>
              ) : (
                <>
                  <header>
                    <h1>{personal.fullName || 'Your Name'}</h1>
                    <p className="muted">{personal.title || 'Professional Title'}</p>
                    <p className="contact">{[personal.email, personal.phone, personal.location].filter(Boolean).join(' \u2022 ')}</p>
                  </header>

                  {summary && (
                    <section>
                      <h3>Summary</h3>
                      <p>{summary}</p>
                    </section>
                  )}

                  {skills && (
                    <section>
                      <h3>Skills</h3>
                      <ul className="skills-list">
                        {skills.split(',').map((s, i) => (
                          <li key={`skill-${i}`}>{s.trim()}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {experiences.filter((e) => e.company || e.title || e.description).length > 0 && (
                    <section>
                      <h3>Experience</h3>
                      {experiences.map((exp, i) => (
                        <div className="exp-item" key={`exp-prev-${i}`}>
                          <h4>{exp.title || 'Job Title'}{exp.company ? `, ${exp.company}` : ''}</h4>
                          <p className="muted">{[exp.start, exp.end].filter(Boolean).join(' - ')}</p>
                          {exp.description && <p>{exp.description}</p>}
                        </div>
                      ))}
                    </section>
                  )}

                  {educations.filter((e) => e.school || e.degree || e.description).length > 0 && (
                    <section>
                      <h3>Education</h3>
                      {educations.map((ed, i) => (
                        <div className="ed-item" key={`ed-prev-${i}`}>
                          <h4>{ed.degree || 'Degree'}{ed.school ? `, ${ed.school}` : ''}</h4>
                          <p className="muted">{[ed.start, ed.end].filter(Boolean).join(' - ')}</p>
                          {ed.description && <p>{ed.description}</p>}
                        </div>
                      ))}
                    </section>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilder;


