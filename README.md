# Budget App Enhancement

This repository contains an enhanced version of a small JavaScript budget tracking application for CPT304 Coursework 1. The app allows users to record income and expense entries, view totals, and track the current balance in the browser.

## Source Project

The original source code was based on the open-source Budget App project listed for the coursework:

- Original project list item: Personal Budget App
- Repository: https://github.com/sptin2002/Budget-app
- Tutorial credit in the original project: [aaramiss](https://samiraatech.github.io/Budget-app/)

This repository is a coursework fork/enhancement of that original project. The purpose of this version is to improve the original app against identified software deficiencies and required baseline standards.

## Main Enhancements

- Input validation: Income and expense amounts must be positive numeric values with up to two decimal places.
- DOM XSS prevention: User-entered titles are rendered safely as text instead of being inserted as raw HTML.
- Accessibility improvements: Interactive controls use semantic buttons, form fields have labels, and icon controls include accessible names.
- Responsive layout: The app layout and chart sizing adapt better across mobile and desktop screen sizes.
- Internationalization: The interface supports English and Chinese through a language toggle.
- Legal compliance: A cookie banner and a dedicated Privacy Policy page have been added.

## Usage

1. Clone the repository or download the ZIP file.

1. Open the project in your preferred code editor.

1. Launch the `index.html` file in your browser to run the Budget App locally.

1. Start by adding your income and expenses to track your budget. The app will automatically calculate your available budget.

1. Use the language toggle to switch between English and Chinese if needed.

1. Open `privacy.html` or use the Privacy Policy link in the app to view the privacy policy page.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Browser localStorage

## Notes

This app stores budget entries, language preference, and cookie acknowledgement in the user's browser localStorage. It does not send budget data to a server.
