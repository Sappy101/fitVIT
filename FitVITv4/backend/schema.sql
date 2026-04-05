-- SQL Schema for fitvit backend tables

CREATE TABLE IF NOT EXISTS public.meal_ratings_daily (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id UUID NOT NULL,
    email TEXT,
    log_date DATE NOT NULL,
    diet_type TEXT NOT NULL,
    slot TEXT NOT NULL,
    item_name TEXT NOT NULL,
    servings INT DEFAULT 0,
    rating INT DEFAULT 0,
    calories INT DEFAULT 0,
    protein_g INT DEFAULT 0,
    carbs_g INT DEFAULT 0,
    fat_g INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meal_preferences_daily (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id UUID NOT NULL,
    email TEXT,
    log_date DATE NOT NULL,
    diet_type TEXT NOT NULL,
    slot TEXT NOT NULL,
    item_name TEXT NOT NULL,
    preference_value INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
