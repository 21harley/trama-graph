"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
var express_1 = require("express");
var measurements_routes_1 = require("../modules/measurements/measurements.routes");
exports.apiRouter = (0, express_1.Router)();
exports.apiRouter.use("/measurements", measurements_routes_1.measurementsRouter);
