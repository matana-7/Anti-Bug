# Changes v1.4.0 - Stability & User Experience Improvements

## Summary
This release focuses on making the extension more stable and user-friendly by improving error handling for large file uploads and removing the automatic HAR capture feature.

## Changes Implemented

### 1. Better Error Handling for Large Files ✅

**Problem:** When users attached large files (especially videos), they received a generic "Resource::kQuotaBytes quota exceeded" error, and bug creation would fail completely.

**Solution:**
- Added intelligent detection of quota/size-related errors in `modules/monday-api.js`
- Introduced a new "skipped" category for files that are too large
- Updated the upload results structure to include three categories:
  - `uploaded`: Successfully uploaded files
  - `failed`: Files that failed due to other errors
  - `skipped`: Files that were too large for the extension to upload

**User Experience:**
- When large files are detected, users now see this clear message:
  ```
  Bug created successfully! However, [N] file(s) were too large to upload 
  via the extension: [file names]. Please upload them directly to the 
  Monday ticket.
  ```
- The bug is still created successfully WITHOUT the oversized files
- Users can then navigate to the Monday item and upload large files directly there

**Files Modified:**
- `modules/monday-api.js` - Updated `addFilesToItem()` method to catch quota errors
- `scripts/create-bug.js` - Updated success handler to display skipped files message

### 2. Removed Automatic HAR Capture ✅

**Problem:** The automatic HAR capture feature was heavy, complex, unreliable, and contributed to size/quota issues.

**Solution:** Completely removed the HAR capture functionality from the extension UI and logic.

**Changes Made:**
1. **HTML Updates:**
   - Removed HAR checkbox and status indicator from `create-bug.html`
   - Removed entire HAR Settings section from `settings.html`
   - Simplified Privacy & Consent section to only mention screenshots

2. **JavaScript Updates:**
   - Removed `autoAttachHAR` variable and references from `create-bug.js`
   - Removed `captureHAR()` function (70+ lines of code)
   - Removed HAR capture trigger from bug creation flow
   - Removed `handleCaptureHAR()` from `background.js`
   - Removed HAR-related settings from `settings.js`
   - Removed `saveHARSettings()` function

3. **Settings Cleanup:**
   - Removed HAR-related storage keys: `autoAttachHAR`, `harTimeframe`, `maskSensitiveHeaders`, `maskQueryStrings`, `harConsent`
   - Updated consent section to only track `screenshotConsent`

**User Impact:**
- Extension is now lighter and faster
- No more quota issues from large HAR files
- Users can manually attach logs when needed
- Simplified UI with fewer options
- More reliable bug creation process

**Files Modified:**
- `create-bug.html` - Removed HAR UI section
- `scripts/create-bug.js` - Removed HAR capture logic
- `background.js` - Removed HAR message handler
- `settings.html` - Removed HAR settings section
- `scripts/settings.js` - Removed HAR settings functions

**Files Unchanged:**
- `modules/har-capture.js` - Left in place (not actively used, but available for future use if needed)

## Technical Details

### Error Detection Logic
The extension now detects quota errors by checking for these patterns in error messages:
- "quota"
- "Resource::kQuotaBytes"
- "too large"
- "size limit"

When detected, files are categorized as "skipped" instead of "failed", and users receive the appropriate guidance.

### Backward Compatibility
- Old HAR settings in storage will remain but won't be used
- No migration needed - extension will work with existing data
- Users who had HAR enabled won't see any errors

## Testing Performed
- ✅ No linter errors in any modified files
- ✅ All HAR references removed from application code
- ✅ Error handling logic properly implemented
- ✅ User-friendly messages display correctly

## Benefits
1. **More Stable:** No more complete failures due to large file uploads
2. **Better UX:** Clear, actionable error messages instead of generic quota errors
3. **Faster:** Removed heavy HAR capture overhead
4. **Simpler:** Cleaner UI with fewer options and settings
5. **More Reliable:** Bug creation succeeds even when file uploads partially fail

## Upgrade Path
No user action required. The extension will work immediately after installation with the improved behavior.

---

**Version:** 1.4.0  
**Date:** November 30, 2025  
**Status:** Complete ✅
