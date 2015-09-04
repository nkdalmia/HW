# HW 0: Solutions

## Learn Git

### Level 1: Introduction to Git Commits
```
git commit -m "C2"
git commit -m "C3"
```

### Level 2: Branching in Git
```
git branch bugFix
git checkout bugFix
```

### Level 3: Merging in Git
```
git branch bugFix
git checkout bugFix
git commit -m "C2"
git checkout master
git commit -m "C3"
git merge bugFix
```

### Level 4: Rebase Introduction
```
git branch bugFix
git checkout bugFix
git commit -m "C2"
git checkout master
git commit -m "C3"
git checkout bugFix
git rebase master
```

### Level 5: Detach yo' HEAD
```
git checkout C4
```

### Level 6: Relative Refs (^)
```
git checkout bugFix^
```

### Level 7: Relative Refs #2 (~)
```
git branch -f master C6
git checkout HEAD~1
git branch -f bugFix HEAD~1
```

### Level 8: Reversing Changes in Git
```
git reset HEAD~1
git checkout pushed
git revert HEAD
```

### Progress

![git_exercises](https://cloud.githubusercontent.com/assets/9170076/9653002/70c7dade-51ee-11e5-8490-e722bf52b4dc.JPG)

## Git Hooks

### post-commit file (Windows)
```
#!/bin/sh

start https://duckduckgo.com
```

### Gif Image

![hooks](https://cloud.githubusercontent.com/assets/9170076/9693443/7ec7a1e2-531e-11e5-828b-61e123ee30b0.gif)

