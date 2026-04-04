(function () {
  function getRuntimeConfig() {
    const urlFromWindow = typeof window !== "undefined" ? window.FITVIT_SUPABASE_URL : "";
    const keyFromWindow = typeof window !== "undefined" ? window.FITVIT_SUPABASE_ANON_KEY : "";
    const urlFromStorage = typeof localStorage !== "undefined" ? localStorage.getItem("fitvit_supabase_url") || "" : "";
    const keyFromStorage =
      typeof localStorage !== "undefined" ? localStorage.getItem("fitvit_supabase_anon_key") || "" : "";

    return {
      url: urlFromWindow || urlFromStorage,
      anonKey: keyFromWindow || keyFromStorage
    };
  }

  function hasRuntime() {
    return typeof window !== "undefined" && window.supabase && typeof window.supabase.createClient === "function";
  }

  function isConfigured() {
    const runtime = getRuntimeConfig();
    return Boolean(runtime.url && runtime.anonKey && hasRuntime());
  }

  let client = null;
  let clientUrl = "";

  function getClient() {
    const runtime = getRuntimeConfig();
    if (!runtime.url || !runtime.anonKey || !hasRuntime()) {
      return null;
    }

    // Recreate client if runtime config changes.
    if (!client || clientUrl !== runtime.url) {
      client = window.supabase.createClient(runtime.url, runtime.anonKey);
      clientUrl = runtime.url;
    }

    return client;
  }

  function normalizeUid(uid) {
    return String(uid || "").trim().toLowerCase();
  }

  function normalizeAdmin(value) {
    return String(value || "").trim().toLowerCase() === "yes" ? "yes" : "no";
  }

  function mapDbProfile(row) {
    if (!row) return null;
    return {
      id: row.id,
      uid: normalizeUid(row.email),
      name: row.full_name || "",
      email: row.email || "",
      age: row.age ?? "",
      weight: row.weight_kg ?? "",
      height: row.height_cm ?? "",
      preferred_mess: row.diet_preference || "",
      required_kcal: row.required_kcal ?? "",
      required_protein: row.required_protein ?? "",
      required_fats: row.required_fats ?? "",
      admin: normalizeAdmin(row.admin)
    };
  }

  function normalizeDayKey(day) {
    const t = String(day || "").trim().toLowerCase();
    if (t.startsWith("mon")) return "Mon";
    if (t.startsWith("tue")) return "Tue";
    if (t.startsWith("wed")) return "Wed";
    if (t.startsWith("thu")) return "Thu";
    if (t.startsWith("fri")) return "Fri";
    if (t.startsWith("sat")) return "Sat";
    if (t.startsWith("sun")) return "Sun";
    return null;
  }

  function normalizeDietType(dietType) {
    const t = String(dietType || "").trim().toLowerCase();
    const compact = t.replace(/[^a-z]/g, "");
    if (compact === "veg" || compact === "vegetarian") return "Veg";
    if (compact === "nonveg" || compact === "nonvegetarian") return "Non-Veg";
    if (compact === "special" || compact === "highprotein") return "Special";
    return null;
  }

  function normalizeMealSlot(meal) {
    const t = String(meal || "").trim().toLowerCase();
    if (t.startsWith("breakfast")) return "breakfast";
    if (t.startsWith("lunch")) return "lunch";
    if (t.startsWith("dinner")) return "dinner";
    if (t.startsWith("snack")) return "snacks";
    return null;
  }

  function isSameDayKey(rowDay, targetDay) {
    const rowKey = normalizeDayKey(rowDay);
    const targetKey = normalizeDayKey(targetDay);
    return Boolean(rowKey && targetKey && rowKey === targetKey);
  }

  function createEmptyPlannerTypes() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const types = {
      Veg: {},
      "Non-Veg": {},
      Special: {}
    };

    Object.keys(types).forEach((diet) => {
      days.forEach((day) => {
        types[diet][day] = {
          breakfast: [],
          lunch: [],
          snacks: [],
          dinner: []
        };
      });
    });

    return types;
  }

  function rowsToPlannerTypes(rows) {
    const types = createEmptyPlannerTypes();

    (rows || []).forEach((row) => {
      const day = normalizeDayKey(row.day);
      const diet = normalizeDietType(row.diet_type);
      const slot = normalizeMealSlot(row.meal);
      const name = String(row.name || "").trim();
      if (!day || !diet || !slot || !name) {
        return;
      }

      const target = types?.[diet]?.[day]?.[slot];
      if (!Array.isArray(target)) {
        return;
      }

      target.push(name);
    });

    return types;
  }

  async function getMealsVaultPlannerTypes() {
    const c = getClient();
    if (!c) {
      return { data: null, error: new Error("Supabase is not configured") };
    }

    // Use flexible selection so schema additions/removals do not break menu reads.
    const result = await c
      .from("meals_vault")
      .select("*");

    return {
      data: result.error ? null : rowsToPlannerTypes(result.data || []),
      error: result.error
    };
  }

  async function getMealsVaultRowsByDayAndType(dayKey, dietType) {
    const c = getClient();
    if (!c) {
      return { data: null, error: new Error("Supabase is not configured") };
    }

    const targetDiet = normalizeDietType(dietType);
    const targetDay = normalizeDayKey(dayKey);
    if (!targetDiet || !targetDay) {
      return { data: [], error: null };
    }

    // Use flexible selection so schema additions/removals do not break menu reads.
    const result = await c
      .from("meals_vault")
      .select("*");

    if (result.error) {
      return { data: null, error: result.error };
    }

    const filtered = (result.data || []).filter((row) => {
      const rowDiet = normalizeDietType(row.diet_type);
      return rowDiet === targetDiet && isSameDayKey(row.day, targetDay);
    });

    return { data: filtered, error: null };
  }

  async function getAuthIdentity() {
    const c = getClient();
    if (!c) {
      return { data: null, error: new Error("Supabase is not configured") };
    }

    const authRes = await c.auth.getUser();
    const user = authRes?.data?.user || null;
    if (!user?.id) {
      return { data: null, error: new Error("No authenticated user") };
    }

    return {
      data: {
        authUserId: String(user.id).trim(),
        email: normalizeUid(user.email || "")
      },
      error: null
    };
  }

  async function getMealRatingsForDate(logDate, dietType) {
    const c = getClient();
    if (!c) {
      return { data: null, error: new Error("Supabase is not configured") };
    }

    const identity = await getAuthIdentity();
    if (identity.error || !identity.data) {
      return { data: null, error: identity.error || new Error("No authenticated user") };
    }

    const targetDate = String(logDate || "").trim();
    if (!targetDate) {
      return { data: [], error: null };
    }

    let query = c
      .from("meal_ratings_daily")
      .select("log_date,diet_type,slot,item_name,servings,rating,calories,protein_g,carbs_g,fat_g,updated_at")
      .eq("auth_user_id", identity.data.authUserId)
      .eq("log_date", targetDate);

    if (dietType) {
      query = query.eq("diet_type", String(dietType));
    }

    const result = await query;
    return {
      data: result.error ? null : result.data || [],
      error: result.error
    };
  }

  async function saveMealRatings(entries) {
    const c = getClient();
    if (!c) {
      return { data: null, error: new Error("Supabase is not configured") };
    }

    const identity = await getAuthIdentity();
    if (identity.error || !identity.data) {
      return { data: null, error: identity.error || new Error("No authenticated user") };
    }

    const rows = (entries || [])
      .map((entry) => ({
        auth_user_id: identity.data.authUserId,
        email: identity.data.email || null,
        log_date: String(entry?.log_date || ""),
        diet_type: String(entry?.diet_type || ""),
        slot: String(entry?.slot || "").toLowerCase(),
        item_name: String(entry?.item_name || "").trim(),
        servings: Math.max(0, Number(entry?.servings || 0)),
        rating: entry?.rating == null ? null : Number(entry.rating),
        calories: entry?.calories == null ? null : Number(entry.calories),
        protein_g: entry?.protein_g == null ? null : Number(entry.protein_g),
        carbs_g: entry?.carbs_g == null ? null : Number(entry.carbs_g),
        fat_g: entry?.fat_g == null ? null : Number(entry.fat_g),
        updated_at: new Date().toISOString()
      }))
      .filter((row) => row.log_date && row.diet_type && row.slot && row.item_name);

    if (!rows.length) {
      return { data: [], error: null };
    }

    const result = await c
      .from("meal_ratings_daily")
      .upsert(rows, {
        onConflict: "auth_user_id,log_date,diet_type,slot,item_name"
      })
      .select("id");

    return {
      data: result.error ? null : result.data || [],
      error: result.error
    };
  }

  async function getMealPreferencesForDate(logDate, dietType) {
    const c = getClient();
    if (!c) {
      return { data: null, error: new Error("Supabase is not configured") };
    }

    const identity = await getAuthIdentity();
    if (identity.error || !identity.data) {
      return { data: null, error: identity.error || new Error("No authenticated user") };
    }

    const targetDate = String(logDate || "").trim();
    if (!targetDate) {
      return { data: [], error: null };
    }

    let query = c
      .from("meal_preferences_daily")
      .select("log_date,diet_type,slot,item_name,preference_value,updated_at")
      .eq("auth_user_id", identity.data.authUserId)
      .eq("log_date", targetDate);

    if (dietType) {
      query = query.eq("diet_type", String(dietType));
    }

    const result = await query;
    return {
      data: result.error ? null : result.data || [],
      error: result.error
    };
  }

  async function saveMealPreferences(entries) {
    const c = getClient();
    if (!c) {
      return { data: null, error: new Error("Supabase is not configured") };
    }

    const identity = await getAuthIdentity();
    if (identity.error || !identity.data) {
      return { data: null, error: identity.error || new Error("No authenticated user") };
    }

    const rows = (entries || [])
      .map((entry) => ({
        auth_user_id: identity.data.authUserId,
        email: identity.data.email || null,
        log_date: String(entry?.log_date || ""),
        diet_type: String(entry?.diet_type || ""),
        slot: String(entry?.slot || "").toLowerCase(),
        item_name: String(entry?.item_name || "").trim(),
        preference_value: entry?.preference_value === -1 ? -1 : entry?.preference_value === 1 ? 1 : 0,
        updated_at: new Date().toISOString()
      }))
      .filter((row) => row.log_date && row.diet_type && row.slot && row.item_name);

    if (!rows.length) {
      return { data: [], error: null };
    }

    const result = await c
      .from("meal_preferences_daily")
      .upsert(rows, {
        onConflict: "auth_user_id,log_date,diet_type,slot,item_name"
      })
      .select("id");

    return {
      data: result.error ? null : result.data || [],
      error: result.error
    };
  }

  async function upsertProfile(uid, payload) {
    const c = getClient();
    if (!c) {
      return { data: null, error: new Error("Supabase is not configured") };
    }

    const key = normalizeUid(uid);
    if (!key) {
      return { data: null, error: new Error("Missing uid") };
    }

    let authEmail = "";
    let authUserId = "";
    try {
      const authRes = await c.auth.getUser();
      authEmail = normalizeUid(authRes?.data?.user?.email || "");
      authUserId = String(authRes?.data?.user?.id || "").trim();
    } catch {
      // Ignore and continue with provided uid fallback.
    }

    const effectiveEmail = authEmail || normalizeUid(payload?.email || key);

    const existing = authUserId
      ? await c
          .from("profiles")
          .select("id,full_name,email,age,height_cm,weight_kg,diet_preference,required_kcal,required_protein,required_fats,admin")
          .eq("auth_user_id", authUserId)
          .maybeSingle()
      : await c
          .from("profiles")
          .select("id,full_name,email,age,height_cm,weight_kg,diet_preference,required_kcal,required_protein,required_fats,admin")
          .eq("email", effectiveEmail)
          .maybeSingle();
    if (existing.error && existing.error.code !== "PGRST116") {
      return { data: null, error: existing.error };
    }

    const prior = existing.data || {};

    const requiredKcalRaw = payload?.required_kcal ?? payload?.requiredKcal;
    const requiredProteinRaw = payload?.required_protein ?? payload?.requiredProtein;
    const requiredFatsRaw = payload?.required_fats ?? payload?.requiredFats;

    const row = {
      auth_user_id: authUserId || null,
      full_name: payload?.name != null ? String(payload.name).trim() : String(prior.full_name || "").trim(),
      email: effectiveEmail || prior.email || null,
      age: payload?.age != null ? (payload.age === "" ? null : Number(payload.age || 0) || null) : prior.age ?? null,
      weight_kg: payload?.weight != null ? (payload.weight === "" ? null : Number(payload.weight || 0) || null) : prior.weight_kg ?? null,
      height_cm: payload?.height != null ? (payload.height === "" ? null : Number(payload.height || 0) || null) : prior.height_cm ?? null,
      diet_preference:
        payload?.preferredMess ?? payload?.preferred_mess ?? payload?.diet_preference ?? prior.diet_preference ?? null,
      required_kcal:
        requiredKcalRaw != null ? (requiredKcalRaw === "" ? null : Number(requiredKcalRaw || 0) || null) : prior.required_kcal ?? null,
      required_protein:
        requiredProteinRaw != null
          ? requiredProteinRaw === ""
            ? null
            : Number(requiredProteinRaw || 0) || null
          : prior.required_protein ?? null,
      required_fats:
        requiredFatsRaw != null ? (requiredFatsRaw === "" ? null : Number(requiredFatsRaw || 0) || null) : prior.required_fats ?? null,
      admin: payload?.admin != null ? normalizeAdmin(payload.admin) : normalizeAdmin(prior.admin || "no")
    };

    if (existing.data?.id) {
      const updated = await c
        .from("profiles")
        .update(row)
        .eq("id", existing.data.id)
        .select("id,full_name,email,age,height_cm,weight_kg,diet_preference,required_kcal,required_protein,required_fats,admin")
        .single();

      return {
        data: mapDbProfile(updated.data),
        error: updated.error
      };
    }

    const inserted = await c
      .from("profiles")
      .insert(row)
      .select("id,full_name,email,age,height_cm,weight_kg,diet_preference,required_kcal,required_protein,required_fats,admin")
      .single();

    return {
      data: mapDbProfile(inserted.data),
      error: inserted.error
    };
  }

  async function getProfile(uid) {
    const c = getClient();
    if (!c) {
      return { data: null, error: new Error("Supabase is not configured") };
    }

    const key = normalizeUid(uid);
    if (!key) {
      return { data: null, error: new Error("Missing uid") };
    }

    let effectiveEmail = key;
    let authUserId = "";
    try {
      const authRes = await c.auth.getUser();
      const authEmail = normalizeUid(authRes?.data?.user?.email || "");
      authUserId = String(authRes?.data?.user?.id || "").trim();
      if (authEmail) {
        effectiveEmail = authEmail;
      }
    } catch {
      // Keep fallback from uid.
    }

    const baseQuery = c
      .from("profiles")
      .select("id,full_name,email,age,height_cm,weight_kg,diet_preference,required_kcal,required_protein,required_fats,admin");

    const result = authUserId
      ? await baseQuery.eq("auth_user_id", authUserId).maybeSingle()
      : await baseQuery.eq("email", effectiveEmail).maybeSingle();

    return {
      data: mapDbProfile(result.data),
      error: result.error
    };
  }

  async function isAdminUser(uid) {
    const key = uid || "self";
    const result = await getProfile(key);
    if (result.error || !result.data) {
      return {
        data: false,
        error: result.error || null
      };
    }

    return {
      data: normalizeAdmin(result.data.admin) === "yes",
      error: null
    };
  }

  async function signUpWithPassword(email, password, meta) {
    const c = getClient();
    if (!c) {
      return { data: null, error: new Error("Supabase is not configured") };
    }

    return c.auth.signUp({
      email: String(email || "").trim().toLowerCase(),
      password: String(password || ""),
      options: {
        data: {
          full_name: String(meta?.full_name || meta?.name || "").trim()
        }
      }
    });
  }

  async function signInWithPassword(email, password) {
    const c = getClient();
    if (!c) {
      return { data: null, error: new Error("Supabase is not configured") };
    }

    return c.auth.signInWithPassword({
      email: String(email || "").trim().toLowerCase(),
      password: String(password || "")
    });
  }

  async function getCurrentUser() {
    const c = getClient();
    if (!c) {
      return { data: { user: null }, error: new Error("Supabase is not configured") };
    }

    return c.auth.getUser();
  }

  async function signOutAuth() {
    const c = getClient();
    if (!c) {
      return { error: null };
    }

    return c.auth.signOut();
  }

  function setConfig(url, anonKey) {
    if (!url || !anonKey) return;
    localStorage.setItem("fitvit_supabase_url", String(url).trim());
    localStorage.setItem("fitvit_supabase_anon_key", String(anonKey).trim());
  }

  function getConfigStatus() {
    const runtime = getRuntimeConfig();
    return {
      urlPresent: Boolean(runtime.url),
      anonKeyPresent: Boolean(runtime.anonKey),
      runtimePresent: hasRuntime()
    };
  }

  window.FitVitSupabase = {
    isConfigured,
    getClient,
    getProfile,
    upsertProfile,
    isAdminUser,
    signUpWithPassword,
    signInWithPassword,
    getCurrentUser,
    signOutAuth,
    getMealsVaultPlannerTypes,
    getMealsVaultRowsByDayAndType,
    getMealRatingsForDate,
    saveMealRatings,
    getMealPreferencesForDate,
    saveMealPreferences,
    getConfigStatus,
    setConfig
  };
})();
