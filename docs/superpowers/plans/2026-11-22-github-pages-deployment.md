# GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public static site load when GitHub Pages serves the repository root.

**Architecture:** Keep `admin/` and `client/` intact. Add a root entry page that redirects to `client/index.html`, plus `.nojekyll` to publish the static tree unchanged. GitHub Pages must be configured to deploy `main` from `/(root)` in repository settings.

**Tech Stack:** Static HTML, GitHub Pages.

---

### Task 1: Add a GitHub Pages root entry point

**Files:**
- Create: `index.html`
- Create: `.nojekyll`
- Test: repository-root entry point and existing relative asset/page paths

- [ ] **Step 1: Add the root redirect**

Create `index.html` with a page title, a meta refresh to `client/index.html`, and a visible fallback link to `client/index.html`.

- [ ] **Step 2: Mark the repository as static content**

Create an empty `.nojekyll` file at the repository root.

- [ ] **Step 3: Verify the deployment entry point**

From the repository root, confirm `index.html`, `.nojekyll`, and `client/index.html` exist and that the root entry point points to `client/index.html`.

- [ ] **Step 4: Verify existing project references**

Check that representative client/admin HTML, CSS, JS, and image files still exist at their current relative paths; no existing pages should be moved or rewritten.

- [ ] **Step 5: Configure GitHub Pages**

In the repository, open **Settings → Pages**, select **Deploy from a branch**, choose branch `main` and folder `/(root)`, and save. This setting is outside the repository files.
