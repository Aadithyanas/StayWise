"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = __importDefault(require("http"));
const mongoose_1 = require("mongoose");
const app_1 = require("./server/app");
const port = parseInt(process.env.PORT || '4000', 10);
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/staywise';
async function bootstrap() {
    await (0, mongoose_1.connect)(mongoUri);
    const app = (0, app_1.createApp)();
    const server = http_1.default.createServer(app);
    server.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`StayWise backend listening on http://localhost:${port}`);
    });
}
bootstrap().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', err);
    process.exit(1);
});
