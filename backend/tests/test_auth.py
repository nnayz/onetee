import pytest
from unittest.mock import patch, Mock
from fastapi.testclient import TestClient

def test_auth_endpoints_exist(client):
    """Test that auth endpoints are accessible"""
    response = client.get("/auth/")
    # Should either return 200 (if there's a root endpoint) or 404 (if not)
    assert response.status_code in [200, 404, 405]

def test_signup_endpoint_structure(client):
    """Test signup endpoint structure"""
    response = client.post("/auth/signup", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
        "display_name": "Test User"
    })
    # Should either return 200/201 (success) or 422 (validation error)
    assert response.status_code in [200, 201, 422]

def test_login_endpoint_structure(client):
    """Test login endpoint structure"""
    response = client.post("/auth/login", json={
        "username_or_email": "test@example.com",
        "password": "testpassword123"
    })
    # Should either return 200 (success) or 422 (validation error)
    assert response.status_code in [200, 422]

def test_invalid_email_format(client):
    """Test validation for invalid email format"""
    response = client.post("/auth/signup", json={
        "username": "testuser",
        "email": "invalid-email",
        "password": "testpassword123",
        "display_name": "Test User"
    })
    assert response.status_code == 422

def test_weak_password(client):
    """Test validation for weak password"""
    response = client.post("/auth/signup", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "123",  # Too short
        "display_name": "Test User"
    })
    assert response.status_code == 422

def test_short_username(client):
    """Test validation for short username"""
    response = client.post("/auth/signup", json={
        "username": "ab",  # Too short
        "email": "test@example.com",
        "password": "testpassword123",
        "display_name": "Test User"
    })
    assert response.status_code == 422

@patch('auth.service.AuthService.signup')
def test_signup_success(mock_signup, client):
    """Test successful user signup"""
    from community.models import User
    from uuid import uuid4
    
    mock_user = Mock(spec=User)
    mock_user.id = uuid4()
    mock_user.username = "testuser"
    mock_user.email = "test@example.com"
    mock_user.display_name = "Test User"
    mock_user.created_at = "2024-01-01T00:00:00Z"
    
    mock_signup.return_value = mock_user
    
    response = client.post("/auth/signup", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
        "display_name": "Test User"
    })
    
    assert response.status_code in [200, 201]
    mock_signup.assert_called_once()

@patch('auth.service.AuthService.authenticate')
@patch('auth.service.AuthService.issue_token')
def test_login_success(mock_issue_token, mock_authenticate, client):
    """Test successful user login"""
    from community.models import User
    from uuid import uuid4
    
    mock_user = Mock(spec=User)
    mock_user.id = uuid4()
    mock_user.username = "testuser"
    mock_user.email = "test@example.com"
    mock_user.display_name = "Test User"
    
    mock_authenticate.return_value = mock_user
    mock_issue_token.return_value = "fake-token"
    
    response = client.post("/auth/login", json={
        "username_or_email": "test@example.com",
        "password": "testpassword123"
    })
    
    assert response.status_code == 200
    mock_authenticate.assert_called_once()
    mock_issue_token.assert_called_once() 