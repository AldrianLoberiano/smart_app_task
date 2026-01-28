# Quick Reference Guide - Enhanced Features

## 🚀 Quick Start

### For Users

```
Navigate to: Appointments
Action: Click "New Appointment"
Features: Search, Filter, Quick Actions, Export
```

### For Admins

```
Navigate to: Admin > Appointments
Action: Review Pending tab
Features: Bulk Actions, Advanced Filters, Export, Quick Approve/Reject
```

---

## 📋 User Cheat Sheet

### Creating Appointments

| Step | Action                  | Validation                                 |
| ---- | ----------------------- | ------------------------------------------ |
| 1    | Click "New Appointment" | -                                          |
| 2    | Enter title (3+ chars)  | ✅ Required                                |
| 3    | Select start date/time  | ⚠️ Can't be in past                        |
| 4    | Select end date/time    | ⚠️ Must be after start, 15min-24h duration |
| 5    | Add location (optional) | -                                          |
| 6    | Click Save              | ✅ See duration calculated                 |

### Finding Appointments

| What      | How                         | Example          |
| --------- | --------------------------- | ---------------- |
| Search    | Type in search box          | "Doctor"         |
| By Status | Select from Status dropdown | "Scheduled"      |
| By Date   | Select from Date dropdown   | "This Week"      |
| Today's   | Select "Today"              | Shows only today |
| Upcoming  | Select "Upcoming"           | All future       |

### Quick Actions

| Action   | When                 | Result             |
| -------- | -------------------- | ------------------ |
| Complete | Appointment happened | Status → Completed |
| Cancel   | Can't attend         | Status → Cancelled |
| Edit     | Need to change       | Opens form         |
| Delete   | Remove permanently   | Deleted            |
| Export   | Need CSV             | Downloads file     |

---

## 🔐 Admin Cheat Sheet

### Reviewing Appointments

| Tab       | Shows          | Use Case              |
| --------- | -------------- | --------------------- |
| All       | Everything     | Overview              |
| Pending   | Needs review   | Daily review          |
| Approved  | Admin approved | Track approved        |
| Completed | Finished       | History               |
| Cancelled | Rejected       | Monitor cancellations |

### Bulk Operations

| Step | Action               | Shortcut              |
| ---- | -------------------- | --------------------- |
| 1    | Check boxes          | Click checkbox column |
| 2    | Click "Bulk Actions" | Shows count           |
| 3    | Choose action        | Approve or Reject     |
| 4    | Confirm              | Processes all         |

### Quick Admin Actions

| Icon         | Action       | When to Use   |
| ------------ | ------------ | ------------- |
| ✅ Green     | Approve      | Good to go    |
| ❌ Red       | Reject       | Can't approve |
| ⋮ Three dots | More options | Change status |

### Filtering

| Filter | Options  | Combine? |
| ------ | -------- | -------- |
| Search | Any text | ✅ Yes   |
| User   | Dropdown | ✅ Yes   |
| Status | Dropdown | ✅ Yes   |
| Date   | Dropdown | ✅ Yes   |

---

## 🎯 Common Tasks

### User: "I need to see next week's appointments"

```
1. Go to Appointments
2. Date Filter → "This Week" or "Upcoming"
3. View results
```

### User: "I want to cancel an appointment"

```
1. Find appointment in list
2. Click "Cancel" button (orange)
3. Confirm in success message
```

### Admin: "Approve all pending appointments for John"

```
1. Go to Admin > Appointments
2. Tab → "Pending"
3. User Filter → "John"
4. Select all (checkbox in header)
5. Bulk Actions → Approve Selected
```

### Admin: "Export this month's completed appointments"

```
1. Go to Admin > Appointments
2. Tab → "Completed"
3. Date Filter → "Past" or search by date
4. Click "Export" button
5. Open CSV file
```

---

## ⚡ Keyboard Shortcuts

### Universal

| Key   | Action          |
| ----- | --------------- |
| Tab   | Navigate fields |
| Enter | Submit form     |
| Esc   | Close dialog    |

### Tables

| Key   | Action                    |
| ----- | ------------------------- |
| Space | Select row (when focused) |
| ↑/↓   | Navigate rows             |
| ←/→   | Navigate tabs             |

---

## 🎨 Status Colors

| Status    | Color | Icon |
| --------- | ----- | ---- |
| Scheduled | Blue  | 📅   |
| Approved  | Cyan  | ✅   |
| Completed | Green | ✓    |
| Cancelled | Red   | ✗    |

---

## 📊 Statistics Explained

### User Dashboard

- **Total**: All your appointments
- **Upcoming**: Future scheduled appointments
- **Completed**: Finished appointments
- **Scheduled**: Current scheduled status
- **Cancelled**: Cancelled appointments

### Admin Dashboard

- **Total**: All appointments in system
- **Pending**: Scheduled + future (needs review)
- **Approved**: Admin approved items
- **Completed**: Finished appointments
- **Cancelled**: Rejected/cancelled items
- **Users**: Unique users with appointments

---

## 🐛 Troubleshooting

### "Can't create appointment"

- ✅ Check title is 3+ characters
- ✅ Ensure end time is after start time
- ✅ Verify duration is 15min-24h
- ✅ Make sure start time isn't in past

### "Search not finding results"

- ✅ Check spelling
- ✅ Try partial words
- ✅ Check filters aren't too restrictive
- ✅ Try clearing all filters

### "Bulk actions not working"

- ✅ Ensure items are selected (checkboxes)
- ✅ Check you have items on current page
- ✅ Verify you clicked correct bulk action
- ✅ Wait for success message

### "Export is empty"

- ✅ Check you have appointments visible
- ✅ Verify filters aren't excluding everything
- ✅ Try "All" filters first
- ✅ Check Downloads folder

---

## 💡 Pro Tips

### For Users

1. 🔍 **Use Search**: Faster than scrolling
2. 📅 **Filter by Date**: Find appointments quickly
3. ⏰ **Set Reminders**: Check "Upcoming" daily
4. 📊 **Export Monthly**: Keep records
5. ✓ **Mark Complete**: Keep status current

### For Admins

1. ☑️ **Bulk Operations**: Save time on multiple items
2. 📑 **Use Tabs**: Jump to categories quickly
3. 👤 **Filter by User**: Monitor user activity
4. 📊 **Check Pending Daily**: Stay on top of reviews
5. 📥 **Export Regularly**: Keep compliance records

---

## 📞 Quick Support

### Common Questions

**Q: How do I approve multiple appointments?**
A: Check boxes → Bulk Actions → Approve Selected

**Q: Can I search by user?**
A: Yes (Admin), use User filter dropdown

**Q: How do I see only today's appointments?**
A: Use Date Filter → "Today"

**Q: What does "Pending" mean?**
A: Scheduled appointments in the future awaiting admin review

**Q: Can I undo a status change?**
A: Yes, click three-dot menu and change status back

---

## 🎓 Learning Path

### Day 1: Basics

- Create appointment
- View list
- Use search

### Day 2: Filters

- Status filtering
- Date filtering
- Export data

### Day 3: Advanced

- Quick actions
- Bulk operations (admin)
- Combined filters

---

## 📱 Mobile Tips

### Best Practices

- 📱 Portrait mode for forms
- 📄 Landscape for tables
- 👆 Tap cards to view details
- 🔍 Use search instead of scrolling
- ⚡ Swipe left/right on tabs

---

## ⚙️ Settings Reference

### User Preferences

- Rows per page: 5, 10, 25, 50, 100
- Default view: List (calendar coming soon)
- Time format: 12-hour with AM/PM

### Admin Preferences

- Pagination: Configurable per page
- Bulk action limit: No limit
- Export format: CSV

---

## 🔒 Permissions

### Users Can:

- ✅ Create appointments
- ✅ Edit their appointments
- ✅ Delete their appointments
- ✅ Change status (their own)
- ✅ Export their data

### Admins Can:

- ✅ View all appointments
- ✅ Update any status
- ✅ Bulk approve/reject
- ✅ Export all data
- ✅ Filter by user
- ✅ Monitor system-wide

---

## 🎯 Goals & Metrics

### User Success

- Create appointment in < 30 seconds
- Find appointment in < 5 seconds
- Update status in < 3 clicks

### Admin Success

- Review pending in < 5 minutes
- Bulk approve 10+ in < 10 seconds
- Export report in < 5 clicks

---

**Happy Scheduling! 🎉**
