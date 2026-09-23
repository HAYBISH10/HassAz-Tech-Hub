export function publicFail(res, status, message, error) {
  if (error) console.error(error?.message || error);
  return res.status(status).json({ message });
}
