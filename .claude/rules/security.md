# Security

- No secrets, API keys, or tokens in the repo - ever. Use `.env` locally (gitignored) and document required vars in README.
- This app will accept user-uploaded images and user-authored templates: treat all user content as untrusted. Validate file types/sizes; never `dangerouslySetInnerHTML` with user content; sanitize anything rendered or exported.
- Keep dependencies minimal and audited - every new package needs a reason; prefer zero-dependency solutions for small utilities.
- Open-source repo: assume everything committed is public the moment it lands. There is no "temporary" secret commit.
