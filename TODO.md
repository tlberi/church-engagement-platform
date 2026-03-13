# Church Engagement Platform - PRIORITY 3: Notification Engine

## Status: 🔔 Priority 3 In Progress (Phase 4: 1/7 complete)

### Phase 1-2: Risk & Alerts ✅ COMPLETE
- ✅ Core risk algorithm (weighted scoring + evidence)
- ✅ Alerts collection CRUD + generateDailyAlerts

### Phase 3: UI ✅ COMPLETE  
- ✅ Alerts.jsx dashboard (stats/tabs/search/collection)
- ✅ AlertCard (severity colors, evidence display)

### Phase 4: Notification Engine (Priority 3) ⏳
- ✅ 1. Create `src/services/notifications.service.js`: CRUD templates/notifications, sendEmail/sendSMS (SendGrid/Twilio placeholders), template rendering, seedDefaults
- ✅ 2. Update `src/services/alerts.service.js`: Auto-trigger notifications on red alert create (leader email + member SMS)
- ✅ 3. Update `src/components/alerts/AlertCard.jsx`: Buttons → [View Evidence] [Contact Now] [Assign Task], template selector dropdown, real sends
- ✅ 4. Update `src/pages/Alerts.jsx`: Add Generate Alerts button, pass notifications service, show sent status column
- [ ] 5. Create `.env.example`: API keys (SENDGRID_API_KEY, TWILIO_SID/AUTH_TOKEN/PHONE)
- [ ] 6. Seed templates: Call seedDefaultTemplates() in console or Alerts.jsx
- [ ] 7. Test notifications: Generate alerts → Contact Now → check Firestore + console/logs

### Phase 5: Final Polish & Test
- [ ] 8. Update Dashboard.jsx: Live risk stats refresh
- [ ] 9. Full test: npm start, Alerts→Generate→Red alert→Contact→verify notifications collection
- [ ] 10. Firestore rules update for notifications collections

**Notes:**
- Placeholders for SendGrid/Twilio (fetch, console.log + toast). Real keys in .env
- Templates vars: {member_name}, {risk_score}, {leader_name}, {org_name}
- Brand colors: Red #ef4444, Orange #fb923c, etc.
- Strict coding standards: try/catch, Timestamp, orgId filter

**Next Step:** 2/7 - Update alerts.service.js for auto-notifications


