# Translation Manager Feature

## Overview
A new "Translation Manager" section has been added to the Admin Panel. This allows translators and admins to view and edit translations for all supported languages directly from the dashboard.

## Features
- **Language Selection**: Filter translations by any active language.
- **Search**: Real-time search by Key, Default English Text, or Translated Text.
- **Inline Editing**: valid translations can be edited directly in the table. Changes are auto-saved on blur.
- **Pagination**: Client-side pagination to handle thousands of keys efficiently.
- **Visual Feedback**: visual indicators for saving state and success/error toasts.

## Technical Details

### Frontend
- **Page**: `src/pages/Languages/TranslationManager.jsx`
- **Route**: `/languages/translations`
- **Service**: Uses `adminService.getTranslations` and `adminService.updateTranslation`.

### Backend
- **Endpoints**:
  - `GET /api/v1/admin/translations?language_id=X`: Fetches all keys with their translations for language X.
  - `PUT /api/v1/admin/translations/:id`: Updates the translated text.

## Usage
1. Navigate to **Languages > Translations** in the sidebar.
2. Select the target language from the dropdown.
3. Use the search bar to find specific strings.
4. Click on any translation text field to edit.
5. Click away (blur) to auto-save the change.
