from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
from collections import defaultdict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')

HEADERS = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
}

app = FastAPI()
api_router = APIRouter(prefix="/api")

# --- Helpers ---
async def supabase_get(table: str, params: dict = None):
    async with httpx.AsyncClient(timeout=15) as client:
        url = f"{SUPABASE_URL}/rest/v1/{table}"
        resp = await client.get(url, headers=HEADERS, params=params or {})
        resp.raise_for_status()
        return resp.json()

async def supabase_post(table: str, data: dict):
    async with httpx.AsyncClient(timeout=15) as client:
        url = f"{SUPABASE_URL}/rest/v1/{table}"
        resp = await client.post(url, headers=HEADERS, json=data)
        resp.raise_for_status()
        return resp.json()

async def supabase_patch(table: str, match_params: dict, data: dict):
    async with httpx.AsyncClient(timeout=15) as client:
        url = f"{SUPABASE_URL}/rest/v1/{table}"
        resp = await client.patch(url, headers=HEADERS, params=match_params, json=data)
        resp.raise_for_status()
        return resp.json()

async def supabase_delete(table: str, match_params: dict):
    async with httpx.AsyncClient(timeout=15) as client:
        url = f"{SUPABASE_URL}/rest/v1/{table}"
        resp = await client.delete(url, headers=HEADERS, params=match_params)
        resp.raise_for_status()
        return resp.json()

# --- Models ---
class ProfileCreate(BaseModel):
    auth_user_id: str
    email: str
    full_name: str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    diet_preference: Optional[str] = None

class RatingCreate(BaseModel):
    auth_user_id: str
    email: str
    log_date: str
    diet_type: str
    slot: str
    item_name: str
    servings: int
    rating: int
    calories: Optional[int] = 0
    protein_g: Optional[int] = 0
    carbs_g: Optional[int] = 0
    fat_g: Optional[int] = 0

class PreferenceCreate(BaseModel):
    auth_user_id: str
    email: str
    log_date: str
    diet_type: str
    slot: str
    item_name: str
    preference_value: int

class MealCreate(BaseModel):
    name: str
    day: str
    diet_type: str
    meal: str
    calories: Optional[int] = 0
    protein_g: Optional[int] = 0
    carbs_g: Optional[int] = 0
    fat_g: Optional[int] = 0
    fiber_g: Optional[int] = 0

# --- Routes ---
@api_router.get("/")
async def root():
    return {"message": "FitVit API", "status": "ok"}

# --- Meals ---
@api_router.get("/meals")
async def get_meals(day: Optional[str] = None, diet_type: Optional[str] = None, meal: Optional[str] = None):
    params = {"order": "meal.asc,name.asc"}
    if day:
        params["day"] = f"eq.{day.upper()}"
    if diet_type:
        params["diet_type"] = f"eq.{diet_type}"
    if meal:
        params["meal"] = f"eq.{meal}"
    return await supabase_get("meals_vault", params)

@api_router.post("/meals")
async def create_meal(data: MealCreate):
    result = await supabase_post("meals_vault", data.model_dump())
    return result[0] if result else result

@api_router.patch("/meals/{meal_id}")
async def update_meal(meal_id: str, data: MealCreate):
    result = await supabase_patch("meals_vault", {"id": f"eq.{meal_id}"}, data.model_dump())
    return result[0] if result else result

@api_router.delete("/meals/{meal_id}")
async def delete_meal(meal_id: str):
    await supabase_delete("meals_vault", {"id": f"eq.{meal_id}"})
    return {"status": "deleted"}

# --- Profile ---
@api_router.get("/profile")
async def get_profile(auth_user_id: str):
    try:
        data = await supabase_get("profiles", {"auth_user_id": f"eq.{auth_user_id}", "limit": "1"})
        if data:
            return data[0]
        return None
    except Exception as e:
        logger.error(f"Profile fetch error: {e}")
        return None

@api_router.post("/profile")
async def create_profile(data: ProfileCreate):
    try:
        existing = await supabase_get("profiles", {"auth_user_id": f"eq.{data.auth_user_id}", "limit": "1"})
        if existing:
            return existing[0]
    except Exception:
        pass
    try:
        payload = data.model_dump()
        payload['admin'] = 'admin' in (data.email or '').lower()
        result = await supabase_post("profiles", payload)
        return result[0] if result else result
    except Exception as e:
        logger.error(f"Profile create error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.patch("/profile/{auth_user_id}")
async def update_profile(auth_user_id: str, data: ProfileUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    result = await supabase_patch("profiles", {"auth_user_id": f"eq.{auth_user_id}"}, update_data)
    return result[0] if result else result

# --- Ratings ---
@api_router.get("/ratings")
async def get_ratings(auth_user_id: Optional[str] = None, log_date: Optional[str] = None, slot: Optional[str] = None):
    params = {"order": "created_at.desc"}
    if auth_user_id:
        params["auth_user_id"] = f"eq.{auth_user_id}"
    if log_date:
        params["log_date"] = f"eq.{log_date}"
    if slot:
        params["slot"] = f"eq.{slot}"
    return await supabase_get("meal_ratings_daily", params)

@api_router.post("/ratings")
async def create_rating(data: RatingCreate):
    # Upsert - delete existing then insert
    try:
        await supabase_delete("meal_ratings_daily", {
            "auth_user_id": f"eq.{data.auth_user_id}",
            "log_date": f"eq.{data.log_date}",
            "slot": f"eq.{data.slot}",
            "item_name": f"eq.{data.item_name}",
        })
    except Exception:
        pass
    now = datetime.utcnow().isoformat()
    payload = data.model_dump()
    payload['updated_at'] = now
    result = await supabase_post("meal_ratings_daily", payload)
    return result[0] if result else result

@api_router.post("/ratings/bulk")
async def create_ratings_bulk(ratings: List[RatingCreate]):
    results = []
    for r in ratings:
        try:
            await supabase_delete("meal_ratings_daily", {
                "auth_user_id": f"eq.{r.auth_user_id}",
                "log_date": f"eq.{r.log_date}",
                "slot": f"eq.{r.slot}",
                "item_name": f"eq.{r.item_name}",
            })
        except Exception:
            pass
        now = datetime.utcnow().isoformat()
        payload = r.model_dump()
        payload['updated_at'] = now
        res = await supabase_post("meal_ratings_daily", payload)
        results.append(res[0] if res else res)
    return results

# --- Preferences ---
@api_router.get("/preferences")
async def get_preferences(auth_user_id: Optional[str] = None, log_date: Optional[str] = None, slot: Optional[str] = None):
    params = {"order": "created_at.desc"}
    if auth_user_id:
        params["auth_user_id"] = f"eq.{auth_user_id}"
    if log_date:
        params["log_date"] = f"eq.{log_date}"
    if slot:
        params["slot"] = f"eq.{slot}"
    return await supabase_get("meal_preferences_daily", params)

@api_router.post("/preferences/bulk")
async def create_preferences_bulk(prefs: List[PreferenceCreate]):
    results = []
    for p in prefs:
        try:
            await supabase_delete("meal_preferences_daily", {
                "auth_user_id": f"eq.{p.auth_user_id}",
                "log_date": f"eq.{p.log_date}",
                "slot": f"eq.{p.slot}",
                "item_name": f"eq.{p.item_name}",
            })
        except Exception:
            pass
        now = datetime.utcnow().isoformat()
        payload = p.model_dump()
        payload['updated_at'] = now
        res = await supabase_post("meal_preferences_daily", payload)
        results.append(res[0] if res else res)
    return results

# --- Analytics ---
@api_router.get("/analytics")
async def get_analytics():
    try:
        all_ratings = await supabase_get("meal_ratings_daily", {"limit": "1000"})
        all_prefs = await supabase_get("meal_preferences_daily", {"limit": "1000"})
        all_meals = await supabase_get("meals_vault", {"limit": "500"})

        # Demand score per item
        item_scores = defaultdict(lambda: {"total_rating": 0, "count": 0, "pref_likes": 0, "pref_dislikes": 0, "total_servings": 0})
        for r in all_ratings:
            key = r.get("item_name", "")
            item_scores[key]["total_rating"] += r.get("rating", 0)
            item_scores[key]["count"] += 1
            item_scores[key]["total_servings"] += r.get("servings", 0)
        for p in all_prefs:
            key = p.get("item_name", "")
            if p.get("preference_value", 0) > 0:
                item_scores[key]["pref_likes"] += 1
            else:
                item_scores[key]["pref_dislikes"] += 1

        demand_items = []
        for name, s in item_scores.items():
            avg_rating = s["total_rating"] / s["count"] if s["count"] > 0 else 0
            pref_score = s["pref_likes"] - s["pref_dislikes"]
            demand_score = round((avg_rating * 20) + (pref_score * 10) + (s["total_servings"] * 2), 1)
            waste_risk = "HIGH" if demand_score < 20 else "MEDIUM" if demand_score < 50 else "LOW"
            demand_items.append({
                "item_name": name,
                "avg_rating": round(avg_rating, 1),
                "total_ratings": s["count"],
                "pref_likes": s["pref_likes"],
                "pref_dislikes": s["pref_dislikes"],
                "total_servings": s["total_servings"],
                "demand_score": demand_score,
                "waste_risk": waste_risk,
            })
        demand_items.sort(key=lambda x: x["demand_score"], reverse=True)

        # Summary stats
        total_items = len(all_meals)
        rated_items = len(set(r.get("item_name") for r in all_ratings))
        total_ratings = len(all_ratings)
        avg_overall = round(sum(r.get("rating", 0) for r in all_ratings) / max(len(all_ratings), 1), 1)
        high_risk = sum(1 for d in demand_items if d["waste_risk"] == "HIGH")
        medium_risk = sum(1 for d in demand_items if d["waste_risk"] == "MEDIUM")

        recommendations = []
        for d in demand_items[:3]:
            recommendations.append(f"Keep '{d['item_name']}' - High demand (score: {d['demand_score']})")
        for d in demand_items[-3:]:
            if d["demand_score"] < 30:
                recommendations.append(f"Consider replacing '{d['item_name']}' - Low demand (score: {d['demand_score']})")

        return {
            "summary": {
                "total_menu_items": total_items,
                "rated_items": rated_items,
                "total_ratings": total_ratings,
                "avg_overall_rating": avg_overall,
                "high_waste_risk": high_risk,
                "medium_waste_risk": medium_risk,
            },
            "demand_items": demand_items,
            "recommendations": recommendations,
        }
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/all-ratings")
async def admin_all_ratings():
    return await supabase_get("meal_ratings_daily", {"order": "created_at.desc", "limit": "500"})

@api_router.get("/admin/all-preferences")
async def admin_all_preferences():
    return await supabase_get("meal_preferences_daily", {"order": "created_at.desc", "limit": "500"})

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
