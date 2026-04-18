const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const getId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (value._id) {
    return String(value._id);
  }

  if (value.id) {
    return String(value.id);
  }

  return String(value);
};

const sortCategories = (left, right) => {
  const leftSortOrder = Number(left.sortOrder || 0);
  const rightSortOrder = Number(right.sortOrder || 0);

  if (leftSortOrder !== rightSortOrder) {
    return leftSortOrder - rightSortOrder;
  }

  return collator.compare(left.name || "", right.name || "");
};

const flattenNodes = (nodes, results = []) => {
  nodes.forEach((node) => {
    results.push(node);
    flattenNodes(node.children || [], results);
  });

  return results;
};

const gatherNodeIds = (node, results = []) => {
  if (!node) {
    return results;
  }

  results.push(node.id);
  (node.children || []).forEach((child) => gatherNodeIds(child, results));
  return results;
};

export const applyCategoryHierarchy = (category, parentCategory = null) => {
  if (parentCategory) {
    category.parent = parentCategory._id;
    category.level = Number(parentCategory.level || 0) + 1;
    category.root = parentCategory.root || parentCategory._id;
    category.pathIds = [...(parentCategory.pathIds || []), parentCategory._id];
    category.pathNames = [...(parentCategory.pathNames || []), parentCategory.name];
    category.pathSlugs = [...(parentCategory.pathSlugs || []), parentCategory.slug];
    return category;
  }

  category.parent = null;
  category.level = 0;
  category.root = category._id;
  category.pathIds = [];
  category.pathNames = [];
  category.pathSlugs = [];
  return category;
};

export const syncCategoryDescendants = async (CategoryModel, parentCategory) => {
  const children = await CategoryModel.find({ parent: parentCategory._id }).sort({ sortOrder: 1, name: 1 });

  for (const child of children) {
    applyCategoryHierarchy(child, parentCategory);
    await child.save();
    await syncCategoryDescendants(CategoryModel, child);
  }
};

export const buildCategoryTree = (categories = [], directCountMap = new Map()) => {
  const nodes = categories
    .map((category) => ({
      ...category,
      id: getId(category),
      parentId: getId(category.parent),
      rootId: getId(category.root || category),
      level: Number(category.level || 0),
      sortOrder: Number(category.sortOrder || 0),
      pathIds: Array.isArray(category.pathIds) ? category.pathIds.map(getId) : [],
      pathNames: Array.isArray(category.pathNames) ? [...category.pathNames] : [],
      pathSlugs: Array.isArray(category.pathSlugs) ? [...category.pathSlugs] : [],
      directItemCount: directCountMap.get(getId(category)) || Number(category.directItemCount || 0),
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

  const finalizeNode = (node) => {
    node.children.sort(sortCategories);
    const childCount = node.children.reduce((sum, child) => sum + finalizeNode(child), 0);
    node.itemCount = node.directItemCount + childCount;
    node.childrenCount = node.children.length;
    node.hasChildren = node.children.length > 0;
    node.path = [...node.pathNames.map((name, index) => ({ name, slug: node.pathSlugs[index] || "" })), { name: node.name, slug: node.slug }];
    node.pathLabel = node.path.map((entry) => entry.name).join(" / ");
    node.rootSlug = node.pathSlugs[0] || node.slug;
    return node.itemCount;
  };

  roots.forEach(finalizeNode);
  roots.sort(sortCategories);

  return {
    roots,
    flat: flattenNodes(roots),
    nodeMap,
  };
};

export const findCategoryNode = (categories = [], value = "") => {
  const normalizedValue = getId(value);

  return (
    categories.find((category) => getId(category) === normalizedValue || category.slug === normalizedValue) || null
  );
};

export const getCategoryAndDescendantIds = (categories = [], value = "") => {
  const { roots } = buildCategoryTree(categories);
  const flatNodes = flattenNodes(roots);
  const targetNode = flatNodes.find((node) => node.id === getId(value) || node.slug === getId(value));

  if (!targetNode) {
    return [];
  }

  return gatherNodeIds(targetNode);
};

export const getCategoryBranch = (categories = [], value = "") => {
  const { roots } = buildCategoryTree(categories);
  const flatNodes = flattenNodes(roots);
  const targetNode = flatNodes.find((node) => node.id === getId(value) || node.slug === getId(value));

  if (!targetNode) {
    return [];
  }

  const rootNode = flatNodes.find((node) => node.id === targetNode.rootId) || targetNode;
  return flattenNodes([rootNode]).map((node) => ({
    ...node,
    branchDepth: Math.max(node.level - rootNode.level, 0),
  }));
};
