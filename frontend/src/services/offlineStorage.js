/**
 * offlineStorage.js
 * IndexedDB wrapper for storing courses, materials, and progress offline.
 */

const DB_NAME = 'SmartEduOffline';
const DB_VERSION = 2;

const STORES = {
  COURSES: 'courses',
  COURSE_TOPICS: 'courseTopics',
  TOPIC_CONTENT: 'topicContent',
  MATERIALS: 'materials',
  PROGRESS: 'progress',
  REVISIONS: 'revisions',
  USER_DATA: 'userData',
  DOWNLOADS: 'downloads',
  PENDING_SYNC: 'pendingSync'
};

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORES.COURSES)) {
        db.createObjectStore(STORES.COURSES, { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains(STORES.COURSE_TOPICS)) {
        const store = db.createObjectStore(STORES.COURSE_TOPICS, { keyPath: 'courseId' });
        store.createIndex('courseId', 'courseId', { unique: true });
      }
      if (!db.objectStoreNames.contains(STORES.TOPIC_CONTENT)) {
        db.createObjectStore(STORES.TOPIC_CONTENT, { keyPath: 'topicId' });
      }
      if (!db.objectStoreNames.contains(STORES.MATERIALS)) {
        db.createObjectStore(STORES.MATERIALS, { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
        db.createObjectStore(STORES.PROGRESS, { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains(STORES.REVISIONS)) {
        db.createObjectStore(STORES.REVISIONS, { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.DOWNLOADS)) {
        db.createObjectStore(STORES.DOWNLOADS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.PENDING_SYNC)) {
        db.createObjectStore(STORES.PENDING_SYNC, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generic helpers
async function putItem(storeName, item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function putItems(storeName, items) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    items.forEach((item) => store.put(item));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function stableProgressId(p) {
  if (p._id) return p._id;
  if (p.topic) return p.topic;
  // Fallback: deterministic hash of the item contents so id is stable
  try {
    const str = JSON.stringify(p);
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
      // keep in 32-bit range
      hash = hash & 0xFFFFFFFF;
    }
    return `progress_${Math.abs(hash)}`;
  } catch (e) {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
      try {
        // eslint-disable-next-line no-console
        console.debug('[offlineStorage] stableProgressId fallback used for item', p, e && e.message);
      } catch (_) {}
    }
    return `progress_${Date.now()}`;
  }
}

async function getItem(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function getAllItems(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function deleteItem(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ── Course offline storage ──────────────────────────────────────────

export async function saveCourseOffline(course, topics, topicContents) {
  // Save course info
  await putItem(STORES.COURSES, {
    ...course,
    _offlineAt: new Date().toISOString()
  });

  // Save topics for this course
  await putItem(STORES.COURSE_TOPICS, {
    courseId: course._id,
    topics,
    _offlineAt: new Date().toISOString()
  });

  // Save each topic's content
  if (topicContents && topicContents.length > 0) {
    for (const tc of topicContents) {
      await putItem(STORES.TOPIC_CONTENT, {
        topicId: tc.topicId,
        courseId: course._id,
        content: tc.content,
        _offlineAt: new Date().toISOString()
      });
    }
  }

  // Mark as downloaded
  await putItem(STORES.DOWNLOADS, {
    id: `course_${course._id}`,
    type: 'course',
    entityId: course._id,
    title: course.title,
    downloadedAt: new Date().toISOString(),
    size: JSON.stringify({ course, topics, topicContents }).length
  });
}

export async function getCourseOffline(courseId) {
  const course = await getItem(STORES.COURSES, courseId);
  const topicsData = await getItem(STORES.COURSE_TOPICS, courseId);
  return { course, topics: topicsData?.topics || [] };
}

export async function getTopicContentOffline(topicId) {
  return getItem(STORES.TOPIC_CONTENT, topicId);
}

export async function getAllCoursesOffline() {
  return getAllItems(STORES.COURSES);
}

export async function removeCourseOffline(courseId) {
  await deleteItem(STORES.COURSES, courseId);
  await deleteItem(STORES.COURSE_TOPICS, courseId);
  await deleteItem(STORES.DOWNLOADS, `course_${courseId}`);
  // Also remove topic contents for this course
  const allContent = await getAllItems(STORES.TOPIC_CONTENT);
  for (const tc of allContent) {
    if (tc.courseId === courseId) {
      await deleteItem(STORES.TOPIC_CONTENT, tc.topicId);
    }
  }
}

// ── Materials offline storage ───────────────────────────────────────

export async function saveMaterialOffline(material) {
  await putItem(STORES.MATERIALS, {
    ...material,
    _offlineAt: new Date().toISOString()
  });

  await putItem(STORES.DOWNLOADS, {
    id: `material_${material._id}`,
    type: 'material',
    entityId: material._id,
    title: material.title,
    downloadedAt: new Date().toISOString(),
    size: JSON.stringify(material).length
  });
}

export async function getMaterialOffline(materialId) {
  return getItem(STORES.MATERIALS, materialId);
}

export async function getAllMaterialsOffline() {
  return getAllItems(STORES.MATERIALS);
}

export async function removeMaterialOffline(materialId) {
  await deleteItem(STORES.MATERIALS, materialId);
  await deleteItem(STORES.DOWNLOADS, `material_${materialId}`);
}

// ── Progress offline storage ────────────────────────────────────────

export async function saveProgressOffline(progressItems) {
  const items = progressItems.map(p => ({
    ...p,
    // Ensure _id is set for IndexedDB keyPath. Prefer topic or existing _id.
    _id: stableProgressId(p),
    _offlineAt: new Date().toISOString()
  }));
  await putItems(STORES.PROGRESS, items);
}

export async function saveProgressItemOffline(topicId, courseId, data) {
  // Use topicId as the primary key for consistency with server-cached progress
  await putItem(STORES.PROGRESS, {
    _id: topicId,
    topic: topicId,
    courseId,
    ...data,
    _offlineAt: new Date().toISOString()
  });
}

export async function getProgressOffline() {
  return getAllItems(STORES.PROGRESS);
}

export async function getProgressForCourseOffline(courseId) {
  const all = await getAllItems(STORES.PROGRESS);
  return all.filter(p => p.courseId === courseId);
}

// ── Pending sync queue ──────────────────────────────────────────────

export async function queueProgressSync(topicId, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PENDING_SYNC, 'readwrite');
    tx.objectStore(STORES.PENDING_SYNC).put({
      type: 'progress',
      topicId,
      data,
      queuedAt: new Date().toISOString()
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingSyncs() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PENDING_SYNC, 'readonly');
      const req = tx.objectStore(STORES.PENDING_SYNC).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function clearPendingSyncs() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PENDING_SYNC, 'readwrite');
      tx.objectStore(STORES.PENDING_SYNC).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}

// ── Revisions offline storage ───────────────────────────────────────

export async function saveRevisionsOffline(revisions) {
  await putItems(STORES.REVISIONS, revisions.map(r => ({
    ...r,
    _offlineAt: new Date().toISOString()
  })));
}

export async function getRevisionsOffline() {
  return getAllItems(STORES.REVISIONS);
}

// ── Downloads tracking ──────────────────────────────────────────────

export async function getDownloads() {
  return getAllItems(STORES.DOWNLOADS);
}

export async function isDownloaded(type, entityId) {
  const item = await getItem(STORES.DOWNLOADS, `${type}_${entityId}`);
  return !!item;
}

export async function removeDownload(type, entityId) {
  if (type === 'course') {
    await removeCourseOffline(entityId);
  } else if (type === 'material') {
    await removeMaterialOffline(entityId);
  }
}

// ── User data ───────────────────────────────────────────────────────

export async function saveUserDataOffline(key, data) {
  await putItem(STORES.USER_DATA, { key, data, _offlineAt: new Date().toISOString() });
}

export async function getUserDataOffline(key) {
  const item = await getItem(STORES.USER_DATA, key);
  return item?.data || null;
}

// ── Storage stats ───────────────────────────────────────────────────

export async function getOfflineStorageStats() {
  const downloads = await getDownloads();
  const totalSize = downloads.reduce((sum, d) => sum + (d.size || 0), 0);
  const courseCount = downloads.filter(d => d.type === 'course').length;
  const materialCount = downloads.filter(d => d.type === 'material').length;

  return {
    totalDownloads: downloads.length,
    courseCount,
    materialCount,
    totalSizeBytes: totalSize,
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    downloads
  };
}

// ── Clear all offline data ──────────────────────────────────────────

export async function clearAllOfflineData() {
  const db = await openDB();
  const storeNames = Object.values(STORES);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, 'readwrite');
    storeNames.forEach((name) => tx.objectStore(name).clear());
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
