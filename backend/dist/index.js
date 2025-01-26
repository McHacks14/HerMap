"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const api_1 = __importDefault(require("./api"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dbUrl = (_a = process.env.DB_URL) !== null && _a !== void 0 ? _a : "mongodb://localhost:27017/hermap";
const port = 8000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/', express_1.default.static(path_1.default.join(__dirname, '../../public')));
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Connecting to the database");
    yield mongoose_1.default.connect(dbUrl);
    (0, api_1.default)(app);
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
}))();
