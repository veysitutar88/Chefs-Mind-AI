@echo off
echo Syncing environment variables to user environment...

setx PORT "5000"
if defined OPENAI_API_KEY (setx OPENAI_API_KEY "%OPENAI_API_KEY%" >nul) else (echo Skipping OPENAI_API_KEY: set it in your environment before running this script.)
if defined PERPLEXITY_API_KEY (setx PERPLEXITY_API_KEY "%PERPLEXITY_API_KEY%" >nul) else (echo Skipping PERPLEXITY_API_KEY: set it in your environment before running this script.)
if defined GOOGLE_API_KEY (setx GOOGLE_API_KEY "%GOOGLE_API_KEY%" >nul) else (echo Skipping GOOGLE_API_KEY: set it in your environment before running this script.)
setx VERTEX_PROJECT_ID "fourth-dynamo-466917-s3fourth-dynamo-466917-s3"
setx VERTEX_LOCATION "us-central1"

echo Environment variables synced successfully!
echo Note: New values will be available to new processes only.
