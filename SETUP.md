# Connecting Your Local Repository

If you have a local repository with the same name and want to connect it to this GitHub repository, follow these steps:

> **Important**: This repository exists at `https://github.com/AntonyNeal/wallsendoccupationaltherapy` (no hyphens). Make sure you're using the correct URL.

## Option 1: Connect Existing Local Repository

If you already have a local repository with content that you want to push to this remote:

```bash
# Navigate to your local repository
cd /path/to/your/wallsendoccupationaltherapy

# Check if you already have a remote configured
git remote -v

# If you see a remote with a different URL, remove it first
git remote remove origin

# Add this GitHub repository as a remote (note: no hyphens in the repo name!)
git remote add origin https://github.com/AntonyNeal/wallsendoccupationaltherapy.git

# Verify the remote was added correctly
git remote -v

# Fetch the remote branches to confirm the repository exists
git fetch origin

# If you want to merge the remote main branch with your local work:
git branch --set-upstream-to=origin/main main
git pull origin main --allow-unrelated-histories

# Or, if you want to push your local changes to a new branch:
git checkout -b your-feature-branch
git push -u origin your-feature-branch
```

## Option 2: Clone This Repository

If you don't have local content and just want to start working with this repository:

```bash
# Clone the repository
git clone https://github.com/AntonyNeal/wallsendoccupationaltherapy.git

# Navigate into the directory
cd wallsendoccupationaltherapy

# Start working!
```

## Option 3: Replace Local Repository with Remote

If you want to completely replace your local repository with this remote one:

```bash
# Navigate to your local repository
cd /path/to/your/wallsendoccupationaltherapy

# Remove the existing git history (be careful!)
rm -rf .git

# Initialize as a fresh repository
git init

# Add this remote
git remote add origin https://github.com/AntonyNeal/wallsendoccupationaltherapy.git

# Fetch and checkout the main branch
git fetch origin
git checkout -b main origin/main
```

## Authentication

When pushing to GitHub, you may need to authenticate. GitHub requires either:

1. **Personal Access Token (PAT)**: 
   - Generate at: https://github.com/settings/tokens
   - Use as password when prompted

2. **SSH Key**:
   - Set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
   - Use SSH URL: `git@github.com:AntonyNeal/wallsendoccupationaltherapy.git`

## Troubleshooting

### If you see "remote repository doesn't exist"

This usually means you have the wrong URL. This repository exists at:
```
https://github.com/AntonyNeal/wallsendoccupationaltherapy
```

**Note**: The repository name has NO hyphens. If you're trying to connect to `wallsend-occupational-therapy` (with hyphens), that's a different repository.

To fix:
```bash
# Check your current remote URL
git remote -v

# If it's wrong, remove it and add the correct one
git remote remove origin
git remote add origin https://github.com/AntonyNeal/wallsendoccupationaltherapy.git

# Test the connection
git fetch origin
```

### If you see "remote origin already exists"
```bash
# Remove the existing remote
git remote remove origin

# Add the correct remote
git remote add origin https://github.com/AntonyNeal/wallsendoccupationaltherapy.git
```

### If you see "refusing to merge unrelated histories"
```bash
# Use the --allow-unrelated-histories flag
git pull origin main --allow-unrelated-histories
```

### Check your current configuration
```bash
# See all remotes
git remote -v

# See current branch
git branch

# See git status
git status
```

## Next Steps

Once connected, you can:
- Create feature branches: `git checkout -b feature-name`
- Make commits: `git add . && git commit -m "Your message"`
- Push changes: `git push origin branch-name`
- Pull updates: `git pull origin main`
