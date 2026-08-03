---
date: 2026-07-02
category: linux
tags:
  - environment-variables
  - bash
  - devops
---

# TIL: Terminal Variable Lifecycle (echo vs export)

### Problem / Scenario
Setting a variable locally via `DB_PORT=5432` allowed `echo $DB_PORT` to print the value, but running Python's `os.getenv("DB_PORT")` returned `None`. Additionally, variables vanished entirely upon closing the terminal session.

### Solution / Insight
The terminal splits variable scopes into local shell variables and inherited environment processes.

* **`export`**: Modifies the environment block. It escalates a local variable to an environment variable, broadcasting it to all child processes (like Python interpreters) launched from that shell instance.
* **`echo`**: A downstream readout utility. It evaluates strings or variable references (prefixed with `$`) and outputs them to standard stdout. It has no mechanism to write, bind, or modify configuration states.
* **Persistence**: Shell states are ephemeral. To make variables survive terminal termination, they must be registered in the shell initialization script (`~/.bashrc`), which executes on every fresh runtime instantiation.

### Executable Workflow

```bash
# 1. Faulty local scope assignment (Inaccessible to Python)
DB_PORT=5432
echo \$DB_PORT                                         # Outputs: 5432
python3 -c "import os; print(os.getenv('DB_PORT'))"   # Outputs: None

# 2. Correct global scope assignment (Accessible to Python)
export DB_PORT=5432
python3 -c "import os; print(os.getenv('DB_PORT'))"   # Outputs: 5432

# 3. Permanent system profile persistence
echo "export DB_PORT=5432" >> ~/.bashrc
source ~/.bashrc                                      # Forces instant configuration evaluation
```
