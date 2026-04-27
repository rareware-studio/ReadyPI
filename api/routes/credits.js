const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const db = require('../utils/db');
const logger = require('../utils/logger');

/**
 * GET /credits/balance
 * Get current credit balance
 */
router.get('/balance', verifyJWT, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT balance, total_purchased, total_used, updated_at
       FROM credits
       WHERE user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Credits not found'
      });
    }

    const credits = result.rows[0];

    res.json({
      balance: parseInt(credits.balance),
      total_purchased: parseInt(credits.total_purchased),
      total_used: parseInt(credits.total_used),
      tokens_available: parseInt(credits.balance) * 1000,
      updated_at: credits.updated_at
    });

  } catch (error) {
    logger.error('Get balance error:', error);
    res.status(500).json({
      error: 'Failed to fetch credit balance'
    });
  }
});

/**
 * GET /credits/usage
 * Get usage history
 */
router.get('/usage', verifyJWT, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT model, provider, total_tokens, credits_used, cost_bdt, status, created_at
       FROM usage_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM usage_logs WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      usage: result.rows.map(log => ({
        model: log.model,
        provider: log.provider,
        tokens: log.total_tokens,
        credits_used: parseInt(log.credits_used),
        cost_bdt: parseFloat(log.cost_bdt),
        status: log.status,
        timestamp: log.created_at
      })),
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    logger.error('Get usage error:', error);
    res.status(500).json({
      error: 'Failed to fetch usage history'
    });
  }
});

/**
 * GET /credits/stats
 * Get usage statistics
 */
router.get('/stats', verifyJWT, async (req, res) => {
  try {
    // Last 30 days stats
    const statsResult = await db.query(
      `SELECT 
        COUNT(*) as total_requests,
        SUM(total_tokens) as total_tokens,
        SUM(credits_used) as total_credits,
        SUM(cost_bdt) as total_cost_bdt,
        AVG(latency_ms) as avg_latency
       FROM usage_logs
       WHERE user_id = $1 
       AND created_at >= CURRENT_DATE - INTERVAL '30 days'
       AND status = 'success'`,
      [req.user.id]
    );

    // Model breakdown
    const modelBreakdown = await db.query(
      `SELECT 
        model,
        COUNT(*) as request_count,
        SUM(total_tokens) as total_tokens,
        SUM(credits_used) as credits_used
       FROM usage_logs
       WHERE user_id = $1 
       AND created_at >= CURRENT_DATE - INTERVAL '30 days'
       AND status = 'success'
       GROUP BY model
       ORDER BY request_count DESC`,
      [req.user.id]
    );

    // Daily usage (last 7 days)
    const dailyUsage = await db.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as requests,
        SUM(total_tokens) as tokens,
        SUM(credits_used) as credits
       FROM usage_logs
       WHERE user_id = $1 
       AND created_at >= CURRENT_DATE - INTERVAL '7 days'
       AND status = 'success'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [req.user.id]
    );

    const stats = statsResult.rows[0];

    res.json({
      last_30_days: {
        total_requests: parseInt(stats.total_requests) || 0,
        total_tokens: parseInt(stats.total_tokens) || 0,
        total_credits: parseInt(stats.total_credits) || 0,
        total_cost_bdt: parseFloat(stats.total_cost_bdt) || 0,
        avg_latency_ms: parseFloat(stats.avg_latency) || 0
      },
      model_breakdown: modelBreakdown.rows.map(row => ({
        model: row.model,
        requests: parseInt(row.request_count),
        tokens: parseInt(row.total_tokens),
        credits: parseInt(row.credits_used)
      })),
      daily_usage: dailyUsage.rows.map(row => ({
        date: row.date,
        requests: parseInt(row.requests),
        tokens: parseInt(row.tokens),
        credits: parseInt(row.credits)
      }))
    });

  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch usage statistics'
    });
  }
});

/**
 * GET /credits/packages
 * Get available credit packages
 */
router.get('/packages', async (req, res) => {
  res.json({
    packages: [
      {
        id: 'micro',
        name: 'Micro',
        price_bdt: 199,
        credits: 1000,
        tokens: 1000000,
        best_for: 'Testing, demos, exploration'
      },
      {
        id: 'small',
        name: 'Small',
        price_bdt: 499,
        credits: 3000,
        tokens: 3000000,
        best_for: 'Light usage, side projects'
      },
      {
        id: 'medium',
        name: 'Medium',
        price_bdt: 999,
        credits: 7000,
        tokens: 7000000,
        best_for: 'Active developers'
      },
      {
        id: 'large',
        name: 'Large',
        price_bdt: 1999,
        credits: 18000,
        tokens: 18000000,
        best_for: 'Startups and agencies'
      },
      {
        id: 'xl',
        name: 'XL',
        price_bdt: 4999,
        credits: 50000,
        tokens: 50000000,
        best_for: 'High-volume production apps'
      }
    ],
    subscriptions: [
      {
        id: 'starter',
        name: 'Starter',
        price_bdt: 499,
        credits_per_month: 10000,
        tokens_per_month: 10000000,
        rate_limit: 60,
        features: ['All models', 'Email support 48h', 'Usage analytics']
      },
      {
        id: 'pro',
        name: 'Pro',
        price_bdt: 999,
        credits_per_month: 25000,
        tokens_per_month: 25000000,
        rate_limit: 200,
        features: ['Priority routing', 'Email support 24h', 'Team access (3 seats)']
      },
      {
        id: 'team',
        name: 'Team',
        price_bdt: 2999,
        credits_per_month: 100000,
        tokens_per_month: 100000000,
        rate_limit: 1000,
        features: ['Dedicated routing', 'WhatsApp support', '10 seats + admin']
      }
    ]
  });
});

module.exports = router;
