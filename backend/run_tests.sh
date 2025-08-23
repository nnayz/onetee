#!/bin/bash

# OneTee Backend Test Runner
# This script provides easy ways to run different types of tests

echo "🧪 OneTee Backend Test Runner"
echo "=============================="

case "$1" in
    "basic")
        echo "Running basic API tests..."
        uv run pytest tests/test_basic.py -v
        ;;
    "security")
        echo "Running security tests..."
        uv run pytest tests/test_security.py -v
        ;;
    "auth")
        echo "Running auth tests..."
        uv run pytest tests/test_auth.py -v
        ;;
    "community")
        echo "Running community tests..."
        uv run pytest tests/test_community.py -v
        ;;
    "marketplace")
        echo "Running marketplace tests..."
        uv run pytest tests/test_marketplace.py -v
        ;;
    "passing")
        echo "Running all passing tests..."
        uv run pytest tests/test_basic.py tests/test_security.py -v
        ;;
    "all")
        echo "Running all tests..."
        uv run pytest tests/ -v
        ;;
    "coverage")
        echo "Running tests with coverage..."
        uv run pytest tests/ --cov=. --cov-report=html
        ;;
    *)
        echo "Usage: $0 {basic|security|auth|community|marketplace|passing|all|coverage}"
        echo ""
        echo "Options:"
        echo "  basic      - Run basic API tests (10 tests)"
        echo "  security   - Run security tests (6 tests)"
        echo "  auth       - Run auth tests (8 tests)"
        echo "  community  - Run community tests (12 tests)"
        echo "  marketplace- Run marketplace tests (9 tests)"
        echo "  passing    - Run all passing tests (16 tests)"
        echo "  all        - Run all tests (51 tests)"
        echo "  coverage   - Run all tests with coverage report"
        echo ""
        echo "Examples:"
        echo "  $0 basic     # Run basic tests"
        echo "  $0 passing   # Run all passing tests"
        echo "  $0 all       # Run all tests"
        exit 1
        ;;
esac 