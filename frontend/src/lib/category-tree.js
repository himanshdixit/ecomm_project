const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const sortCategories = (left, right) => {
  const leftSortOrder = Number(left.sortOrder || 0);
  const rightSortOrder = Number(right.sortOrder || 0);

  if (leftSortOrder !== rightSortOrder) {
    return leftSortOrder - rightSortOrder;
  }

  return collator.compare(left.name || "", right.name || "");
};

const flatten = (nodes, results = []) => {
  nodes.forEach((node) => {
    results.push(node);
    flatten(node.children || [], results);
  });

  return results;
};

export const buildCategoryTree = (categories = []) => {
  const nodes = categories
    .map((category) => ({
      ...category,
      children: [],
    }))
    .sort(sortCategories);

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const roots = [];

  nodes.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId).children.push(node);
      return;
    }

    roots.push(node);
  });

  roots.forEach((root) => flatten([root]));

  return {
    roots: roots.sort(sortCategories),
    flat: flatten(roots.sort(sortCategories)),
    nodeMap,
  };
};

export const getRootCategories = (categories = []) => buildCategoryTree(categories).roots;

export const findCategoryBySlug = (categories = [], slug = "") => categories.find((category) => category.slug === slug) || null;

export const getCategoryBranch = (categories = [], slug = "") => {
  const { roots } = buildCategoryTree(categories);
  const flat = flatten(roots);
  const activeCategory = flat.find((category) => category.slug === slug) || null;

  if (!activeCategory) {
    return [];
  }

  const rootCategory = flat.find((category) => category.id === activeCategory.rootId) || activeCategory;

  return flatten([rootCategory]).map((category) => ({
    ...category,
    branchDepth: Math.max(Number(category.level || 0) - Number(rootCategory.level || 0), 0),
  }));
};

export const getHeaderActiveRootSlug = (categories = [], slug = "") => {
  const activeCategory = findCategoryBySlug(categories, slug);
  return activeCategory?.rootSlug || activeCategory?.slug || "";
};
