#!/bin/bash

# Focus Interface Frontend Test Script
# Tests the Focus API endpoints with the test Focus ID

FOCUS_ID="cmh3inmsa00072gdtkwiherjh"
BASE_URL="http://localhost:3000"

echo "🧪 Focus Interface Frontend Test Script"
echo "========================================"
echo ""
echo "Focus ID: $FOCUS_ID"
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Get Focus
echo "📋 Test 1: Get Focus Data"
echo "GET $BASE_URL/api/focus/$FOCUS_ID"
echo ""
curl -s "$BASE_URL/api/focus/$FOCUS_ID" | jq '.success, .data.title, .data.description, (.data.interface.nodes | length), (.data.interface.edges | length)'
echo ""
echo "---"
echo ""

# Test 2: Get Interface
echo "🎨 Test 2: Get Interface Data"
echo "GET $BASE_URL/api/focus/$FOCUS_ID/interface"
echo ""
curl -s "$BASE_URL/api/focus/$FOCUS_ID/interface" | jq '.success, (.interface.nodes | length), (.interface.edges | length), .interface.goal.name'
echo ""
echo "---"
echo ""

# Test 3: List all nodes
echo "📊 Test 3: List All Nodes"
echo ""
curl -s "$BASE_URL/api/focus/$FOCUS_ID/interface" | jq '.interface.nodes[] | {id, type, label: .data.label, importance: .data.importance}'
echo ""
echo "---"
echo ""

# Test 4: List all edges
echo "🔗 Test 4: List All Edges"
echo ""
curl -s "$BASE_URL/api/focus/$FOCUS_ID/interface" | jq '.interface.edges[] | {id, source, target, animated: .type}'
echo ""
echo "---"
echo ""

# Test 5: Check handle coordinates
echo "📍 Test 5: Check Handle Coordinates (First Node)"
echo ""
curl -s "$BASE_URL/api/focus/$FOCUS_ID/interface" | jq '.interface.nodes[0] | {id, type, handles}'
echo ""
echo "---"
echo ""

# Test 6: Update Focus
echo "✏️  Test 6: Update Focus Title"
echo "PATCH $BASE_URL/api/focus/$FOCUS_ID"
echo ""
curl -s -X PATCH "$BASE_URL/api/focus/$FOCUS_ID" \
  -H "Content-Type: application/json" \
  -d '{"metadata":{"testRun":"'$(date +%s)'"}}' | jq '.success, .data.title, .data.metadata'
echo ""
echo "---"
echo ""

echo "✅ All tests complete!"
echo ""
echo "🌐 Frontend Test URLs:"
echo "   - Focus Page: http://localhost:3000/focus/$FOCUS_ID"
echo "   - Test Page: http://localhost:3000/test-focus"
echo ""
echo "📚 Documentation:"
echo "   - FOCUS_TEST_DATA.md - Test data reference"
echo "   - FOCUS_INTERFACE_FRONTEND_GUIDE.md - Implementation guide"
echo "   - FOCUS_INTERFACE_QUICK_START.md - Quick start guide"
echo ""

