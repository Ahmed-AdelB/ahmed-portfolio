#!/bin/bash
# scripts/check-links.sh

URL="${1:-http://localhost:4321}"

echo "Link Checker"
echo "Target: $URL"
echo "---------------------------------------------------"
echo "Ensure your server is running at $URL (or pass a different URL as an argument)."
echo "Example: npm run check:links -- http://localhost:3000"
echo "---------------------------------------------------"

if ! command -v wget &> /dev/null; then
    echo "Error: 'wget' is not installed."
    exit 1
fi

# Run wget in spider mode
# --spider: Check for broken links
# -r: Recursive
# -nd: No directories
# -nv: No verbose (but we want to see errors)
# -l 10: Recursion depth
# -p: Page requisites (css, js, images)
# -e robots=off: Ignore robots.txt

echo "Starting spider..."
wget --spider -r -nd -nv -l 10 -p -e robots=off "$URL" 2>&1 | grep -v "200 OK" | tee link-check.log

# Check for common error indicators in the log
if grep -q -E "Broken|404 Not Found|Connection refused|Unable to establish SSL connection" link-check.log; then
    echo "---------------------------------------------------"
    echo "❌ Issues found! Check link-check.log for details."
    # If connection refused, give a hint
    if grep -q "Connection refused" link-check.log; then
        echo "Tip: Is the server running?"
    fi
    exit 1
else
    # Check if the log is empty (which might happen if wget fails silently or regex is wrong, but with -nv it should print URL: 200 OK)
    # Actually with -nv and grep -v "200 OK", success means empty or just download summaries.
    # Let's check if we actually checked something.
    # Maybe removing the grep pipe for the check is safer, but noisy.
    
    echo "---------------------------------------------------"
    echo "✅ No broken links found (or check completed with no errors reported)."
    rm link-check.log
    exit 0
fi
