import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Lock, Bell, Globe, Clock, Building, RotateCcw } from 'lucide-react';
import { getConfig, updateConfig, resetConfig } from '@/services/config';

const SystemConfig = () => {
  const [config, setConfig] = useState({
    organizationName: '',
    standardWorkingHours: '',
    systemTimezone: '',
    allowOvertimeLogging: true,
    autoApproveLeaves: false,
    multiFactorAuth: true,
    adminNotificationsEmail: ''
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    setLoading(true);
    const data = await getConfig();
    setConfig(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateConfig(config);
    if (result.success) {
      alert('System configuration updated successfully!');
    }
    setSaving(false);
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all configurations to factory defaults?')) {
      const result = await resetConfig();
      if (result.success) {
        setConfig(result.config);
        alert('System configuration reset to defaults.');
      }
    }
  };

  return (
    <div className="fade-in">
       <header style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>System Configuration</h2>
          <p style={{ color: '#64748b' }}>Configure global settings and security protocols for the entire organization</p>
       </header>

       <div className="grid grid-cols-3">
          <div className="card" style={{ gridColumn: 'span 2' }}>
             <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Building size={20} style={{ color: '#4f46e5' }} /> General Settings
             </h3>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#475569' }}>Organization Name</label>
                   <input 
                      type="text" 
                      value={config.organizationName} 
                      onChange={(e) => setConfig({...config, organizationName: e.target.value})}
                      style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} 
                   />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#475569' }}>Standard Working Hours</label>
                   <div style={{ position: 'relative' }}>
                      <Clock size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input 
                        type="text" 
                        value={config.standardWorkingHours} 
                        onChange={(e) => setConfig({...config, standardWorkingHours: e.target.value})}
                        style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} 
                      />
                   </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#475569' }}>System Timezone</label>
                   <div style={{ position: 'relative' }}>
                      <Globe size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input 
                        type="text" 
                        value={config.systemTimezone} 
                        onChange={(e) => setConfig({...config, systemTimezone: e.target.value})}
                        style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} 
                      />
                   </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#475569' }}>Admin Notifications Email</label>
                   <div style={{ position: 'relative' }}>
                      <Bell size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input 
                        type="text" 
                        value={config.adminNotificationsEmail} 
                        onChange={(e) => setConfig({...config, adminNotificationsEmail: e.target.value})}
                        style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} 
                      />
                   </div>
                </div>
             </div>

             <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '2rem', paddingTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={fetchConfig} disabled={loading}>Discard Changes</button>
                <button onClick={handleSave} className="btn btn-primary" style={{ padding: '0.875rem 2.5rem' }} disabled={saving || loading}>
                   {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                   <span>{saving ? 'Processing...' : 'Apply Global Configuration'}</span>
                </button>
             </div>
          </div>
 
          <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <Lock size={18} style={{ color: '#ef4444' }} /> Security Protocols
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Multi-Factor Auth</span>
                      <div style={{ width: '40px', height: '22px', background: config.multiFactorAuth ? '#10b981' : '#cbd5e1', borderRadius: '11px', cursor: 'pointer', position: 'relative' }} onClick={() => setConfig({...config, multiFactorAuth: !config.multiFactorAuth})}>
                        <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: config.multiFactorAuth ? '20px' : '2px', transition: 'all 0.2s' }}></div>
                      </div>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Auto-Approve Leaves</span>
                      <div style={{ width: '40px', height: '22px', background: config.autoApproveLeaves ? '#10b981' : '#cbd5e1', borderRadius: '11px', cursor: 'pointer', position: 'relative' }} onClick={() => setConfig({...config, autoApproveLeaves: !config.autoApproveLeaves})}>
                        <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: config.autoApproveLeaves ? '20px' : '2px', transition: 'all 0.2s' }}></div>
                      </div>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Allow Overtime Logging</span>
                      <div style={{ width: '40px', height: '22px', background: config.allowOvertimeLogging ? '#10b981' : '#cbd5e1', borderRadius: '11px', cursor: 'pointer', position: 'relative' }} onClick={() => setConfig({...config, allowOvertimeLogging: !config.allowOvertimeLogging})}>
                        <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: config.allowOvertimeLogging ? '20px' : '2px', transition: 'all 0.2s' }}></div>
                      </div>
                   </div>
                </div>
             </div>
 
             <div className="card" style={{ background: '#fef2f2', borderColor: '#fee2e2' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#991b1b' }}>Danger Zone</h3>
                <p style={{ fontSize: '0.75rem', color: '#991b1b', opacity: 0.8, marginBottom: '1.25rem' }}>Resetting system configuration will revert all settings to factory default. This action is irreversible.</p>
                <button 
                   className="btn btn-outline" 
                   style={{ width: '100%', borderColor: '#fca5a5', color: '#991b1b', justifyContent: 'center' }}
                   onClick={handleReset}
                >
                   <RotateCcw size={16} /> Reset to Factory Defaults
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

export default SystemConfig;
