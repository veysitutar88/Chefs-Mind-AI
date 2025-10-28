@echo off
echo Syncing environment variables to user environment...

setx PORT "5000"
setx OPENAI_API_KEY "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"
setx PERPLEXITY_API_KEY "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"
setx GOOGLE_API_KEY "AIzaSyCy1VCav2CT8IRiaZBdsWc8nvf107hKXNg"
setx VERTEX_PROJECT_ID "fourth-dynamo-466917-s3fourth-dynamo-466917-s3"
setx VERTEX_LOCATION "us-central1"

echo Environment variables synced successfully!
echo Note: New values will be available to new processes only.
