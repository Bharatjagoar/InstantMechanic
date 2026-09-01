import { pool } from '../db/pool.js'

export async function getDashboard(req, res) {
  try {
    const [overview, bookingsOverTime, revenueOverTime, statusBreakdown, categoryBreakdown] =
      await Promise.all([
        pool.query(`
          SELECT
            COUNT(*) AS total_bookings,
            COUNT(*) FILTER (WHERE scheduled_at::date = CURRENT_DATE) AS today_bookings,
            COUNT(*) FILTER (WHERE status = 'completed') AS completed_bookings,
            COUNT(*) FILTER (WHERE status = 'pending') AS pending_bookings,
            COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_bookings,
            COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) AS total_revenue
          FROM bookings
        `),
        pool.query(`
          SELECT scheduled_at::date AS date, COUNT(*) AS count
          FROM bookings
          WHERE scheduled_at >= CURRENT_DATE - INTERVAL '29 days'
          GROUP BY date
          ORDER BY date
        `),
        pool.query(`
          SELECT scheduled_at::date AS date, COALESCE(SUM(amount), 0) AS revenue
          FROM bookings
          WHERE status = 'completed' AND scheduled_at >= CURRENT_DATE - INTERVAL '29 days'
          GROUP BY date
          ORDER BY date
        `),
        pool.query(`
          SELECT status, COUNT(*) AS count
          FROM bookings
          GROUP BY status
        `),
        pool.query(`
          SELECT s.category, COUNT(*) AS count
          FROM bookings b
          JOIN services s ON s.id = b.service_id
          GROUP BY s.category
          ORDER BY count DESC
        `),
      ])

    const [mechanicStats, customerStats] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS active_mechanics FROM mechanics WHERE status != 'offline'`),
      pool.query(`SELECT COUNT(*) AS new_customers FROM customers WHERE created_at >= NOW() - INTERVAL '30 days'`),
    ])

    const o = overview.rows[0]

    res.json({
      overview: {
        totalBookings: Number(o.total_bookings),
        todayBookings: Number(o.today_bookings),
        completedBookings: Number(o.completed_bookings),
        pendingBookings: Number(o.pending_bookings),
        cancelledBookings: Number(o.cancelled_bookings),
        totalRevenue: Number(o.total_revenue),
        activeMechanics: Number(mechanicStats.rows[0].active_mechanics),
        newCustomers: Number(customerStats.rows[0].new_customers),
      },
      charts: {
        bookingsOverTime: bookingsOverTime.rows.map((r) => ({ date: r.date, count: Number(r.count) })),
        revenueOverTime: revenueOverTime.rows.map((r) => ({ date: r.date, revenue: Number(r.revenue) })),
        statusBreakdown: statusBreakdown.rows.map((r) => ({ status: r.status, count: Number(r.count) })),
        categoryBreakdown: categoryBreakdown.rows.map((r) => ({ category: r.category, count: Number(r.count) })),
      },
    })
  } catch (error) {
    console.error('Failed to load dashboard:', error)
    res.status(500).json({ error: 'Failed to load dashboard' })
  }
}
