const parseCategorySlugFromPath = (pathname = "") => {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] !== "categories" || !segments[1]) {
    return "";
  }

  return decodeURIComponent(segments[1]);
};

const createSubscription = (eventName, handler) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = (event) => {
    handler(event?.detail || {});
  };

  window.addEventListener(eventName, listener);

  return () => {
    window.removeEventListener(eventName, listener);
  };
};

export const STOREFRONT_CATEGORY_SELECT_EVENT = "storefront:category-select";
export const STOREFRONT_CATEGORY_ACTIVE_EVENT = "storefront:category-active";

export function emitStorefrontCategorySelect(detail = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(STOREFRONT_CATEGORY_SELECT_EVENT, {
      detail,
    })
  );
}

export function emitStorefrontCategoryActive(detail = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(STOREFRONT_CATEGORY_ACTIVE_EVENT, {
      detail,
    })
  );
}

export function subscribeToStorefrontCategorySelect(handler) {
  return createSubscription(STOREFRONT_CATEGORY_SELECT_EVENT, handler);
}

export function subscribeToStorefrontCategoryActive(handler) {
  return createSubscription(STOREFRONT_CATEGORY_ACTIVE_EVENT, handler);
}

export { parseCategorySlugFromPath };
