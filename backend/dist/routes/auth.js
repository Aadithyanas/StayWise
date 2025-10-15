"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
const credentialsSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
router.post('/signup', async (req, res) => {
    const parse = credentialsSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: 'Invalid input' });
    const { email, password } = parse.data;
    const existing = await User_1.User.findOne({ email });
    if (existing)
        return res.status(409).json({ error: 'Email already in use' });
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await User_1.User.create({ email, passwordHash, role: 'user' });
    const token = (0, jwt_1.signJwt)({ sub: user.id, role: user.role });
    return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
});
router.post('/login', async (req, res) => {
    const parse = credentialsSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: 'Invalid input' });
    const { email, password } = parse.data;
    const user = await User_1.User.findOne({ email });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = (0, jwt_1.signJwt)({ sub: user.id, role: user.role });
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});
exports.default = router;
