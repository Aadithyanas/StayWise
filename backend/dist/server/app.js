"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_js_1 = __importDefault(require("../routes/auth.js"));
const properties_js_1 = __importDefault(require("../routes/properties.js"));
const bookings_js_1 = __importDefault(require("../routes/bookings.js"));
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: true, credentials: true }));
    app.use(express_1.default.json());
    app.get('/api/health', (_req, res) => {
        res.json({ ok: true, service: 'staywise-api' });
    });
    app.use('/api/auth', auth_js_1.default);
    app.use('/api/properties', properties_js_1.default);
    app.use('/api/bookings', bookings_js_1.default);
    return app;
}
