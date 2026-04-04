const stitch = {
  signin: "/stitch/stitch_smart_mess_dashboard%20(10)/code.html",
  signup: "/stitch/stitch_smart_mess_dashboard/code.html",
  marketplace: "/stitch/Meal%20prefernence%20page/code.html",
  dashboard: "/stitch/stitch_smart_mess_dashboard%20(2)/code.html",
  nutritionVault: "/stitch/Meal%20Rating%20Screen/code.html",
  mealPlanner: "/stitch/stitch_smart_mess_dashboard%20(4)/code.html",
  profileSettings: "/stitch/stitch_smart_mess_dashboard%20(7)/code.html",
  dailyNutrition: "/stitch/stitch_smart_mess_dashboard%20(8)/code.html",
  onboarding: "/stitch/stitch_smart_mess_dashboard%20(9)/code.html"
};

const routes = {
  "/signin": { src: stitch.signin, protected: false, remember: false },
  "/signup": { src: stitch.signup, protected: false, remember: false },
  "/marketplace": { src: stitch.marketplace, protected: true, remember: true },
  "/dashboard": { src: stitch.dashboard, protected: true, remember: true },
  "/nutrition-vault": { src: stitch.nutritionVault, protected: true, remember: true },
  "/meal-planner": { src: stitch.mealPlanner, protected: true, remember: true },
  "/profile-settings": { src: stitch.profileSettings, protected: true, remember: true },
  "/daily-nutrition": { src: stitch.dailyNutrition, protected: true, remember: true },
  "/onboarding": { src: stitch.onboarding, protected: true, remember: false }
};

const flowPathMap = {
  "/flow/01-food-preferences.html": "/marketplace",
  "/flow/02-performance-dashboard.html": "/dashboard",
  "/flow/03-meal-rating.html": "/nutrition-vault",
  "/flow/04-meal-planner.html": "/meal-planner",
  "/flow/05-dietary-preferences.html": "/dashboard",
  "/flow/06-dietary-goals.html": "/dashboard",
  "/flow/07-profile-settings.html": "/profile-settings",
  "/flow/08-daily-nutrition.html": "/daily-nutrition",
  "/flow/09-onboarding-profile.html": "/onboarding"
};

const iconRouteMap = {
  shopping_basket: "/marketplace",
  storefront: "/marketplace",
  dashboard: "/dashboard",
  menu_book: "/nutrition-vault",
  restaurant_menu: "/meal-planner",
  person: "/profile-settings",
  account_circle: "/profile-settings",
  settings: "/profile-settings"
};

const frame = document.getElementById("stitchFrame");

function isAuthenticated() {
  return Boolean(localStorage.getItem("fitvit_token"));
}

function norm(text) {
  return (text || "").toLowerCase().replace(/[^a-z]/g, "");
}

function routeForText(text) {
  const t = norm(text);
  if (t === "settings") return "/profile-settings";
  if (t.includes("marketplace") || t.includes("foodpreferences")) return "/marketplace";
  if (t.includes("dashboard")) return "/dashboard";
  if (t.includes("nutritionvault") || t.includes("mealrating")) return "/nutrition-vault";
  if (t.includes("mealplanner")) return "/meal-planner";
  if (t.includes("profilesettings") || t === "profile") return "/profile-settings";
  if (t.includes("dailynutrition")) return "/daily-nutrition";
  if (t.includes("onboardingprofile") || t.includes("personalinfo") || t.includes("bodymetrics")) return "/onboarding";
  if (t.includes("review") || t.includes("finish")) return "/profile-settings";
  return null;
}

function onboardingRouteForText(text, currentRoute) {
  if (localStorage.getItem("fitvit_flow_mode") !== "onboarding") return null;
  if (currentRoute !== "/onboarding") return null;

  const t = norm(text);
  if (t.includes("continue") || t.includes("arrowforward")) {
    localStorage.setItem("fitvit_flow_mode", "dashboard");
    localStorage.setItem("fitvit_profile_setup_done", "true");
    return "/dashboard";
  }
  return null;
}

function normalizeRoute(pathname) {
  if (!pathname || pathname === "/" || pathname === "/app.html" || pathname === "/index.html") {
    if (!isAuthenticated()) return "/signin";
    return localStorage.getItem("fitvit_last_page") || "/dashboard";
  }

  if (flowPathMap[pathname]) return flowPathMap[pathname];
  if (routes[pathname]) return pathname;
  return isAuthenticated() ? "/dashboard" : "/signin";
}

function setRememberedPage(route) {
  if (routes[route]?.remember) {
    localStorage.setItem("fitvit_last_page", route);
    sessionStorage.setItem("fitvit_last_page", route);
  }
}

function pushRoute(route, { replace = false } = {}) {
  const finalRoute = routes[route] ? route : "/dashboard";
  const routeMeta = routes[finalRoute];

  if (routeMeta.protected && !isAuthenticated()) {
    navigate("/signin", { replace: true });
    return;
  }

  setRememberedPage(finalRoute);

  if (replace) {
    window.history.replaceState({}, "", finalRoute);
  } else {
    window.history.pushState({}, "", finalRoute);
  }

  if (frame) {
    frame.src = routeMeta.src;
  }
}

function navigate(route, options) {
  pushRoute(route, options);
}

function routeFromAnchor(anchor) {
  if (!anchor) return null;
  const rawHref = anchor.getAttribute("href") || "";
  if (!rawHref || rawHref === "#") return null;

  try {
    const url = new URL(rawHref, window.location.origin);
    return normalizeRoute(url.pathname);
  } catch {
    return null;
  }
}

function bindIframeInteractions(currentRoute) {
  let doc;
  try {
    doc = frame.contentDocument || frame.contentWindow.document;
  } catch {
    return;
  }

  if (!doc) return;

  try {
    const innerPath = frame.contentWindow.location.pathname;
    if (innerPath.startsWith("/flow/")) {
      const mapped = normalizeRoute(innerPath);
      navigate(mapped, { replace: true });
      return;
    }
  } catch {
    // Ignore timing issues.
  }

  doc.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      const button = target.closest("button");
      const icon = target.closest(".material-symbols-outlined");
      const candidate = anchor || button || icon;
      if (!candidate) return;

      let route = null;

      if (anchor) {
        route = routeFromAnchor(anchor);
      }

      if (!route) {
        const iconText = (icon?.textContent || "").trim().toLowerCase().replace(/\s+/g, "_");
        route = iconRouteMap[iconText] || null;
      }

      if (!route) {
        route = onboardingRouteForText(candidate.textContent || "", currentRoute) || routeForText(candidate.textContent || "");
      }

      if (!route) return;

      event.preventDefault();
      event.stopPropagation();
      navigate(route);
    },
    true
  );
}

function init() {
  const initialRoute = normalizeRoute(window.location.pathname);
  navigate(initialRoute, { replace: true });

  if (frame) {
    frame.addEventListener("load", () => {
      const currentRoute = normalizeRoute(window.location.pathname);
      bindIframeInteractions(currentRoute);
    });
  }

  window.addEventListener("popstate", () => {
    const route = normalizeRoute(window.location.pathname);
    navigate(route, { replace: true });
  });
}

init();
