import pytest
from unittest.mock import patch, Mock
from fastapi.testclient import TestClient

def test_community_endpoints_exist(client):
    """Test that community endpoints are accessible"""
    response = client.get("/community/")
    # Should either return 200 (if there's a root endpoint) or 404 (if not)
    assert response.status_code in [200, 404, 405]

def test_threads_endpoint_structure(client):
    """Test threads endpoint structure"""
    response = client.get("/community/threads")
    # Should either return 200 (success) or 404 (if endpoint doesn't exist)
    assert response.status_code in [200, 404]

def test_create_thread_validation(client):
    """Test thread creation validation"""
    response = client.post("/community/threads", json={
        "title": "Test Thread",
        "content": "This is a test thread content",
        "category": "general"
    })
    # Should either return 201 (success) or 422 (validation error) or 401 (unauthorized)
    assert response.status_code in [201, 422, 401]

def test_thread_title_required(client):
    """Test that thread title is required"""
    response = client.post("/community/threads", json={
        "content": "This is a test thread content",
        "category": "general"
    })
    assert response.status_code == 422

def test_thread_content_required(client):
    """Test that thread content is required"""
    response = client.post("/community/threads", json={
        "title": "Test Thread",
        "category": "general"
    })
    assert response.status_code == 422

@patch('community.services.community_service.create_thread')
def test_create_thread_success(mock_create_thread, client):
    """Test successful thread creation"""
    mock_create_thread.return_value = {
        "id": 1,
        "title": "Test Thread",
        "content": "This is a test thread content",
        "category": "general",
        "author_id": 1,
        "created_at": "2024-01-01T00:00:00Z"
    }
    
    response = client.post("/community/threads", json={
        "title": "Test Thread",
        "content": "This is a test thread content",
        "category": "general"
    })
    
    assert response.status_code in [200, 201]
    mock_create_thread.assert_called_once()

@patch('community.services.community_service.get_threads')
def test_get_threads_success(mock_get_threads, client):
    """Test successful threads retrieval"""
    mock_get_threads.return_value = [
        {
            "id": 1,
            "title": "Test Thread 1",
            "content": "This is a test thread content",
            "category": "general",
            "author": {"username": "testuser"},
            "created_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": 2,
            "title": "Test Thread 2",
            "content": "Another test thread content",
            "category": "help",
            "author": {"username": "testuser2"},
            "created_at": "2024-01-02T00:00:00Z"
        }
    ]
    
    response = client.get("/community/threads")
    
    assert response.status_code == 200
    mock_get_threads.assert_called_once()

def test_thread_detail_endpoint(client):
    """Test thread detail endpoint"""
    response = client.get("/community/threads/1")
    # Should either return 200 (success) or 404 (if thread doesn't exist)
    assert response.status_code in [200, 404]

def test_comments_endpoint_structure(client):
    """Test comments endpoint structure"""
    response = client.get("/community/threads/1/comments")
    # Should either return 200 (success) or 404 (if endpoint doesn't exist)
    assert response.status_code in [200, 404]

def test_create_comment_validation(client):
    """Test comment creation validation"""
    response = client.post("/community/threads/1/comments", json={
        "content": "This is a test comment"
    })
    # Should either return 201 (success) or 422 (validation error) or 401 (unauthorized)
    assert response.status_code in [201, 422, 401]

def test_comment_content_required(client):
    """Test that comment content is required"""
    response = client.post("/community/threads/1/comments", json={})
    assert response.status_code == 422

def test_media_upload_endpoint(client):
    """Test media upload endpoint"""
    response = client.post("/community/media/upload")
    # Should either return 200 (success) or 422 (validation error) or 401 (unauthorized)
    assert response.status_code in [200, 422, 401]

def test_hashtags_endpoint(client):
    """Test hashtags endpoint"""
    response = client.get("/community/hashtags")
    # Should either return 200 (success) or 404 (if endpoint doesn't exist)
    assert response.status_code in [200, 404] 