import User from '../models/User';

export default async (req, res, next) => {
  const checkAdmin = await User.findOne({
    where: { id: req.userId, role: 'ADMIN' },
  });

  if (!checkAdmin) {
    return res
      .status(401)
      .json({ error: 'User is not authorized to view this resource' });
  }

  return next();
};
