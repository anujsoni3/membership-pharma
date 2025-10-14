export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 400;
  const message = err.message || 'Something went wrong';
  res.status(status).json({ error: message });
};
