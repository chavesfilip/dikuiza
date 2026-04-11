"use client";
import { useState, useEffect } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// Afrofuturist-Minimalist: deep charcoal base, warm amber gold accent,
// terracotta secondary, crisp white typography
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:       #0F0E0D;
    --ink-soft:  #1C1A17;
    --ink-mid:   #2A2723;
    --gold:      #E8A030;
    --gold-lite: #F2BC60;
    --gold-dim:  #A06E18;
    --terra:     #C0522A;
    --terra-lite:#D97850;
    --sage:      #3D6B58;
    --sage-lite: #5A9B7F;
    --white:     #FAF7F2;
    --white-dim: #C8C2B8;
    --white-mute:#706A61;
    --danger:    #D94040;
    --success:   #3A9E6E;
    --border:    rgba(232,160,48,0.15);
    --border-strong: rgba(232,160,48,0.35);
    --glass:     rgba(255,255,255,0.03);
    --glass-hover: rgba(255,255,255,0.06);
    --radius:    12px;
    --radius-lg: 20px;
    --shadow:    0 4px 24px rgba(0,0,0,0.4);
    --shadow-gold: 0 0 40px rgba(232,160,48,0.12);
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--ink);
    color: var(--white);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── SCROLLBAR ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--ink-soft); }
  ::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 2px; }

  /* ── LOGIN PAGE ── */
  .login-root {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    position: relative;
    overflow: hidden;
  }
  @media (max-width: 900px) {
    .login-root { grid-template-columns: 1fr; }
    .login-brand { display: none; }
  }

  /* brand side */
  .login-brand {
    background: var(--ink-soft);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px;
    overflow: hidden;
  }
  .login-brand::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 30% 20%, rgba(232,160,48,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 40% 60% at 80% 80%, rgba(192,82,42,0.06) 0%, transparent 60%);
  }
  .brand-geo {
    position: absolute;
    top: -80px; right: -80px;
    width: 400px; height: 400px;
    border: 1px solid var(--border-strong);
    border-radius: 50%;
    opacity: 0.4;
    animation: spinSlow 40s linear infinite;
  }
  .brand-geo::after {
    content: '';
    position: absolute;
    inset: 40px;
    border: 1px solid var(--border);
    border-radius: 50%;
  }
  @keyframes spinSlow { to { transform: rotate(360deg); } }

  .brand-geo-sq {
    position: absolute;
    bottom: 120px; left: -40px;
    width: 160px; height: 160px;
    border: 1px solid var(--border);
    transform: rotate(30deg);
    opacity: 0.3;
  }

  .brand-logo {
    position: relative;
    z-index: 1;
  }
  .brand-logo-mark {
    width: 48px; height: 48px;
    background: var(--gold);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 20px;
    color: var(--ink);
    letter-spacing: -1px;
    margin-bottom: 14px;
  }
  .brand-logo-name {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--white);
  }
  .brand-logo-tag {
    font-size: 12px;
    color: var(--white-mute);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 4px;
  }

  .brand-hero {
    position: relative; z-index: 1;
  }
  .brand-hero h2 {
    font-family: 'Syne', sans-serif;
    font-size: 42px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -1px;
    color: var(--white);
    margin-bottom: 16px;
  }
  .brand-hero h2 span { color: var(--gold); }
  .brand-hero p {
    font-size: 15px;
    color: var(--white-dim);
    line-height: 1.7;
    max-width: 320px;
  }

  .brand-stats {
    position: relative; z-index: 1;
    display: flex; gap: 32px;
  }
  .brand-stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: var(--gold);
  }
  .brand-stat-label {
    font-size: 12px;
    color: var(--white-mute);
    margin-top: 2px;
  }

  /* form side */
  .login-form-side {
    background: var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
    position: relative;
  }
  .login-form-side::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold-dim), transparent);
    display: none;
  }
  @media (max-width: 900px) {
    .login-form-side::before { display: block; }
  }

  .login-card {
    width: 100%;
    max-width: 420px;
  }
  .login-card-header {
    margin-bottom: 40px;
  }
  .login-card-logo {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 32px;
  }
  .login-card-logo-mark {
    width: 36px; height: 36px;
    background: var(--gold);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 14px;
    color: var(--ink);
  }
  .login-card-logo-name {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--white);
  }
  .login-card h1 {
    font-family: 'Syne', sans-serif;
    font-size: 30px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--white);
    margin-bottom: 8px;
  }
  .login-card p.subtitle {
    font-size: 14px;
    color: var(--white-mute);
    line-height: 1.6;
  }

  /* role selector */
  .role-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 28px;
  }
  .role-btn {
    background: var(--ink-soft);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 10px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    color: var(--white-mute);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
  }
  .role-btn:hover { background: var(--glass-hover); border-color: var(--gold-dim); color: var(--white); }
  .role-btn.active {
    background: rgba(232,160,48,0.1);
    border-color: var(--gold);
    color: var(--gold);
  }
  .role-icon { font-size: 18px; }

  /* input */
  .field { margin-bottom: 18px; }
  .field label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--white-dim);
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  .field input {
    width: 100%;
    background: var(--ink-soft);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 13px 16px;
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .field input::placeholder { color: var(--white-mute); }
  .field input:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(232,160,48,0.1);
  }

  .field-row {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 8px;
  }
  .field-row label { margin: 0; }
  .field-link {
    font-size: 12px;
    color: var(--gold);
    cursor: pointer;
    background: none; border: none;
    font-family: 'DM Sans', sans-serif;
  }
  .field-link:hover { color: var(--gold-lite); }

  .btn-primary {
    width: 100%;
    background: var(--gold);
    color: var(--ink);
    border: none;
    border-radius: var(--radius);
    padding: 14px;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
    letter-spacing: 0.2px;
    margin-top: 8px;
  }
  .btn-primary:hover { background: var(--gold-lite); box-shadow: 0 4px 20px rgba(232,160,48,0.3); }
  .btn-primary:active { transform: scale(0.99); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .login-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 24px 0;
    color: var(--white-mute);
    font-size: 12px;
  }
  .login-divider::before, .login-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .login-footer {
    text-align: center;
    font-size: 13px;
    color: var(--white-mute);
    margin-top: 24px;
  }
  .login-footer button {
    background: none; border: none;
    color: var(--gold);
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
  }

  /* error */
  .alert-error {
    background: rgba(217,64,64,0.1);
    border: 1px solid rgba(217,64,64,0.3);
    border-radius: var(--radius);
    padding: 12px 14px;
    font-size: 13px;
    color: #f0a0a0;
    margin-bottom: 18px;
  }

  /* ─── DASHBOARD ──────────────────────────────────────────────────────────── */
  .dash-root {
    min-height: 100vh;
    display: flex;
  }

  /* sidebar */
  .sidebar {
    width: 240px;
    background: var(--ink-soft);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; bottom: 0; left: 0;
    z-index: 100;
    transition: transform 0.3s;
  }
  .sidebar-logo {
    padding: 24px 20px;
    display: flex; align-items: center; gap: 10px;
    border-bottom: 1px solid var(--border);
  }
  .sidebar-logo-mark {
    width: 34px; height: 34px;
    background: var(--gold);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 800; font-size: 13px;
    color: var(--ink); flex-shrink: 0;
  }
  .sidebar-logo-text { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; }

  .sidebar-nav {
    flex: 1;
    padding: 16px 12px;
    overflow-y: auto;
  }
  .nav-label {
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--white-mute);
    padding: 8px 8px 6px;
    margin-top: 8px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    color: var(--white-mute);
    font-size: 13.5px;
    font-weight: 400;
    transition: all 0.15s;
    position: relative;
    border: none; background: none;
    width: 100%; text-align: left;
    font-family: 'DM Sans', sans-serif;
    margin-bottom: 2px;
  }
  .nav-item:hover { background: var(--glass-hover); color: var(--white); }
  .nav-item.active {
    background: rgba(232,160,48,0.12);
    color: var(--gold);
    font-weight: 500;
  }
  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 18px;
    background: var(--gold);
    border-radius: 0 2px 2px 0;
  }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; }
  .nav-badge {
    margin-left: auto;
    background: var(--terra);
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
  }

  .sidebar-user {
    padding: 16px 12px;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
    cursor: pointer;
  }
  .sidebar-avatar {
    width: 34px; height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold-dim), var(--terra));
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600;
    color: var(--white);
    flex-shrink: 0;
  }
  .sidebar-user-info { flex: 1; min-width: 0; }
  .sidebar-user-name { font-size: 13px; font-weight: 500; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-user-role { font-size: 11px; color: var(--gold); margin-top: 1px; }

  /* main */
  .dash-main {
    margin-left: 240px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--ink);
  }

  /* topbar */
  .topbar {
    position: sticky; top: 0; z-index: 50;
    background: rgba(15,14,13,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    height: 60px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .topbar-left { display: flex; align-items: center; gap: 16px; }
  .topbar-page {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--white);
  }
  .topbar-crumb { font-size: 13px; color: var(--white-mute); }

  .topbar-right { display: flex; align-items: center; gap: 16px; }
  .topbar-notif {
    position: relative;
    width: 36px; height: 36px;
    border-radius: 10px;
    background: var(--ink-soft);
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.15s;
  }
  .topbar-notif:hover { border-color: var(--gold-dim); }
  .notif-dot {
    position: absolute;
    top: 6px; right: 6px;
    width: 7px; height: 7px;
    background: var(--terra);
    border-radius: 50%;
    border: 2px solid var(--ink);
  }

  /* content */
  .dash-content {
    flex: 1;
    padding: 32px;
    overflow-y: auto;
  }

  /* welcome banner */
  .welcome-banner {
    background: var(--ink-soft);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
  }
  .welcome-banner::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 50% 100% at 80% 50%, rgba(232,160,48,0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .welcome-banner::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--gold), var(--terra), transparent);
  }
  .welcome-greeting { font-size: 13px; color: var(--white-mute); margin-bottom: 6px; }
  .welcome-name {
    font-family: 'Syne', sans-serif;
    font-size: 24px; font-weight: 700;
    color: var(--white);
    letter-spacing: -0.3px;
    margin-bottom: 8px;
  }
  .welcome-name span { color: var(--gold); }
  .welcome-meta { font-size: 13px; color: var(--white-mute); display: flex; gap: 16px; }
  .welcome-meta span { display: flex; align-items: center; gap: 5px; }

  .welcome-status {
    display: flex; flex-direction: column; align-items: flex-end; gap: 8px;
  }
  .status-pill {
    display: flex; align-items: center; gap: 6px;
    background: rgba(58,158,110,0.12);
    border: 1px solid rgba(58,158,110,0.3);
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 12px;
    color: var(--success);
    font-weight: 500;
  }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

  /* kpi cards */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }

  .kpi-card {
    background: var(--ink-soft);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 22px 24px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .kpi-card:hover { border-color: var(--border-strong); box-shadow: var(--shadow-gold); }
  .kpi-card::before {
    content: '';
    position: absolute;
    bottom: 0; right: 0;
    width: 80px; height: 80px;
    border-radius: 50%;
    opacity: 0.06;
  }
  .kpi-card.gold::before { background: var(--gold); }
  .kpi-card.terra::before { background: var(--terra); }
  .kpi-card.sage::before { background: var(--sage); }
  .kpi-card.warn::before { background: #e8c030; }

  .kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .kpi-icon-wrap {
    width: 38px; height: 38px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px;
  }
  .gold .kpi-icon-wrap { background: rgba(232,160,48,0.15); }
  .terra .kpi-icon-wrap { background: rgba(192,82,42,0.15); }
  .sage .kpi-icon-wrap { background: rgba(61,107,88,0.15); }
  .warn .kpi-icon-wrap { background: rgba(232,192,48,0.15); }

  .kpi-trend {
    font-size: 11px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 6px;
    display: flex; align-items: center; gap: 3px;
  }
  .trend-up { background: rgba(58,158,110,0.12); color: var(--success); }
  .trend-down { background: rgba(217,64,64,0.12); color: var(--danger); }

  .kpi-value {
    font-family: 'Syne', sans-serif;
    font-size: 26px; font-weight: 700;
    color: var(--white);
    letter-spacing: -0.5px;
    line-height: 1;
    margin-bottom: 5px;
  }
  .kpi-label { font-size: 12px; color: var(--white-mute); }

  /* two col layout */
  .dash-cols {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 20px;
    align-items: start;
    margin-bottom: 20px;
  }
  @media (max-width: 1100px) { .dash-cols { grid-template-columns: 1fr; } }

  /* section card */
  .section-card {
    background: var(--ink-soft);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .section-header {
    padding: 20px 24px 16px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--border);
  }
  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700;
    color: var(--white);
    display: flex; align-items: center; gap: 8px;
  }
  .section-title-icon { font-size: 16px; }
  .section-action {
    font-size: 12px;
    color: var(--gold);
    cursor: pointer;
    background: none; border: none;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
  }
  .section-action:hover { color: var(--gold-lite); }

  /* payment card */
  .payment-highlight {
    background: linear-gradient(135deg, var(--ink-mid) 0%, rgba(232,160,48,0.08) 100%);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg);
    padding: 24px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
  }
  .payment-highlight::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--gold), var(--gold-dim), transparent);
  }
  .payment-label { font-size: 11px; color: var(--white-mute); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
  .payment-amount {
    font-family: 'Syne', sans-serif;
    font-size: 36px; font-weight: 800;
    color: var(--gold);
    letter-spacing: -1px;
    margin-bottom: 4px;
  }
  .payment-amount span { font-size: 18px; font-weight: 600; margin-right: 4px; }
  .payment-due { font-size: 13px; color: var(--white-mute); margin-bottom: 24px; }
  .payment-due strong { color: var(--terra-lite); }

  .multicaixa-ref {
    background: var(--ink);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 18px;
  }
  .ref-row {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 10px;
  }
  .ref-row:last-child { margin-bottom: 0; }
  .ref-key { font-size: 11px; color: var(--white-mute); letter-spacing: 0.5px; }
  .ref-val {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700;
    color: var(--white);
    letter-spacing: 1px;
  }
  .ref-copy {
    background: none; border: none;
    color: var(--gold-dim);
    cursor: pointer; font-size: 14px;
    padding: 2px 6px;
    transition: color 0.15s;
  }
  .ref-copy:hover { color: var(--gold); }
  .ref-brand {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px;
    color: var(--white-mute);
    margin-bottom: 12px;
  }
  .ref-brand-logo {
    background: #003087;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 10px;
    font-weight: 700;
    color: white;
    letter-spacing: 0.5px;
  }

  .btn-pay {
    width: 100%;
    background: var(--gold);
    color: var(--ink);
    border: none;
    border-radius: var(--radius);
    padding: 13px;
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-pay:hover { background: var(--gold-lite); box-shadow: 0 4px 16px rgba(232,160,48,0.3); }

  /* payment history */
  .pay-history-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 24px;
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
  }
  .pay-history-item:last-child { border-bottom: none; }
  .pay-history-item:hover { background: var(--glass); }
  .pay-history-left { display: flex; align-items: center; gap: 12px; }
  .pay-dot {
    width: 10px; height: 10px;
    border-radius: 50%; flex-shrink: 0;
  }
  .pay-dot.paid { background: var(--success); }
  .pay-dot.pending { background: var(--gold); }
  .pay-dot.late { background: var(--danger); }
  .pay-month { font-size: 14px; color: var(--white); font-weight: 500; }
  .pay-date { font-size: 12px; color: var(--white-mute); }
  .pay-amount-col { text-align: right; }
  .pay-amount-val { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: var(--white); }
  .pay-status {
    font-size: 11px; font-weight: 500; padding: 2px 8px;
    border-radius: 6px; display: inline-block; margin-top: 3px;
  }
  .pay-status.paid { background: rgba(58,158,110,0.12); color: var(--success); }
  .pay-status.pending { background: rgba(232,160,48,0.12); color: var(--gold); }
  .pay-status.late { background: rgba(217,64,64,0.12); color: var(--danger); }

  /* sidebar panel */
  .sidebar-panel { display: flex; flex-direction: column; gap: 20px; }

  /* avisos */
  .aviso-item {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
  }
  .aviso-item:last-child { border-bottom: none; }
  .aviso-item:hover { background: var(--glass); }
  .aviso-tag {
    font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
    font-weight: 600; margin-bottom: 6px;
    display: flex; align-items: center; gap: 5px;
  }
  .aviso-tag.urgente { color: var(--danger); }
  .aviso-tag.info { color: var(--gold); }
  .aviso-tag.ok { color: var(--success); }
  .aviso-title { font-size: 13.5px; color: var(--white); font-weight: 500; margin-bottom: 4px; line-height: 1.4; }
  .aviso-date { font-size: 11px; color: var(--white-mute); }

  /* ocorrencias */
  .ocor-item {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }
  .ocor-item:last-child { border-bottom: none; }
  .ocor-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
  .ocor-title { font-size: 13.5px; color: var(--white); font-weight: 500; }
  .ocor-badge {
    font-size: 10px; font-weight: 600; padding: 2px 8px;
    border-radius: 6px;
  }
  .ocor-badge.aberta { background: rgba(232,160,48,0.12); color: var(--gold); }
  .ocor-badge.andamento { background: rgba(61,107,88,0.12); color: var(--sage-lite); }
  .ocor-badge.resolvida { background: rgba(58,158,110,0.12); color: var(--success); }
  .ocor-desc { font-size: 12px; color: var(--white-mute); line-height: 1.5; margin-bottom: 6px; }
  .ocor-footer { display: flex; gap: 12px; font-size: 11px; color: var(--white-mute); }

  /* quick actions */
  .quick-actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
  @media (max-width: 900px) { .quick-actions { grid-template-columns: repeat(2,1fr); } }
  .quick-btn {
    background: var(--ink-soft);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 18px 14px;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--white-mute);
    font-size: 12px; font-weight: 500;
    text-align: center;
    font-family: 'DM Sans', sans-serif;
  }
  .quick-btn:hover { background: var(--glass-hover); border-color: var(--gold-dim); color: var(--white); transform: translateY(-2px); }
  .quick-btn-icon {
    width: 40px; height: 40px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }

  /* mobile overlay */
  .sidebar-overlay {
    display: none;
    position: fixed; inset: 0; z-index: 99;
    background: rgba(0,0,0,0.6);
  }
  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay.open { display: block; }
    .dash-main { margin-left: 0; }
    .topbar { padding: 0 16px; }
    .dash-content { padding: 16px; }
    .kpi-grid { grid-template-columns: 1fr 1fr; }
    .dash-cols { grid-template-columns: 1fr; }
    .quick-actions { grid-template-columns: repeat(2,1fr); }
    .welcome-banner { flex-direction: column; align-items: flex-start; gap: 16px; }
  }

  /* modal */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: var(--ink-soft);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg);
    padding: 28px;
    width: 100%; max-width: 480px;
    animation: slideUp 0.2s ease;
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px;
  }
  .modal-title {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 700;
  }
  .modal-close {
    width: 32px; height: 32px;
    background: var(--ink-mid); border: 1px solid var(--border);
    border-radius: 8px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: var(--white-mute);
    transition: all 0.15s;
  }
  .modal-close:hover { color: var(--white); border-color: var(--border-strong); }
  .modal textarea {
    width: 100%;
    background: var(--ink);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 14px;
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    resize: vertical; min-height: 100px;
    outline: none;
    transition: border-color 0.2s;
    margin-bottom: 16px;
  }
  .modal textarea:focus { border-color: var(--gold); }
  .modal select {
    width: 100%;
    background: var(--ink);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 14px;
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    margin-bottom: 16px;
    cursor: pointer;
    appearance: none;
  }
  .file-upload {
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius);
    padding: 20px;
    text-align: center;
    color: var(--white-mute);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
    margin-bottom: 20px;
  }
  .file-upload:hover { border-color: var(--gold); color: var(--gold); background: rgba(232,160,48,0.04); }
  .file-upload-icon { font-size: 24px; margin-bottom: 6px; }

  /* loading spinner */
  .spinner {
    width: 20px; height: 20px;
    border: 2px solid rgba(15,14,13,0.3);
    border-top-color: var(--ink);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* reserva */
  .area-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .area-card {
    background: var(--ink);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
  }
  .area-card:hover, .area-card.selected {
    border-color: var(--gold);
    background: rgba(232,160,48,0.06);
  }
  .area-card-icon { font-size: 24px; margin-bottom: 6px; }
  .area-card-name { font-size: 13px; color: var(--white); font-weight: 500; }
  .area-card-avail { font-size: 11px; color: var(--success); margin-top: 2px; }
`;

// ─── DATA FIXTURES ────────────────────────────────────────────────────────────
const payments = [
  { mes: "Junho 2025", data: "Vence 10 Jun", valor: "50.000 Kz", status: "pending" },
  { mes: "Maio 2025", data: "Pago em 08 Mai", valor: "50.000 Kz", status: "paid" },
  { mes: "Abril 2025", data: "Pago em 07 Abr", valor: "50.000 Kz", status: "paid" },
  { mes: "Março 2025", data: "Pago em 12 Mar", valor: "50.000 Kz", status: "paid" },
  { mes: "Fevereiro 2025", data: "Pago em 09 Fev", valor: "50.000 Kz", status: "paid" },
];

const avisos = [
  { tag: "urgente", tagLabel: "🔴 Urgente", titulo: "Corte de água – Bloco B, dias 15 e 16 de Junho", data: "Hoje, 09h14" },
  { tag: "info", tagLabel: "📋 Informação", titulo: "Assembleia Virtual: Votação do orçamento anual aberta até 20/Jun", data: "Ontem" },
  { tag: "ok", tagLabel: "✅ Concluído", titulo: "Manutenção do elevador Bloco A concluída", data: "12 Jun" },
  { tag: "info", tagLabel: "📋 Informação", titulo: "Novo horário do portão principal: 06h–23h a partir de 1 Jul", data: "10 Jun" },
];

const ocorrencias = [
  { titulo: "Lâmpada queimada – Corredor 3º Andar", status: "andamento", statusLabel: "Em Andamento", desc: "Reportado no dia 11/06. Técnico agendado para 17/06.", local: "Bloco A · Corredor", data: "11 Jun" },
  { titulo: "Infiltração no tecto – Apt. 4B", status: "aberta", statusLabel: "Aberta", desc: "Aguardando visita técnica de avaliação.", local: "Bloco B · Apto 4B", data: "09 Jun" },
  { titulo: "Portão da garagem com ruído", status: "resolvida", statusLabel: "Resolvida", desc: "Peça substituída e lubrificação realizada.", local: "Garagem", data: "01 Jun" },
];

const quickActions = [
  { icon: "💳", label: "Pagar Quota", color: "rgba(232,160,48,0.15)", action: "payment" },
  { icon: "🔧", label: "Ocorrência", color: "rgba(192,82,42,0.15)", action: "ocorrencia" },
  { icon: "🏊", label: "Reservar Área", color: "rgba(61,107,88,0.15)", action: "reserva" },
  { icon: "🗳️", label: "Votar Assembleia", color: "rgba(232,192,48,0.15)", action: "assembleia" },
];

const navItems = [
  { icon: "🏠", label: "Visão Geral", id: "dashboard" },
  { icon: "💳", label: "Pagamentos", id: "pagamentos", badge: "1" },
  { icon: "📢", label: "Mural de Avisos", id: "avisos", badge: "3" },
  { icon: "🔧", label: "Ocorrências", id: "ocorrencias", badge: "2" },
  { icon: "🏊", label: "Áreas Comuns", id: "areas" },
  { icon: "🗳️", label: "Assembleias", id: "assembleias" },
  { icon: "📄", label: "Documentos", id: "documentos" },
  { icon: "👤", label: "O Meu Perfil", id: "perfil" },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function OcorrenciaModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const submit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); setTimeout(onClose, 1500); }, 1800);
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">🔧 Nova Ocorrência</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <p style={{ color: "var(--success)", fontWeight: 600 }}>Ocorrência submetida!</p>
            <p style={{ fontSize: 13, color: "var(--white-mute)", marginTop: 4 }}>Será contactado em breve.</p>
          </div>
        ) : (
          <>
            <div className="field">
              <label>Tipo de Problema</label>
              <select><option>Selecionar categoria...</option><option>Elétrico</option><option>Hidráulico</option><option>Estrutural</option><option>Limpeza</option><option>Outro</option></select>
            </div>
            <div className="field">
              <label>Descrição</label>
              <textarea placeholder="Descreva o problema com detalhes..." />
            </div>
            <div className="file-upload">
              <div className="file-upload-icon">📷</div>
              <div>Clique para anexar foto</div>
              <div style={{ fontSize: 11, marginTop: 3 }}>JPG, PNG até 10MB</div>
            </div>
            <button className="btn-primary" onClick={submit} disabled={loading}>
              {loading ? <span className="spinner" /> : "Submeter Ocorrência"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ReservaModal({ onClose }) {
  const [selected, setSelected] = useState(null);
  const areas = [
    { icon: "🏊", name: "Piscina", avail: "Disponível" },
    { icon: "🏋️", name: "Ginásio", avail: "Disponível" },
    { icon: "🎉", name: "Salão de Festas", avail: "Ocupado sáb." },
    { icon: "⚽", name: "Campo de Futebol", avail: "Disponível" },
  ];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">🏊 Reservar Área Comum</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="area-grid">
          {areas.map(a => (
            <div key={a.name} className={`area-card ${selected === a.name ? "selected" : ""}`} onClick={() => setSelected(a.name)}>
              <div className="area-card-icon">{a.icon}</div>
              <div className="area-card-name">{a.name}</div>
              <div className="area-card-avail">{a.avail}</div>
            </div>
          ))}
        </div>
        {selected && (
          <div className="field">
            <label>Data e Hora</label>
            <input type="datetime-local" style={{ background: "var(--ink)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 14px", color: "var(--white)", width: "100%", fontFamily: "DM Sans", fontSize: 14, outline: "none" }} />
          </div>
        )}
        <button className="btn-primary" style={{ marginTop: 8 }} onClick={onClose}>
          {selected ? `Confirmar Reserva – ${selected}` : "Selecione uma área"}
        </button>
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [role, setRole] = useState("condómino");
  const [email, setEmail] = useState("joao.silva@dikuiza.ao");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    { id: "condómino", icon: "🏠", label: "Condómino" },
    { id: "sindico", icon: "👔", label: "Síndico" },
    { id: "segurança", icon: "🛡️", label: "Segurança" },
    { id: "fornecedor", icon: "🔧", label: "Fornecedor" },
  ];

  const handleLogin = () => {
    if (!email || !pass) { setError("Preencha o e-mail e a senha."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1600);
  };

  return (
    <div className="login-root">
      {/* Brand side */}
      <div className="login-brand">
        <div className="brand-geo" />
        <div className="brand-geo-sq" />

        <div className="brand-logo">
          <div className="brand-logo-mark">DK</div>
          <div className="brand-logo-name">Dikuiza</div>
          <div className="brand-logo-tag">Gestão de Condomínios</div>
        </div>

        <div className="brand-hero">
          <h2>A sua comunidade,<br /><span>mais organizada.</span></h2>
          <p>
            Feito para Angola. Nascido na Centralidade do Kilamba.
            Transparência financeira, comunicação eficiente e controlo total
            do seu condomínio — numa única plataforma.
          </p>
        </div>

        <div className="brand-stats">
          <div>
            <div className="brand-stat-num">710</div>
            <div className="brand-stat-label">Edifícios</div>
          </div>
          <div>
            <div className="brand-stat-num">12k+</div>
            <div className="brand-stat-label">Moradores</div>
          </div>
          <div>
            <div className="brand-stat-num">98%</div>
            <div className="brand-stat-label">Satisfação</div>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="login-form-side">
        <div className="login-card">
          <div className="login-card-logo">
            <div className="login-card-logo-mark">DK</div>
            <span className="login-card-logo-name">Dikuiza</span>
          </div>

          <div className="login-card-header">
            <h1>Bem-vindo de volta</h1>
            <p className="subtitle">Aceda à sua área pessoal do condomínio</p>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: 8, fontSize: 12, color: "var(--white-mute)", letterSpacing: "0.5px" }}>Perfil de Acesso</div>
          <div className="role-grid">
            {roles.map(r => (
              <button key={r.id} className={`role-btn ${role === r.id ? "active" : ""}`} onClick={() => setRole(r.id)}>
                <span className="role-icon">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>

          {error && <div className="alert-error">⚠️ {error}</div>}

          <div className="field">
            <label>E-mail</label>
            <input type="email" placeholder="o.seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="field">
            <div className="field-row">
              <label>Senha</label>
              <button className="field-link">Esqueceu a senha?</button>
            </div>
            <input type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>

          <button className="btn-primary" onClick={handleLogin} disabled={loading}>
            {loading ? <span className="spinner" /> : `Entrar como ${roles.find(r => r.id === role)?.label}`}
          </button>

          <div className="login-divider">ou</div>

          <button className="btn-primary" style={{ background: "var(--ink-soft)", color: "var(--white)", border: "1px solid var(--border)", marginTop: 0 }}>
            🔑 &nbsp;Acesso com Token SMS
          </button>

          <div className="login-footer">
            Ainda não tem conta?&nbsp;
            <button>Solicitar acesso ao Síndico</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(null); // null | 'ocorrencia' | 'reserva'
  const [copied, setCopied] = useState(null);

  const copyRef = (key, val) => {
    navigator.clipboard?.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="dash-root">
      {/* Sidebar overlay (mobile) */}
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">DK</div>
          <span className="sidebar-logo-text">Dikuiza</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Principal</div>
          {navItems.slice(0, 4).map(item => (
            <button key={item.id} className={`nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}

          <div className="nav-label" style={{ marginTop: 16 }}>Serviços</div>
          {navItems.slice(4).map(item => (
            <button key={item.id} className={`nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-user" onClick={onLogout} title="Clique para sair">
          <div className="sidebar-avatar">JS</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">João Silva</div>
            <div className="sidebar-user-role">Condómino · Bloco A, 3B</div>
          </div>
          <span style={{ color: "var(--white-mute)", fontSize: 14 }}>↩</span>
        </div>
      </aside>

      {/* Main area */}
      <main className="dash-main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "var(--white-mute)", fontSize: 20, cursor: "pointer", display: "none" }}
              className="hamburger">☰</button>
            <span className="topbar-crumb">Dikuiza</span>
            <span style={{ color: "var(--white-mute)" }}>›</span>
            <span className="topbar-page">Visão Geral</span>
          </div>
          <div className="topbar-right">
            <span style={{ fontSize: 13, color: "var(--white-mute)" }}>Junho 2025</span>
            <div className="topbar-notif">
              🔔
              <div className="notif-dot" />
            </div>
            <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: 12, borderRadius: 9 }}>JS</div>
          </div>
        </div>

        {/* Content */}
        <div className="dash-content">

          {/* Welcome banner */}
          <div className="welcome-banner">
            <div>
              <div className="welcome-greeting">Bom dia 👋</div>
              <div className="welcome-name">João <span>Silva</span></div>
              <div className="welcome-meta">
                <span>🏢 Condomínio Kilamba Prime</span>
                <span>🚪 Bloco A, Apto 3B</span>
              </div>
            </div>
            <div className="welcome-status">
              <div className="status-pill">
                <div className="status-dot" />
                Condomínio Activo
              </div>
              <div style={{ fontSize: 12, color: "var(--white-mute)", textAlign: "right" }}>
                Morador desde Jan 2024
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            {quickActions.map(qa => (
              <button key={qa.id} className="quick-btn" onClick={() => qa.action !== "assembleia" && setModal(qa.action)}>
                <div className="quick-btn-icon" style={{ background: qa.color }}>{qa.icon}</div>
                {qa.label}
              </button>
            ))}
          </div>

          {/* KPIs */}
          <div className="kpi-grid">
            <div className="kpi-card gold">
              <div className="kpi-top">
                <div className="kpi-icon-wrap">💳</div>
                <div className="kpi-trend trend-down">⬇ Vence em 10 Jun</div>
              </div>
              <div className="kpi-value">50.000<span style={{ fontSize: 14, fontWeight: 400 }}> Kz</span></div>
              <div className="kpi-label">Quota de Junho em aberto</div>
            </div>
            <div className="kpi-card terra">
              <div className="kpi-top">
                <div className="kpi-icon-wrap">🔧</div>
                <div className="kpi-trend trend-up">2 abertas</div>
              </div>
              <div className="kpi-value">3</div>
              <div className="kpi-label">Ocorrências submetidas</div>
            </div>
            <div className="kpi-card sage">
              <div className="kpi-top">
                <div className="kpi-icon-wrap">✅</div>
                <div className="kpi-trend trend-up">↑ 100%</div>
              </div>
              <div className="kpi-value">5/5</div>
              <div className="kpi-label">Pagamentos em dia (2025)</div>
            </div>
            <div className="kpi-card warn">
              <div className="kpi-top">
                <div className="kpi-icon-wrap">📢</div>
                <div className="kpi-trend trend-down">3 novos</div>
              </div>
              <div className="kpi-value">4</div>
              <div className="kpi-label">Avisos não lidos</div>
            </div>
          </div>

          {/* Main columns */}
          <div className="dash-cols">
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Payment card */}
              <div className="payment-highlight">
                <div className="payment-label">Quota Condominial</div>
                <div className="payment-amount"><span>Kz</span>50.000</div>
                <div className="payment-due">Vencimento: <strong>10 de Junho de 2025</strong></div>

                <div className="ref-brand">
                  <div className="ref-brand-logo">MULTICAIXA</div>
                  <span>Referência de Pagamento</span>
                </div>
                <div className="multicaixa-ref">
                  <div className="ref-row">
                    <span className="ref-key">Entidade</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="ref-val">11547</span>
                      <button className="ref-copy" onClick={() => copyRef("ent", "11547")}>{copied === "ent" ? "✓" : "📋"}</button>
                    </div>
                  </div>
                  <div className="ref-row">
                    <span className="ref-key">Referência</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="ref-val">987 654 321</span>
                      <button className="ref-copy" onClick={() => copyRef("ref", "987654321")}>{copied === "ref" ? "✓" : "📋"}</button>
                    </div>
                  </div>
                  <div className="ref-row">
                    <span className="ref-key">Montante</span>
                    <span className="ref-val" style={{ color: "var(--gold)" }}>50.000,00 Kz</span>
                  </div>
                </div>
                <button className="btn-pay" onClick={() => setModal("payment")}>
                  💳 Pagar Agora via Multicaixa Express
                </button>
              </div>

              {/* Payment history */}
              <div className="section-card">
                <div className="section-header">
                  <span className="section-title"><span className="section-title-icon">📅</span>Histórico de Pagamentos</span>
                  <button className="section-action">Ver todos →</button>
                </div>
                {payments.map((p, i) => (
                  <div key={i} className="pay-history-item">
                    <div className="pay-history-left">
                      <div className={`pay-dot ${p.status}`} />
                      <div>
                        <div className="pay-month">{p.mes}</div>
                        <div className="pay-date">{p.data}</div>
                      </div>
                    </div>
                    <div className="pay-amount-col">
                      <div className="pay-amount-val">{p.valor}</div>
                      <div className={`pay-status ${p.status}`}>
                        {p.status === "paid" ? "Pago" : p.status === "pending" ? "Pendente" : "Em atraso"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="sidebar-panel">
              {/* Avisos */}
              <div className="section-card">
                <div className="section-header">
                  <span className="section-title"><span className="section-title-icon">📢</span>Mural de Avisos</span>
                  <button className="section-action">Ver todos →</button>
                </div>
                {avisos.map((a, i) => (
                  <div key={i} className="aviso-item">
                    <div className={`aviso-tag ${a.tag}`}>{a.tagLabel}</div>
                    <div className="aviso-title">{a.titulo}</div>
                    <div className="aviso-date">{a.data}</div>
                  </div>
                ))}
              </div>

              {/* Ocorrências */}
              <div className="section-card">
                <div className="section-header">
                  <span className="section-title"><span className="section-title-icon">🔧</span>Ocorrências</span>
                  <button className="section-action" onClick={() => setModal("ocorrencia")}>+ Nova →</button>
                </div>
                {ocorrencias.map((o, i) => (
                  <div key={i} className="ocor-item">
                    <div className="ocor-header">
                      <div className="ocor-title">{o.titulo}</div>
                      <span className={`ocor-badge ${o.status}`}>{o.statusLabel}</span>
                    </div>
                    <div className="ocor-desc">{o.desc}</div>
                    <div className="ocor-footer">
                      <span>📍 {o.local}</span>
                      <span>📅 {o.data}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {modal === "ocorrencia" && <OcorrenciaModal onClose={() => setModal(null)} />}
      {modal === "reserva" && <ReservaModal onClose={() => setModal(null)} />}
      {modal === "payment" && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">💳 Confirmar Pagamento</span>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div style={{ textAlign: "center", padding: "12px 0 24px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
              <p style={{ color: "var(--white-dim)", fontSize: 14, lineHeight: 1.7 }}>
                Abra a app <strong>Multicaixa Express</strong> no seu telemóvel,<br />
                selecione <strong>"Pagar Serviços"</strong> e introduza:<br /><br />
                <span style={{ fontFamily: "Syne", color: "var(--gold)", fontSize: 16 }}>Entidade: 11547 · Ref: 987 654 321</span>
              </p>
            </div>
            <button className="btn-primary" onClick={() => setModal(null)}>Já Paguei</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("login");
  return (
    <>
      <style>{CSS}</style>
      {page === "login"
        ? <LoginPage onLogin={() => setPage("dashboard")} />
        : <Dashboard onLogout={() => setPage("login")} />
      }
    </>
  );
}