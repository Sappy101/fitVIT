"""
Backend API Tests for Smart Mess Menu & Nutrition System
Tests: Health check, Meals CRUD, Profile, Ratings, Preferences, Analytics, Admin endpoints
"""
import pytest
import requests
from datetime import date

class TestHealthCheck:
    """Test API health and connectivity"""
    
    def test_root_endpoint(self, api_client, base_url):
        """Test GET /api/ returns status ok"""
        response = api_client.get(f"{base_url}/api/")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "status" in data, "Response missing 'status' field"
        assert data["status"] == "ok", f"Expected status 'ok', got {data.get('status')}"
        assert "message" in data, "Response missing 'message' field"
        print(f"✓ Health check passed: {data}")


class TestMealsEndpoints:
    """Test meals_vault table endpoints"""
    
    def test_get_all_meals(self, api_client, base_url):
        """Test GET /api/meals returns meals data"""
        response = api_client.get(f"{base_url}/api/meals")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of meals"
        print(f"✓ Retrieved {len(data)} meals from meals_vault")
        
        # Verify data structure if meals exist
        if len(data) > 0:
            meal = data[0]
            assert "name" in meal, "Meal missing 'name' field"
            assert "day" in meal, "Meal missing 'day' field"
            assert "diet_type" in meal, "Meal missing 'diet_type' field"
            assert "meal" in meal, "Meal missing 'meal' field (slot)"
            print(f"✓ Sample meal: {meal.get('name')} - {meal.get('day')} {meal.get('meal')}")
    
    def test_get_meals_by_day(self, api_client, base_url):
        """Test GET /api/meals?day=MONDAY returns Monday meals"""
        response = api_client.get(f"{base_url}/api/meals?day=MONDAY")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of meals"
        
        # Verify all returned meals are for MONDAY
        for meal in data:
            assert meal.get("day") == "MONDAY", f"Expected MONDAY, got {meal.get('day')}"
        
        print(f"✓ Retrieved {len(data)} meals for MONDAY")
    
    def test_get_meals_with_filters(self, api_client, base_url):
        """Test GET /api/meals with multiple filters"""
        response = api_client.get(f"{base_url}/api/meals?day=MONDAY&diet_type=vegetarian&meal=Breakfast")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of meals"
        
        # Verify filters applied correctly
        for meal in data:
            assert meal.get("day") == "MONDAY", f"Day filter failed"
            assert meal.get("diet_type") == "vegetarian", f"Diet type filter failed"
            assert meal.get("meal") == "Breakfast", f"Meal slot filter failed"
        
        print(f"✓ Filtered query returned {len(data)} meals (MONDAY, vegetarian, Breakfast)")


class TestAnalyticsEndpoint:
    """Test analytics endpoint"""
    
    def test_get_analytics(self, api_client, base_url):
        """Test GET /api/analytics returns demand scores and recommendations"""
        response = api_client.get(f"{base_url}/api/analytics")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "summary" in data, "Analytics missing 'summary' field"
        assert "demand_items" in data, "Analytics missing 'demand_items' field"
        assert "recommendations" in data, "Analytics missing 'recommendations' field"
        
        # Verify summary structure
        summary = data["summary"]
        assert "total_menu_items" in summary, "Summary missing 'total_menu_items'"
        assert "rated_items" in summary, "Summary missing 'rated_items'"
        assert "total_ratings" in summary, "Summary missing 'total_ratings'"
        assert "avg_overall_rating" in summary, "Summary missing 'avg_overall_rating'"
        assert "high_waste_risk" in summary, "Summary missing 'high_waste_risk'"
        assert "medium_waste_risk" in summary, "Summary missing 'medium_waste_risk'"
        
        # Verify demand_items structure
        demand_items = data["demand_items"]
        assert isinstance(demand_items, list), "demand_items should be a list"
        
        if len(demand_items) > 0:
            item = demand_items[0]
            assert "item_name" in item, "Demand item missing 'item_name'"
            assert "demand_score" in item, "Demand item missing 'demand_score'"
            assert "waste_risk" in item, "Demand item missing 'waste_risk'"
            assert "avg_rating" in item, "Demand item missing 'avg_rating'"
        
        print(f"✓ Analytics: {summary['total_menu_items']} items, {summary['total_ratings']} ratings")
        print(f"✓ Recommendations: {len(data['recommendations'])} suggestions")


class TestAdminEndpoints:
    """Test admin-only endpoints"""
    
    def test_admin_all_ratings(self, api_client, base_url):
        """Test GET /api/admin/all-ratings returns all ratings"""
        response = api_client.get(f"{base_url}/api/admin/all-ratings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of ratings"
        print(f"✓ Admin endpoint: Retrieved {len(data)} ratings")
        
        # Verify rating structure if data exists
        if len(data) > 0:
            rating = data[0]
            assert "auth_user_id" in rating, "Rating missing 'auth_user_id'"
            assert "item_name" in rating, "Rating missing 'item_name'"
            assert "rating" in rating, "Rating missing 'rating' value"
            assert "log_date" in rating, "Rating missing 'log_date'"
    
    def test_admin_all_preferences(self, api_client, base_url):
        """Test GET /api/admin/all-preferences returns all preferences"""
        response = api_client.get(f"{base_url}/api/admin/all-preferences")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of preferences"
        print(f"✓ Admin endpoint: Retrieved {len(data)} preferences")


class TestProfileEndpoint:
    """Test profile CRUD operations"""
    
    def test_get_profile_nonexistent(self, api_client, base_url):
        """Test GET /api/profile with non-existent user returns null"""
        response = api_client.get(f"{base_url}/api/profile?auth_user_id=TEST_nonexistent_user_12345")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Should return null or empty for non-existent user
        data = response.json()
        print(f"✓ Profile query for non-existent user returned: {data}")
    
    def test_create_and_get_profile(self, api_client, base_url):
        """Test POST /api/profile creates profile and GET verifies persistence"""
        test_user_id = f"TEST_user_{date.today().isoformat()}"
        test_email = f"TEST_testuser@example.com"
        
        # Create profile
        create_payload = {
            "auth_user_id": test_user_id,
            "email": test_email,
            "full_name": "Test User"
        }
        create_response = api_client.post(f"{base_url}/api/profile", json=create_payload)
        assert create_response.status_code == 200, f"Expected 200, got {create_response.status_code}"
        
        created_profile = create_response.json()
        assert created_profile["auth_user_id"] == test_user_id, "Created profile auth_user_id mismatch"
        assert created_profile["email"] == test_email, "Created profile email mismatch"
        assert created_profile["full_name"] == "Test User", "Created profile full_name mismatch"
        print(f"✓ Profile created: {created_profile.get('full_name')}")
        
        # GET to verify persistence
        get_response = api_client.get(f"{base_url}/api/profile?auth_user_id={test_user_id}")
        assert get_response.status_code == 200, f"Expected 200, got {get_response.status_code}"
        
        retrieved_profile = get_response.json()
        assert retrieved_profile is not None, "Profile not found after creation"
        assert retrieved_profile["auth_user_id"] == test_user_id, "Retrieved profile auth_user_id mismatch"
        assert retrieved_profile["email"] == test_email, "Retrieved profile email mismatch"
        print(f"✓ Profile persistence verified via GET")


class TestRatingsEndpoint:
    """Test ratings endpoints"""
    
    def test_get_ratings(self, api_client, base_url):
        """Test GET /api/ratings returns ratings list"""
        response = api_client.get(f"{base_url}/api/ratings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of ratings"
        print(f"✓ Retrieved {len(data)} ratings")


class TestPreferencesEndpoint:
    """Test preferences endpoints"""
    
    def test_get_preferences(self, api_client, base_url):
        """Test GET /api/preferences returns preferences list"""
        response = api_client.get(f"{base_url}/api/preferences")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of preferences"
        print(f"✓ Retrieved {len(data)} preferences")
