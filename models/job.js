"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a Job (from data), update db, return new company data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * */

  static async create({ title, salary, equity, companyHandle }) {

    const result = await db.query(
          `INSERT INTO jobs
           (title, name, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING title, salary, equity, company_handle AS "companyHandle"`,
        [
          title,
          name,
          salary,
          equity,
          companyHandle,
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */

  static async findAll(filters = {noFilter: true}) {
    const { title, minSalary, hasEquity } = filters;

    // Validate that the request does not contain inappropriate filtering fields
    const allowedFilters = ['title', 'minSalary', 'hasEquity', 'noFilter'];
    const invalidFilters = Object.keys(filters).filter(filter => !allowedFilters.includes(filter));
    if (invalidFilters.length > 0) {
        throw new Error(`Invalid filters: ${invalidFilters.join(', ')}`);
    }

    // Build the SQL query based on the provided filters
    let query = `SELECT title,
                        salary,
                        equity,
                        company_handle AS "companyHandle"
                 FROM jobs`;

    const whereClauses = [];
    const values = [];

    if (title) {
        whereClauses.push(`LOWER(title) LIKE LOWER($${values.length + 1})`);
        values.push(`%${title}%`);
    }

    if (minSalary) {
        whereClauses.push(`salary >= $${values.length + 1}`);
        values.push(minSalary);
    }

    if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += ` ORDER BY name`;

    // Execute the query with the specified filters
    const jobsRes = await db.query(query, values);
    return jobsRes.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { title, salary, equity, company_handle }
   *   
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No Job: ${id}`);

    return job;
  }

  /** Update jkob data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          companyHandle: "company_handle",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, handle]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING title`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}


module.exports = Job;
