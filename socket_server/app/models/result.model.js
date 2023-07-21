const mongoose = require("mongoose");

const Result = mongoose.model(
  "Result",
  new mongoose.Schema({
    seed: String,
    total_plays: Number,
    wins: Number,
    dead_counts: Number,
    bet_amount: Number,
    bet_payout: Number,
    bet_result: Number,
    is_profit_lost: Boolean,
    created_at: String
  })
);

module.exports = Result;