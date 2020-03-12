#!/bin/bash

# common setup

set -e

DIRNAME=$( cd "$( dirname "$0" )" && pwd )
PROJECT_ROOT=$( cd "$DIRNAME/../.." && pwd )

# script specific sources, variables and function definitions

# -

# setup

cd $PROJECT_ROOT

# execution

echo ""
echo "node dist/atlas.js login --help"
node dist/atlas.js login --help

echo ""
echo "node dist/atlas.js login http://localhost:8000 --root --output json"
node dist/atlas.js login http://localhost:8000 --root --output json

echo ""
echo "node dist/atlas.js session-status --help"
node dist/atlas.js session-status --help

echo ""
echo "node dist/atlas.js session-status --output json"
node dist/atlas.js session-status --output json

echo ""
echo "node dist/atlas.js deploy-files --help"
node dist/atlas.js deploy-files --help

echo ""
echo "node dist/atlas.js deploy-files fixtures/wait-demo.bpmn --output json"
node dist/atlas.js deploy-files fixtures/wait-demo.bpmn --output json

echo ""
echo "node dist/atlas.js start-process-model --help"
node dist/atlas.js start-process-model --help

echo ""
echo "node dist/atlas.js start-process-model wait_demo StartEvent_1 --input-values '{"seconds": 1}' --output json | ..."
node dist/atlas.js start-process-model wait_demo StartEvent_1 --input-values '{"seconds": 1}' --output json \
                  | node dist/atlas.js stop-process-instance --output json \
                  | node dist/atlas.js show-process-instance

echo ""
echo "node dist/atlas.js list-process-instances --help"
node dist/atlas.js list-process-instances --help

echo ""
echo "node dist/atlas.js list-process-instances"
node dist/atlas.js list-process-instances

echo ""
echo "node dist/atlas.js list-process-models --help"
node dist/atlas.js list-process-models --help

echo ""
echo "node dist/atlas.js list-process-models"
node dist/atlas.js list-process-models

echo ""
echo "node dist/atlas.js remove --help"
node dist/atlas.js remove --help

echo ""
echo "node dist/atlas.js remove wait_demo --yes"
node dist/atlas.js remove wait_demo --yes

echo ""
echo "node dist/atlas.js logout --help"
node dist/atlas.js logout --help

echo ""
echo "node dist/atlas.js logout"
node dist/atlas.js logout

echo ""
echo "node dist/atlas.js session-status"
node dist/atlas.js session-status

echo ""
echo "Smoke test successful."
