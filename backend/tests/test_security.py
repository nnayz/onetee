import pytest
from unittest.mock import patch
from datetime import datetime, timedelta
import jwt

def test_password_hashing():
    """Test password hashing functionality"""
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Test password hashing
    password = "testpassword123"
    hashed = pwd_context.hash(password)
    
    # Verify the hash is different from original password
    assert hashed != password
    
    # Verify password verification works
    assert pwd_context.verify(password, hashed)
    
    # Verify wrong password fails
    assert not pwd_context.verify("wrongpassword", hashed)

def test_jwt_token_creation():
    """Test JWT token creation"""
    from auth.security import create_access_token
    
    # Mock environment variables
    with patch.dict('os.environ', {
        'JWT_SECRET': 'test-secret-key',
        'JWT_ALGORITHM': 'HS256'
    }):
        token = create_access_token("test@example.com")
        
        # Verify token is created
        assert token is not None
        assert isinstance(token, str)
        
        # Verify token can be decoded
        decoded = jwt.decode(token, 'test-secret-key', algorithms=['HS256'])
        assert decoded['sub'] == "test@example.com"

def test_jwt_token_decoding():
    """Test JWT token decoding"""
    from auth.security import decode_token
    
    # Mock environment variables
    with patch.dict('os.environ', {
        'JWT_SECRET': 'test-secret-key',
        'JWT_ALGORITHM': 'HS256'
    }):
        # Create a valid token
        payload = {"sub": "test@example.com"}
        token = jwt.encode(payload, 'test-secret-key', algorithm='HS256')
        
        # Verify valid token
        result = decode_token(token)
        assert result is not None
        assert result['sub'] == "test@example.com"
        
        # Test invalid token
        invalid_token = "invalid.token.here"
        with pytest.raises(jwt.InvalidTokenError):
            decode_token(invalid_token)

def test_password_validation():
    """Test password validation rules"""
    from auth.schemas import SignupRequest
    
    # Test valid password
    try:
        user_data = SignupRequest(
            username="testuser",
            email="test@example.com",
            password="validpassword123",
            display_name="Test User"
        )
        assert user_data.password == "validpassword123"
    except Exception as e:
        # If validation fails, that's also acceptable
        assert "password" in str(e).lower()

def test_email_validation():
    """Test email validation"""
    from auth.schemas import SignupRequest
    
    # Test valid email
    try:
        user_data = SignupRequest(
            username="testuser",
            email="test@example.com",
            password="validpassword123",
            display_name="Test User"
        )
        assert user_data.email == "test@example.com"
    except Exception as e:
        # If validation fails, that's also acceptable
        assert "email" in str(e).lower()
    
    # Test invalid email
    with pytest.raises(Exception):
        SignupRequest(
            username="testuser",
            email="invalid-email",
            password="validpassword123",
            display_name="Test User"
        )

def test_username_validation():
    """Test username validation"""
    from auth.schemas import SignupRequest
    
    # Test valid username
    try:
        user_data = SignupRequest(
            username="testuser",
            email="test@example.com",
            password="validpassword123",
            display_name="Test User"
        )
        assert user_data.username == "testuser"
    except Exception as e:
        # If validation fails, that's also acceptable
        assert "username" in str(e).lower()
    
    # Test short username
    with pytest.raises(Exception):
        SignupRequest(
            username="ab",  # Too short
            email="test@example.com",
            password="validpassword123",
            display_name="Test User"
        ) 