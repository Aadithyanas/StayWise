import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { signJwt } from '../utils/jwt';

const router = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/signup', async (req, res) => {
  const parse = credentialsSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { email, password } = parse.data;

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, role: 'user' });
  const token = signJwt({ sub: user.id, email: user.email, role: user.role });
  return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

router.post('/login', async (req, res) => {
  const parse = credentialsSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { email, password } = parse.data;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signJwt({ sub: user.id, email: user.email, role: user.role });
  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// Admin/Business signup
router.post('/admin/signup', async (req, res) => {
  const parse = credentialsSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { email, password } = parse.data;

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, role: 'admin' });
  const token = signJwt({ sub: user.id, email: user.email, role: user.role });
  return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

export default router;


