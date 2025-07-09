export var FallbackStrategy;
(function (FallbackStrategy) {
    FallbackStrategy["CACHE_THEN_ERROR"] = "cache_then_error";
    FallbackStrategy["CACHE_THEN_FALLBACK"] = "cache_then_fallback";
    FallbackStrategy["ERROR_IMMEDIATELY"] = "error_immediately";
    FallbackStrategy["DEGRADE_GRACEFULLY"] = "degrade_gracefully";
})(FallbackStrategy || (FallbackStrategy = {}));
export var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "closed";
    CircuitState["OPEN"] = "open";
    CircuitState["HALF_OPEN"] = "half_open";
})(CircuitState || (CircuitState = {}));
export var DatabaseErrorType;
(function (DatabaseErrorType) {
    DatabaseErrorType["CONNECTION_ERROR"] = "connection_error";
    DatabaseErrorType["TIMEOUT_ERROR"] = "timeout_error";
    DatabaseErrorType["CONSTRAINT_VIOLATION"] = "constraint_violation";
    DatabaseErrorType["RATE_LIMIT_ERROR"] = "rate_limit_error";
    DatabaseErrorType["UNKNOWN_ERROR"] = "unknown_error";
})(DatabaseErrorType || (DatabaseErrorType = {}));
