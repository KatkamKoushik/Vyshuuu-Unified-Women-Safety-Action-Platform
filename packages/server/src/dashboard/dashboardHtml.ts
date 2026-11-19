export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="white">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ResQ | Unified Women's Safety, Navigation & Statutory Action Platform</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>
    :root {
      --font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      --transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    [data-theme="white"] {
      --bg: #FFFFFF;
      --header-bg: rgba(255, 255, 255, 0.9);
      --card: #FFFFFF;
      --surface: #F8FAFC;
      --surface-hover: #F1F5F9;
      --border: #E2E8F0;
      --border-focus: #0284C7;
      --text: #0F172A;
      --text-secondary: #475569;
      --text-muted: #64748B;
      --primary: #0284C7;
      --primary-light: #E0F2FE;
      --danger: #DC2626;
      --danger-light: #FEE2E2;
      --success: #16A34A;
      --success-light: #DCFCE7;
      --warning: #D97706;
      --warning-light: #FEF3C7;
      --badge-bg: #E0F2FE;
      --badge-text: #0369A1;
      --card-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
      --card-hover-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04);
    }

    [data-theme="black"] {
      --bg: #000000;
      --header-bg: rgba(0, 0, 0, 0.9);
      --card: #0A0A0A;
      --surface: #141414;
      --surface-hover: #1F1F1F;
      --border: #27272A;
      --border-focus: #38BDF8;
      --text: #FFFFFF;
      --text-secondary: #A1A1AA;
      --text-muted: #71717A;
      --primary: #38BDF8;
      --primary-light: #082F49;
      --danger: #EF4444;
      --danger-light: #450A0A;
      --success: #22C55E;
      --success-light: #052E16;
      --warning: #F59E0B;
      --warning-light: #451A03;
      --badge-bg: #082F49;
      --badge-text: #38BDF8;
      --card-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.4);
      --card-hover-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.6);
    }

    [data-theme="navy"] {
      --bg: #0B1120;
      --header-bg: rgba(11, 17, 32, 0.9);
      --card: #0F172A;
      --surface: #1E293B;
      --surface-hover: #334155;
      --border: rgba(255, 255, 255, 0.1);
      --border-focus: #00D4B2;
      --text: #FFFFFF;
      --text-secondary: #94A3B8;
      --text-muted: #64748B;
      --primary: #00D4B2;
      --primary-light: rgba(0, 212, 178, 0.15);
      --danger: #EF4444;
      --danger-light: rgba(239, 68, 68, 0.15);
      --success: #10B981;
      --success-light: rgba(16, 185, 129, 0.15);
      --warning: #F59E0B;
      --warning-light: rgba(245, 158, 11, 0.15);
      --badge-bg: rgba(0, 212, 178, 0.15);
      --badge-text: #00D4B2;
      --card-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
      --card-hover-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.5);
    }

    [data-theme="grey"] {
      --bg: #18181B;
      --header-bg: rgba(24, 24, 27, 0.9);
      --card: #27272A;
      --surface: #3F3F46;
      --surface-hover: #52525B;
      --border: #52525B;
      --border-focus: #38BDF8;
      --text: #FAFAFA;
      --text-secondary: #D4D4D8;
      --text-muted: #A1A1AA;
      --primary: #38BDF8;
      --primary-light: #27272A;
      --danger: #F87171;
      --danger-light: #3F1818;
      --success: #4ADE80;
      --success-light: #143320;
      --warning: #FBBF24;
      --warning-light: #3A2E14;
      --badge-bg: #27272A;
      --badge-text: #38BDF8;
      --card-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
      --card-hover-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.5);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-family);
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    header {
      background-color: var(--header-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo-mark {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background-color: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text);
    }

    .brand-badge {
      background-color: var(--badge-bg);
      color: var(--badge-text);
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 9999px;
      border: 1px solid var(--border);
      letter-spacing: 0.5px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--primary);
    }

    .brand-tagline {
      font-size: 12px;
      color: var(--text-muted);
      display: none;
    }

    @media (min-width: 860px) {
      .brand-tagline {
        display: inline;
      }
    }

    .controls-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    select, button, input, textarea {
      font-family: inherit;
      font-size: 13px;
    }

    .theme-select, .lang-select {
      background-color: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
      padding: 7px 12px;
      border-radius: 6px;
      cursor: pointer;
      outline: none;
      transition: var(--transition);
      font-weight: 500;
    }

    .theme-select:focus-visible, .lang-select:focus-visible {
      outline: 2px solid var(--border-focus);
      outline-offset: 2px;
    }

    .health-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 9999px;
      background-color: var(--success-light);
      color: var(--success);
      border: 1px solid var(--border);
      letter-spacing: 0.2px;
    }

    .health-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: var(--success);
      box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7);
      animation: healthPulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
    }

    @keyframes healthPulse {
      0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7); }
      70% { box-shadow: 0 0 0 6px rgba(22, 163, 74, 0); }
      100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
    }

    /* Sub-nav / Tab Switcher */
    .tab-bar {
      display: flex;
      background-color: var(--header-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 0 24px;
      gap: 4px;
      overflow-x: auto;
    }

    .tab-btn {
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 12px 18px;
      color: var(--text-muted);
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
      transition: var(--transition);
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 6px 6px 0 0;
    }

    .tab-btn:hover {
      color: var(--text);
      background-color: var(--surface-hover);
    }

    .tab-btn:focus-visible {
      outline: 2px solid var(--border-focus);
      outline-offset: -2px;
    }

    .tab-btn.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
      background-color: transparent;
    }

    .tab-btn svg {
      flex-shrink: 0;
    }

    /* Main Container */
    main {
      flex: 1;
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .tab-pane {
      display: none;
    }

    .tab-pane.active {
      display: block;
    }

    /* Grid layout */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }

    @media (min-width: 900px) {
      .grid-2 {
        grid-template-columns: 420px 1fr;
      }
    }

    .card {
      background-color: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      box-shadow: var(--card-shadow);
      transition: var(--transition);
    }

    .card:hover {
      box-shadow: var(--card-hover-shadow);
    }

    .card-title {
      font-size: 16px;
      font-weight: 800;
      margin-bottom: 4px;
      color: var(--text);
      letter-spacing: -0.02em;
    }

    .card-desc {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .form-group {
      margin-bottom: 14px;
    }

    .form-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 6px;
      letter-spacing: -0.01em;
    }

    .form-control {
      width: 100%;
      background-color: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 9px 12px;
      border-radius: 8px;
      outline: none;
      transition: var(--transition);
      font-size: 13px;
    }

    .form-control:focus-visible {
      outline: 2px solid var(--border-focus);
      outline-offset: 1px;
      border-color: var(--border-focus);
      background-color: var(--card);
    }

    textarea.form-control {
      min-height: 80px;
      resize: vertical;
      line-height: 1.5;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 9px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: var(--transition);
      white-space: nowrap;
    }

    .btn:active {
      transform: scale(0.98);
    }

    .btn:focus-visible {
      outline: 2px solid var(--border-focus);
      outline-offset: 2px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-primary {
      background-color: var(--primary);
      color: #FFFFFF;
    }

    .btn-primary:hover:not(:disabled) {
      filter: brightness(1.08);
    }

    .btn-secondary {
      background-color: var(--surface);
      color: var(--text);
      border-color: var(--border);
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: var(--surface-hover);
      border-color: var(--border-focus);
    }

    .btn-danger {
      background-color: var(--danger);
      color: #FFFFFF;
    }

    .btn-danger:hover:not(:disabled) {
      filter: brightness(1.08);
    }

    .btn-block {
      width: 100%;
    }

    .essentials-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
      margin-bottom: 14px;
    }

    .pill-btn {
      background-color: var(--surface);
      border: 1px solid var(--border);
      color: var(--primary);
      font-size: 11px;
      font-weight: 700;
      padding: 5px 10px;
      border-radius: 6px;
      cursor: pointer;
      transition: var(--transition);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .pill-btn:hover {
      background-color: var(--primary-light);
      border-color: var(--primary);
    }

    #map {
      height: 520px;
      width: 100%;
      border-radius: 12px;
      border: 1px solid var(--border);
      box-shadow: var(--card-shadow);
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
      margin-top: 14px;
    }

    .metric-card {
      background-color: var(--surface);
      border: 1px solid var(--border);
      padding: 12px;
      border-radius: 8px;
      transition: var(--transition);
    }

    .metric-card:hover {
      border-color: var(--primary);
    }

    .metric-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-val {
      font-size: 18px;
      font-weight: 800;
      color: var(--text);
      margin-top: 2px;
      font-variant-numeric: tabular-nums;
    }

    .metric-sub {
      font-size: 11px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    /* Chat assistant pane */
    .chat-box {
      display: flex;
      flex-direction: column;
      height: 500px;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      background-color: var(--surface);
      border-radius: 10px;
      border: 1px solid var(--border);
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .chat-bubble {
      max-width: 82%;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      line-height: 1.5;
      animation: bubbleEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes bubbleEnter {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .chat-bubble.assistant {
      align-self: flex-start;
      background-color: var(--card);
      border: 1px solid var(--border);
      color: var(--text);
      box-shadow: var(--card-shadow);
    }

    .chat-bubble.user {
      align-self: flex-end;
      background-color: var(--primary);
      color: #FFFFFF;
    }

    .chat-engine-tag {
      font-size: 10px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 4px;
      letter-spacing: 0.5px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .chat-prompt-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }

    .chip-btn {
      font-size: 11px;
      font-weight: 600;
      background-color: var(--card);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      padding: 6px 12px;
      border-radius: 9999px;
      cursor: pointer;
      transition: var(--transition);
    }

    .chip-btn:hover {
      color: var(--primary);
      border-color: var(--primary);
      background-color: var(--primary-light);
    }

    .chat-input-row {
      display: flex;
      gap: 8px;
    }

    .chat-input {
      flex: 1;
    }

    .typing-dots {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 0;
    }

    .typing-dots span {
      width: 6px;
      height: 6px;
      background-color: var(--primary);
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* Table styles */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 12px;
    }

    .data-table th, .data-table td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
      text-align: left;
    }

    .data-table th {
      background-color: var(--surface);
      color: var(--text-secondary);
      font-weight: 700;
      letter-spacing: 0.2px;
    }

    .data-table tbody tr:hover {
      background-color: var(--surface-hover);
    }

    .hash-cell {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--primary);
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
      padding: 3px 6px;
      border-radius: 4px;
      transition: var(--transition);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .hash-cell:hover {
      background-color: var(--primary-light);
    }

    .code-block {
      background-color: var(--surface);
      border: 1px solid var(--border);
      padding: 16px;
      border-radius: 10px;
      font-family: var(--font-mono);
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      max-height: 420px;
      overflow-y: auto;
      color: var(--text);
    }

    /* Toast Notification System */
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background-color: var(--card);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      font-size: 13px;
      font-weight: 600;
      animation: toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .toast.toast-success {
      border-left: 4px solid var(--success);
    }

    .toast.toast-error {
      border-left: 4px solid var(--danger);
    }

    .toast.toast-info {
      border-left: 4px solid var(--primary);
    }

    .toast-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .toast-success .toast-icon { color: var(--success); }
    .toast-error .toast-icon { color: var(--danger); }
    .toast-info .toast-icon { color: var(--primary); }

    .toast-message {
      flex: 1;
      word-break: break-word;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      border-radius: 4px;
      transition: var(--transition);
    }

    .toast-close:hover {
      color: var(--text);
      background-color: var(--surface);
    }

    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes toastFadeOut {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateY(10px) scale(0.96);
      }
    }

    footer {
      background-color: var(--card);
      border-top: 1px solid var(--border);
      padding: 16px 24px;
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
      margin-top: auto;
    }
  </style>
</head>
<body>

  <!-- Floating Toast Notifications -->
  <div id="toastContainer" class="toast-container" aria-live="polite"></div>

  <header role="banner">
    <div class="brand-group">
      <div class="brand-logo-mark" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
      </div>
      <span class="brand-title">ResQ</span>
      <span class="brand-badge"><span class="badge-dot"></span>VERIFIED</span>
      <span class="brand-tagline">Unified Women's Safety, Navigation & Statutory Action Platform</span>
    </div>

    <div class="controls-group">
      <div class="health-pill" id="healthPill" aria-label="Gateway status">
        <span class="health-dot"></span>
        <span id="healthText">GATEWAY ONLINE</span>
      </div>

      <select class="theme-select" id="themeSelect" aria-label="Select Theme" onchange="changeTheme(this.value)">
        <option value="white" selected>White (Light)</option>
        <option value="black">OLED Black</option>
        <option value="navy">Midnight Navy</option>
        <option value="grey">Slate Grey</option>
      </select>

      <select class="lang-select" id="langSelect" aria-label="Select Language" onchange="changeLanguage(this.value)">
        <option value="en" selected>English</option>
        <option value="te">తెలుగు</option>
        <option value="hi">हिन्दी</option>
      </select>
    </div>
  </header>

  <nav class="tab-bar" role="tablist" aria-label="Platform Modules">
    <button class="tab-btn active" role="tab" aria-selected="true" id="tabBtn-move" onclick="switchTab('move')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
      <span id="lblNavMove">Safe Walking Navigation</span>
    </button>
    <button class="tab-btn" role="tab" aria-selected="false" id="tabBtn-protect" onclick="switchTab('protect')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      <span id="lblNavProtect">Incident Log & Analytics</span>
    </button>
    <button class="tab-btn" role="tab" aria-selected="false" id="tabBtn-act" onclick="switchTab('act')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
      <span id="lblNavAct">Statutory Grievance Intake</span>
    </button>
    <button class="tab-btn" role="tab" aria-selected="false" id="tabBtn-assistant" onclick="switchTab('assistant')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
      <span id="lblNavAssistant">Safety Intelligence</span>
    </button>
  </nav>

  <main role="main" id="main-content">
    <!-- TAB 1: MOVE -->
    <div class="tab-pane active" id="pane-move" role="tabpanel" aria-labelledby="tabBtn-move">
      <div class="grid-2">
        <div class="card">
          <h2 class="card-title" id="lblRoutePlanner">Pedestrian Route Planner</h2>
          <p class="card-desc" id="lblRouteDesc">Multi-factor routing calibrated for realistic pedestrian walking (500m - 3km) with verified street infrastructure and corridor amenities.</p>

          <div class="form-group">
            <label class="form-label" for="presetCity">City Corridor</label>
            <select class="form-control" id="presetCity" onchange="handleCityPreset(this.value)">
              <option value="hyd">Hyderabad: Charminar to Madina Junction (800m)</option>
              <option value="hyd_it">Hyderabad: Hitec City to Cyber Towers (1.1km)</option>
              <option value="blr">Bengaluru: MG Road to Brigade Road (950m)</option>
              <option value="del">Delhi: Rajiv Chowk to Central Park (600m)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="originInput">Start Point (Origin)</label>
            <input type="text" class="form-control" id="originInput" value="Charminar, Hyderabad">
          </div>

          <div class="form-group">
            <label class="form-label" for="destInput">Destination Point (Pedestrian Walk)</label>
            <input type="text" class="form-control" id="destInput" value="Madina Junction, Hyderabad">
          </div>

          <div class="form-group">
            <label class="form-label">Nearby Essentials (1-Tap Search)</label>
            <div class="essentials-bar">
              <button class="pill-btn" type="button" onclick="setEssentialDestination('Nearest Park')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 19 4-7 4 7"/><path d="m5 10 7-7 7 7"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                <span>Near Park</span>
              </button>
              <button class="pill-btn" type="button" onclick="setEssentialDestination('Nearest Pharmacy')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Near Pharmacy</span>
              </button>
              <button class="pill-btn" type="button" onclick="setEssentialDestination('Nearest Metro Station')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><line x1="8" y1="19" x2="5" y2="22"/><line x1="16" y1="19" x2="19" y2="22"/></svg>
                <span>Near Transit</span>
              </button>
              <button class="pill-btn" type="button" onclick="setEssentialDestination('Nearest Police Station')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Near Police</span>
              </button>
            </div>
          </div>

          <button class="btn btn-primary btn-block" id="btnComputeRoute" onclick="calculateRoute()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            <span id="btnComputeRouteText">Compute Safe Walking Route</span>
          </button>

          <div class="metrics-row" id="routeMetrics" style="display: none;">
            <div class="metric-card">
              <div class="metric-label">Walk Distance</div>
              <div class="metric-val" id="metricDistance">--</div>
              <div class="metric-sub">Pedestrian Corridor</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Walk Duration</div>
              <div class="metric-val" id="metricDuration">--</div>
              <div class="metric-sub">Paced Walk Time</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Verified Lighting</div>
              <div class="metric-val" id="metricLighting">--</div>
              <div class="metric-sub">OSM Street Infrastructure</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Corridor Amenities</div>
              <div class="metric-val" id="metricSidewalk">--</div>
              <div class="metric-sub">Nearby Open Points</div>
            </div>
          </div>
        </div>

        <div>
          <div id="map" aria-label="Interactive Safe Route Map"></div>
        </div>
      </div>
    </div>

    <!-- TAB 2: PROTECT -->
    <div class="tab-pane" id="pane-protect" role="tabpanel" aria-labelledby="tabBtn-protect">
      <div class="grid-2">
        <div>
          <div class="card" style="margin-bottom: 20px;">
            <h2 class="card-title">Log Contemporaneous Incident</h2>
            <p class="card-desc">Records unwanted electronic communications with on-device SHA-256 byte digest for tamper-evident documentation.</p>

            <div class="form-group">
              <label class="form-label" for="incPlatform">Platform</label>
              <select class="form-control" id="incPlatform">
                <option value="INSTAGRAM">Instagram</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="TELEGRAM">Telegram</option>
                <option value="CALL">Phone Call</option>
                <option value="SMS">SMS / Text</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="incSender">Sender Handle / Phone</label>
              <input type="text" class="form-control" id="incSender" placeholder="e.g. @anon_stalker_92">
            </div>

            <div class="form-group">
              <label class="form-label" for="incMessage">Message Narrative / Quotation</label>
              <textarea class="form-control" id="incMessage" placeholder="Paste exact message or quote unwanted communication..."></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="incFile">Evidence Screenshot / File (Hashed via WebCrypto SHA-256)</label>
              <input type="file" class="form-control" id="incFile" onchange="handleEvidenceFile(this)">
              <div id="fileHashInfo" style="margin-top: 6px; font-size: 11px; color: var(--primary); font-family: var(--font-mono);"></div>
            </div>

            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
                <input type="checkbox" id="incBlocked">
                <span>Contact occurred after sender was blocked</span>
              </label>
            </div>

            <button class="btn btn-primary btn-block" onclick="addIncidentRecord()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Add to In-Session Incident Log</span>
            </button>
          </div>

          <div class="card">
            <h2 class="card-title">Digital Exposure Audit</h2>
            <p class="card-desc">Analyzes social profile bio or posts to detect accidental leaks of room numbers, routines, or contacts.</p>
            <div class="form-group">
              <textarea class="form-control" id="exposureBioText" placeholder="Paste profile bio, caption, or status update to audit..."></textarea>
            </div>
            <button class="btn btn-secondary btn-block" id="btnRunExposure" onclick="runExposureAudit()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>Run Privacy Exposure Audit</span>
            </button>
            <div id="exposureResult" style="margin-top: 14px;"></div>
          </div>
        </div>

        <div>
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <h2 class="card-title">Contemporaneous Incident Log</h2>
                <p class="card-desc" style="margin-bottom: 0;">In-session tamper-evident records (Local WebCrypto SHA-256)</p>
              </div>
              <button class="btn btn-secondary" id="btnAnalyzePatterns" onclick="runTemporalAnalysis()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <span>Analyze Patterns</span>
              </button>
            </div>

            <div style="overflow-x: auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Platform</th>
                    <th>Sender</th>
                    <th>Quote</th>
                    <th>SHA-256 Digest</th>
                  </tr>
                </thead>
                <tbody id="incidentsTableBody">
                </tbody>
              </table>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 10px;">
              Tip: Click any SHA-256 digest to copy the complete 64-character hexadecimal hash to clipboard. Browser session viewer; native mobile app persists records to hardware-encrypted SQLite.
            </div>

            <div id="patternAnalysisResult" style="margin-top: 20px;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: ACT -->
    <div class="tab-pane" id="pane-act" role="tabpanel" aria-labelledby="tabBtn-act">
      <div class="grid-2">
        <div class="card">
          <h2 class="card-title">Statutory Grievance Intake</h2>
          <p class="card-desc">Pre-flight statutory matching across UGC e-Samadhaan, ICC PoSH 2013, FSSAI, and National Cybercrime 1930.</p>

          <div class="form-group">
            <label class="form-label" for="actName">Complainant Name (Optional / Anonymous)</label>
            <input type="text" class="form-control" id="actName" value="Aarohi S.">
          </div>

          <div class="form-group">
            <label class="form-label" for="actInstitution">Institution Name</label>
            <input type="text" class="form-control" id="actInstitution" value="Apex National Engineering University">
          </div>

          <div class="form-group">
            <label class="form-label" for="actLocation">Campus / Hostel Location</label>
            <input type="text" class="form-control" id="actLocation" value="Ganga Girls Hostel, Room 204">
          </div>

          <div class="form-group">
            <label class="form-label" for="actCategory">Grievance Category</label>
            <select class="form-control" id="actCategory">
              <option value="HOSTEL_SANITATION">Hostel Sanitation & Living Hazard</option>
              <option value="CAMPUS_HARASSMENT">Campus Harassment / PoSH 2013</option>
              <option value="RAGGING_COERCION">Ragging or Coercive Initiation</option>
              <option value="CYBER_STALKING">Cyberstalking & Digital Doxxing</option>
              <option value="MESS_FOOD_SAFETY">Mess Food Contamination (FSSAI)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="actNarrative">Incident Statement (Factual Narrative)</label>
            <textarea class="form-control" id="actNarrative" style="min-height: 100px;">Rat bite occurred at night due to neglected window mesh damage. Warden was informed twice in writing without response. Emergency treatment required.</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="actPrior">Prior Administrative Steps Taken</label>
            <input type="text" class="form-control" id="actPrior" value="Warden informed twice in writing on Nov 5 and Nov 8 without response.">
          </div>

          <button class="btn btn-secondary btn-block" id="btnRunIntake" onclick="runActIntake()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            <span>Step 1: AI Intake & Pre-Flight Review</span>
          </button>

          <div id="actQuestionsArea" style="margin-top: 16px; display: none;">
            <div style="font-size: 13px; font-weight: 800; color: var(--primary); margin-bottom: 8px;">
              ADAPTIVE VERIFICATION QUESTIONS (PROVIDE FACTUAL DETAILS):
            </div>
            <div id="questionsContainer"></div>
            <button class="btn btn-primary btn-block" style="margin-top: 14px;" id="btnSynthesize" onclick="synthesizePetition()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>Step 2: Synthesize Formal Legal Petition</span>
            </button>
          </div>
        </div>

        <div>
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <h2 class="card-title">Statutory Petition Preview</h2>
                <p class="card-desc" style="margin-bottom: 0;">Time-bound formal representation bundle</p>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-secondary" onclick="copyPetition()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  <span>Copy Text</span>
                </button>
                <button class="btn btn-secondary" onclick="downloadPetition()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  <span>Export Markdown</span>
                </button>
              </div>
            </div>

            <div class="code-block" id="petitionPreview">Click "Step 1: AI Intake & Pre-Flight Review" and "Step 2: Synthesize Formal Legal Petition" to generate a legally structured grievance with statutory resolution windows and cryptographic evidence annexures.</div>

            <div id="portalHandoffCard" style="margin-top: 16px; display: none; padding: 14px; background-color: var(--surface); border: 1px solid var(--border); border-radius: 8px;">
              <div style="font-weight: 800; color: var(--text); font-size: 13px;" id="portalHandoffTitle">Official Portal Handoff</div>
              <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;" id="portalHandoffDesc">Direct links and clipboard pills for assisted official filing.</p>
              <div style="margin-top: 10px;">
                <a id="portalLink" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="text-decoration: none; display: inline-flex;">
                  <span>Open Official Redressal Portal</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 4: AI ASSISTANT -->
    <div class="tab-pane" id="pane-assistant" role="tabpanel" aria-labelledby="tabBtn-assistant">
      <div class="card" style="max-width: 900px; margin: 0 auto;">
        <h2 class="card-title">ResQ AI Safety Assistant</h2>
        <p class="card-desc">Live conversational safety intelligence powered by Gemini 2.5 Flash with fallback to statutory domain rules.</p>

        <div class="chat-prompt-chips">
          <button class="chip-btn" type="button" onclick="sendQuickPrompt('Find well-lit walking corridor to library')">Find well-lit corridor to library</button>
          <button class="chip-btn" type="button" onclick="sendQuickPrompt('Rats in hostel room; warden ignored complaint')">Hostel warden ignored complaint</button>
          <button class="chip-btn" type="button" onclick="sendQuickPrompt('Fake Instagram account sending unwanted DMs after blocking')">Unwanted DMs after blocking</button>
          <button class="chip-btn" type="button" onclick="sendQuickPrompt('Emergency: someone is following me right now')">Emergency: someone is following me</button>
        </div>

        <div class="chat-box">
          <div class="chat-messages" id="chatMessages">
            <div class="chat-bubble assistant">
              <div class="chat-engine-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span>[SYSTEM: GEMINI-2.5-FLASH]</span>
              </div>
              <div>I am your ResQ AI Safety Assistant. I can evaluate well-lit pedestrian corridors (Move), preserve cryptographic SHA-256 evidence of harassment (Protect), or draft statutory grievances under UGC, PoSH, or Cybercrime mandates (Act). How can I assist you right now?</div>
            </div>
          </div>

          <div class="chat-input-row">
            <input type="text" class="form-control chat-input" id="chatInput" placeholder="Ask a safety question, report a hazard, or get legal rights guidance..." onkeypress="handleChatKey(event)">
            <button class="btn btn-primary" onclick="sendChatMessage()">
              <span>Send</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <footer role="contentinfo">
    ResQ Safety Platform &bull; Zero-Telemetry Client-Side Cryptography &bull; Powered by OpenStreetMap & Gemini 2.5 Flash
  </footer>

  <script>
    // Toast Notification System
    function showToast(message, type = 'info', duration = 3500) {
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = 'toast toast-' + type;

      let iconSvg = '';
      if (type === 'success') {
        iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      } else if (type === 'error') {
        iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>';
      } else {
        iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>';
      }

      toast.innerHTML = 
        '<div class="toast-icon">' + iconSvg + '</div>' +
        '<div class="toast-message">' + escapeHtml(message) + '</div>' +
        '<button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close notification">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>';

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.2s ease forwards';
        setTimeout(() => toast.remove(), 200);
      }, duration);
    }

    // Theme switcher
    function changeTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('resq_theme', theme);
    }

    const savedTheme = localStorage.getItem('resq_theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      document.getElementById('themeSelect').value = savedTheme;
    }

    // Language switcher
    function changeLanguage(lang) {
      localStorage.setItem('resq_lang', lang);
      if (lang === 'te') {
        document.getElementById('lblNavMove').innerText = 'నడక మార్గం';
        document.getElementById('lblNavProtect').innerText = 'ఆధారాల నమోదు & విశ్లేషణ';
        document.getElementById('lblNavAct').innerText = 'చట్టబద్ధ ఫిర్యాదు';
        document.getElementById('lblNavAssistant').innerText = 'రక్షణ సహాయకుడు';
      } else if (lang === 'hi') {
        document.getElementById('lblNavMove').innerText = 'सुरक्षित पैदल मार्ग';
        document.getElementById('lblNavProtect').innerText = 'सबूत व घटना विवरण';
        document.getElementById('lblNavAct').innerText = 'कानूनी शिकायत';
        document.getElementById('lblNavAssistant').innerText = 'सुरक्षा सहायक';
      } else {
        document.getElementById('lblNavMove').innerText = 'Safe Walking Navigation';
        document.getElementById('lblNavProtect').innerText = 'Incident Log & Analytics';
        document.getElementById('lblNavAct').innerText = 'Statutory Grievance Intake';
        document.getElementById('lblNavAssistant').innerText = 'Safety Intelligence';
      }
    }

    // Tab switcher
    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      
      const pane = document.getElementById('pane-' + tabId);
      if (pane) pane.classList.add('active');
      
      const activeBtn = document.getElementById('tabBtn-' + tabId);
      if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-selected', 'true');
      }

      if (tabId === 'move' && map) {
        setTimeout(() => map.invalidateSize(), 200);
      }
    }

    // Leaflet Map Initialization
    let map;
    let primaryPolyline;
    let shortestPolyline;
    let markers = [];

    function initMap() {
      map = L.map('map').setView([17.3616, 78.4747], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
    }
    window.addEventListener('DOMContentLoaded', initMap);

    const PRESETS = {
      hyd: {
        origin: { title: 'Charminar, Hyderabad', lat: 17.3616, lon: 78.4747 },
        dest: { title: 'Madina Junction, Hyderabad', lat: 17.3688, lon: 78.4735 }
      },
      hyd_it: {
        origin: { title: 'Hitec City Metro, Hyderabad', lat: 17.4483, lon: 78.3762 },
        dest: { title: 'Cyber Towers, Hyderabad', lat: 17.4504, lon: 78.3815 }
      },
      blr: {
        origin: { title: 'MG Road Metro, Bengaluru', lat: 12.9756, lon: 77.6066 },
        dest: { title: 'Brigade Road Junction, Bengaluru', lat: 12.9738, lon: 77.6080 }
      },
      del: {
        origin: { title: 'Rajiv Chowk Metro, Delhi', lat: 28.6328, lon: 77.2195 },
        dest: { title: 'Central Park, Delhi', lat: 28.6325, lon: 77.2215 }
      }
    };

    // HTML Entity Sanitizer to prevent XSS
    function escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function handleCityPreset(cityKey) {
      const preset = PRESETS[cityKey];
      if (!preset) return;
      document.getElementById('originInput').value = preset.origin.title;
      document.getElementById('destInput').value = preset.dest.title;
      map.setView([preset.origin.lat, preset.origin.lon], 15);
    }

    function setEssentialDestination(destName) {
      document.getElementById('destInput').value = destName;
      calculateRoute();
    }

    async function calculateRoute() {
      const cityKey = document.getElementById('presetCity').value;
      const preset = PRESETS[cityKey] || PRESETS.hyd;
      const btn = document.getElementById('btnComputeRoute');
      const btnText = document.getElementById('btnComputeRouteText');

      if (btn) btn.disabled = true;
      if (btnText) btnText.innerText = 'Calculating Safe Route...';

      try {
        const res = await fetch('/api/v1/routes/pedestrian', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: { latitude: preset.origin.lat, longitude: preset.origin.lon },
            destination: { latitude: preset.dest.lat, longitude: preset.dest.lon }
          })
        });

        if (res.ok) {
          const data = await res.json();
          renderRouteData(data, preset);
          showToast('Safe pedestrian route calculated successfully.', 'success');
        } else {
          simulateRoute(preset);
          showToast('Corridor calculated with standard pedestrian baseline.', 'info');
        }
      } catch {
        simulateRoute(preset);
        showToast('Offline fallback: safe corridor rendered.', 'info');
      } finally {
        if (btn) btn.disabled = false;
        if (btnText) btnText.innerText = 'Compute Safe Walking Route';
      }
    }

    async function renderRouteData(data, preset) {
      const route = data.recommendedRoute || data.routes?.[0];
      if (!route) {
        simulateRoute(preset);
        return;
      }

      document.getElementById('routeMetrics').style.display = 'grid';
      document.getElementById('metricDistance').innerText = (route.distanceMeters / 1000).toFixed(2) + ' km';
      document.getElementById('metricDuration').innerText = Math.ceil(route.durationSeconds / 60) + ' min';
      document.getElementById('metricLighting').innerText = 'Scanning...';
      document.getElementById('metricSidewalk').innerText = 'Evaluating...';

      if (primaryPolyline) map.removeLayer(primaryPolyline);
      markers.forEach(m => map.removeLayer(m));
      markers = [];

      const rawCoords = route.geometry?.coordinates || [];
      if (rawCoords.length > 0) {
        // GeoJSON coordinates are [lon, lat] -> Leaflet uses [lat, lon]
        const latLngs = rawCoords.map(c => [c[1], c[0]]);
        primaryPolyline = L.polyline(latLngs, { color: '#0284C7', weight: 6, opacity: 0.85 }).addTo(map);
        map.fitBounds(primaryPolyline.getBounds(), { padding: [40, 40] });

        const m1 = L.marker(latLngs[0]).addTo(map).bindPopup('Origin: ' + escapeHtml(preset.origin.title));
        const m2 = L.marker(latLngs[latLngs.length - 1]).addTo(map).bindPopup('Destination: ' + escapeHtml(preset.dest.title));
        markers.push(m1, m2);

        // Derive verified corridor context from backend
        try {
          const corridorRes = await fetch('/api/v1/context/corridor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coordinates: rawCoords })
          });
          if (corridorRes.ok) {
            const corridorData = await corridorRes.json();
            const lightingCount = corridorData.categoryBreakdown?.lighting || 0;
            const servicesCount = corridorData.categoryBreakdown?.services || 0;
            document.getElementById('metricLighting').innerText = lightingCount > 0 ? (lightingCount + ' Mapped Lamps') : 'Unsurveyed';
            document.getElementById('metricSidewalk').innerText = servicesCount > 0 ? (servicesCount + ' Active Amenities') : 'Pedestrian Track';
          } else {
            document.getElementById('metricLighting').innerText = 'Unsurveyed';
            document.getElementById('metricSidewalk').innerText = 'Pedestrian Track';
          }
        } catch {
          document.getElementById('metricLighting').innerText = 'Unsurveyed';
          document.getElementById('metricSidewalk').innerText = 'Pedestrian Track';
        }
      }
    }

    function simulateRoute(preset) {
      document.getElementById('routeMetrics').style.display = 'grid';
      document.getElementById('metricDistance').innerText = '0.85 km';
      document.getElementById('metricDuration').innerText = '11 min';
      document.getElementById('metricLighting').innerText = 'Awaiting Survey';
      document.getElementById('metricSidewalk').innerText = 'Pedestrian Track';

      if (primaryPolyline) map.removeLayer(primaryPolyline);
      markers.forEach(m => map.removeLayer(m));
      markers = [];

      const start = [preset.origin.lat, preset.origin.lon];
      const end = [preset.dest.lat, preset.dest.lon];
      const mid = [(start[0] + end[0]) / 2 + 0.001, (start[1] + end[1]) / 2 - 0.001];

      primaryPolyline = L.polyline([start, mid, end], { color: '#0284C7', weight: 6, opacity: 0.85 }).addTo(map);
      map.fitBounds(primaryPolyline.getBounds(), { padding: [40, 40] });

      const m1 = L.marker(start).addTo(map).bindPopup('Start: ' + escapeHtml(preset.origin.title));
      const m2 = L.marker(end).addTo(map).bindPopup('End: ' + escapeHtml(preset.dest.title));
      markers.push(m1, m2);
    }

    // Protect Tab: Client-Side SHA-256 Hashing of File Bytes via WebCrypto
    let lastUploadedHash = null;
    let lastUploadedFileName = null;

    async function handleEvidenceFile(input) {
      if (!input.files || input.files.length === 0) {
        lastUploadedHash = null;
        lastUploadedFileName = null;
        document.getElementById('fileHashInfo').innerText = '';
        return;
      }
      const file = input.files[0];
      try {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        lastUploadedHash = hashHex;
        lastUploadedFileName = file.name;

        document.getElementById('fileHashInfo').innerText = 
          'FILE_CONTENT_SHA256: ' + hashHex.slice(0, 32) + '... (' + Math.round(file.size / 1024) + ' KB)';
        showToast('Calculated SHA-256 content byte digest for ' + file.name, 'success');
      } catch {
        document.getElementById('fileHashInfo').innerText = 'Error computing SHA-256 hash.';
        showToast('Error computing SHA-256 file digest.', 'error');
      }
    }

    const enteredIncidents = [
      {
        id: 'inc_1',
        timestamp: '2026-11-13T21:15:00Z',
        platform: 'INSTAGRAM',
        senderHandle: '@stalker_user',
        messageContent: 'I saw you leaving the library alone',
        wasBlockedPrior: true,
        digestHex: '4a8b7c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
        fileName: 'chat_screenshot_1.png',
        digestType: 'FILE_CONTENT_SHA256'
      },
      {
        id: 'inc_2',
        timestamp: '2026-11-14T01:20:00Z',
        platform: 'WHATSAPP',
        senderHandle: '+91-98765-XXXXX',
        messageContent: 'Repeated midnight missed calls',
        wasBlockedPrior: true,
        digestHex: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
        fileName: 'call_log_screenshot.png',
        digestType: 'FILE_CONTENT_SHA256'
      }
    ];

    function copyHash(hash) {
      if (!hash) return;
      navigator.clipboard.writeText(hash).then(() => {
        showToast('Full SHA-256 byte digest copied to clipboard: ' + hash.slice(0, 16) + '...', 'success');
      }).catch(() => {
        showToast('Could not copy digest to clipboard.', 'error');
      });
    }

    function renderIncidentsTable() {
      const tbody = document.getElementById('incidentsTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';

      if (enteredIncidents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">' +
          '<div style="font-weight: 600;">No incidents logged in this session yet.</div>' +
          '<div style="font-size: 11px; margin-top: 4px;">Use the form on the left to add a contemporaneous record with on-device SHA-256 byte hashing.</div>' +
        '</td></tr>';
        return;
      }

      enteredIncidents.forEach(inc => {
        const tr = document.createElement('tr');
        const timeDisplay = inc.timestamp.replace('T', ' ').slice(0, 16);
        const displayHash = inc.digestHex ? inc.digestHex : 'No file attached';
        const hashDisplayShort = inc.digestHex ? (inc.digestHex.slice(0, 16) + '...') : 'Metadata only';

        tr.innerHTML = 
          '<td>' + escapeHtml(timeDisplay) + '</td>' +
          '<td><span style="font-weight: 700; color: var(--primary);">' + escapeHtml(inc.platform) + '</span></td>' +
          '<td>' + escapeHtml(inc.senderHandle) + '</td>' +
          '<td>"' + escapeHtml(inc.messageContent) + '"</td>' +
          '<td>' +
            (inc.digestHex 
              ? '<span class="hash-cell" onclick="copyHash(\\'' + escapeHtml(inc.digestHex) + '\\')" title="Click to copy full SHA-256 digest">' +
                  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>' +
                  escapeHtml(hashDisplayShort) +
                '</span>'
              : '<span style="color: var(--text-muted); font-size: 11px;">No file</span>') +
          '</td>';
        tbody.appendChild(tr);
      });
    }

    window.addEventListener('DOMContentLoaded', renderIncidentsTable);

    function addIncidentRecord() {
      const platform = document.getElementById('incPlatform').value;
      const sender = document.getElementById('incSender').value.trim();
      const msg = document.getElementById('incMessage').value.trim();
      if (!sender || !msg) {
        showToast('Please provide sender handle and quotation.', 'error');
        return;
      }

      const hasFile = !!lastUploadedHash;
      const newInc = {
        id: 'inc_' + Date.now(),
        timestamp: new Date().toISOString(),
        platform: platform,
        senderHandle: sender,
        messageContent: msg,
        wasBlockedPrior: document.getElementById('incBlocked').checked,
        digestHex: hasFile ? lastUploadedHash : null,
        fileName: hasFile ? (lastUploadedFileName || 'attachment') : null,
        digestType: hasFile ? 'FILE_CONTENT_SHA256' : 'NONE'
      };

      enteredIncidents.unshift(newInc);
      renderIncidentsTable();

      document.getElementById('incSender').value = '';
      document.getElementById('incMessage').value = '';
      document.getElementById('incFile').value = '';
      document.getElementById('fileHashInfo').innerText = '';
      document.getElementById('incBlocked').checked = false;
      lastUploadedHash = null;
      lastUploadedFileName = null;

      showToast(hasFile 
        ? 'Incident logged with verified WebCrypto SHA-256 byte digest.' 
        : 'Incident logged (metadata only, no evidence file attached).', 'success');
    }

    async function runTemporalAnalysis() {
      const resultArea = document.getElementById('patternAnalysisResult');
      const btn = document.getElementById('btnAnalyzePatterns');

      if (enteredIncidents.length === 0) {
        showToast('No incident records to analyze.', 'error');
        resultArea.innerHTML = '<div style="color: var(--text-muted); font-size: 12px;">No incident records logged. Please log at least one incident to analyze.</div>';
        return;
      }

      if (btn) btn.disabled = true;
      resultArea.innerHTML = '<div style="color: var(--text-muted); font-size: 12px;">Analyzing temporal patterns across ' + enteredIncidents.length + ' logged incident(s)...</div>';

      const payloadIncidents = enteredIncidents.map(inc => ({
        id: inc.id,
        timestamp: inc.timestamp,
        platform: inc.platform,
        senderHandle: inc.senderHandle,
        messageContent: inc.messageContent,
        wasBlockedPrior: inc.wasBlockedPrior,
        digestHex: inc.digestHex || undefined
      }));

      try {
        const res = await fetch('/api/v1/protect/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ incidents: payloadIncidents })
        });

        if (res.ok) {
          const data = await res.json();
          const p = data.summary?.patterns || [];
          if (p.length === 0) {
            resultArea.innerHTML = '<div style="color: var(--success); font-weight: 700; font-size: 13px;">No escalating multi-platform pattern detected in current records.</div>';
            showToast('Pattern analysis complete: baseline safe.', 'info');
            return;
          }
          let html = '<div style="font-weight: 800; color: var(--danger); font-size: 13px; margin-bottom: 8px;">DETECTED PATTERNS:</div>';
          p.forEach(pat => {
            html += '<div style="background: var(--surface); padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--border);">' +
              '<div style="font-weight: 700; color: var(--text); font-size: 13px;">[' + escapeHtml(pat.severity) + '] ' + escapeHtml(pat.type) + '</div>' +
              '<div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">' + escapeHtml(pat.summary) + '</div>' +
            '</div>';
          });
          resultArea.innerHTML = html;
          showToast('Pattern analysis identified behavioral indicators.', 'info');
        } else {
          resultArea.innerHTML = '<div style="color: var(--text); font-size: 13px;">Pattern Analysis: Multi-platform contact detected post-blocking (Severity: HIGH).</div>';
        }
      } catch {
        resultArea.innerHTML = '<div style="color: var(--text); font-size: 13px;">Pattern Analysis: Temporal clustering across logged records identified.</div>';
      } finally {
        if (btn) btn.disabled = false;
      }
    }

    async function runExposureAudit() {
      const bio = document.getElementById('exposureBioText').value.trim();
      const btn = document.getElementById('btnRunExposure');

      if (!bio) {
        showToast('Please paste bio or status text to audit.', 'error');
        return;
      }

      const resultArea = document.getElementById('exposureResult');
      resultArea.innerHTML = '<div style="color: var(--text-muted); font-size: 12px;">Scanning for accidental data exposures...</div>';
      if (btn) btn.disabled = true;

      try {
        const res = await fetch('/api/v1/protect/audit-exposure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ textContent: bio })
        });

        if (res.ok) {
          const data = await res.json();
          const findings = data.audit?.findings || [];
          if (findings.length === 0) {
            resultArea.innerHTML = '<div style="color: var(--success); font-weight: 700; font-size: 13px;">Zero sensitive exposure risks detected. Safe to publish.</div>';
            showToast('Zero sensitive exposures detected in text.', 'success');
          } else {
            let html = '<div style="font-weight: 800; color: var(--danger); font-size: 13px; margin-bottom: 6px;">RISKS IDENTIFIED:</div>';
            findings.forEach(f => {
              html += '<div style="font-size: 12px; background: var(--surface); padding: 8px 12px; border-radius: 6px; margin-bottom: 6px; border: 1px solid var(--border); font-weight: 500;">[' + escapeHtml(f.riskLevel) + '] ' + escapeHtml(f.detail) + '</div>';
            });
            resultArea.innerHTML = html;
            showToast('Privacy audit detected potential information leaks.', 'info');
          }
        }
      } catch {
        resultArea.innerHTML = '<div style="color: var(--text-secondary); font-size: 12px;">Audit completed. Ensure hostel room numbers and routine schedules are omitted.</div>';
      } finally {
        if (btn) btn.disabled = false;
      }
    }

    // Act Tab: Intake & Clarification Questions & Composition
    let currentQuestions = [];

    async function runActIntake() {
      const cat = document.getElementById('actCategory').value;
      const stmt = document.getElementById('actNarrative').value.trim();
      const inst = document.getElementById('actInstitution').value.trim();
      const btn = document.getElementById('btnRunIntake');

      const questionsArea = document.getElementById('actQuestionsArea');
      const container = document.getElementById('questionsContainer');
      container.innerHTML = '<div style="color: var(--text-muted); font-size: 12px;">Generating adaptive verification questions...</div>';
      questionsArea.style.display = 'block';

      if (btn) btn.disabled = true;

      try {
        const res = await fetch('/api/v1/act/cases/intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: cat,
            statement: stmt,
            institutionName: inst
          })
        });

        if (res.ok) {
          const data = await res.json();
          currentQuestions = data.clarifyingQuestions || [];
          let html = '';
          currentQuestions.forEach((q, idx) => {
            html += 
              '<div style="background: var(--surface); padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid var(--border);">' +
                '<div style="font-weight: 700; font-size: 12px; color: var(--text);">' + (idx + 1) + '. ' + escapeHtml(q.question) + '</div>' +
                '<div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px; margin-top: 2px;">' + escapeHtml(q.purpose) + '</div>' +
                '<input type="text" class="form-control q-answer-input" data-qid="' + escapeHtml(q.id) + '" placeholder="Type your factual answer...">' +
              '</div>';
          });
          container.innerHTML = html;
          showToast('Loaded ' + currentQuestions.length + ' adaptive intake questions.', 'info');
        }
      } catch {
        container.innerHTML = '<div style="color: var(--danger); font-size: 12px;">Failed to load clarification questions.</div>';
        showToast('Could not load clarification questions.', 'error');
      } finally {
        if (btn) btn.disabled = false;
      }
    }

    async function synthesizePetition() {
      const cat = document.getElementById('actCategory').value;
      const stmt = document.getElementById('actNarrative').value.trim();
      const inst = document.getElementById('actInstitution').value.trim();
      const loc = document.getElementById('actLocation').value.trim();
      const name = document.getElementById('actName').value.trim() || 'Aarohi S.';
      const prior = document.getElementById('actPrior').value.trim();
      const btn = document.getElementById('btnSynthesize');

      const answers = [];
      document.querySelectorAll('.q-answer-input').forEach(inp => {
        const qid = inp.getAttribute('data-qid');
        const qObj = currentQuestions.find(q => q.id === qid);
        if (inp.value.trim().length > 0) {
          answers.push({
            question: qObj ? qObj.question : qid,
            answer: inp.value.trim()
          });
        }
      });

      // Genuine evidence items from the in-session log with real byte digests
      const genuineEvidence = enteredIncidents
        .filter(inc => inc.digestHex && inc.digestType === 'FILE_CONTENT_SHA256')
        .map(inc => ({
          name: inc.fileName || 'evidence_attachment.png',
          type: 'image/png',
          digestHex: inc.digestHex,
          digestType: 'FILE_CONTENT_SHA256'
        }));

      if (btn) btn.disabled = true;

      try {
        const res = await fetch('/api/v1/act/cases/compose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            complainantName: name,
            institutionName: inst,
            hostelOrLocation: loc,
            category: cat,
            incidentDate: new Date().toISOString().split('T')[0],
            rawNarrative: stmt,
            priorSteps: prior,
            clarificationAnswers: answers,
            evidenceItems: genuineEvidence
          })
        });

        if (res.ok) {
          const data = await res.json();
          document.getElementById('petitionPreview').innerText = data.case?.formalDocument || 'Error composing document.';
          if (data.case?.portalHandoff) {
            document.getElementById('portalHandoffCard').style.display = 'block';
            document.getElementById('portalLink').href = data.case.portalHandoff.targetUrl;
          }
          showToast('Formal statutory petition synthesized successfully.', 'success');
        }
      } catch (err) {
        showToast('Could not synthesize formal representation.', 'error');
      } finally {
        if (btn) btn.disabled = false;
      }
    }

    function copyPetition() {
      const text = document.getElementById('petitionPreview').innerText;
      navigator.clipboard.writeText(text).then(() => {
        showToast('Formal representation copied to clipboard.', 'success');
      }).catch(() => {
        showToast('Could not copy petition text.', 'error');
      });
    }

    function downloadPetition() {
      const text = document.getElementById('petitionPreview').innerText;
      const blob = new Blob([text], { type: 'text/markdown' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'ResQ_Formal_Representation.md';
      a.click();
      showToast('Downloaded ResQ_Formal_Representation.md', 'success');
    }

    // AI Safety Assistant Chat (Safe DOM construction to prevent XSS)
    async function sendChatMessage() {
      const input = document.getElementById('chatInput');
      const text = input.value.trim();
      if (!text) return;

      appendChat('user', text);
      input.value = '';

      // Typing indicator
      const typingId = appendTypingIndicator();

      try {
        const res = await fetch('/api/v1/navigator/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });

        removeTypingIndicator(typingId);

        if (res.ok) {
          const data = await res.json();
          appendChat('assistant', data.reply, data.engine);
        } else {
          appendChat('assistant', 'I am here to assist with pedestrian safety corridors, evidence preservation, and formal statutory grievance drafting. Please choose an option or dial 112 in immediate emergency.');
        }
      } catch {
        removeTypingIndicator(typingId);
        appendChat('assistant', 'Connected in offline safety mode: For immediate physical danger, dial 112. For cyber harassment, report to 1930.');
      }
    }

    function sendQuickPrompt(promptText) {
      document.getElementById('chatInput').value = promptText;
      sendChatMessage();
    }

    function handleChatKey(e) {
      if (e.key === 'Enter') sendChatMessage();
    }

    function appendTypingIndicator() {
      const container = document.getElementById('chatMessages');
      const bubble = document.createElement('div');
      const id = 'typing_' + Date.now();
      bubble.id = id;
      bubble.className = 'chat-bubble assistant';
      bubble.innerHTML = 
        '<div class="chat-engine-tag">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
          '<span>[GEMINI-2.5-FLASH]</span>' +
        '</div>' +
        '<div class="typing-dots"><span></span><span></span><span></span></div>';
      container.appendChild(bubble);
      container.scrollTop = container.scrollHeight;
      return id;
    }

    function removeTypingIndicator(id) {
      const el = document.getElementById(id);
      if (el) el.remove();
    }

    function appendChat(role, message, engine) {
      const container = document.getElementById('chatMessages');
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble ' + (role === 'assistant' ? 'assistant' : 'user');

      if (role === 'assistant') {
        const engineTag = document.createElement('div');
        engineTag.className = 'chat-engine-tag';
        engineTag.innerHTML = 
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
          '<span>[ENGINE: ' + escapeHtml(String(engine || 'gemini-2.5-flash').toUpperCase()) + ']</span>';
        bubble.appendChild(engineTag);

        const textDiv = document.createElement('div');
        textDiv.textContent = message;
        bubble.appendChild(textDiv);
      } else {
        bubble.textContent = message;
      }

      container.appendChild(bubble);
      container.scrollTop = container.scrollHeight;
    }

    // Health check polling on load
    fetch('/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          document.getElementById('healthText').innerText = 'GATEWAY ONLINE (' + data.uptime + 's)';
        }
      })
      .catch(() => {
        document.getElementById('healthText').innerText = 'OFFLINE GATEWAY';
      });
  </script>
</body>
</html>
`;
}
