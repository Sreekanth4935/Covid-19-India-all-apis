//SOLUTION OR PRACTICE

const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "covid19India.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertStateDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

const convertDistrictDbObjectToResponseObject = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT
      *
    FROM
      state;`;
  const statesArray = await database.all(getStatesQuery);
  response.send(
    statesArray.map((eachState) =>
      convertStateDbObjectToResponseObject(eachState)
    )
  );
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT 
      *
    FROM 
      state 
    WHERE 
      state_id = ${stateId};`;
  const state = await database.get(getStateQuery);
  response.send(convertStateDbObjectToResponseObject(state));
});

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictsQuery = `
    SELECT
      *
    FROM
     district
    WHERE
      district_id = ${districtId};`;
  const district = await database.get(getDistrictsQuery);
  response.send(convertDistrictDbObjectToResponseObject(district));
});

app.post("/districts/", async (request, response) => {
  const { stateId, districtName, cases, cured, active, deaths } = request.body;
  const postDistrictQuery = `
  INSERT INTO
    district (state_id, district_name, cases, cured, active, deaths)
  VALUES
    (${stateId}, '${districtName}', ${cases}, ${cured}, ${active}, ${deaths});`;
  await database.run(postDistrictQuery);
  response.send("District Successfully Added");
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
  DELETE FROM
    district
  WHERE
    district_id = ${districtId} 
  `;
  await database.run(deleteDistrictQuery);
  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateDistrictQuery = `
  UPDATE
    district
  SET
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active}, 
    deaths = ${deaths}
  WHERE
    district_id = ${districtId};
  `;

  await database.run(updateDistrictQuery);
  response.send("District Details Updated");
});

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateStatsQuery = `
    SELECT
      SUM(cases),
      SUM(cured),
      SUM(active),
      SUM(deaths)
    FROM
      district
    WHERE
      state_id=${stateId};`;
  const stats = await database.get(getStateStatsQuery);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateNameQuery = `
    SELECT
      state_name
    FROM
      district
    NATURAL JOIN
      state
    WHERE 
      district_id=${districtId};`;
  const state = await database.get(getStateNameQuery);
  response.send({ stateName: state.state_name });
});

module.exports = app;

// OWN CODE
// const express = require("express");
// const { open } = require("sqlite");
// const sqlite3 = require("sqlite3");
// const path = require("path");

// const databasePath = path.join(__dirname, "covid19India.db");

// const app = express();

// app.use(express.json());

// let database = null;
// const initializeDBAndServer = async () => {
//   try {
//     db = await open({
//       filename: databasePath,
//       driver: sqlite3.Database,
//     });
//     app.listen(3000, () =>
//       console.log("Server is running at http://localhost:3000")
//     );
//   } catch (e) {
//     console.log(`Error is ${e.message}`);
//     process.exit(1);
//   }
// };

// initializeDBAndServer();

// const convertMovieObjectToResponseObject = (object) => {
//   return {
//     stateId: object.state_id,
//     stateName: object.state_name,
//     population: object.population,
//   };
// };

// const convertStateObjectToResponseObject = (dbObject) => {
//   return {
//     totalCases: dbObject["SUM(cases)"],
//     totalCured: dbObject["SUM(cured)"],
//     totalActive: dbObject["SUM(active)"],
//     totalDeaths: dbObject["SUM(deaths)"],
//   };
// };

// const convertDistrictRequestToResponseObject = (dbObject) => {
//   return {
//     districtId: dbObject.district_id,
//     districtName: dbObject.district_name,
//     stateId: dbObject.state_id,
//     cases: dbObject.cases,
//     cured: dbObject.cured,
//     active: dbObject.active,
//     deaths: dbObject.deaths,
//   };
// };

// //API 1
// app.get("/states/", async (request, response) => {
//   const statesArray = `
//     SELECT
//       *
//     FROM
//     state;
//     `;
//   const finalArray = await db.all(statesArray);
//   //   console.log(finalArray);
//   response.send(
//     finalArray.map((eachObject) =>
//       convertMovieObjectToResponseObject(eachObject)
//     )
//   );
// });
// //API 2
// app.get("/states/:stateId", async (request, response) => {
//   const { stateId } = request.params;
//   //   console.log(stateId);
//   const getStateQuery = `
//    SELECT
//      *
//    FROM
//    state
//    WHERE
//        state_id = ${stateId};`;

//   const getState = await db.get(getStateQuery);
//   response.send(convertMovieObjectToResponseObject(getState));
// });

// //API 3
// app.post("/districts/", async (request, response) => {
//   const { districtName, stateId, cases, cured, active, deaths } = request.body;
//   const updateDistrictQuery = `
//   INSERT INTO district("district_name","state_id","cases","cured","active","deaths")
//   VALUES(
//       '${districtName}','${stateId}','${cases}','${cured}','${active}','${deaths}'
//   );`;
//   const dbResponse = await db.run(updateDistrictQuery);
//   //   const district_id = dbResponse.lastID;
//   //   console.log(district_id);
//   response.send("District Successfully Added");
// });

// //API 4

// app.get("/districts/:districtId/", async (request, response) => {
//   const { districtId } = request.params;
//   //   console.log(districtId);
//   const getDistrict = `
//  SELECT
//    *
// FROM
//  district
// WHERE
//  district_id = ${districtId};
//  `;
//   const getDistrictBasedOnId = await db.get(getDistrict);
//   //   console.log(getDistrictBasedOnId);
//   response.send(convertDistrictRequestToResponseObject(getDistrictBasedOnId));
// });

// //api 5
// app.delete("/districts/:districtId/", async (request, response) => {
//   const { districtId } = request.params;
//   //   console.log(districtId);
//   const deleteQuery = `
//       DELETE FROM
//            district
//       WHERE district_id = ${districtId};
//   `;
//   await db.run(deleteQuery);
//   response.send("District Removed");
// });

// //api 6
// app.put("/districts/:districtId/", async (request, response) => {
//   const { districtId } = request.params;
//   const { districtName, stateId, cases, cured, active, deaths } = request.body;

//   const updateDetailsQuery = `
//     UPDATE
//       district
//     SET
//        district_name = '${districtName}',
//        state_id = '${stateId}',
//        cases = '${cases}',
//        cured = '${cured}',
//        active = '${active}',
//        deaths = '${deaths}';
//   `;
//   await db.run(updateDetailsQuery);
//   response.send("District Details Updated");
// });

// //api 7
// app.get("/states/:stateId/stats/", async (request, response) => {
//   const { stateId } = request.params;
//   const getStateDetailsQuery = `
//     SELECT
//        SUM(cases),
//        SUM(cured),
//        SUM(active),
//        SUM(deaths)
//     FROM
//          district
//     WHERE
//          state_id = ${stateId}
//     `;
//   const stateDetails = await db.get(getStateDetailsQuery);
//   console.log(stateDetails);
//   response.send(convertStateObjectToResponseObject(stateDetails));
// });

// app.get("/districts/:districtId/details/", async (request, response) => {
//   const { districtId } = request.params;
//   //   console.log(districtId);
//   const getStateNameQuery = `
//  SELECT
//     state.state_name
//  FROM
//    state INNER JOIN district ON district.state_id = state.state_id;
//  `;
//   const stateArray = await db.get(getStateNameQuery);
//   response.send({ stateName: stateArray.state_name });
// });

// module.exports = app;
