import mongoose from 'mongoose';

export const parsePagination = (query) => {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);
  const { cursor } = query;

  if (cursor !== undefined && (typeof cursor !== 'string' || !mongoose.isValidObjectId(cursor))) {
    return { error: 'Invalid cursor' };
  }
  return { limit, cursor };
};

export const buildPage = (docs, limit) => {
  const hasMore = docs.length > limit;
  const items = hasMore ? docs.slice(0, limit) : docs;
  return { items, nextCursor: hasMore ? items[items.length - 1]._id : null };
};