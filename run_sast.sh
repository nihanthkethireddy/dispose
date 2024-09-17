#!/bin/bash

# Fail the script on the first error
set -e

# Authenticate with Snyk
echo "Authenticating with Snyk..."
snyk auth $SNYK_TOKEN

# Perform SAST with Snyk
echo "Running Snyk Code Test for SAST..."
snyk code test --json > snyk_sast_report.json

echo "Snyk SAST results:"
cat snyk_sast_report.json

# Fail the pipeline if vulnerabilities are found
echo "Checking for vulnerabilities..."
vuln_count=$(jq '.vulnerabilities | length' snyk_sast_report.json)
if [ "$vuln_count" -ne 0 ]; then
  echo "Vulnerabilities found: $vuln_count"
  exit 1
else
  echo "No vulnerabilities found."
fi
