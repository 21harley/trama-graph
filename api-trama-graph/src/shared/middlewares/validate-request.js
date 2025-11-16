"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
function validateBody(schema) {
    return function (req, _res, next) {
        var result = schema.safeParse(req.body);
        if (!result.success) {
            return next(result.error);
        }
        req.body = result.data;
        return next();
    };
}
