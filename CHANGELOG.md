# Changelog

All notable changes to the Bug Reporter extension will be documented in this file.

## [1.0.1] - 2025-11-12

### Fixed
- **Critical Fix**: Resolved "Cannot read properties of undefined (reading 'add_file_to_update')" error
- Changed Monday.com integration approach:
  - Bug details are now added as updates/posts on items (more reliable)
  - Files are attached to updates instead of columns
  - Simplified item creation without complex column value mapping
- Improved error handling throughout the file upload process
- Added validation for board/group selection before bug creation
- Better error messages for debugging

### Changed
- Simplified bug creation flow for better reliability
- Bug information is now formatted as markdown in update posts
- File attachments are more robust (continue even if some files fail)

### Technical Notes
- The Monday.com API has specific requirements for file uploads
- Files must be attached to updates (posts) rather than directly to items
- Column-based file attachments require specific column IDs that vary by board
- Updates approach is more universal and works across all board types

## [1.0.0] - 2025-11-12

### Added
- Initial release
- Chrome Manifest V3 extension
- HAR capture using chrome.debugger API
- Screenshot capture with annotation tools (pen, arrow, rectangle, text)
- Drag & drop file attachments
- Monday.com GraphQL API integration
- Privacy controls and consent system
- Settings page for configuration
- Recent bugs list in popup
- Comprehensive documentation

### Features
- Template-based bug reporting
- Network traffic capture (last 10 minutes)
- Canvas-based screenshot annotation
- File attachment support (up to 50MB per file)
- Board and group selection with persistence
- Sensitive header masking
- Auto-attach HAR option
- Professional gradient UI design

### Documentation
- README with full usage instructions
- QUICKSTART guide (5-minute setup)
- INSTALL guide with multiple icon generation methods
- PRIVACY_NOTICE with GDPR/CCPA compliance
- TEST_PLAN with 49 test cases
- PROJECT_SUMMARY with technical overview

## Known Limitations

### File Uploads
- Monday.com file upload API has some limitations
- Large files (>50MB) cannot be uploaded
- Some file types may not upload depending on Monday.com plan
- File uploads happen asynchronously and may take time to appear

### HAR Capture
- Limited to last 10 minutes (configurable)
- Requires debugger permission (conflicts with DevTools)
- Some sites with strict CSP may have incomplete HAR data
- Only captures traffic for the active tab

### Screenshots
- Can only capture visible tab content (not full page)
- Cannot capture Chrome internal pages (chrome://)
- Incognito mode may require additional permissions

## Future Enhancements

### Planned
- OAuth 2.0 for Monday.com (vs. personal tokens)
- Full-page screenshot with stitching
- Video recording capability
- Better file upload progress indicators
- HAR viewer/preview before upload

### Under Consideration
- Firefox support (when Manifest V3 available)
- Dark mode UI theme
- Keyboard shortcuts
- Offline queue for bug creation
- Automatic duplicate detection
- Custom templates per board

## Support

For issues or questions:
- Check TROUBLESHOOTING section in README.md
- Review this CHANGELOG for recent fixes
- Open an issue on GitHub
- Check browser console for detailed error messages

---

**Tip**: Always reload the extension after updates:
1. Go to chrome://extensions/
2. Find "Bug Reporter for Monday.com"
3. Click the reload icon (circular arrow)
