---
title: Search Bar
description: Example Search Bar Behavior
---

Use this behavior as a starting point for your own project.

```toml title=SearchBar.zap.toml
name = "SearchBar"
behavior = """
  # SearchBar Behavior Specification

## Overview
The `SearchBar` component allows users to enter a query and trigger a search action. It supports debounced input changes to minimize API calls, displays a loading indicator during search operations, and handles empty or invalid queries gracefully.

---

## Input Field
- **Search Input**
  - **Type**: Text
  - **Placeholder**: "Search…"
  - **Validations**:
    - Required: "Search query cannot be empty."
    - Minimum Length: 3 characters

---

## Buttons
- **Search Button** (Optional)
  - **Label**: "Search"
  - **Disabled State**:
    - Disabled if the input query is invalid or empty.

---

## API Integration
- **GET /search**
  - **Query Parameters**:
    - `q`: The search query string.
  - **Success Response**:
    - **HTTP Status**: 200
    - **Action**: Display search results in a list or grid format.
  - **Error Response**:
    - **HTTP Status**: 400
      - **Action**: Display "Invalid query. Please try again."
    - **HTTP Status**: 500
      - **Action**: Display "Something went wrong. Please try again later."

---

## UI States
- **Loading State**
  - Display a spinner or loading indicator in place of the search button or near the input field.
  - Disable the search button while loading.

- **Error State**
  - Display an error message below the input field if the query is invalid.
  - Display a global error message for server-side errors.

---

## Accessibility
- Ensure the search input is focusable and usable via keyboard navigation.
- Associate error messages with the input field using `aria-describedby`.
- Add `aria-live="polite"` to the results container to announce updates to screen readers.

---

## Events
- **Input Change**
  - Debounce input changes with a 300ms delay.
  - Trigger an API call after debounce period if the query is valid.

- **Search Submission**
  - Triggered on search button click or `Enter` key press.
  - Validate the query and initiate a GET request to the `/search` endpoint.

---

## Testing
- **Unit Tests**:
  - Verify the input field renders with placeholder text.
  - Ensure debounce logic triggers the API call after the set delay.
  - Test validations for empty or invalid queries.
  - Check that the loading spinner appears during API calls.

- **Integration Tests**:
  - Simulate user input and verify the debounce mechanism works as expected.
  - Validate that search results update after successful API calls.
  - Test error handling for invalid queries and server-side errors.
"""