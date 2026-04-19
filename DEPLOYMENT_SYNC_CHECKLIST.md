# Deployment Sync Checklist (Vercel + GitHub)

Use this quick checklist when a deployment seems to run an old commit.

1. Confirm the branch and commit hash shown in Vercel **Source**.
2. Confirm the expected commit hash in GitHub (branch head).
3. If hashes differ, redeploy from the right commit/branch.
4. If hashes match but behavior is stale, use **Redeploy with Clear Build Cache**.
5. Re-check the Vercel deployment details to ensure the final hash is correct.

## Optional terminal checks

```bash
git log -1 --oneline --decorate
git status --short
```

These commands help confirm your local branch head and working tree state before pushing.
