const { Router } = require('express');
const reservationService = require('../services/reservationService');

// Mirrors ReservationController.java: thin routing, no business logic.
const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const response = await reservationService.book(req.body);
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

router.get('/:reservationNumber', (req, res, next) => {
  try {
    res.json(reservationService.find(req.params.reservationNumber));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
