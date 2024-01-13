const { sqlForPartialUpdate } = require("../helpers/sql");
//test with jest -i /helpers/sql.test.js
describe("Test sql helper", function () {
    test("sqlForPartialUpdate", function () {
        const { setCols, values } = sqlForPartialUpdate(
            {
                numEmployees: 5,
                logoUrl: "awesome"
            },
            {
              numEmployees: "num_employees",
              logoUrl: "logo_url",
            });

        expect(setCols).toEqual("\"num_employees\"=$1, \"logo_url\"=$2");
        expect(values).toEqual([5, "awesome"]);
    });
  });