"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 10000,
    equity: "0",
    companyHandle: "c1"
  };


  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'new'`);
    expect(result.rows).toEqual([
        {
            title: "new",
            salary: 10000,
            equity: "0",
            company_handle: "c1"
          },
    ]);
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    const newJob = {
        title: "new",
        salary: 10000,
        equity: "0",
        companyHandle: "c1"
    };
    let job = await Job.create(newJob);

    let jobs = await Job.findAll();
    expect(jobs).toEqual([
        {
            title: "new",
            salary: 10000,
            equity: "0",
            companyHandle: "c1"
          }
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    const newJob = {
        title: "new",
        salary: 10000,
        equity: "0",
        companyHandle: "c1"
    };
    await Job.create(newJob);
    let idRes = await db.query(`SELECT id FROM jobs WHERE title = $1`,
    [newJob.title]);
    let id = idRes.rows[0].id;

    let job = await Job.get(id);
    expect(job).toEqual({
        title: "new",
        salary: 10000,
        equity: "0",
        companyHandle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(-4);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
    
  const updateData = {
    salary: 11000,
    equity: "1"
  };

  test("works", async function () {
    const newJob = {
        title: "new",
        salary: 10000,
        equity: "0",
        companyHandle: "c1"
    };
    await Job.create(newJob);
    let idRes = await db.query(`SELECT id FROM jobs WHERE title = $1`,
    [newJob.title]);
    let id = idRes.rows[0].id;

    let job = await Job.update(id, updateData);
    expect(job).toEqual({
      title: "new",
      ...updateData,
      companyHandle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(-1, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    const newJob = {
        title: "new",
        salary: 10000,
        equity: "0",
        companyHandle: "c1"
    };
    await Job.create(newJob);
    let idRes = await db.query(`SELECT id FROM jobs WHERE title = $1`,
    [newJob.title]);
    let id = idRes.rows[0].id;

    await Job.remove(id);
    const res = await db.query(
        "SELECT title FROM jobs WHERE id = $1", [id]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(-1);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
