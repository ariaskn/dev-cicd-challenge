#!/usr/bin/env bash

set -o pipefail

LOG_FILE="logs/pipeline_output.log"

touch "$LOG_FILE"

run_step() {
  local STEP_NAME="$1"
  local CMD="$2"

  echo "" | tee -a "$LOG_FILE"
  echo "==============================" | tee -a "$LOG_FILE"
  echo "STEP: $STEP_NAME" | tee -a "$LOG_FILE"
  echo "COMMAND: $CMD" | tee -a "$LOG_FILE"
  echo "TIMESTAMP: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" | tee -a "$LOG_FILE"
  echo "==============================" | tee -a "$LOG_FILE"

  eval "$CMD" 2>&1 | tee -a "$LOG_FILE"

  #Pipe Status del CMD
  EXIT_CODE=${PIPESTATUS[0]}

  echo "EXIT_CODE: $EXIT_CODE" | tee -a "$LOG_FILE"

  if [ $EXIT_CODE -ne 0 ]; then
    echo "STATUS: FAILED" | tee -a "$LOG_FILE"
    return $EXIT_CODE
  else
    echo "STATUS: SUCCESS" | tee -a "$LOG_FILE"
  fi
}