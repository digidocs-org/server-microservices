import { NextFunction, Request, Response } from 'express';

export const searchAndFilter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const queryKeys = Object.keys(req.query);
  const dbQueries = [];
  if (queryKeys.length) {
    let { name, status } = req.query;

    if (name) {
      const docName = new RegExp(escapeRegExp(name), 'gi');
      dbQueries.push({
        $or: [{ 'document.name': docName }],
      });
    }

    if (status) {
      dbQueries.push({ status });
    }
  }

  res.locals.dbQueries = dbQueries.length ? { $and: dbQueries } : {};
  res.locals.query = req.query;

  next();
};

function escapeRegExp(str: any) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
