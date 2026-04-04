(function () {
  const token = localStorage.getItem("fitvit_token");
  if (!token) {
    window.location.href = "/stitch/stitch_smart_mess_dashboard%20(10)/code.html";
    return;
  }

  const flowMode = localStorage.getItem("fitvit_flow_mode") || "dashboard";
  const currentPath = window.location.pathname;

  if (currentPath.startsWith("/flow/")) {
    localStorage.setItem("fitvit_last_page", currentPath);
    sessionStorage.setItem("fitvit_last_page", currentPath);
  }

  const frame = document.getElementById("stitchFrame");
  if (!frame) return;

  const routes = {
    marketplace: "/flow/01-food-preferences.html",
    dashboard: "/flow/02-performance-dashboard.html",
    nutritionvault: "/flow/03-meal-rating.html",
    mealplanner: "/flow/04-meal-planner.html",
    profilesettings: "/flow/07-profile-settings.html",
    dailynutrition: "/flow/08-daily-nutrition.html",
    onboardingprofile: "/flow/09-onboarding-profile.html",
    personalinfo: "/flow/09-onboarding-profile.html",
    bodymetrics: "/flow/09-onboarding-profile.html",
    review: "/flow/07-profile-settings.html",
    finish: "/flow/07-profile-settings.html"
  };

  const stitchToFlowRoute = {
    1: routes.marketplace,
    2: routes.dashboard,
    3: routes.nutritionvault,
    4: routes.mealplanner,
    5: routes.dashboard,
    6: routes.dashboard,
    7: routes.profilesettings,
    8: routes.dailynutrition,
    9: routes.onboardingprofile,
    10: "/stitch/stitch_smart_mess_dashboard%20(10)/code.html"
  };

  const iconRoutes = {
    shopping_basket: routes.marketplace,
    storefront: routes.marketplace,
    dashboard: routes.dashboard,
    menu_book: routes.nutritionvault,
    restaurant_menu: routes.mealplanner,
    person: routes.profilesettings,
    account_circle: routes.profilesettings,
    settings: routes.profilesettings
  };

  function norm(text) {
    return (text || "").toLowerCase().replace(/[^a-z]/g, "");
  }

  function routeForText(text) {
    const t = norm(text);
    if (t === "settings") return routes.profilesettings;
    if (t.includes("marketplace") || t.includes("foodpreferences")) return routes.marketplace;
    if (t.includes("dashboard")) return routes.dashboard;
    if (t.includes("nutritionvault") || t.includes("mealrating")) return routes.nutritionvault;
    if (t.includes("mealplanner")) return routes.mealplanner;
    if (t.includes("profilesettings") || t === "profile") return routes.profilesettings;
    if (t.includes("dailynutrition")) return routes.dailynutrition;
    if (t.includes("onboardingprofile") || t.includes("personalinfo") || t.includes("bodymetrics")) return routes.onboardingprofile;
    if (t.includes("review") || t.includes("finish")) return routes.review;
    return null;
  }

  function onboardingRouteForText(text) {
    if (flowMode !== "onboarding") return null;
    const t = norm(text);

    if (currentPath.endsWith("/flow/09-onboarding-profile.html")) {
      if (t.includes("continue") || t.includes("arrowforward")) return "/flow/02-performance-dashboard.html";
    }

    return null;
  }

  function inferFlowRouteFromIframePath(pathname) {
    const decoded = decodeURIComponent(pathname || "");

    if (decoded.startsWith("/flow/")) {
      return decoded;
    }

    if (!decoded.startsWith("/stitch/")) {
      return null;
    }

    const match = decoded.match(/\((\d+)\)\/code\.html$/);
    if (!match) {
      return null;
    }

    const stitchId = Number(match[1]);
    return stitchToFlowRoute[stitchId] || null;
  }

  function bindRoute(node, route) {
    if (!node || !route || node.dataset.flowBound === "1") return;
    node.dataset.flowBound = "1";

    if (node.tagName === "A") {
      node.setAttribute("href", route);
      node.setAttribute("target", "_top");
    }

    node.style.cursor = "pointer";
    node.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      sessionStorage.setItem("fitvit_last_page", route);
      localStorage.setItem("fitvit_last_page", route);

      if (
        flowMode === "onboarding" &&
        currentPath.endsWith("/flow/09-onboarding-profile.html") &&
        route === "/flow/02-performance-dashboard.html"
      ) {
        localStorage.setItem("fitvit_flow_mode", "dashboard");
        localStorage.setItem("fitvit_profile_setup_done", "true");
      }

      window.location.href = route;
    });
  }

  function patchIframeNav() {
    let doc;
    try {
      doc = frame.contentDocument || frame.contentWindow.document;
    } catch {
      return;
    }
    if (!doc) return;

    try {
      const innerPath = frame.contentWindow.location.pathname;
      const inferredRoute = inferFlowRouteFromIframePath(innerPath);
      if (inferredRoute) {
        if (inferredRoute.startsWith("/flow/") && inferredRoute !== currentPath) {
          localStorage.setItem("fitvit_last_page", inferredRoute);
          sessionStorage.setItem("fitvit_last_page", inferredRoute);
          window.location.replace(inferredRoute);
          return;
        }

        if (inferredRoute.includes("(10)/code.html")) {
          clearFitvitSessionAndExit();
          return;
        }
      }
    } catch {
      // Ignore timing issues.
    }

    const candidates = doc.querySelectorAll("a, button, nav div, nav span, footer div, footer span");
    candidates.forEach((node) => {
      // Let onboarding page script handle the Continue button so profile fields are saved first.
      if (
        currentPath.endsWith("/flow/09-onboarding-profile.html") &&
        (node.id === "onboardContinueBtn" || node.closest("#onboardContinueBtn"))
      ) {
        return;
      }

      const isAnchorOrButton = node.tagName === "A" || node.tagName === "BUTTON";
      const hasNestedInteractive = !!node.querySelector("a, button, input, select, textarea");
      const textLen = norm(node.textContent).length;

      if (!isAnchorOrButton && (hasNestedInteractive || textLen === 0 || textLen > 28)) {
        return;
      }

      const route = onboardingRouteForText(node.textContent) || routeForText(node.textContent);
      if (route) bindRoute(node, route);
    });

    const icons = doc.querySelectorAll(".material-symbols-outlined");
    icons.forEach((icon) => {
      if (currentPath.endsWith("/flow/09-onboarding-profile.html") && icon.closest("#onboardContinueBtn")) {
        return;
      }

      const key = (icon.textContent || "").trim().toLowerCase().replace(/\s+/g, "_");
      const route = iconRoutes[key];
      if (!route) return;

      let target = icon.closest("a,button,[role='button']");
      if (!target && icon.closest("nav,footer")) {
        target = icon.parentElement;
      }
      if (!target) {
        return;
      }

      bindRoute(target, route);
    });
  }

  frame.addEventListener("load", patchIframeNav);

  function clearFitvitSessionAndExit() {
    const preservedKeys = new Set(["fitvit_accounts", "fitvit_dummy_account", "fitvit_supabase_url", "fitvit_supabase_anon_key"]);
    const localKeys = Object.keys(localStorage).filter(
      (key) => key.startsWith("fitvit_") && !preservedKeys.has(key)
    );
    localKeys.forEach((key) => localStorage.removeItem(key));

    const sessionKeys = Object.keys(sessionStorage).filter((key) => key.startsWith("fitvit_"));
    sessionKeys.forEach((key) => sessionStorage.removeItem(key));

    window.location.replace("/stitch/stitch_smart_mess_dashboard%20(10)/code.html");
  }
})();
