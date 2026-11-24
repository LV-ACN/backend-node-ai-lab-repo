class BookingRejectedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BookingRejectedError';
    this.status = 409;
  }
}

class PropertyNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PropertyNotFoundError';
    this.status = 404;
  }
}

class ReservationNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ReservationNotFoundError';
    this.status = 404;
  }
}

// Mirrors ApiExceptionHandler.java: maps a known error type to its status
// code and a { error: message } body. Anything else is a genuine bug, so it
// falls through to Express's default 500 handling instead of being hidden.
function errorHandler(err, req, res, next) {
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  next(err);
}

module.exports = {
  BookingRejectedError,
  PropertyNotFoundError,
  ReservationNotFoundError,
  errorHandler,
};
