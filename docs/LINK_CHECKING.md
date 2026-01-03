# Link Checking Guide

This project uses a bash script wrapping `wget` to check for broken links in the application.

## Prerequisites

- `wget` must be installed on your system.
- The application server must be running (locally) before starting the check.

## Usage

1.  **Start the Server:**
    Run the development server or the preview server.
    ```bash
    npm run dev
    # OR
    npm run build && npm run preview
    ```
    Note the URL (usually `http://localhost:4321`).

2.  **Run the Check:**
    In a separate terminal, run:
    ```bash
    npm run check:links
    ```
    This defaults to checking `http://localhost:4321`.

3.  **Custom URL:**
    If your server is running on a different port or URL, pass it as an argument:
    ```bash
    bash scripts/check-links.sh http://localhost:3000
    ```

## CI/CD

In a CI environment, ensure the server is started in the background before running this script.

Example pattern:
```bash
npm run build
npm run preview &
PID=$!
sleep 5 # Wait for server to start
npm run check:links
kill $PID
```
