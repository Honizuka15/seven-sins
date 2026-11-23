// Sauvegarde : compte Claude (privé, par personne) si disponible, sinon navigateur, sinon mémoire
const LS = 'sevensins_v1';
export const store = {
  mode: 'loading',
  state: { settings: null, unlocked: {}, seen: [] },
  history: [],
  col: null,
  db: null,
  listeners: [],
  onChange(f) { this.listeners.push(f); },
  emit() { this.listeners.forEach(f => { try { f(); } catch (e) {} }); },
  async init() {
    try {
      if (window.claude && window.claude.use) {
        const user = await window.claude.use('user');
        const db = await window.claude.use('db');
        if (db && user) {
          const id = await user.id();
          if (id) {
            this.db = db;
            this.col = db.collection('data/users/' + id);
            const snap = await this.col.get();
            const st = snap.docs.find(d => d.id === 'state');
            if (st) Object.assign(this.state, st.data());
            this.history = snap.docs.filter(d => d.id.startsWith('r-')).map(d => d.data()).sort((a, b) => (a.ts || 0) - (b.ts || 0));
            this.mode = 'db'; this.emit(); return;
          }
        }
      }
    } catch (e) {}
    try {
      const raw = localStorage.getItem(LS);
      if (raw) { const d = JSON.parse(raw); Object.assign(this.state, d.state || {}); this.history = d.history || []; }
      this.mode = 'local';
    } catch (e) { this.mode = 'mem'; }
    this.emit();
  },
  _local() { try { localStorage.setItem(LS, JSON.stringify({ state: this.state, history: this.history })); } catch (e) {} },
  _busy: Promise.resolve(),
  async saveState() {
    if (this.mode === 'db') { this._busy = this._busy.then(() => this.col.doc('state').set(JSON.parse(JSON.stringify(this.state)))).catch(() => {}); return this._busy; }
    this._local();
  },
  async addResult(r) {
    this.history.push(r);
    if (this.mode === 'db') { try { await this.col.doc(r.id).set(JSON.parse(JSON.stringify(r))); } catch (e) {} }
    else this._local();
  },
  async removeResult(id) {
    this.history = this.history.filter(r => r.id !== id);
    if (this.mode === 'db') { try { await this.col.doc(id).delete(); } catch (e) {} } else this._local();
  },
  async clearAll() {
    const ids = this.history.map(r => r.id);
    this.history = []; this.state.unlocked = {}; this.state.seen = [];
    if (this.mode === 'db') { for (const id of ids) { try { await this.col.doc(id).delete(); } catch (e) {} } await this.saveState(); }
    else this._local();
  },
  async report(qid, reason) {
    const rec = { qid, reason, ts: Date.now() };
    if (this.db) { try { await this.db.collection('reports').add(rec); return true; } catch (e) {} }
    this.state.reports = [...(this.state.reports || []), rec]; this.saveState(); return true;
  }
};
